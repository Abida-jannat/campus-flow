"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { FaGraduationCap } from "react-icons/fa";
import { HiOutlineMoon, HiOutlineSun, HiBars3, HiXMark } from "react-icons/hi2";

export default function Navbar({ activeTab, setActiveTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();


  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern
    setMounted(true);
  }, []);

  const navLinks = [
    { name: "Home", id: "home" },
    { name: "Features", id: "features" },
    { name: "About", id: "about" },
    { name: "Contact", id: "contact" },
  ];

  return (
    <nav className="w-full bg-background/80 backdrop-blur-lg border-b border-slate-700/40 transition-colors duration-300">
      <div className="max-w-8xl mx-auto flex items-center justify-between px-4 sm:px-8 md:px-15 py-4">
        
 
        <button onClick={() => setActiveTab && setActiveTab("home")} className="flex items-center gap-2">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center">
            <FaGraduationCap className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold">
            Campus<span className="text-indigo-500">Flow</span>
          </h1>
        </button>

    
        <ul className="hidden md:flex items-center gap-10 font-medium">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <li key={link.id}>
                <button
                  onClick={() => setActiveTab && setActiveTab(link.id)}
                  className={`relative py-1 transition duration-300 ${
                    isActive ? "text-indigo-500 font-semibold" : "hover:text-indigo-400"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-full" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>


        <div className="hidden md:flex items-center gap-4">

          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="w-10 h-10 rounded-full bg-slate-800/20 hover:bg-slate-800/40 border border-slate-700/50 flex items-center justify-center transition cursor-pointer"
            >
              {theme === "dark" ? (
                <HiOutlineSun className="text-amber-400 text-xl" />
              ) : (
                <HiOutlineMoon className="text-indigo-600 text-xl" />
              )}
            </button>
          )}

          <Link href="/auth/login">
            <button className="px-6 py-2 border border-slate-700 rounded-xl hover:bg-slate-800/30 transition">
              Login
            </button>
          </Link>

          <Link href="/auth/register">
            <button className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition">
              Register
            </button>
          </Link>
        </div>


        <div className="flex md:hidden items-center gap-3">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="w-10 h-10 rounded-full bg-slate-800/20 flex items-center justify-center"
            >
              {theme === "dark" ? (
                <HiOutlineSun className="text-amber-400 text-xl" />
              ) : (
                <HiOutlineMoon className="text-indigo-600 text-xl" />
              )}
            </button>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-3xl focus:outline-none"
          >
            {isOpen ? <HiXMark /> : <HiBars3 />}
          </button>
        </div>

      </div>
    </nav>
  );
}