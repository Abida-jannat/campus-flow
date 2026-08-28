"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FaGraduationCap, FaArrowRight } from "react-icons/fa";
import { HiOutlineAcademicCap } from "react-icons/hi";
import toast from "react-hot-toast";

function redirectByRole(router, role) {
  if (role === "teacher") {
    router.push("/teacher");
  } else if (role === "admin") {
    router.push("/admin");
  } else {
    router.push("/dashboard");
  }
}

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const session = await authClient.getSession();

      if (session?.data?.session) {
        redirectByRole(router, session.data.user?.role);
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
      await authClient.signOut();
      const { error } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        const errorMsg = error.message ? error.message.toLowerCase() : "";

        if (
          error.status === 404 ||
          errorMsg.includes("user not found") ||
          errorMsg.includes("account does not exist") ||
          errorMsg.includes("not registered")
        ) {
          toast.error("Account not found. Please register first!");

          setTimeout(() => {
            router.push("/auth/register");
          }, 1500);
        } else {
          toast.error(error.message || "Invalid credentials. Please try again.");
        }

        setLoading(false);
        return;
      }

      toast.success("Welcome Back 👋");

      const session = await authClient.getSession();
      const role = session?.data?.user?.role;

      setTimeout(() => {
        redirectByRole(router, role);
      }, 100);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-300 dark:bg-slate-950 flex items-center justify-center px-6 py-10 transition-colors duration-300">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border-2 border-slate-400/60 dark:border-slate-800 shadow-2xl shadow-slate-500/50 dark:shadow-none transition-colors duration-300">
        
        {/* LEFT SIDE */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 relative overflow-hidden">
          <div className="absolute w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl -top-20 -left-20"></div>
          <div className="absolute w-80 h-80 bg-purple-600/20 rounded-full blur-3xl -bottom-24 -right-20"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center">
                <FaGraduationCap className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">CampusFlow</h1>
                <p className="text-slate-400">Smart University Ecosystem</p>
              </div>
            </div>

            <h2 className="text-5xl font-bold text-white leading-tight">
              Welcome
              <br />
              <span className="text-indigo-400">Back.</span>
            </h2>

            <p className="text-slate-300 mt-8 text-lg leading-8">
              Sign in to continue your academic journey and access your personalized dashboard.
            </p>
          </div>

          <div className="relative z-10 space-y-5">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">Student Dashboard</p>
                <p className="text-slate-400 text-sm">Attendance • Schedule • Results</p>
              </div>
              <HiOutlineAcademicCap className="text-3xl text-indigo-400" />
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">AI Assistant</p>
                <p className="text-slate-400 text-sm">Ready to help anytime</p>
              </div>
              <FaArrowRight className="text-indigo-400" />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">

          {/* Mobile Brand Header */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
              <FaGraduationCap className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">CampusFlow</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Smart University Ecosystem</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Sign In to Portal 🚀
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm lg:text-base">
              Please enter your details to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                University Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="student@university.edu"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-sm"
                required
              />
            </div>

            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500" />
                Remember Me
              </label>

              <Link
                href="/auth/forgot-password"
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
            {"Don't have an account?"}
            <Link
              href="/auth/register"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-semibold"
            >
              Register Now
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}