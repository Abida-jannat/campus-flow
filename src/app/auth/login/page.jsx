"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FaGraduationCap, FaArrowRight } from "react-icons/fa";
import { HiOutlineAcademicCap } from "react-icons/hi";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();

  // 1. Session Guard (Redirect if already logged in)
  useEffect(() => {
    async function checkUser() {
      // getSession handles client-side session checking efficiently
      const session = await authClient.getSession();

      // Better Auth sometimes returns data even if there's no session, so check session.data.session.
      // Use .replace() so the "Back" button doesn't create a loop.
      if (session?.data?.session) {
        router.replace("/dashboard");
      }
    }
    
    checkUser();
  }, [router]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      // 2. Clear any previous session *before* signing in (good practice)
      await authClient.signOut();

      // 3. Authenticate with Better Auth
      const { data, error } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        // autoSignIn is true by default, which is what you want here.
      });

      if (error) {
        const errorMsg = error.message ? error.message.toLowerCase() : "";

        // 4. Specific handling for unregistered users vs. wrong credentials
        if (
          error.status === 404 ||
          errorMsg.includes("user not found") ||
          errorMsg.includes("account does not exist") ||
          errorMsg.includes("not registered")
        ) {
          // If the user isn't in the database, show a specific toast and redirect to register.
          toast.error("Account not found. Please register first!");

          setTimeout(() => {
            router.push("/auth/register");
          }, 1500);
        } else {
          // For other errors (like wrong password), show a generic error toast.
          toast.error(error.message || "Invalid credentials. Please try again.");
        }

        setLoading(false);
        return; // Prevent the dashboard redirect on error
      }

      // 5. Successful login
      toast.success("Welcome Back 👋");

      // A small delay before redirecting allows the toast to be seen.
      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);

    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 py-10">

      <div className="w-full max-w-6xl grid lg:grid-cols-2 bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">

        {/* LEFT SIDE */}

        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 relative overflow-hidden">

          {/* Background Glow */}
          <div className="absolute w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl -top-20 -left-20"></div>

          <div className="absolute w-80 h-80 bg-purple-600/20 rounded-full blur-3xl -bottom-24 -right-20"></div>

          <div className="relative z-10">

            <div className="flex items-center gap-4 mb-12">

              <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center">
                <FaGraduationCap className="text-white text-3xl" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-white">
                  CampusFlow
                </h1>

                <p className="text-slate-400">
                  Smart University Ecosystem
                </p>
              </div>

            </div>

            <h2 className="text-5xl font-bold text-white leading-tight">
              Welcome
              <br />
              <span className="text-indigo-400">Back.</span>
            </h2>

            <p className="text-slate-300 mt-8 text-lg leading-8">
              Sign in to continue your academic journey and access your
              personalized dashboard.
            </p>

          </div>

          <div className="relative z-10 space-y-5">

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">
                  Student Dashboard
                </p>
                <p className="text-slate-400 text-sm">
                  Attendance • Schedule • Results
                </p>
              </div>

              <HiOutlineAcademicCap className="text-3xl text-indigo-400" />
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">
                  AI Assistant
                </p>
                <p className="text-slate-400 text-sm">
                  Ready to help anytime
                </p>
              </div>

              <FaArrowRight className="text-indigo-400" />
            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="p-10 lg:p-12 flex flex-col justify-center">

          <div className="mb-8">

            <h2 className="text-4xl font-bold text-white">
              Login
            </h2>

            <p className="text-slate-400 mt-2">
              Sign in to your CampusFlow account.
            </p>

          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}

            <div>
              <label className="block text-slate-300 mb-2">
                University Email
              </label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
                required
              />
            </div>

            {/* Password */}

            <div>
              <label className="block text-slate-300 mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
                required
              />
            </div>

            {/* Remember + Forgot */}

            <div className="flex justify-between items-center text-sm">

              <label className="flex items-center gap-2 text-slate-300">
                <input type="checkbox" />
                Remember Me
              </label>

              <Link
                href="/auth/forgot-password"
                className="text-indigo-400 hover:text-indigo-300"
              >
                Forgot Password?
              </Link>

            </div>

            {/* Login Button */}

            <button
              type="submit"
              disabled={loading} // Prevent double submission
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Login"}
            </button>

          </form>

          <p className="text-center text-slate-400 mt-8">
            Dont have an account?{" "}
            <Link
              href="/auth/register"
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Register
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}