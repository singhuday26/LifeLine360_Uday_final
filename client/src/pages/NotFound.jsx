import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NotFound() {
    return (
        <div className="bg-slate-50 min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 flex items-center">
                <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
                    <p className="text-sm font-semibold text-emerald-600 uppercase tracking-widest">404</p>
                    <h1 className="text-4xl font-black text-slate-900">Page not found</h1>
                    <p className="text-slate-600 text-lg">
                        The page you&apos;re looking for has moved or no longer exists. Use the links below to return to a live view of
                        LifeLine360.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-emerald-600 text-white text-sm font-semibold shadow-md hover:bg-emerald-700 transition-colors"
                        >
                            Back to Overview
                        </Link>
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-slate-300 text-slate-700 text-sm font-semibold bg-white hover:bg-slate-100 transition-colors"
                        >
                            Open Dashboard
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
