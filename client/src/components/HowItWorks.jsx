import React from "react";
import { Sensors, Brain, Bell, Users } from "lucide-react";

export default function HowItWorks() {
    const steps = [
        {
            icon: Sensors,
            title: "Sensor Network Detection",
            description: "Our distributed IoT sensors continuously monitor environmental conditions, detecting anomalies in real-time across urban and rural areas.",
            step: "01"
        },
        {
            icon: Brain,
            title: "AI Analysis & Verification",
            description: "Advanced machine learning algorithms analyze sensor data and community reports, filtering false positives and validating genuine threats.",
            step: "02"
        },
        {
            icon: Bell,
            title: "Instant Alert Distribution",
            description: "Verified alerts are instantly distributed to affected populations, emergency services, and relevant authorities with precise location data.",
            step: "03"
        },
        {
            icon: Users,
            title: "Community Response",
            description: "Citizens receive actionable information and safety instructions, while emergency responders coordinate efficient disaster response efforts.",
            step: "04"
        }
    ];

    return (
        <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                        How LifeLine360 Works
                    </h2>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                        From detection to response, our integrated platform ensures rapid, accurate,
                        and coordinated disaster management in four simple steps.
                    </p>
                </div>

                <div className="relative">
                    {/* Connection Line */}
                    <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 transform -translate-y-1/2"></div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div key={index} className="relative">
                                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 relative z-10">
                                        <div className="text-center">
                                            <div className="relative inline-block mb-6">
                                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                                                    <Icon className="w-10 h-10 text-white" />
                                                </div>
                                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                                    {step.step}
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-4">{step.title}</h3>
                                            <p className="text-slate-600 leading-relaxed">{step.description}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
