import {
  FaUsers,
  FaChalkboardTeacher,
  FaUniversity,
  FaCalendarCheck,
} from "react-icons/fa";

const stats = [
  {
    icon: <FaUsers className="text-3xl text-blue-400" />,
    number: "5,000+",
    title: "Active Students",
  },
  {
    icon: <FaChalkboardTeacher className="text-3xl text-green-400" />,
    number: "300+",
    title: "Teachers",
  },
  {
    icon: <FaUniversity className="text-3xl text-yellow-400" />,
    number: "8+",
    title: "Departments",
  },
  {
    icon: <FaCalendarCheck className="text-3xl text-pink-400" />,
    number: "120+",
    title: "Campus Events",
  },
];

export default function Stats() {
  return (
    <section className="bg-slate-950 pb-20">
      <div className="max-w-7xl mx-auto px-6">

        <div className="bg-slate-900 rounded-3xl border border-slate-800 grid grid-cols-2 lg:grid-cols-4">

          {stats.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-5 p-8 border-b lg:border-b-0 lg:border-r last:border-r-0 border-slate-800"
            >
              <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center">
                {item.icon}
              </div>

              <div>
                <h2 className="text-3xl font-bold text-white">
                  {item.number}
                </h2>

                <p className="text-gray-400">
                  {item.title}
                </p>
              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}