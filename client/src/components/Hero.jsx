import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Play,
    Pause,
    Activity,
    Shield,
    AlertTriangle,
    TrendingUp,
    Globe,
    Users,
    Zap,
    CheckCircle2,
    ArrowRight,
    Sparkles
} from "lucide-react";
import MapVisualization from "./MapVisualization";
import StatusIndicator from "./StatusIndicator";
import ActionButton from "./ActionButton.jsx";

export default function Hero() {
    const [isSimulationPaused, setIsSimulationPaused] = useState(false);
    const [isLiveFeed, setIsLiveFeed] = useState(false);
    const [alertCount, setAlertCount] = useState(12);
    const [animatedStats, setAnimatedStats] = useState({
        sensors: 0,
        reports: 0
    });

    // Animate stats on component mount
    useEffect(() => {
        const duration = 2000;
        const steps = 60;
        const sensorsTarget = 847;
        const reportsTarget = 2400;

        let currentStep = 0;
        const interval = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;

            setAnimatedStats({
                sensors: Math.floor(sensorsTarget * progress),
                reports: Math.floor(reportsTarget * progress)
            });

            if (currentStep >= steps) {
                clearInterval(interval);
                setAnimatedStats({ sensors: sensorsTarget, reports: reportsTarget });
            }
        }, duration / steps);

        return () => clearInterval(interval);
    }, []);

    const handleSimulationToggle = useCallback(() => {
        setIsSimulationPaused(prev => !prev);
        if (!isSimulationPaused) {
            setAlertCount(prev => prev + Math.floor(Math.random() * 3));
        }
    }, [isSimulationPaused]);

    const handleLiveFeedToggle = useCallback(() => {
        setIsLiveFeed(prev => !prev);
        setIsSimulationPaused(false);
    }, []);

    const statusText = useMemo(() => {
        if (isLiveFeed) return "Live monitoring active";
        if (isSimulationPaused) return "Simulation paused";
        return "Demo simulation running";
    }, [isLiveFeed, isSimulationPaused]);

    const statusColor = useMemo(() => {
        if (isLiveFeed) return "text-emerald-600";
        if (isSimulationPaused) return "text-amber-600";
        return "text-green-600";
    }, [isLiveFeed, isSimulationPaused]);

    return (
        <main className="relative min-h-screen bg-white overflow-hidden">
            {/* Premium White Background with Subtle Green Accents */}
            <div className="absolute inset-0">
                {/* Main clean background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/30 to-green-50/20"></div>
                {/* Subtle geometric patterns */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-green-50/10 to-emerald-50/20"></div>
                {/* Elegant radial accents */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.08),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.06),transparent_50%)]"></div>
            </div>

            {/* Minimal Floating Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Subtle green accent dots */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-400/40 rounded-full animate-ping"></div>
                <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-emerald-400/30 rounded-full animate-pulse"></div>
                <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-green-300/50 rounded-full animate-bounce"></div>
                <div className="absolute top-1/2 left-1/5 w-1 h-1 bg-emerald-300/40 rounded-full animate-ping"></div>
                <div className="absolute bottom-1/3 right-1/4 w-0.5 h-0.5 bg-green-400/60 rounded-full animate-pulse"></div>
            </div>

            <section className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-8 py-12 lg:py-20">
                <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center min-h-screen">
                    {/* Content Section - Takes 2 columns */}
                    <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
                        {/* Status Badge */}
                        <div className="animate-fade-in">
                            <StatusIndicator
                                status={statusText}
                                colorClass={statusColor}
                                icon={isLiveFeed ? Activity : isSimulationPaused ? Pause : Play}
                                alertCount={alertCount}
                            />
                        </div>

                        {/* Hero Text - Premium styling */}
                        <div className="space-y-6 animate-slide-up">
                            <div className="space-y-5">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-5 h-5 text-green-500" />
                                    <span className="text-green-600 font-semibold text-xs tracking-wide uppercase bg-green-50 px-3 py-1 rounded-full">
                                        Advanced Intelligence Platform
                                    </span>
                                </div>

                                <h1
                                    id="hero-title"
                                    className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight tracking-tight"
                                >
                                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 mb-2">
                                        LifeLine360
                                    </span>
                                    <span className="block text-slate-900 font-bold text-2xl sm:text-3xl lg:text-4xl">
                                        Hyper-Local Disaster Intelligence
                                    </span>
                                </h1>

                                <p className="text-lg sm:text-xl text-slate-700 leading-relaxed font-light">
                                    Enterprise-grade disaster intelligence platform combining
                                    <span className="text-green-600 font-semibold"> real-time sensors</span>,
                                    <span className="text-emerald-600 font-semibold"> AI analytics</span>, and
                                    <span className="text-green-700 font-semibold"> community insights</span>
                                    to protect millions of lives.
                                </p>
                            </div>

                            {/* Trust Indicators - Clean white cards with green accents */}
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-green-100">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <span className="font-medium text-slate-700">SOC 2 Certified</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-green-100">
                                    <Shield className="w-4 h-4 text-green-500" />
                                    <span className="font-medium text-slate-700">Enterprise Ready</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-green-100">
                                    <Globe className="w-4 h-4 text-emerald-500" />
                                    <span className="font-medium text-slate-700">India Scale</span>
                                </div>
                            </div>
                        </div>

                        {/* Premium White Stats Cards with Green Accents */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-red-100 to-orange-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative p-6 bg-white rounded-2xl border border-slate-200 hover:border-red-200 transition-all duration-300 shadow-lg hover:shadow-xl">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                                            <AlertTriangle className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    </div>
                                    <div className="text-3xl font-bold text-slate-900 mb-1">{alertCount}</div>
                                    <div className="text-sm text-slate-600 font-medium">Active Alerts</div>
                                </div>
                            </div>

                            <div className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative p-6 bg-white rounded-2xl border border-slate-200 hover:border-green-200 transition-all duration-300 shadow-lg hover:shadow-xl">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                            <Activity className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    </div>
                                    <div className="text-3xl font-bold text-slate-900 mb-1">{animatedStats.sensors.toLocaleString()}</div>
                                    <div className="text-sm text-slate-600 font-medium">Sensors Online</div>
                                </div>
                            </div>

                            <div className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-green-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-200 transition-all duration-300 shadow-lg hover:shadow-xl">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                                            <Users className="w-5 h-5 text-white" />
                                        </div>
                                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div className="text-3xl font-bold text-slate-900 mb-1">{(animatedStats.reports / 1000).toFixed(1)}k</div>
                                    <div className="text-sm text-slate-600 font-medium">Community Reports</div>
                                </div>
                            </div>
                        </div>

                        {/* Premium Action Buttons */}
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-4">
                                <ActionButton
                                    onClick={handleSimulationToggle}
                                    variant="outline-white"
                                    icon={isSimulationPaused ? Play : Pause}
                                    disabled={isLiveFeed}
                                    ariaLabel={`${isSimulationPaused ? 'Resume' : 'Pause'} simulation`}
                                    className="group relative overflow-hidden flex-1"
                                >
                                    <span className="relative z-10 text-sm">
                                        {isSimulationPaused ? 'Resume' : 'Pause'} Simulation
                                    </span>
                                </ActionButton>

                                <ActionButton
                                    onClick={handleLiveFeedToggle}
                                    variant={isLiveFeed ? "danger-white" : "green-premium"}
                                    icon={isLiveFeed ? AlertTriangle : Activity}
                                    ariaLabel={`${isLiveFeed ? 'Disable' : 'Enable'} live feed`}
                                    className="group relative overflow-hidden flex-1"
                                >
                                    <span className="relative z-10 text-sm">
                                        {isLiveFeed ? 'Disable' : 'Use'} Live Feed
                                    </span>
                                </ActionButton>
                            </div>

                            <Link to="/dashboard" className="w-full">
                                <ActionButton
                                    variant="green-outline"
                                    icon={Shield}
                                    fullWidth
                                    ariaLabel="Navigate to dashboard"
                                    className="group relative overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2 text-sm">
                                        Access Dashboard
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </ActionButton>
                            </Link>
                        </div>

                        {/* Clean System Health Indicators */}
                        <div className="flex flex-wrap items-center gap-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                                </div>
                                <span className="text-slate-700 font-semibold text-sm">99.99% Uptime</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Zap className="w-4 h-4 text-green-500" />
                                <span className="text-slate-700 font-semibold text-sm">&lt; 500ms Response</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Shield className="w-4 h-4 text-emerald-500" />
                                <span className="text-slate-700 font-semibold text-sm">ISO 27001</span>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Visualization Section */}
                    <div className="lg:col-span-3 order-1 lg:order-2 flex justify-center lg:justify-end animate-slide-up-delay">
                        <div className="relative w-full max-w-4xl">
                            {/* Subtle background effects */}
                            <div className="absolute inset-0 bg-gradient-to-r from-green-100/30 to-emerald-100/30 rounded-3xl blur-3xl"></div>
                            <div className="absolute -inset-4 bg-gradient-to-r from-green-50/20 to-emerald-50/20 rounded-3xl blur-2xl"></div>

                            {/* Clean white container */}
                            <div className="relative bg-white rounded-3xl border border-slate-200 p-8 shadow-2xl">
                                <MapVisualization
                                    isActive={!isSimulationPaused}
                                    isLiveFeed={isLiveFeed}
                                    alertCount={alertCount}
                                />
                            </div>

                            {/* Minimal decorative elements */}
                            <div className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full animate-bounce opacity-80"></div>
                            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full animate-pulse opacity-60"></div>
                        </div>
                    </div>
                </div>

                {/* Premium Bottom CTA */}
                <div className="mt-20 text-center">
                    <div className="inline-flex items-center gap-6 px-8 py-6 bg-white rounded-2xl border border-slate-200 shadow-xl">
                        <div className="flex items-center -space-x-2">
                            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-lg" />
                            <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face" alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-lg" />
                            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-lg" />
                            <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                +500
                            </div>
                        </div>
                        <span className="text-slate-700 font-semibold">
                            Trusted by emergency professionals across India
                        </span>
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-4 h-4 text-yellow-400 fill-current">⭐</div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Custom CSS for animations */}
            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out;
                }
                .animate-slide-up {
                    animation: slide-up 1s ease-out;
                }
                .animate-slide-up-delay {
                    animation: slide-up 1s ease-out 0.3s both;
                }
            `}</style>
        </main>
    );
}
