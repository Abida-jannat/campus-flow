"use client";

// Shown if a page crashes while rendering. Without it the user sees a blank screen.
export default function GlobalRouteError({ error, reset }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-slate-400 text-sm mb-6">
          The page could not be displayed. You can try again; if it keeps happening, please report it.
          {error?.digest ? ` (ref ${error.digest})` : ""}
        </p>
        <button
          onClick={() => reset()}
          className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl text-sm font-semibold transition"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
