import React from "react";
import {
    Mail,
    Phone,
    MapPin,
    Twitter,
    Linkedin,
    Github,
    Facebook,
    Shield,
    Zap
} from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold">LifeLine360</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed mb-6">
                            Protecting communities across India with advanced disaster intelligence
                            and real-time emergency response systems.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Platform</h3>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Dashboard</a></li>
                            <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Alerts</a></li>
                            <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Hotspot Map</a></li>
                            <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Analytics</a></li>
                            <li><a href="#" className="text-slate-300 hover:text-white transition-colors">API</a></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Resources</h3>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Documentation</a></li>
                            <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Case Studies</a></li>
                            <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Blog</a></li>
                            <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Support</a></li>
                            <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Training</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Contact</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-blue-400" />
                                <span className="text-slate-300">contact@lifeline360.com</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-blue-400" />
                                <span className="text-slate-300">+91 83803 20579</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-blue-400" />
                                <span className="text-slate-300">VIT-AP University</span>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-4 h-4 text-green-400" />
                                <span className="text-sm font-medium">System Status</span>
                            </div>
                            <div className="text-sm text-green-400">All systems operational</div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
                    <div className="text-slate-400 text-sm">
                        © 2025 LifeLine360. All rights reserved.
                    </div>
                    <div className="flex gap-6 mt-4 sm:mt-0">
                        <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
                        <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Terms of Service</a>
                        <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Security</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
