import React, { useState, useEffect } from "react";
import { TrendingUp, Users, MapPin, Clock } from "lucide-react";

export default function Statistics() {
    const [counters, setCounters] = useState({
        alerts: 0,
        users: 0,
        locations: 0,
        response: 0
    });

    const finalValues = {
        alerts: 2847,
        users: 150000,
        locations: 847,
        response: 1.2
    };

    useEffect(() => {
        const duration = 2000; // 2 seconds
        const steps = 60;
        const stepDuration = duration / steps;

        const intervals = Object.keys(finalValues).map(key => {
            const increment = finalValues[key] / steps;
            let currentStep = 0;

            return setInterval(() => {
                currentStep++;
                setCounters(prev => ({
                    ...prev,
                    [key]: Math.min(Math.floor(increment * currentStep), finalValues[key])
                }));

                if (currentStep >= steps) {
                    clearInterval(intervals.find(interval => interval === this));
                }
            }, stepDuration);
        });

        return () => intervals.forEach(interval => clearInterval(interval));
    }, []);

    const stats = [
        {
            icon: TrendingUp,
            value: counters.alerts.toLocaleString(),
            label: "Alerts Processed",
            suffix: "+",
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            icon: Users,
            value: counters.users.toLocaleString(),
            label: "Protected Citizens",
            suffix: "+",
            color: "text-green-600",
            bg: "bg-green-50"
        },
        {
            icon: MapPin,
            value: counters.locations.toLocaleString(),
            label: "Monitoring Locations",
            suffix: "",
            color: "text-purple-600",
            bg: "bg-purple-50"
        },
        {
            icon: Clock,
            value: counters.response.toFixed(1),
            label: "Avg Response Time",
            suffix: "s",
            color: "text-orange-600",
            bg: "bg-orange-50"
        }
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                        Protecting Communities Worldwide
                    </h2>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                        Our global network of sensors and community reporters work together
                        to keep millions of people safe from natural disasters.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="text-center p-8 rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-lg">
                                <div className={`${stat.bg} ${stat.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                                    <Icon className="w-8 h-8" />
                                </div>
                                <div className="text-4xl lg:text-5xl font-bold text-slate-900 mb-2">
                                    {stat.value}{stat.suffix}
                                </div>
                                <div className="text-slate-600 font-medium">{stat.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
