import React from "react";
import { TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function AlertStats({ alerts, unreadCount, criticalCount, types }) {
    const getTypeStats = () => {
        return Object.keys(types).map(type => ({
            type,
            count: alerts.filter(alert => alert.type === type).length,
            config: types[type]
        }));
    };

    const totalAlerts = alerts.length;
    const resolvedAlerts = alerts.filter(alert => alert.status === 'Resolved').length;
    const activeAlerts = totalAlerts - resolvedAlerts;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-blue-100 text-sm font-medium mb-1">Total Alerts</p>
                        <p className="text-3xl font-bold">{totalAlerts}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-200" />
                </div>
            </div>

            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-red-100 text-sm font-medium mb-1">Critical</p>
                        <p className="text-3xl font-bold">{criticalCount}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-200" />
                </div>
            </div>

            <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-amber-100 text-sm font-medium mb-1">Unread</p>
                        <p className="text-3xl font-bold">{unreadCount}</p>
                    </div>
                    <Clock className="w-8 h-8 text-amber-200" />
                </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-green-100 text-sm font-medium mb-1">Resolved</p>
                        <p className="text-3xl font-bold">{resolvedAlerts}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-200" />
                </div>
            </div>
        </div>
    );
}
