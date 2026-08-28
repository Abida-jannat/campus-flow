import Link from "next/link";
import {
  FaFacebookF,
  FaGithub,
  FaLinkedinIn,
  FaInstagram,
  FaGraduationCap,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-gray-300 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-5 py-9">

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">

          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <FaGraduationCap className="text-white text-2xl" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Campus<span className="text-indigo-500">Flow</span>
              </h2>
            </div>

            <p className="text-slate-500 dark:text-gray-400">
              A modern university ecosystem that connects students,
              teachers, and administrators in one smart platform.
            </p>

            <div className="flex gap-4 mt-6">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white transition flex items-center justify-center text-slate-700 dark:text-gray-300"
              >
                <FaFacebookF />
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white transition flex items-center justify-center text-slate-700 dark:text-gray-300"
              >
                <FaGithub />
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white transition flex items-center justify-center text-slate-700 dark:text-gray-300"
              >
                <FaLinkedinIn />
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white transition flex items-center justify-center text-slate-700 dark:text-gray-300"
              >
                <FaInstagram />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-slate-900 dark:text-white text-lg font-semibold mb-5">
              Quick Links
            </h3>

            <ul className="space-y-3">
              <li><Link href="/" className="hover:text-indigo-500 dark:hover:text-indigo-400">Home</Link></li>
              <li><Link href="#" className="hover:text-indigo-500 dark:hover:text-indigo-400">Features</Link></li>
              <li><Link href="#" className="hover:text-indigo-500 dark:hover:text-indigo-400">Modules</Link></li>
              <li><Link href="#" className="hover:text-indigo-500 dark:hover:text-indigo-400">About</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-slate-900 dark:text-white text-lg font-semibold mb-5">
              Modules
            </h3>

            <ul className="space-y-3 text-slate-500 dark:text-gray-400">
              <li>Attendance</li>
              <li>Class Schedule</li>
              <li>Marketplace</li>
              <li>Discussion Forum</li>
              <li>AI Assistant</li>
            </ul>
          </div>

          <div>
            <h3 className="text-slate-900 dark:text-white text-lg font-semibold mb-5">
              Contact
            </h3>

            <ul className="space-y-3 text-slate-500 dark:text-gray-400">
              <li>📍 Sylhet, Bangladesh</li>
              <li>📧 info@campusflow.com</li>
              <li>📞 +880 1234-567890</li>
            </ul>

            <button className="mt-6 bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl text-white font-medium transition shadow-lg shadow-indigo-600/20">
              Get Started
            </button>
          </div>

        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 dark:text-gray-500">

          <p>
            © 2026 CampusFlow. All rights reserved.
          </p>

          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-indigo-500 dark:hover:text-indigo-400">
              Privacy Policy
            </Link>

            <Link href="#" className="hover:text-indigo-500 dark:hover:text-indigo-400">
              Terms of Service
            </Link>

            <Link href="#" className="hover:text-indigo-500 dark:hover:text-indigo-400">
              Support
            </Link>
          </div>

        </div>

      </div>
    </footer>
  );
}