"use client";

import Link from "next/link";
import { FaGraduationCap } from "react-icons/fa";
import { HiOutlineMoon } from "react-icons/hi2";

export default function Navbar() {

  return (
    <nav className="w-full bg-slate-950/90 backdrop-blur-lg border-b border-slate-800">
      <div className="max-w-8xl mx-9 flex items-center justify-between px-15 py-4">    
        <Link href="/" className="flex items-center gap-2">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center">
            <FaGraduationCap className="text-white text-2xl" />
          </div>

          <h1 className="text-2xl font-bold text-white">
            Campus
            <span className="text-indigo-500">Flow</span>
          </h1>
        </Link>

        <ul className="hidden md:flex items-center gap-10 text-gray-300 font-medium">
          <li>
            <Link
              href="/"
              className="hover:text-indigo-400 transition duration-300"
            >
              Home
            </Link>
          </li>

          <li>
            <Link
              href="#features"
              className="hover:text-indigo-400 transition duration-300"
            >
              Features
            </Link>
          </li>

          <li>
            <Link
              href="#about"
              className="hover:text-indigo-400 transition duration-300"
            >
              About
            </Link>
          </li>
        
          <li>
            <Link
              href="#contact"
              className="hover:text-indigo-400 transition duration-300"
            >
              Contact
            </Link>
          </li>
        </ul>

        <div className="hidden md:flex items-center gap-4">

          <button className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition">
            <HiOutlineMoon className="text-white text-xl" />
          </button>        

      <Link href="/auth/login">
        <button className="px-6 py-2 border border-slate-600 rounded-xl text-white hover:bg-slate-800 transition">
         Login
        </button>
      </Link>

          
     <Link href="/auth/register">
          <button className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition">              
       Register
      </button>
      </Link>     
        </div>
        
      </div>
   </nav>
  );
}