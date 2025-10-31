import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/useAuth';
import { useNavigate } from 'react-router-dom';
import { getApiBaseUrl } from '../utils/apiConfig';

const AdminDashboard = () => {
    const { user, token, logout, hasRole } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [triageItems, setTriageItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(null);

    const apiUrl = getApiBaseUrl();

    const fetchAdminStats = useCallback(async () => {
        if (!token) {
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/api/admin/stats`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setStats(data.data);
                }
            } else if (response.status === 401) {
                logout();
            }
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        }
    }, [apiUrl, token, logout]);

    const fetchTriageItems = useCallback(async () => {
        if (!token) {
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/api/admin/triage`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setTriageItems(data.data);
                }
            } else if (response.status === 401) {
                logout();
            }
        } catch (error) {
            console.error('Error fetching triage items:', error);
        }
    }, [apiUrl, token, logout]);

    const updateIncidentStatus = async (incidentId, newStatus) => {
        if (!token) {
            return;
        }

        setUpdatingStatus(incidentId);
        try {
            const response = await fetch(`${apiUrl}/api/admin/incidents/${incidentId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Update the local state
                    setTriageItems(prevItems =>
                        prevItems.map(item =>
                            item.id === incidentId
                                ? { ...item, status: newStatus }
                                : item
                        )
                    );
                    alert(`Incident status updated to ${newStatus} successfully!`);
                }
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error updating incident status:', error);
            alert('Failed to update incident status. Please try again.');
        } finally {
            setUpdatingStatus(null);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([fetchAdminStats(), fetchTriageItems()]);
            setLoading(false);
        };
        fetchData();
    }, [fetchAdminStats, fetchTriageItems]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getSeverityColor = (severity) => {
        switch (severity.toLowerCase()) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-300';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'low': return 'bg-green-100 text-green-800 border-green-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'verified': return 'bg-blue-100 text-blue-800';
            case 'in_progress': return 'bg-orange-100 text-orange-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Admin Dashboard
                            </h1>
                            <p className="text-gray-600">
                                Welcome back, {user?.email} ({user?.role?.replace('_', ' ').toUpperCase()})
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Role Information */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Your Permissions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`p-4 rounded-lg ${hasRole('super_admin') ? 'bg-purple-100 border-2 border-purple-300' : 'bg-gray-100'}`}>
                            <h3 className="font-semibold text-gray-900">Super Admin</h3>
                            <p className="text-sm text-gray-600">Full system access</p>
                            <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${hasRole('super_admin') ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                                {hasRole('super_admin') ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div className={`p-4 rounded-lg ${hasRole('fire_admin') ? 'bg-red-100 border-2 border-red-300' : 'bg-gray-100'}`}>
                            <h3 className="font-semibold text-gray-900">Fire Admin</h3>
                            <p className="text-sm text-gray-600">Fire emergency management</p>
                            <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${hasRole('fire_admin') ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                                {hasRole('fire_admin') ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div className={`p-4 rounded-lg ${hasRole('flood_admin') ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-100'}`}>
                            <h3 className="font-semibold text-gray-900">Flood Admin</h3>
                            <p className="text-sm text-gray-600">Flood emergency management</p>
                            <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${hasRole('flood_admin') ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                                {hasRole('flood_admin') ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">System Statistics</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-blue-900">Total Alerts</h3>
                                <p className="text-2xl font-bold text-blue-600">{stats.totalAlerts || 0}</p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-red-900">Active Hotspots</h3>
                                <p className="text-2xl font-bold text-red-600">{stats.activeHotspots || 0}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-green-900">Online Sensors</h3>
                                <p className="text-2xl font-bold text-green-600">{stats.onlineSensors || 0}</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-purple-900">Total Incidents</h3>
                                <p className="text-2xl font-bold text-purple-600">{stats.totalIncidents || 0}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Triage Dashboard */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Incident Triage</h2>
                        <button
                            onClick={fetchTriageItems}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Refresh
                        </button>
                    </div>

                    {triageItems.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No pending incidents to triage.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {triageItems.map((item) => (
                                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(item.severity)}`}>
                                                    {item.severity.toUpperCase()}
                                                </span>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                                                    {item.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                                    {item.source === 'sensor' ? 'SENSOR' : 'COMMUNITY'}
                                                </span>
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                                    {item.incidentType.toUpperCase()}
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-gray-900 mb-1">{item.description}</h3>
                                            <p className="text-sm text-gray-600 mb-2">
                                                <strong>Location:</strong> {item.location}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                <strong>Reported:</strong> {formatTimestamp(item.timestamp)}
                                            </p>
                                            {item.reporterName && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    <strong>Reporter:</strong> {item.reporterName} ({item.reporterEmail})
                                                </p>
                                            )}
                                        </div>
                                        <div className="ml-4 flex flex-col gap-2">
                                            <select
                                                id={`status-${item.id}`}
                                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                defaultValue={item.status}
                                                disabled={updatingStatus === item.id}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="verified">Verified</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="resolved">Resolved</option>
                                            </select>
                                            <button
                                                onClick={() => {
                                                    const select = document.getElementById(`status-${item.id}`);
                                                    const newStatus = select.value;
                                                    if (newStatus !== item.status) {
                                                        updateIncidentStatus(item.id, newStatus);
                                                    }
                                                }}
                                                disabled={updatingStatus === item.id}
                                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                            >
                                                {updatingStatus === item.id ? 'Updating...' : 'Update Status'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg font-medium transition-colors"
                        >
                            View Public Dashboard
                        </button>
                        <button
                            onClick={() => navigate('/map')}
                            className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-medium transition-colors"
                        >
                            Emergency Map
                        </button>
                        <button
                            onClick={() => navigate('/report')}
                            className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg font-medium transition-colors"
                        >
                            Incident Reports
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;