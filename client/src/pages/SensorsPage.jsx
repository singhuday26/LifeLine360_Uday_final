import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HotspotMap from "../components/HotspotMap";
import SensorReadings from "../components/SensorReadings";
import Alerts from "../components/Alerts";

export default function SensorsPage() {
    return (
        <div className="bg-slate-50 min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
                <section className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-slate-50 to-blue-100" aria-hidden="true" />
                    <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20">
                        <div className="max-w-3xl space-y-6">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-widest">
                                Live Sensor Network
                            </span>
                            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
                                Comprehensive Environmental Intelligence in Real Time
                            </h1>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                Monitor fire, flood, seismic, and atmospheric conditions from a single command center.
                                LifeLine360 blends IoT telemetry with AI analytics to help teams respond before incidents escalate.
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                                <Link
                                    to="/dashboard"
                                    className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-emerald-600 text-white text-sm font-semibold shadow-md hover:bg-emerald-700 transition-colors"
                                >
                                    Open Operations Dashboard
                                </Link>
                                <Link
                                    to="/how-it-works"
                                    className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-slate-300 text-slate-700 text-sm font-semibold bg-white/60 backdrop-blur-sm hover:bg-white transition-colors"
                                >
                                    Learn How the Platform Works
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-8 items-start">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-slate-900">Incident Hotspot Map</h2>
                            <p className="text-slate-600">
                                Track verified incidents as they unfold. Filter by category, adjust map layers, and review historical
                                reports to coordinate mitigation strategies with confidence.
                            </p>
                            <p className="text-sm text-slate-500">
                                Hotspot data automatically refreshes every few seconds while live monitoring is enabled. Pause updates to
                                perform detailed investigations without losing context.
                            </p>
                        </div>
                        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                            <HotspotMap />
                        </div>
                    </div>
                </section>

                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-8 items-stretch">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-slate-900">Deep Sensor Telemetry</h2>
                            <p className="text-slate-600">
                                View granular readings for temperature, humidity, smoke, gas levels, water flow, atmospheric quality, and
                                more. Automatic thresholds highlight anomalies and elevate priority incidents for rapid response.
                            </p>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600 space-y-3">
                                <p className="font-semibold text-slate-800">Highlights</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Adaptive warning levels tuned per sensor type.</li>
                                    <li>Automatic retry logic with manual refresh controls.</li>
                                    <li>Supports hybrid telemetry sources including LoRaWAN and cellular.</li>
                                </ul>
                            </div>
                        </div>
                        <div className="rounded-3xl bg-slate-900 text-white shadow-2xl overflow-hidden border border-slate-700">
                            <SensorReadings />
                        </div>
                    </div>
                </section>

                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="mb-8 max-w-3xl">
                            <h2 className="text-3xl font-bold text-slate-900">Live Alert Feed</h2>
                            <p className="text-slate-600">
                                Consolidated alerting provides triage-ready intelligence across all sensor clusters. Assign teams,
                                mark alerts as resolved, and archive incidents with a single click.
                            </p>
                        </div>
                        <Alerts />
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
