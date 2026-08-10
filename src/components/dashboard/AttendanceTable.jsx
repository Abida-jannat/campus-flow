"use client";

import { useEffect, useState } from "react";

export default function AttendanceTable({ email }) {

  const [attendance, setAttendance] = useState([]);
useEffect(() => {
  async function loadAttendance() {
    // Get logged-in user
    const userRes = await fetch("/api/user");
    const user = await userRes.json();

    // Get attendance using the user's email
    const attendanceRes = await fetch(
      `/api/attendance?email=${user.email}`
    );

    const attendanceData = await attendanceRes.json();

    setAttendance(attendanceData);
  }

  loadAttendance();
}, []);
  return (

    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6">

      <h2 className="text-xl font-bold mb-5">
        Attendance
      </h2>

      <table className="w-full">

        <thead>

          <tr className="text-slate-400 border-b border-slate-800">

            <th className="text-left py-3">Subject</th>

            <th>Present</th>

            <th>Total</th>

            <th>Percentage</th>

          </tr>

        </thead>

        <tbody>

          {attendance.map((item) => (

            <tr
              key={item._id}
              className="border-b border-slate-800"
            >

              <td className="py-4">
                {item.subject}
              </td>

              <td className="text-center">
                {item.present}
              </td>

              <td className="text-center">
                {item.total}
              </td>

              <td className="text-center text-green-400 font-semibold">
                {item.percentage}%
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}