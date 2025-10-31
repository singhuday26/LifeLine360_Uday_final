import React, { useState } from 'react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AlertTriangle, MapPin, Send, CheckCircle, XCircle } from 'lucide-react';
import { getApiBaseUrl } from '../utils/apiConfig';

export default function ReportPage() {
    const [formData, setFormData] = useState({
        incidentType: '',
        severity: 'medium',
        description: '',
        location: '',
        contactName: '',
        contactPhone: '',
        contactEmail: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'

    const incidentTypes = [
        { value: 'flood', label: 'Flood', icon: '🌊' },
        { value: 'fire', label: 'Fire', icon: '🔥' },
        { value: 'earthquake', label: 'Earthquake', icon: '🏔️' },
        { value: 'storm', label: 'Storm', icon: '⛈️' },
        { value: 'accident', label: 'Traffic Accident', icon: '🚨' },
        { value: 'medical', label: 'Medical Emergency', icon: '🚑' },
        { value: 'other', label: 'Other Emergency', icon: '⚠️' }
    ];

    const severityLevels = [
        { value: 'low', label: 'Low', color: 'text-emerald-700 bg-emerald-100' },
        { value: 'medium', label: 'Medium', color: 'text-amber-700 bg-amber-100' },
        { value: 'high', label: 'High', color: 'text-orange-700 bg-orange-100' },
        { value: 'critical', label: 'Critical', color: 'text-red-700 bg-red-100' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            // Simulate API call - replace with actual API endpoint
            const apiUrl = getApiBaseUrl();

            const response = await fetch(`${apiUrl}/api/incident-reports`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    timestamp: new Date().toISOString(),
                    status: 'pending'
                })
            });

            if (response.ok) {
                setSubmitStatus('success');
                // Reset form
                setFormData({
                    incidentType: '',
                    severity: 'medium',
                    description: '',
                    location: '',
                    contactName: '',
                    contactPhone: '',
                    contactEmail: ''
                });
            } else {
                throw new Error('Failed to submit report');
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col pb-20">
            <Navbar />

            {/* Header */}
            <div className="bg-white border-b border-slate-200/60 shadow-sm">
                <div className="max-w-4xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-red-100 to-rose-100 p-3 rounded-xl shadow-sm">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                Report Incident
                            </h1>
                            <p className="text-slate-600 mt-2 font-medium">
                                Submit emergency reports to help coordinate response efforts
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Container */}
            <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
                <div className="bg-white rounded-3xl border-2 border-slate-200/60 shadow-xl overflow-hidden">
                    <div className="p-8">
                        {/* Success/Error Messages */}
                        {submitStatus === 'success' && (
                            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-emerald-600" />
                                <div>
                                    <p className="text-emerald-800 font-bold">Report Submitted Successfully!</p>
                                    <p className="text-emerald-700 text-sm">Emergency services have been notified and will respond shortly.</p>
                                </div>
                            </div>
                        )}

                        {submitStatus === 'error' && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                                <XCircle className="w-6 h-6 text-red-600" />
                                <div>
                                    <p className="text-red-800 font-bold">Failed to Submit Report</p>
                                    <p className="text-red-700 text-sm">Please try again or contact emergency services directly.</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Incident Type */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">
                                    Incident Type *
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {incidentTypes.map((type) => (
                                        <label
                                            key={type.value}
                                            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                formData.incidentType === type.value
                                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                                    : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="incidentType"
                                                value={type.value}
                                                checked={formData.incidentType === type.value}
                                                onChange={handleInputChange}
                                                className="sr-only"
                                                required
                                            />
                                            <span className="text-2xl">{type.icon}</span>
                                            <span className="text-sm font-bold text-slate-700">{type.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Severity Level */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">
                                    Severity Level *
                                </label>
                                <div className="flex gap-3">
                                    {severityLevels.map((level) => (
                                        <label
                                            key={level.value}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${
                                                formData.severity === level.value
                                                    ? 'ring-2 ring-blue-500 shadow-md'
                                                    : 'hover:shadow-sm'
                                            } ${level.color}`}
                                        >
                                            <input
                                                type="radio"
                                                name="severity"
                                                value={level.value}
                                                checked={formData.severity === level.value}
                                                onChange={handleInputChange}
                                                className="sr-only"
                                            />
                                            <span className="text-sm font-bold">{level.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-bold text-slate-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe the incident in detail..."
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                                    rows={4}
                                    required
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label htmlFor="location" className="block text-sm font-bold text-slate-700 mb-2">
                                    Location *
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        placeholder="Street address, landmark, or coordinates"
                                        className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="contactName" className="block text-sm font-bold text-slate-700 mb-2">
                                        Contact Name
                                    </label>
                                    <input
                                        type="text"
                                        id="contactName"
                                        name="contactName"
                                        value={formData.contactName}
                                        onChange={handleInputChange}
                                        placeholder="Your full name"
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="contactPhone" className="block text-sm font-bold text-slate-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="contactPhone"
                                        name="contactPhone"
                                        value={formData.contactPhone}
                                        onChange={handleInputChange}
                                        placeholder="+1 (555) 123-4567"
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="contactEmail" className="block text-sm font-bold text-slate-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="contactEmail"
                                    name="contactEmail"
                                    value={formData.contactEmail}
                                    onChange={handleInputChange}
                                    placeholder="your.email@example.com"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-bold text-lg transition-all duration-300 shadow-lg transform hover:scale-105 hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Submitting Report...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-6 h-6" />
                                            Submit Emergency Report
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}