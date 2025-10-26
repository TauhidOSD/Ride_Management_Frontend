import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import RideBooking from "./pages/RideBooking";
import Navbar from "./components/Navbar";
import DriverDashboard from "./pages/DriverDashboard";
import RideHistory from "./pages/RideHistory";
import EarningsDashboard from "./pages/EarningsDashboard";
import SummaryCards from "./components/SummaryCards"; // ✅ Import added

const App = () => {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
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
    </Router>
  );
};

export default App;

// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Home from "./pages/Home";
// import Login from "./pages/Login";
// import Profile from "./pages/Profile";
// import RideBooking from "./pages/RideBooking";
// import Navbar from "./components/Navbar";
// import DriverDashboard from "./pages/DriverDashboard";
// //import Earnings from "./pages/Earnings";
// import RideHistory from "./pages/RideHistory";
// import EarningsDashboard from "./pages/EarningsDashboard";

// const App = () => {
//   return (
//     <Router>
//       <Navbar />

//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/profile" element={<Profile />} />
//         <Route path="/ride" element={<RideBooking />} />

//         {/* ✅ Driver dashboard nested routing */}
//         <Route path="/dashboard" element={<DriverDashboard />} />
//         <Route path="/dashboard/earnings" element={<EarningsDashboard />} />
//         <Route path="/dashboard/history" element={<RideHistory />} />
//       </Routes>
//     </Router>
//   );
// };

// export default App;



        

