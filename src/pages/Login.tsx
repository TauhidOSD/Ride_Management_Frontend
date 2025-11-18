/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/SignIn.tsx
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Provide email and password"); return; }
    setSubmitting(true);
    const toastId = toast.loading("Signing in...");
    try {
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw data;

      const token = data.token ? (data.token.startsWith("Bearer ") ? data.token : `Bearer ${data.token}`) : null;
      const user = data.user ?? data;

      if (token) localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      toast.success("Signed in", { id: toastId });
      // redirect by role
      if (user?.role === "driver") navigate("/dashboard");
      else if (user?.role === "admin") navigate("/admin");
      else navigate("/");
    } catch (err: any) {
      console.error("signin err", err);
      const msg = err?.message || err?.data?.message || "Login failed";
      toast.error(msg, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
        <p className="text-sm text-gray-500 mb-4">Sign in to continue to RideBook</p>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" className="mt-1 w-full p-3 border rounded" placeholder="you@example.com" />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" className="mt-1 w-full p-3 border rounded" />
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={submitting} className={`flex-1 py-3 rounded-lg text-white ${submitting ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"}`}>
              {submitting ? "Signing in..." : "Sign in"}
            </button>
            <Link to="/register" className="text-sm px-3 py-2 border rounded">Create</Link>
          </div>
        </form>

        <div className="mt-4 text-xs text-gray-500">
          If don't have any account? <a className="text-indigo-600" href="/register">Register</a>
        </div>
      </div>
    </div>
  );
}
