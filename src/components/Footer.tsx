// src/components/Footer.tsx

import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
        <div>
          <div className="text-white font-bold mb-2">RideBook</div>
          <div className="text-sm">© {new Date().getFullYear()} RideBook. All rights reserved.</div>
        </div>
        <div>
          <div className="font-semibold mb-2">Quick links</div>
          <div className="flex flex-col gap-1 text-sm">
            <Link to="/about" className="hover:underline">About</Link>
            <Link to="/contact" className="hover:underline">Contact</Link>
            <Link to="/faq" className="hover:underline">FAQ</Link>
          </div>
        </div>
        <div>
          <div className="font-semibold mb-2">Contact</div>
          <div className="text-sm">support@ridebook.example</div>
          <div className="text-sm">+880 1234 567890</div>
        </div>
      </div>
    </footer>
  );
}
