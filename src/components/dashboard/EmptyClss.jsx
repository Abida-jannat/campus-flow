"use client";

import { useEffect, useState } from "react";
import { Search, Building2, CalendarDays, Clock3 } from "lucide-react";

export default function EmptyRoomCard() {
  const [building, setBuilding] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");

  const [department, setDepartment] = useState("");
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get Logged-in User Department
  useEffect(() => {
    async function getUser() {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();

        setDepartment(data.user.department);
      } catch (err) {
        console.log(err);
      }
    }

    getUser();
  }, []);

  const handleSearch = async () => {
    if (!department) return;

    setLoading(true);

    try {
      let url = `/api/emptyRooms?department=${department}`;

      if (building)
        url += `&building=${encodeURIComponent(building)}`;

      if (day)
        url += `&day=${encodeURIComponent(day)}`;

      if (time)
        url += `&time=${encodeURIComponent(time)}`;

      const res = await fetch(url);
      const data = await res.json();

      setRooms(data);
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6">

      {/* Title */}

      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Building2 className="text-indigo-400" size={22} />
        Empty Classroom Finder
      </h2>

      {/* Search Section */}

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
            <option value="">All Buildings</option>
            <option>Academic Building A</option>
            <option>Engineering Building</option>
            <option>Business Building</option>
            <option>Humanities Building</option>
            <option>Central Library</option>
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
            <option value="">All Days</option>
            <option>Sunday</option>
            <option>Monday</option>
            <option>Tuesday</option>
            <option>Wednesday</option>
            <option>Thursday</option>
            <option>Friday</option>
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
            <option value="">All Times</option>
            <option>09:00 AM</option>
            <option>10:00 AM</option>
            <option>11:00 AM</option>
            <option>12:00 PM</option>
            <option>01:00 PM</option>
            <option>02:00 PM</option>
            <option>03:00 PM</option>
            <option>04:00 PM</option>
          </select>
        </div>

      </div>

      {/* Search Button */}

      <button
        onClick={handleSearch}
        className="mt-6 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition px-6 py-3 rounded-xl text-white font-semibold"
      >
        <Search size={18} />
        Search Empty Classroom
      </button>

      {/* Loading */}

      {loading && (
        <div className="mt-6 text-slate-400">
          Searching...
        </div>
      )}

      {/* Results */}

      {!loading && rooms.length > 0 && (
        <div className="mt-8 space-y-4">

          <h3 className="text-lg font-semibold text-white">
            Available Rooms
          </h3>

          {rooms.map((room) => (
            <div
              key={room._id}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-4 hover:border-indigo-500 transition"
            >
              <div className="flex justify-between items-center">

                <div>

                  <h4 className="text-white font-semibold text-lg">
                    {room.room}
                  </h4>

                  <p className="text-slate-400">
                    {room.building}
                  </p>

                </div>

                <div className="text-right">

                  <div className="flex items-center gap-1 text-slate-300 text-sm justify-end">
                    <CalendarDays size={15} />
                    {room.day}
                  </div>

                  <div className="flex items-center gap-1 text-indigo-400 text-sm justify-end mt-1">
                    <Clock3 size={15} />
                    {room.time}
                  </div>

                </div>

              </div>
            </div>
          ))}

        </div>
      )}

      {/* No Results */}

      {!loading && rooms.length === 0 && (
        <div className="mt-8 text-center border border-dashed border-slate-700 rounded-2xl p-8">

          <Building2
            size={40}
            className="mx-auto text-slate-500 mb-3"
          />

          <p className="text-slate-400">
            No empty classrooms found.
          </p>

          <p className="text-slate-500 text-sm mt-1">
            Try changing the building, day or time.
          </p>

        </div>
      )}

    </div>
  );
}