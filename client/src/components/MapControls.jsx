import React from "react";
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react";

export default function MapControls({ zoomLevel, onZoomIn, onZoomOut, onRefresh }) {
    return (
        <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white rounded-lg shadow-lg border border-slate-200 p-2">
            <button
                onClick={onZoomIn}
                disabled={zoomLevel >= 2}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Zoom in"
            >
                <ZoomIn className="w-5 h-5" />
            </button>

            <button
                onClick={onZoomOut}
                disabled={zoomLevel <= 0.5}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Zoom out"
            >
                <ZoomOut className="w-5 h-5" />
            </button>

            <div className="border-t border-slate-200 my-1"></div>

            <button
                onClick={onRefresh}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Refresh data"
            >
                <RefreshCw className="w-5 h-5" />
            </button>

            {/* Zoom Level Indicator */}
            <div className="text-xs text-center text-slate-500 font-mono">
                {Math.round(zoomLevel * 100)}%
            </div>
        </div>
    );
}
