import React from "react";
import { Cpu, Wifi, Shield, Zap, Cloud, Smartphone, Sparkles } from "lucide-react";

export default function Technology() {
    const technologies = [
        {
            icon: Cpu,
            title: "AI & Machine Learning",
            description: "Advanced neural networks analyze patterns and predict disaster scenarios with 99.2% accuracy.",
            gradient: "from-green-500 to-green-700",
            hoverBorder: "hover:border-green-300",
            shadowColor: "hover:shadow-green-500/10"
        },
        {
            icon: Wifi,
            title: "IoT Sensor Network",
            description: "Distributed sensors monitor environmental conditions 24/7 across urban and rural areas.",
            gradient: "from-teal-400 to-teal-600",
            hoverBorder: "hover:border-teal-300",
            shadowColor: "hover:shadow-teal-500/10"
        },
        {
            icon: Cloud,
            title: "Cloud Infrastructure",
            description: "Scalable cloud architecture ensures reliable service during high-demand emergency situations.",
            gradient: "from-cyan-400 to-cyan-600",
            hoverBorder: "hover:border-cyan-300",
            shadowColor: "hover:shadow-cyan-500/10"
        },
        {
            icon: Shield,
            title: "Data Security",
            description: "Enterprise-grade encryption and security protocols protect sensitive emergency data.",
            gradient: "from-green-600 to-green-800",
            hoverBorder: "hover:border-green-400",
            shadowColor: "hover:shadow-green-600/10"
        },
        {
            icon: Zap,
            title: "Real-Time Processing",
            description: "Lightning-fast data processing delivers alerts within seconds of detection.",
            gradient: "from-emerald-500 to-emerald-700",
            hoverBorder: "hover:border-emerald-300",
            shadowColor: "hover:shadow-emerald-500/10"
        },
        {
            icon: Smartphone,
            title: "Mobile Integration",
            description: "Native mobile apps and APIs integrate seamlessly with existing emergency systems.",
            gradient: "from-lime-400 to-lime-600",
            hoverBorder: "hover:border-lime-300",
            shadowColor: "hover:shadow-lime-500/10"
        }
    ];

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Subtle Background Effects */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/20 via-white to-emerald-50/30"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(34,197,94,0.04),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.03),transparent_50%)]"></div>
            </div>

            {/* Floating Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/5 w-2 h-2 bg-green-400/30 rounded-full animate-ping"></div>
                <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-emerald-400/20 rounded-full animate-pulse"></div>
                <div className="absolute bottom-1/3 left-2/3 w-1 h-1 bg-teal-400/40 rounded-full animate-bounce"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                {/* Premium Header Section */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100 mb-6">
                        <Sparkles className="w-4 h-4 text-green-600" />
                        <span className="text-green-700 font-semibold text-sm">Enterprise Technology Stack</span>
                    </div>

                    <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                        Powered by
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 block">
                            Cutting-Edge Technology
                        </span>
                    </h2>

                    <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
                        Our platform leverages the latest advances in artificial intelligence,
                        environmental IoT sensors, and cloud computing to deliver unparalleled disaster intelligence
                        and real-time emergency response capabilities.
                    </p>
                </div>

                {/* Technology Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {technologies.map((tech, index) => {
                        const Icon = tech.icon;
                        return (
                            <div
                                key={index}
                                className={`group relative p-8 bg-white rounded-3xl border border-slate-200 ${tech.hoverBorder} hover:shadow-2xl ${tech.shadowColor} transition-all duration-500 hover:-translate-y-2`}
                            >
                                {/* Background hover effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 to-emerald-50/0 group-hover:from-green-50/50 group-hover:to-emerald-50/30 rounded-3xl transition-all duration-500"></div>

                                {/* Content */}
                                <div className="relative z-10">
                                    {/* Enhanced Icon Container */}
                                    <div className={`w-16 h-16 bg-gradient-to-br ${tech.gradient} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-xl`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-slate-800 transition-colors">
                                        {tech.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-slate-600 leading-relaxed text-lg group-hover:text-slate-700 transition-colors">
                                        {tech.description}
                                    </p>
                                </div>

                                {/* Decorative elements */}
                                <div className="absolute top-6 right-6 w-2 h-2 bg-green-400/0 group-hover:bg-green-400/60 rounded-full transition-all duration-500"></div>
                                <div className="absolute bottom-6 left-6 w-1 h-1 bg-emerald-400/0 group-hover:bg-emerald-400/40 rounded-full transition-all duration-700"></div>
                            </div>
                        );
                    })}
                </div>

                {/* Technology Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                    <div className="text-center p-6 bg-white rounded-2xl border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
                        <div className="text-slate-600 font-medium">System Uptime</div>
                    </div>
                    <div className="text-center p-6 bg-white rounded-2xl border border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="text-3xl font-bold text-emerald-600 mb-2">847K</div>
                        <div className="text-slate-600 font-medium">Data Points/Hour</div>
                    </div>
                    <div className="text-center p-6 bg-white rounded-2xl border border-teal-100 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="text-3xl font-bold text-teal-600 mb-2">&lt; 2s</div>
                        <div className="text-slate-600 font-medium">Processing Time</div>
                    </div>
                    <div className="text-center p-6 bg-white rounded-2xl border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
                        <div className="text-slate-600 font-medium">Data Encrypted</div>
                    </div>
                </div>

                {/* Technology Integration Showcase */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-12 border border-green-100">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold text-slate-900 mb-4">
                            Seamless Technology Integration
                        </h3>
                        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                            Our unified platform combines all technologies into a single,
                            powerful solution for comprehensive disaster management and community protection.
                        </p>
                    </div>

                    {/* Integration Flow */}
                    <div className="flex flex-wrap justify-center items-center gap-8">
                        {/* Sensors */}
                        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-lg border border-green-200">
                            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center">
                                <Wifi className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-semibold text-slate-700">IoT Sensors</span>
                        </div>

                        <div className="text-green-500 text-2xl font-bold">→</div>

                        {/* AI Processing */}
                        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-lg border border-green-200">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
                                <Cpu className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-semibold text-slate-700">AI Processing</span>
                        </div>

                        <div className="text-green-500 text-2xl font-bold">→</div>

                        {/* Mobile Alerts */}
                        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-lg border border-green-200">
                            <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-lime-600 rounded-xl flex items-center justify-center">
                                <Smartphone className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-semibold text-slate-700">Instant Alerts</span>
                        </div>
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-16">
                    <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                        <Shield className="w-5 h-5" />
                        <span>Explore Our Technology</span>
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
