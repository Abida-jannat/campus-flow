"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Footer from "@/components/Footer";

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col justify-between transition-colors duration-300">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-grow">
        {activeTab === "home" && (
          <div>
            <Hero />
            <Stats />
          </div>
        )}

        {activeTab === "features" && (
          <div className="py-12">
            <Stats />
          </div>
        )}

        {activeTab === "about" && (
          <div className="py-12">
            <Hero />
          </div>
        )}

        {activeTab === "contact" && (
          <div className="py-12">
            <Footer />
          </div>
        )}
      </main>

      {activeTab !== "contact" && <Footer />}
    </div>
  );
}
