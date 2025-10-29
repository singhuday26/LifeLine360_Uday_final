import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import DashboardPage from "./pages/DashboardPage";
import SensorsPage from "./pages/SensorsPage";
import HowItWorksPage from "./pages/HowItWorksPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/sensors" element={<SensorsPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
            </Routes>
        </Router>
    );
}

export default App;
