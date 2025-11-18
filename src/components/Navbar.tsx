// src/components/Navbar.tsx

import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const userJson = typeof window !== 'undefined' && localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
  const role = userJson?.role;

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-indigo-600 text-white flex items-center justify-center font-bold">RB</div>
          <div>
            <div className="font-semibold">RideBook</div>
            <div className="text-xs text-gray-500">Reliable ride booking</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-4">
          <Link to="/" className="text-gray-700 hover:text-indigo-600">Home</Link>
          <Link to="/ride" className="text-gray-700 hover:text-indigo-600">Book Ride</Link>
          <Link to="/ride-history" className="text-gray-700 hover:text-indigo-600">Rides</Link>
          <Link to="/features" className="text-gray-700 hover:text-indigo-600">Features</Link>
          <Link to="/faq" className="text-gray-700 hover:text-indigo-600">FAQ</Link>
        </nav>

        <div className="flex items-center gap-3">
          {!token ? (
            <>
              <Link to="/login" className="px-3 py-1 border rounded text-sm">Login</Link>
              <Link to="/register" className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">Sign up</Link>
            </>
          ) : (
            <div className="relative">
              <button className="flex items-center gap-2 p-1 rounded hover:bg-gray-50">
                <img src={userJson?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userJson?.name||'User')}`} alt="me" className="w-8 h-8 rounded-full" />
                <span className="hidden md:inline">{userJson?.name?.split(' ')[0]}</span>
              </button>
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-md py-1">
                <Link to="/profile" className="block px-3 py-2 hover:bg-gray-50">Profile</Link>
                {role === 'driver' && <Link to="/dashboard" className="block px-3 py-2 hover:bg-gray-50">Driver Dashboard</Link>}
                {role === 'admin' && <Link to="/admin" className="block px-3 py-2 hover:bg-gray-50">Admin</Link>}
                <button onClick={logout} className="w-full text-left px-3 py-2 hover:bg-gray-50">Logout</button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden">
          <Link to="/menu" className="px-2 py-1">☰</Link>
        </div>
      </div>
    </header>
  );
}
