import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import DashboardPage from "./pages/DashboardPage";
import MapPage from "./pages/MapPage";
import ReportPage from "./pages/ReportPage";
import SensorsPage from "./pages/SensorsPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import {
    BarChart3,
    Map,
    AlertTriangle,
    Activity,
    Settings,
    Home as HomeIcon
} from "lucide-react";

// Bottom Tab Navigation Component
function BottomTabNavigation() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(location.pathname);

    useEffect(() => {
        setActiveTab(location.pathname);
    }, [location.pathname]);

    const tabs = [
        {
            id: 'home',
            path: '/',
            label: 'Home',
            icon: HomeIcon,
            color: 'from-blue-500 to-indigo-500'
        },
        {
            id: 'dashboard',
            path: '/dashboard',
            label: 'Dashboard',
            icon: BarChart3,
            color: 'from-emerald-500 to-teal-500'
        },
        {
            id: 'map',
            path: '/map',
            label: 'Map',
            icon: Map,
            color: 'from-purple-500 to-pink-500'
        },
        {
            id: 'report',
            path: '/report',
            label: 'Report',
            icon: AlertTriangle,
            color: 'from-red-500 to-rose-500'
        }
    ];

    const handleTabClick = (tab) => {
        setActiveTab(tab.path);
        navigate(tab.path);
    };

    // Don't show bottom tabs on certain pages
    const hideTabsOn = ['/sensors', '/how-it-works', '/login', '/register', '/admin'];
    if (hideTabsOn.includes(location.pathname)) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t-2 border-slate-200/60 shadow-2xl z-50">
            <div className="max-w-md mx-auto px-4 py-2">
                <div className="flex justify-around items-center">
                    {tabs.map((tab) => {
                        const IconComponent = tab.icon;
                        const isActive = activeTab === tab.path;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab)}
                                className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 min-w-[80px] ${
                                    isActive
                                        ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-110`
                                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                                }`}
                            >
                                <IconComponent
                                    className={`w-6 h-6 mb-1 transition-transform duration-300 ${
                                        isActive ? 'scale-110' : ''
                                    }`}
                                />
                                <span className={`text-xs font-bold transition-all duration-300 ${
                                    isActive ? 'scale-105' : ''
                                }`}>
                                    {tab.label}
                                </span>
                                {isActive && (
                                    <div className={`absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r ${tab.color} rounded-full`}></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// Main App Component
function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="relative min-h-screen">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/how-it-works" element={<HowItWorksPage />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/map" element={<MapPage />} />
                        <Route path="/report" element={<ReportPage />} />
                        <Route path="/sensors" element={<SensorsPage />} />
                    </Route>

                    {/* Admin-only Route */}
                    <Route element={<ProtectedRoute allowedRoles={["fire_admin", "flood_admin", "super_admin"]} />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                    </Route>

                    {/* 404 Page */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
                {/* Bottom Tab Navigation */}
                    <BottomTabNavigation />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
