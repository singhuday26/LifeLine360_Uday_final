import React, { useState } from "react";
import { Clock, MapPin, Users, X, Eye, ExternalLink, MoreVertical } from "lucide-react";

export default function AlertCard({ alert, config, onDismiss, onMarkAsRead, compact = false, viewMode = 'cards' }) {
    const [showDetails, setShowDetails] = useState(false);
    const Icon = config.icon;

    const formatTimestamp = (timestamp) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
        return `${Math.floor(minutes / 1440)}d ago`;
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'Critical': return 'text-red-600 bg-red-100';
            case 'High': return 'text-orange-600 bg-orange-100';
            case 'Medium': return 'text-yellow-600 bg-yellow-100';
            case 'Low': return 'text-blue-600 bg-blue-100';
            default: return 'text-slate-600 bg-slate-100';
        }
    };

    const handleCardClick = () => {
        if (!alert.isRead) {
            onMarkAsRead(alert.id);
        }
        if (!compact) {
            setShowDetails(!showDetails);
        }
    };

    return (
        <div className={`
            ${config.bg} ${config.border} border-l-4 rounded-lg transition-all duration-200 hover:shadow-md
            ${!alert.isRead ? 'ring-2 ring-blue-200' : ''}
            ${compact ? 'p-4' : 'p-6'}
        `}>
            <div className="flex items-start gap-4">
                <div className={`${config.color} ${compact ? 'p-2' : 'p-3'} bg-white rounded-lg shadow-sm`}>
                    <Icon className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 cursor-pointer" onClick={handleCardClick}>
                            <div className="flex items-center gap-3 mb-2">
                                <h4 className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-slate-900 line-clamp-2`}>
                                    {alert.title}
                                </h4>
                                {!alert.isRead && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mb-3">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{formatTimestamp(alert.timestamp)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{alert.location}</span>
                                </div>
                                {!compact && (
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        <span>{alert.affectedPopulation.toLocaleString()} affected</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                                    {alert.severity}
                                </span>
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                                    {alert.status}
                                </span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                                    {alert.confidence}% confidence
                                </span>
                            </div>

                            {!compact && (
                                <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                                    {alert.description}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={() => onDismiss(alert.id)}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors"
                            aria-label="Dismiss alert"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {showDetails && !compact && (
                        <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-slate-700">Source:</span>
                                    <span className="ml-2 text-slate-600">{alert.source}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-slate-700">Category:</span>
                                    <span className="ml-2 text-slate-600">{alert.category}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {alert.tags.map((tag, index) => (
                                    <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
                                    <ExternalLink className="w-4 h-4" />
                                    View Details
                                </button>
                                <button className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
                                    <Eye className="w-4 h-4" />
                                    Track Status
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
