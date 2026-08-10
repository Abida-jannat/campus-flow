"use client";

import { useState } from "react";
import {
  Search,
  Building2,
  CalendarDays,
  Clock3,
} from "lucide-react";

export default function EmptyRoomCard() {
  const [building, setBuilding] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!building || !day || !time) {
      alert("Please select building, day and time.");
      return;
    }

    setLoading(true);
    setSearched(true);
    setRooms([]);

    try {
      const url =
        `/api/classroom?building=${encodeURIComponent(building)}` +
        `&day=${encodeURIComponent(day)}` +
        `&time=${encodeURIComponent(time)}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to search");
      }

      setRooms(data.availableRooms || []);

    } catch (error) {
      console.error("Classroom search error:", error);
      alert("Could not search classrooms.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6">

      {/* Title */}
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Building2 className="text-indigo-400" size={22} />
        Empty Classroom Finder
      </h2>

      {/* Search */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Building */}
        <div>
          <label className="text-slate-300 text-sm mb-2 block">
            Building
          </label>

          <select
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"
          >
            <option value="">Select Building</option>
            <option value="Academic Building">
              Academic Building
            </option>
          </select>
        </div>

        {/* Day */}
        <div>
          <label className="text-slate-300 text-sm mb-2 block">
            Day
          </label>

          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"
          >
            <option value="">Select Day</option>
            <option value="Sunday">Sunday</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
          </select>
        </div>

        {/* Time */}
        <div>
          <label className="text-slate-300 text-sm mb-2 block">
            Time
          </label>

          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"
          >
            <option value="">Select Time</option>
            <option value="09:00">09:00 AM</option>
            <option value="09:30">09:30 AM</option>
            <option value="10:00">10:00 AM</option>
            <option value="10:30">10:30 AM</option>
            <option value="11:00">11:00 AM</option>
            <option value="11:30">11:30 AM</option>
            <option value="12:00">12:00 PM</option>
            <option value="12:30">12:30 PM</option>
            <option value="13:00">01:00 PM</option>
            <option value="13:30">01:30 PM</option>
            <option value="14:00">02:00 PM</option>
            <option value="14:30">02:30 PM</option>
            <option value="15:00">03:00 PM</option>
            <option value="15:30">03:30 PM</option>
            <option value="16:00">04:00 PM</option>
            <option value="16:30">04:30 PM</option>
            <option value="17:00">05:00 PM</option>
            <option value="17:30">05:30 PM</option>
          </select>
        </div>

      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        disabled={loading}
        className="mt-6 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition px-6 py-3 rounded-xl text-white font-semibold"
      >
        <Search size={18} />

        {loading
          ? "Searching..."
          : "Search Empty Classroom"}
      </button>

      {/* Results */}
      {searched && !loading && (
        <div className="mt-8">

          {rooms.length > 0 ? (
            <>
              <h3 className="text-lg font-semibold text-white mb-4">
                Available Rooms
              </h3>

              <div className="grid md:grid-cols-2 gap-4">

                {rooms.map((room) => (
                  <div
                    key={room}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-4 hover:border-indigo-500 transition"
                  >
                    <div className="flex justify-between items-center">

                      <div>
                        <h4 className="text-white font-semibold text-lg">
                          Room {room}
                        </h4>

                        <p className="text-slate-400 text-sm">
                          {building}
                        </p>
                      </div>

                      <div className="text-right">

                        <div className="flex items-center gap-1 text-slate-300 text-sm">
                          <CalendarDays size={15} />
                          {day}
                        </div>

                        <div className="flex items-center gap-1 text-green-400 text-sm mt-1">
                          <Clock3 size={15} />
                          {time}
                        </div>

                      </div>

                    </div>

                    <div className="mt-3 text-green-400 text-sm font-medium">
                      ✓ Available
                    </div>

                  </div>
                ))}

              </div>
            </>
          ) : (
            <div className="text-center border border-dashed border-slate-700 rounded-2xl p-8">

              <Building2
                size={40}
                className="mx-auto text-slate-500 mb-3"
              />

              <p className="text-slate-400">
                No empty classrooms found.
              </p>

              <p className="text-slate-500 text-sm mt-1">
                All classrooms are occupied at this time.
              </p>

            </div>
          )}

        </div>
      )}

    </div>
  );
}