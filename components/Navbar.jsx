"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await api.get("/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <Link
        href="/"
        className="text-2xl font-bold text-yellow-400 tracking-wide"
      >
        Akash Jewellers
      </Link>

      <div className="flex space-x-6 items-center">
        {!user ? (
          <>
            <Link href="/register" className="hover:text-yellow-400 transition">
              Register
            </Link>
            <Link href="/login" className="hover:text-yellow-400 transition">
              Login
            </Link>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="bg-yellow-500 px-4 py-2 rounded-md font-semibold hover:bg-yellow-600 transition"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
