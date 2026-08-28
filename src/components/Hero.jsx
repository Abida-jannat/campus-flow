import Image from "next/image";
import {
  FaArrowRight,
  FaUsers,
  FaCalendarAlt,
  FaRobot,
} from "react-icons/fa";

export default function Hero() {
  return (
    <section className="bg-background text-foreground overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">

        <div className="grid lg:grid-cols-2 items-center gap-16">

          <div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              One Campus.
              <br />
              <span className="text-indigo-500">
                Endless Possibilities.
              </span>
            </h1>

            <p className="mt-6 opacity-75 text-lg max-w-xl">
              CampusFlow is your all-in-one university ecosystem.
              Stay connected, organized, and inspired.
            </p>

            <div className="flex gap-4 mt-10">
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-3 rounded-xl font-semibold flex items-center gap-2 transition">
                Get Started
                <FaArrowRight />
              </button>

              <button className="border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50 px-7 py-3 rounded-xl transition">
                Explore Features
              </button>
            </div>

            <div className="flex gap-10 mt-12">
              <div>
                <h2 className="text-3xl font-bold">5000+</h2>
                <p className="opacity-70">Students</p>
              </div>

              <div>
                <h2 className="text-3xl font-bold">100+</h2>
                <p className="opacity-70">Events</p>
              </div>

              <div>
                <h2 className="text-3xl font-bold">10+</h2>
                <p className="opacity-70">Clubs</p>
              </div>
            </div>

          </div>

          <div className="relative flex justify-center">

            <div className="absolute w-80 h-80 bg-indigo-600 rounded-full blur-[120px] opacity-20 dark:opacity-30"></div>

            {/* Dashboard Card Container */}
            <div className="relative bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl backdrop-blur-md p-6 w-full max-w-md">

              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-xl">
                    Student Dashboard
                  </h3>

                  <p className="opacity-70 text-sm">
                    Welcome back 👋
                  </p>
                </div>
              </div>

              <div className="space-y-4">

                <div className="bg-slate-100/80 dark:bg-slate-800/60 rounded-xl p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <FaCalendarAlt className="text-indigo-500 text-xl" />

                    <div>
                      <h4 className="font-medium">Today Classes</h4>
                      <p className="text-sm opacity-70">
                        3 Classes
                      </p>
                    </div>
                  </div>

                  <span className="text-emerald-500 font-medium text-sm">
                    Active
                  </span>
                </div>

                <div className="bg-slate-100/80 dark:bg-slate-800/60 rounded-xl p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <FaUsers className="text-emerald-500 text-xl" />

                    <div>
                      <h4 className="font-medium">Attendance</h4>
                      <p className="text-sm opacity-70">
                        90%
                      </p>
                    </div>
                  </div>

                  <span className="text-emerald-500 font-medium text-sm">
                    Good
                  </span>
                </div>

                <div className="bg-slate-100/80 dark:bg-slate-800/60 rounded-xl p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <FaRobot className="text-pink-500 text-xl" />

                    <div>
                      <h4 className="font-medium">AI Assistant</h4>
                      <p className="text-sm opacity-70">
                        Ask anything
                      </p>
                    </div>
                  </div>

                  <button className="text-indigo-500 hover:underline text-sm font-medium">
                    Open →
                  </button>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}