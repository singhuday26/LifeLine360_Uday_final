import Navbar from "../components/Navbar";
import Dashboard from "../components/Dashboard";
import Footer from "../components/Footer";

export default function DashboardPage() {
    return (
        <div className="bg-slate-50 min-h-screen flex flex-col">
            <Navbar />
            <Dashboard />
            <Footer />
        </div>
    );
}
