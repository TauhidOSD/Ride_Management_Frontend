/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/SignUp.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

type Role = "rider" | "driver";

export default function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>("rider");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const validate = () => {
    if (!name.trim()) { toast.error("Name required"); return false; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { toast.error("Valid email required"); return false; }
    if (!phone.trim() || phone.length < 6) { toast.error("Valid phone required"); return false; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return false; }
    if (password !== confirm) { toast.error("Password and Confirm must match"); return false; }
    return true;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const toastId = toast.loading("Registering...");
    try {
      const res = await fetch(`${apiBase}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim(), password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw data;

      // Expect { token, user }
      const token = data.token ? (data.token.startsWith("Bearer ") ? data.token : `Bearer ${data.token}`) : null;
      const user = data.user ?? data;

      if (token) localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      toast.success("Registration successful", { id: toastId });
      // redirect to home or dashboard based on role
      if (user?.role === "driver") navigate("/dashboard");
      else navigate("/");
    } catch (err: any) {
      console.error("signup err:", err);
      const msg = err?.message || err?.data?.message || "Registration failed";
      toast.error(msg, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-bold mb-2">Create your account</h2>
        <p className="text-sm text-gray-500 mb-4">Sign up as Rider or Driver.</p>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-sm font-medium">Full name</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="mt-1 w-full p-3 border rounded" placeholder="Your name" />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" className="mt-1 w-full p-3 border rounded" placeholder="you@example.com" />
          </div>

          <div>
            <label className="text-sm font-medium">Phone</label>
            <input value={phone} onChange={(e)=>setPhone(e.target.value)} className="mt-1 w-full p-3 border rounded" placeholder="+8801..." />
          </div>

          <div>
            <label className="text-sm font-medium">Role</label>
            <select value={role} onChange={(e)=>setRole(e.target.value as Role)} className="mt-1 w-full p-3 border rounded">
              <option value="rider">Rider</option>
              <option value="driver">Driver</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" className="mt-1 w-full p-3 border rounded" placeholder="At least 6 characters" />
          </div>

          <div>
            <label className="text-sm font-medium">Confirm Password</label>
            <input value={confirm} onChange={(e)=>setConfirm(e.target.value)} type="password" className="mt-1 w-full p-3 border rounded" />
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={submitting} className={`flex-1 py-3 rounded-lg text-white ${submitting ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"}`}>
              {submitting ? "Creating..." : "Create account"}
            </button>
            <Link to="/login" className="text-sm px-3 py-2 border rounded">Sign in</Link>
          </div>
        </form>

        <div className="mt-4 text-xs text-gray-500">
          By creating an account you agree to our <a className="text-indigo-600" href="/terms">Terms</a>.
        </div>
      </div>
    </div>
  )
}
