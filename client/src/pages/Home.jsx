import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import Features from "../components/Features";
import Statistics from "../components/Statistics";
import Technology from "../components/Technology";
import Testimonials from "../components/Testimonials";
export default function Home() {
    return (
        <div className="bg-slate-50 min-h-screen flex flex-col">
            <Navbar />
            <Hero />
            <Statistics />
            <Features />
            <Statistics />
            <Technology />
            <Testimonials />
            <Footer />
        </div>
    );
}
