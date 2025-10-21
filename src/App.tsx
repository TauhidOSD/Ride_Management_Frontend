
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import RideBooking from "./pages/RideBooking";
import Navbar from "./components/Navbar";
import RideListRTK from "./components/RideListRTK";

const App = () => {
  return (
    <Router>
       <Navbar />
       <RideListRTK />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ride" element={<RideBooking />} />
      </Routes>
    </Router>
  );
};

export default App;
