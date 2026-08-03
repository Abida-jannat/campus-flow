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
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl grid lg:grid-cols-2">

  
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 relative overflow-hidden">

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
              One Campus.
              <br />
              Endless
              <span className="text-indigo-400"> Possibilities.</span>
            </h2>

            <p className="text-slate-300 mt-8 text-lg leading-8">
              Join a modern digital campus where students can manage
              academics, events, clubs, marketplace and much more
              from one platform.
            </p>

          </div>

          <div className="relative z-10 space-y-5">

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center justify-between">

              <div>
                <p className="text-white font-semibold">
                  Student Portal
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
                  Smart Campus
                </p>

                <p className="text-slate-400 text-sm">
                  AI Assistant • Events • Marketplace
                </p>
              </div>

              <FaArrowRight className="text-indigo-400" />

            </div>

          </div>

        </div>


        <div className="p-10 lg:p-12">

          <div className="mb-8">

            <h2 className="text-4xl font-bold text-white">
              Create Account
            </h2>

            <p className="text-slate-400 mt-2">
              Register as a student to access CampusFlow.
            </p>

          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
              required
            />

            <input
              type="text"
              name="universityId"
              placeholder="University ID"
              value={formData.universityId}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
              required
            />
         <div>
  

          <select
           name="department"
           value={formData.department}
           onChange={handleChange}
           className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
           required
           >
         <option value="">Select Department</option>
         <option value="CSE">Computer Science & Engineering (CSE)</option>
        <option value="EEE">Electrical & Electronic Engineering (EEE)</option>
        <option value="BBA">Business Administration (BBA)</option>
        <option value="English">English</option>
        <option value="Law">Law</option>
        <option value="Data Science">Data Science</option>
        <option value="Software Engineering">SWE</option>
     </select>
         </div>

            <input
              type="email"
              name="email"
              placeholder="University Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
              required
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
              required
            />

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 text-white font-semibold py-3 rounded-xl"
            >
              Create Account
            </button>

          </form>

          <p className="text-center text-slate-400 mt-8">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Login
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}