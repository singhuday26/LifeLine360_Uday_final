import React from "react";
import { Star, Quote } from "lucide-react";

export default function Testimonials() {
    const testimonials = [
        {
            name: "Dr. Priya Sharma",
            role: "Emergency Response Coordinator",
            organization: "Mumbai Municipal Corporation",
            image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
            content: "LifeLine360 has transformed our disaster response in Mumbai. During the recent monsoon floods, their accurate alerts helped us evacuate thousands of residents safely and efficiently.",
            rating: 5
        },
        {
            name: "Rajesh Kumar",
            role: "Disaster Management Specialist",
            organization: "National Disaster Management Authority",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            content: "The precision of LifeLine360's sensor network is remarkable. We can now predict and respond to disasters across India's diverse geography with unprecedented accuracy.",
            rating: 5
        },
        {
            name: "Anjali Patel",
            role: "Community Safety Director",
            organization: "Ahmedabad District Administration",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
            content: "Having real-time disaster intelligence has revolutionized how we protect our communities. The system seamlessly integrates with our existing emergency protocols.",
            rating: 5
        }
    ];

    return (
        <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                        Trusted by Indian Emergency Professionals
                    </h2>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                        See what disaster management professionals across India are saying about LifeLine360's
                        impact on community safety and emergency response.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 relative">
                            <Quote className="w-8 h-8 text-blue-500 mb-6" />

                            <div className="flex items-center mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                ))}
                            </div>

                            <p className="text-slate-700 leading-relaxed mb-6 italic">
                                "{testimonial.content}"
                            </p>

                            <div className="flex items-center gap-4">
                                <img
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                                    <div className="text-sm text-slate-600">{testimonial.role}</div>
                                    <div className="text-sm text-blue-600 font-medium">{testimonial.organization}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
