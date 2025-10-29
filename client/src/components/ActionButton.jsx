import React from "react";

const variants = {
    "green-premium": "bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl hover:shadow-green-500/25",
    "danger-white": "bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl hover:shadow-red-500/25",
    "green-outline": "border-2 border-green-500 hover:border-green-600 text-green-600 hover:bg-green-50 bg-white shadow-lg hover:shadow-xl",
    "outline-white": "border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-50 bg-white shadow-lg hover:shadow-xl"
};

export default function ActionButton({
                                         children,
                                         onClick,
                                         variant = "green-premium",
                                         icon: Icon,
                                         disabled = false,
                                         fullWidth = false,
                                         ariaLabel,
                                         className = ""
                                     }) {
    const baseClasses = "relative inline-flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98]";
    const variantClasses = variants[variant] || variants["green-premium"];
    const widthClass = fullWidth ? "w-full" : "";
    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer";

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses} ${widthClass} ${disabledClasses} ${className}`}
            aria-label={ariaLabel}
        >
            {Icon && <Icon className="w-5 h-5 relative z-10" />}
            {children}
        </button>
    );
}
