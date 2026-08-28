"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FaGraduationCap, FaArrowRight } from "react-icons/fa";
import { HiOutlineAcademicCap } from "react-icons/hi";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    universityId: "",
    department: "",
    role: "student",
    semester: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const session = await authClient.getSession();

      if (session?.data) {
        router.replace("/dashboard");
      }
    }

    checkUser();
  }, [router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await authClient.signUp.email({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department,
        semester: formData.semester,
        studentId: formData.universityId,
        autoSignIn: false,
      });

      if (error) {
        const errorMsg = error.message ? error.message.toLowerCase() : "";

        if (
          error.status === 400 ||
          errorMsg.includes("already exists") ||
          errorMsg.includes("user_already_exists") ||
          errorMsg.includes("email already in use")
        ) {
          toast.error("Account already exists! Redirecting to login...");

          setTimeout(() => {
            router.push("/auth/login");
          }, 1500);
        } else {
          toast.error(error.message || "Registration Failed");
        }

        setLoading(false);
        return;
      }

      await authClient.signOut();

      toast.success("Registration Successful! Please log in.");

      setTimeout(() => {
        router.push("/auth/login");
      }, 300);

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
              One Campus.
              <br />
              Endless
              <span className="text-indigo-400"> Possibilities.</span>
            </h2>

            <p className="text-slate-300 mt-8 text-lg leading-8">
              Join a modern digital campus where students can manage academics, events, clubs, marketplace and much more from one platform.
            </p>
          </div>

          <div className="relative z-10 space-y-5">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">Student Portal</p>
                <p className="text-slate-400 text-sm">Attendance • Schedule • Results</p>
              </div>
              <HiOutlineAcademicCap className="text-3xl text-indigo-400" />
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">Smart Campus</p>
                <p className="text-slate-400 text-sm">AI Assistant • Events • Marketplace</p>
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
              Create Account 🚀
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm lg:text-base">
              Register to access CampusFlow.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-sm"
              required
            >
              <option value="student">Register as Student</option>
              <option value="teacher">Register as Teacher</option>
            </select>

            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-sm"
              required
            />

            <input
              type="text"
              name="universityId"
              placeholder={formData.role === "teacher" ? "Employee ID" : "University ID"}
              value={formData.universityId}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-sm"
              required
            />

            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-sm"
              required
            >
              <option value="">Select Department</option>
              <option value="CSE">Computer Science & Engineering (CSE)</option>
              <option value="EEE">Electrical & Electronic Engineering (EEE)</option>
              <option value="BBA">Business Administration (BBA)</option>
              <option value="English">English</option>
              <option value="Law">Law</option>
              <option value="Data Science">Data Science</option>
              <option value="SWE">Software Engineering (SWE)</option>
            </select>

            {formData.role === "student" && (
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-sm"
                required
              >
                <option value="">Select Semester</option>
                <option value="Spring 2026">Spring 2026</option>
                <option value="Summer 2026">Summer 2026</option>
              </select>
            )}

            <input
              type="email"
              name="email"
              placeholder="University Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-sm"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-sm"
              required
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-sm"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-semibold"
            >
              Login
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}