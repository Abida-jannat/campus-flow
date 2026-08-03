import Image from "next/image";
import {
  FaArrowRight,
  FaUsers,
  FaCalendarAlt,
  FaRobot,
} from "react-icons/fa";

export default function Hero() {
  return (
    <section className="bg-slate-950 text-white overflow-hidden">
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

          <p className="mt-6 text-gray-400 text-lg max-w-xl">
            CampusFlow is your all-in-one university ecosystem.
            Stay connected, organized, and inspired.
          </p>

            <div className="flex gap-4 mt-10">

              <button className="bg-indigo-600 hover:bg-indigo-500 px-7 py-3 rounded-xl font-semibold flex items-center gap-2 transition">
                Get Started
                <FaArrowRight />
              </button>

              <button className="border border-slate-700 hover:bg-slate-800 px-7 py-3 rounded-xl transition">
                Explore Features
              </button>

            </div>


            <div className="flex gap-10 mt-12">

              <div>
                <h2 className="text-3xl font-bold">5000+</h2>
                <p className="text-slate-400">Students</p>
              </div>

              <div>
                <h2 className="text-3xl font-bold">100+</h2>
                <p className="text-slate-400">Events</p>
              </div>

              <div>
                <h2 className="text-3xl font-bold">10+</h2>
                <p className="text-slate-400">Clubs</p>
              </div>

            </div>

          </div>


          <div className="relative flex justify-center">

            <div className="absolute w-80 h-80 bg-indigo-600 rounded-full blur-[120px] opacity-30"></div>


            <div className="relative bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 w-full max-w-md">


              <div className="flex justify-between items-center mb-6">

                <div>
                  <h3 className="font-bold text-xl">
                    Student Dashboard
                  </h3>

                  <p className="text-slate-400 text-sm">
                    Welcome back 👋
                  </p>
                </div>
              </div>

              <div className="space-y-4">

                <div className="bg-slate-800 rounded-xl p-4 flex justify-between items-center">

                  <div className="flex items-center gap-3">
                    <FaCalendarAlt className="text-indigo-400 text-xl" />

                    <div>
                      <h4>Today Classes</h4>
                      <p className="text-sm text-slate-400">
                        3 Classes
                      </p>
                    </div>
                  </div>

                  <span className="text-green-400">
                    Active
                  </span>

                </div>

                <div className="bg-slate-800 rounded-xl p-4 flex justify-between items-center">

                  <div className="flex items-center gap-3">
                    <FaUsers className="text-green-400 text-xl" />

                    <div>
                      <h4>Attendance</h4>
                      <p className="text-sm text-slate-400">
                        90%
                      </p>
                    </div>
                  </div>

                  <span className="text-green-400">
                    Good
                  </span>

                </div>

                <div className="bg-slate-800 rounded-xl p-4 flex justify-between items-center">

                  <div className="flex items-center gap-3">
                    <FaRobot className="text-pink-400 text-xl" />

                    <div>
                      <h4>AI Assistant</h4>
                      <p className="text-sm text-slate-400">
                        Ask anything
                      </p>
                    </div>
                  </div>

                  <button className="text-indigo-400">
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