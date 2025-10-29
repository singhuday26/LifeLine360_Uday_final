import React from "react";

export default function StatusIndicator({ status, colorClass, icon: IconComponent, alertCount }) { // eslint-disable-line no-unused-vars
    return (
        <div className="inline-flex items-center gap-6 px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-lg">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className={`w-3 h-3 rounded-full ${colorClass.replace('text-', 'bg-')}`}></div>
                    <div className={`absolute inset-0 w-3 h-3 rounded-full ${colorClass.replace('text-', 'bg-')} animate-ping opacity-75`}></div>
                </div>
                <IconComponent className={`w-5 h-5 ${colorClass}`} />
                <span className={`font-bold text-sm ${colorClass}`}>
                    {status}
                </span>
            </div>

            {alertCount > 0 && (
                <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-red-600 font-bold">
                        {alertCount} critical alerts
                    </span>
                </div>
            )}
        </div>
    );
}
