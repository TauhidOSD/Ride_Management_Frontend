// src/pages/Home.tsx

import { Link } from "react-router-dom";


export default function Home() {
  return (
    <main>
      {/* HERO */}
      <section className="bg-gradient-to-r from-indigo-600 to-indigo-400 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Fast. Safe. Reliable Rides</h1>
          <p className="mb-6 text-lg">Book rides, track drivers live, and pay securely. For riders, drivers, and admins.</p>
          <div className="flex justify-center gap-3">
            <Link to="/ride" className="px-6 py-3 bg-white text-indigo-700 rounded font-semibold">Book a Ride</Link>
            <Link to="/login" className="px-6 py-3 border rounded text-white">Sign in</Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6 text-center">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 border rounded-lg text-center">
              <h3 className="font-semibold mb-2">1. Book</h3>
              <p>Enter pickup & destination, choose payment method.</p>
            </div>
            <div className="p-6 border rounded-lg text-center">
              <h3 className="font-semibold mb-2">2. Driver</h3>
              <p>Nearby drivers get the request and accept it.</p>
            </div>
            <div className="p-6 border rounded-lg text-center">
              <h3 className="font-semibold mb-2">3. Ride</h3>
              <p>Track live and pay after completion.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6 text-center">Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-white rounded shadow">
              <h4 className="font-semibold">Role-based Dashboards</h4>
              <p className="text-sm text-gray-600">Different experiences for Riders, Drivers and Admins.</p>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <h4 className="font-semibold">RTK + RTK Query</h4>
              <p className="text-sm text-gray-600">Robust state & API caching.</p>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <h4 className="font-semibold">Real-time Sockets</h4>
              <p className="text-sm text-gray-600">Live ride requests and driver tracking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL / CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-xl font-semibold mb-3">What our users say</h3>
          <p className="text-gray-600 mb-6">“Quick pickups and friendly drivers — best ride app I've used.” — Rahim</p>
          <Link to="/ride" className="px-5 py-3 bg-indigo-600 text-white rounded">Try Now</Link>
        </div>
        
      </section>
      
    </main>
  );
}
