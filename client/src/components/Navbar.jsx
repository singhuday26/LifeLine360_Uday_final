import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, BarChart3 } from "lucide-react";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <nav className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Brand/Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl text-slate-800">LifeLine360</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/"
                            className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors duration-200 hover:underline underline-offset-4"
                        >
                            Overview
                        </Link>
                        <Link
                            to="/dashboard"
                            className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors duration-200 hover:underline underline-offset-4"
                        >
                            Dashboard
                        </Link>
                        <a
                            href="#sensors"
                            className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors duration-200 hover:underline underline-offset-4"
                        >
                            Sensors
                        </a>
                        <a
                            href="#how-it-works"
                            className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors duration-200 hover:underline underline-offset-4"
                        >
                            How it works
                        </a>
                    </div>

                    {/* CTA Button & Mobile Menu Button */}
                    <div className="flex items-center gap-4">
                        <button className="hidden sm:inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]">
                            Open Demo
                        </button>

                        {/* Mobile CTA Button */}
                        <button className="sm:hidden inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
                            Demo
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={toggleMenu}
                            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors duration-200"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMenuOpen ? (
                                <X className="block h-5 w-5" />
                            ) : (
                                <Menu className="block h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                <div className={`md:hidden transition-all duration-300 ease-in-out ${
                    isMenuOpen
                        ? 'max-h-64 opacity-100 pb-4'
                        : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                    <div className="px-2 pt-2 pb-3 space-y-1 bg-slate-50 rounded-lg mt-2 border border-slate-200">
                        <Link
                            to="/"
                            onClick={closeMenu}
                            className="block px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg text-sm font-medium transition-all duration-200"
                        >
                            Overview
                        </Link>
                        <Link
                            to="/dashboard"
                            onClick={closeMenu}
                            className="block px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg text-sm font-medium transition-all duration-200"
                        >
                            Dashboard
                        </Link>
                        <a
                            href="#sensors"
                            onClick={closeMenu}
                            className="block px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg text-sm font-medium transition-all duration-200"
                        >
                            Sensors
                        </a>
                        <a
                            href="#how-it-works"
                            onClick={closeMenu}
                            className="block px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg text-sm font-medium transition-all duration-200"
                        >
                            How it works
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
}
