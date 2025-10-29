import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";
import Technology from "../components/Technology";
import Testimonials from "../components/Testimonials";
import Statistics from "../components/Statistics";

export default function HowItWorksPage() {
    return (
        <div className="bg-slate-50 min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
                <section className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-100 to-purple-100" aria-hidden="true" />
                    <div className="relative max-w-6xl mx-auto px-6 lg:px-8 py-20 text-center space-y-6">
                        <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold uppercase tracking-widest">
                            Platform Blueprint
                        </span>
                        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
                            From Detection to Response in Four Coordinated Phases
                        </h1>
                        <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                            LifeLine360 orchestrates IoT sensors, AI decisioning, and community engagement to deliver a comprehensive
                            disaster intelligence stack. Explore the operational model and see how agencies deploy it in the field.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Link
                                to="/dashboard"
                                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-purple-600 text-white text-sm font-semibold shadow-md hover:bg-purple-700 transition-colors"
                            >
                                Launch Live Dashboard
                            </Link>
                            <Link
                                to="/sensors"
                                className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-slate-300 text-slate-700 text-sm font-semibold bg-white/70 backdrop-blur-sm hover:bg-white transition-colors"
                            >
                                Review Sensor Telemetry
                            </Link>
                        </div>
                    </div>
                </section>

                <HowItWorks />
                <Statistics />
                <Features />
                <Technology />
                <Testimonials />
            </main>
            <Footer />
        </div>
    );
}
