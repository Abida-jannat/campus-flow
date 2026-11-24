import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-indigo-400 text-sm font-semibold mb-2">404</p>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-slate-400 text-sm mb-6">The page you are looking for does not exist.</p>
        <Link href="/" className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl text-sm font-semibold transition inline-block">
          Go home
        </Link>
      </div>
    </div>
  );
}
