const express = require('express');
const { protect, checkRole } = require('../middleware/auth');
const Stats = require('../models/Stats');
const Alert = require('../models/Alert');
const IncidentReport = require('../models/IncidentReport');

const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(protect);

// GET endpoint to get system stats for admins
router.get('/stats', checkRole(['super_admin', 'fire_admin', 'flood_admin']), async (req, res) => {
    try {
        const stats = await Stats.getStats();

        res.json({
            success: true,
            data: {
                totalAlerts: stats.totalAlerts,
                activeHotspots: stats.activeHotspots,
                onlineSensors: stats.onlineSensors,
                totalIncidents: stats.totalIncidents,
                lastUpdated: stats.lastUpdated
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stats'
        });
    }
});

// PUT endpoint to update stats (Admin only)
router.put('/stats', checkRole(['super_admin', 'fire_admin', 'flood_admin']), async (req, res) => {
    try {
        const { totalAlerts, activeHotspots, onlineSensors, totalIncidents } = req.body;

        let stats = await Stats.findOne();
        if (!stats) {
            stats = new Stats({
                totalAlerts: totalAlerts || 0,
                activeHotspots: activeHotspots || 0,
                onlineSensors: onlineSensors || 0,
                totalIncidents: totalIncidents || 0
            });
        } else {
            if (totalAlerts !== undefined) stats.totalAlerts = totalAlerts;
            if (activeHotspots !== undefined) stats.activeHotspots = activeHotspots;
            if (onlineSensors !== undefined) stats.onlineSensors = onlineSensors;
            if (totalIncidents !== undefined) stats.totalIncidents = totalIncidents;
            stats.lastUpdated = new Date();
        }

        await stats.save();

        res.json({
            success: true,
            data: {
                totalAlerts: stats.totalAlerts,
                activeHotspots: stats.activeHotspots,
                onlineSensors: stats.onlineSensors,
                totalIncidents: stats.totalIncidents,
                lastUpdated: stats.lastUpdated
            },
            message: 'Stats updated successfully'
        });

        // Broadcast stats update to WebSocket clients
        const broadcastToClients = req.app.locals.broadcastToClients;
        if (broadcastToClients) {
            broadcastToClients({
                type: 'stats_update',
                data: {
                    totalAlerts: stats.totalAlerts,
                    activeHotspots: stats.activeHotspots,
                    onlineSensors: stats.onlineSensors,
                    totalIncidents: stats.totalIncidents
                },
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('Error updating admin stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update stats'
        });
    }
});

// GET /api/admin/triage - Triage Dashboard API
router.get('/triage', checkRole(['fire_admin', 'flood_admin', 'super_admin']), async (req, res) => {
    try {
        const userRole = req.user.role;
        let filter = { status: 'pending' };

        // Add role-based filtering
        if (userRole === 'fire_admin') {
            filter.assignedToDept = 'fire';
        } else if (userRole === 'flood_admin') {
            filter.assignedToDept = 'flood';
        }
        // super_admin sees all pending incidents (no additional filter)

        // Fetch both alerts and incident reports
        const [alerts, incidentReports] = await Promise.all([
            Alert.find(filter).sort({ timestamp: -1 }),
            IncidentReport.find(filter).sort({ timestamp: -1 })
        ]);

        // Combine and format the results
        const triageItems = [
            ...alerts.map(alert => ({
                id: alert._id,
                type: 'alert',
                incidentType: alert.sensorType,
                severity: alert.severity,
                description: alert.message,
                location: alert.location.address || `${alert.location.lat}, ${alert.location.lng}`,
                timestamp: alert.timestamp,
                status: alert.status,
                assignedToDept: alert.assignedToDept,
                source: 'sensor'
            })),
            ...incidentReports.map(report => ({
                id: report._id,
                type: 'incident_report',
                incidentType: report.incidentType,
                severity: report.severity,
                description: report.description,
                location: report.location,
                timestamp: report.timestamp,
                status: report.status,
                assignedToDept: report.assignedToDept,
                source: 'community',
                reporterName: report.contactName,
                reporterEmail: report.contactEmail,
                reporterPhone: report.contactPhone
            }))
        ];

        // Sort combined results by timestamp (newest first)
        triageItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({
            success: true,
            data: triageItems,
            metadata: {
                total: triageItems.length,
                role: userRole,
                filter: filter
            }
        });
    } catch (error) {
        console.error('Error fetching triage items:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch triage items'
        });
    }
});

// PATCH /api/admin/incidents/:id/assign - Assign incident to department (super_admin only)
router.patch('/incidents/:id/assign', checkRole(['super_admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { dept } = req.body;

        // Validate department
        const validDepts = ['fire', 'flood', 'general'];
        if (!validDepts.includes(dept)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid department. Must be one of: fire, flood, general'
            });
        }

        // Try to find and update the incident report
        const updatedReport = await IncidentReport.findByIdAndUpdate(
            id,
            { assignedToDept: dept },
            { new: true, runValidators: true }
        );

        if (!updatedReport) {
            return res.status(404).json({
                success: false,
                message: 'Incident report not found'
            });
        }

        res.json({
            success: true,
            data: {
                id: updatedReport._id,
                incidentType: updatedReport.incidentType,
                severity: updatedReport.severity,
                assignedToDept: updatedReport.assignedToDept,
                status: updatedReport.status
            },
            message: `Incident assigned to ${dept} department successfully`
        });
    } catch (error) {
        console.error('Error assigning incident:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign incident'
        });
    }
});

// PATCH /api/admin/incidents/:id/status - Update incident status
router.patch('/incidents/:id/status', checkRole(['fire_admin', 'flood_admin', 'super_admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        // Validate status
        const validStatuses = ['pending', 'verified', 'in_progress', 'resolved'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: pending, verified, in_progress, resolved'
            });
        }

        // Check if admin has permission to update this incident
        const userRole = req.user.role;
        let incident;

        if (userRole === 'super_admin') {
            // Super admin can update any incident
            incident = await IncidentReport.findById(id);
        } else {
            // Department admins can only update incidents assigned to their department
            const deptMap = {
                fire_admin: 'fire',
                flood_admin: 'flood'
            };
            incident = await IncidentReport.findOne({
                _id: id,
                assignedToDept: deptMap[userRole]
            });
        }

        if (!incident) {
            return res.status(404).json({
                success: false,
                message: 'Incident not found or access denied'
            });
        }

        // Update the incident
        const updateData = { status };
        if (notes) {
            updateData.adminNotes = notes;
        }

        const updatedIncident = await IncidentReport.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: {
                id: updatedIncident._id,
                incidentType: updatedIncident.incidentType,
                severity: updatedIncident.severity,
                status: updatedIncident.status,
                assignedToDept: updatedIncident.assignedToDept,
                adminNotes: updatedIncident.adminNotes
            },
            message: `Incident status updated to ${status} successfully`
        });
    } catch (error) {
        console.error('Error updating incident status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update incident status'
        });
    }
});

module.exports = router;