import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
    AlertTriangle,
    CheckCircle,
    XCircle,
    Info,
    Clock,
    Bell,
    BellOff,
    Filter,
    Trash2,
    Eye,
    EyeOff,
    RefreshCw,
    Settings,
    Download,
    Search
} from "lucide-react";
import AlertCard from "./AlertCard";
import AlertFilters from "./AlertFilters";
import AlertStats from "./AlertStats";

const ALERT_TYPES = {
    critical: {
        icon: XCircle,
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        label: "Critical",
        priority: 1
    },
    warning: {
        icon: AlertTriangle,
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        label: "Warning",
        priority: 2
    },
    info: {
        icon: Info,
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
        label: "Info",
        priority: 3
    },
    success: {
        icon: CheckCircle,
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-200",
        label: "Resolved",
        priority: 4
    }
};

const ALERT_SOURCES = [
    'Sensor Network', 'Community Reports', 'Weather Service', 'Emergency Services',
    'Social Media', 'Government', 'News Sources', 'Automated Systems'
];

const ALERT_CATEGORIES = [
    'Fire', 'Flood', 'Storm', 'Earthquake', 'Power Outage', 'Medical',
    'Traffic', 'Security', 'Environmental', 'Infrastructure'
];

export default function Alerts() {
    const [alerts, setAlerts] = useState([]);
    const [liveAlerts, setLiveAlerts] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState({
        types: Object.keys(ALERT_TYPES),
        sources: ALERT_SOURCES,
        categories: ALERT_CATEGORIES,
        timeRange: 'all'
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [isLiveMode, setIsLiveMode] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('timestamp');
    const [viewMode, setViewMode] = useState('cards'); // cards, list, compact

    // Generate sample alerts
    const generateAlert = useCallback(() => {
        const types = Object.keys(ALERT_TYPES);
        const id = Date.now() + Math.random();

        return {
            id,
            type: types[Math.floor(Math.random() * types.length)],
            title: [
                "High wind speeds detected in downtown area",
                "Flash flood warning for riverside districts",
                "Power outage affecting 2,500+ homes",
                "Earthquake sensors triggered - magnitude 4.2",
                "Fire reported at industrial complex",
                "Medical emergency response activated",
                "Traffic incident causing major delays",
                "Severe weather alert issued",
                "Infrastructure failure detected",
                "Air quality threshold exceeded"
            ][Math.floor(Math.random() * 10)],
            description: "Automated systems have detected anomalous conditions requiring immediate attention. Emergency response protocols have been activated.",
            location: [
                "Downtown District", "Riverside Area", "Industrial Zone",
                "Residential Sector", "Commercial District", "Highway 101"
            ][Math.floor(Math.random() * 6)],
            source: ALERT_SOURCES[Math.floor(Math.random() * ALERT_SOURCES.length)],
            category: ALERT_CATEGORIES[Math.floor(Math.random() * ALERT_CATEGORIES.length)],
            timestamp: Date.now() - Math.random() * 7200000, // Random time within last 2 hours
            severity: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)],
            affectedPopulation: Math.floor(Math.random() * 5000) + 100,
            status: ['Active', 'Investigating', 'Responding', 'Resolved'][Math.floor(Math.random() * 4)],
            confidence: Math.floor(Math.random() * 40) + 60, // 60-100%
            isRead: false,
            isDismissed: false,
            tags: ['urgent', 'verified', 'automatic'].slice(0, Math.floor(Math.random() * 3) + 1)
        };
    }, []);

    // Initialize alerts
    useEffect(() => {
        const initialAlerts = Array.from({ length: 8 }, generateAlert);
        setAlerts(initialAlerts);
        setLiveAlerts(initialAlerts.slice(0, 3));
    }, [generateAlert]);

    // Simulate live updates
    useEffect(() => {
        if (!isLiveMode) return;

        const interval = setInterval(() => {
            // Occasionally add new alert
            if (Math.random() > 0.7) {
                const newAlert = generateAlert();
                setAlerts(prev => [newAlert, ...prev].slice(0, 50)); // Keep only latest 50
                setLiveAlerts(prev => [newAlert, ...prev].slice(0, 10)); // Keep only latest 10
            }

            // Update existing alerts
            setAlerts(prev => prev.map(alert => ({
                ...alert,
                confidence: Math.max(alert.confidence, Math.floor(Math.random() * 40) + 60)
            })));
        }, 8000);

        return () => clearInterval(interval);
    }, [isLiveMode, generateAlert]);

    // Filter and sort alerts
    const filteredAlerts = useMemo(() => {
        let filtered = alerts.filter(alert => {
            const matchesType = selectedFilters.types.includes(alert.type);
            const matchesSource = selectedFilters.sources.includes(alert.source);
            const matchesCategory = selectedFilters.categories.includes(alert.category);
            const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                alert.description.toLowerCase().includes(searchTerm.toLowerCase());

            let matchesTimeRange = true;
            if (selectedFilters.timeRange !== 'all') {
                const now = Date.now();
                const ranges = {
                    '1h': 3600000,
                    '6h': 21600000,
                    '24h': 86400000,
                    '7d': 604800000
                };
                matchesTimeRange = (now - alert.timestamp) <= ranges[selectedFilters.timeRange];
            }

            return matchesType && matchesSource && matchesCategory && matchesSearch && matchesTimeRange && !alert.isDismissed;
        });

        // Sort alerts
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'priority':
                    return ALERT_TYPES[a.type].priority - ALERT_TYPES[b.type].priority;
                case 'severity':
                    const severityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
                    return severityOrder[a.severity] - severityOrder[b.severity];
                case 'location':
                    return a.location.localeCompare(b.location);
                case 'timestamp':
                default:
                    return b.timestamp - a.timestamp;
            }
        });

        return filtered;
    }, [alerts, selectedFilters, searchTerm, sortBy]);

    const handleDismissAlert = useCallback((alertId) => {
        setAlerts(prev => prev.map(alert =>
            alert.id === alertId ? { ...alert, isDismissed: true } : alert
        ));
        setLiveAlerts(prev => prev.filter(alert => alert.id !== alertId));
    }, []);

    const handleMarkAsRead = useCallback((alertId) => {
        setAlerts(prev => prev.map(alert =>
            alert.id === alertId ? { ...alert, isRead: true } : alert
        ));
    }, []);

    const handleClearAll = useCallback(() => {
        setAlerts(prev => prev.map(alert => ({ ...alert, isDismissed: true })));
        setLiveAlerts([]);
    }, []);

    const unreadCount = alerts.filter(alert => !alert.isRead && !alert.isDismissed).length;
    const criticalCount = filteredAlerts.filter(alert => alert.type === 'critical').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Alert Center</h2>
                    <p className="text-slate-600 mt-1">
                        Real-time monitoring and incident management
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Live Mode Toggle */}
                    <button
                        onClick={() => setIsLiveMode(!isLiveMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                            isLiveMode
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                    >
                        {isLiveMode ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                        {isLiveMode ? 'Live' : 'Paused'}
                    </button>

                    {/* Filters Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm"
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                </div>
            </div>

            {/* Alert Statistics */}
            <AlertStats
                alerts={filteredAlerts}
                unreadCount={unreadCount}
                criticalCount={criticalCount}
                types={ALERT_TYPES}
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Live Alerts Panel */}
                <div className="xl:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-red-50 to-orange-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                                        Live Alerts
                                    </h3>
                                    <p className="text-sm text-slate-600">
                                        Real-time incident notifications
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-medium text-red-600">
                                        {liveAlerts.length} Active
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            {liveAlerts.length > 0 ? (
                                <div className="space-y-4">
                                    {liveAlerts.slice(0, 5).map((alert) => (
                                        <AlertCard
                                            key={alert.id}
                                            alert={alert}
                                            config={ALERT_TYPES[alert.type]}
                                            onDismiss={handleDismissAlert}
                                            onMarkAsRead={handleMarkAsRead}
                                            compact={true}
                                        />
                                    ))}

                                    {liveAlerts.length > 5 && (
                                        <div className="text-center pt-4 border-t border-slate-200">
                                            <span className="text-sm text-slate-500">
                                                +{liveAlerts.length - 5} more alerts
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                    <p className="text-slate-600 font-medium">All systems nominal</p>
                                    <p className="text-sm text-slate-500">No active alerts at this time</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Alerts Panel */}
                <div className="xl:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                {/* Search */}
                                <div className="flex-1 relative">
                                    <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search alerts..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-3">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                    >
                                        <option value="timestamp">Latest First</option>
                                        <option value="priority">Priority</option>
                                        <option value="severity">Severity</option>
                                        <option value="location">Location</option>
                                    </select>

                                    <button
                                        onClick={handleClearAll}
                                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Filters Panel */}
                        {showFilters && (
                            <AlertFilters
                                selectedFilters={selectedFilters}
                                onUpdateFilters={setSelectedFilters}
                                types={ALERT_TYPES}
                                sources={ALERT_SOURCES}
                                categories={ALERT_CATEGORIES}
                            />
                        )}

                        {/* Alerts List */}
                        <div className="p-6">
                            {filteredAlerts.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredAlerts.map((alert) => (
                                        <AlertCard
                                            key={alert.id}
                                            alert={alert}
                                            config={ALERT_TYPES[alert.type]}
                                            onDismiss={handleDismissAlert}
                                            onMarkAsRead={handleMarkAsRead}
                                            viewMode={viewMode}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Info className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-slate-900 mb-2">No alerts found</h3>
                                    <p className="text-slate-600">
                                        {searchTerm || Object.keys(selectedFilters).some(key => selectedFilters[key].length < (key === 'types' ? Object.keys(ALERT_TYPES).length : key === 'sources' ? ALERT_SOURCES.length : ALERT_CATEGORIES.length))
                                            ? 'Try adjusting your search or filters'
                                            : 'All systems are operating normally'
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
