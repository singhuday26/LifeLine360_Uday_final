import React from "react";
import {
    Zap,
    Shield,
    Users,
    MapPin,
    AlertTriangle,
    Clock,
    CheckCircle,
    Smartphone,
    Cloud,
    Activity
} from "lucide-react";

export default function Features() {
    const features = [
        {
            icon: Zap,
            title: "Real-Time Detection",
            description: "AI-powered sensors detect anomalies within seconds, providing instant early warning alerts for natural disasters and emergencies.",
            color: "text-green-600",
            bg: "bg-green-50",
            hoverBg: "hover:bg-green-100",
            shadowColor: "hover:shadow-green-500/10"
        },
        {
            icon: MapPin,
            title: "Hyper-Local Intelligence",
            description: "Street-level precision mapping ensures alerts are accurate to within meters, not miles, for targeted emergency response.",
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            hoverBg: "hover:bg-emerald-100",
            shadowColor: "hover:shadow-emerald-500/10"
        },
        {
            icon: Users,
            title: "Community Verified",
            description: "Crowd-sourced reports are automatically verified using AI and cross-referenced with sensor data for maximum accuracy.",
            color: "text-rose-600",
            bg: "bg-rose-50",
            hoverBg: "hover:bg-rose-100",
            shadowColor: "hover:shadow-rose-500/10"
        },
        {
            icon: Shield,
            title: "Multi-Hazard Monitoring",
            description: "Comprehensive coverage for floods, fires, earthquakes, severe weather, and infrastructure failures in one platform.",
            color: "text-lime-600",
            bg: "bg-lime-50",
            hoverBg: "hover:bg-lime-100",
            shadowColor: "hover:shadow-lime-500/10"
        },
        {
            icon: Smartphone,
            title: "Mobile-First Alerts",
            description: "Instant notifications delivered to smartphones, tablets, and emergency services with GPS-precise location data.",
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            hoverBg: "hover:bg-emerald-100",
            shadowColor: "hover:shadow-emerald-500/10"
        },
        {
            icon: Activity,
            title: "Predictive Analytics",
            description: "Machine learning algorithms analyze patterns to predict potential disaster scenarios before they escalate.",
            color: "text-teal-600",
            bg: "bg-teal-50",
            hoverBg: "hover:bg-teal-100",
            shadowColor: "hover:shadow-teal-500/10"
        }
    ];

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Subtle background accents */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-white to-emerald-50/20"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(34,197,94,0.05),transparent_50%)]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                {/* Premium Header Section */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100 mb-6">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-700 font-semibold text-sm">Advanced Intelligence Platform</span>
                    </div>

                    <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                            Advanced Disaster
                        </span>
                        <br />
                        Intelligence Features
                    </h2>

                    <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
                        Our cutting-edge technology combines environmental IoT sensors, AI analytics, and community reporting
                        to deliver the most accurate and timely disaster intelligence available to protect communities worldwide.
                    </p>
                </div>

                {/* Premium Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className={`group relative p-8 bg-white rounded-3xl border border-slate-200 ${feature.hoverBg} hover:border-slate-300 hover:shadow-2xl ${feature.shadowColor} transition-all duration-500 hover:-translate-y-2`}
                            >
                                {/* Subtle background gradient on hover */}
                                <div className={`absolute inset-0 ${feature.bg} rounded-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`}></div>

                                {/* Content */}
                                <div className="relative z-10">
                                    {/* Enhanced Icon Container */}
                                    <div className={`${feature.bg} ${feature.color} w-20 h-20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-xl`}>
                                        <Icon className="w-10 h-10" />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-slate-800 transition-colors">
                                        {feature.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-slate-600 leading-relaxed text-lg group-hover:text-slate-700 transition-colors">
                                        {feature.description}
                                    </p>
                                </div>

                                {/* Decorative corner accent */}
                                <div className={`absolute top-4 right-4 w-2 h-2 ${feature.color.replace('text-', 'bg-')} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Stats Section */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center p-8 bg-white rounded-2xl border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="text-4xl font-bold text-green-600 mb-2">99.9%</div>
                        <div className="text-slate-600 font-medium">Detection Accuracy</div>
                    </div>
                    <div className="text-center p-8 bg-white rounded-2xl border border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="text-4xl font-bold text-emerald-600 mb-2">&lt; 2s</div>
                        <div className="text-slate-600 font-medium">Alert Response Time</div>
                    </div>
                    <div className="text-center p-8 bg-white rounded-2xl border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
                        <div className="text-slate-600 font-medium">Continuous Monitoring</div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="mt-16 text-center">
                    <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                        <Shield className="w-5 h-5" />
                        <span>Experience Advanced Protection</span>
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
