import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import RideBooking from "./pages/RideBooking";
import Navbar from "./components/Navbar";
import DriverDashboard from "./pages/DriverDashboard";
import RideHistory from "./pages/RideHistory";
import EarningsDashboard from "./pages/EarningsDashboard";
import SummaryCards from "./components/SummaryCards"; 
import Footer from "./components/Footer";
import SignUp from "./pages/SignUp";


const App = () => {
  return (
    <Router>
      <Navbar />




      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ride" element={<RideBooking />} />

        {/* ✅ Dashboard Section */}
        <Route
          path="/dashboard"
          element={
            <div className="p-4">
              <SummaryCards />
              <DriverDashboard />
            </div>
          }
        />
        <Route path="/dashboard/earnings" element={<EarningsDashboard />} />
        <Route path="/dashboard/history" element={<RideHistory />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;

