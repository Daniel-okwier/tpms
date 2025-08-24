import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Users,
  Activity,
  ClipboardList,
  FlaskConical,
  Calendar,
  Stethoscope,
  FileText,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: Activity },
  { name: "Patients", path: "/patients", icon: Users },
  { name: "Diagnosis", path: "/diagnosis", icon: ClipboardList },
  { name: "Lab Tests", path: "/labtests", icon: FlaskConical },
  { name: "Screenings", path: "/screenings", icon: Stethoscope },
  { name: "Appointments", path: "/appointments", icon: Calendar },
  { name: "Treatments", path: "/treatments", icon: ClipboardList },
  { name: "Reports", path: "/reports", icon: FileText },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-blue-900 text-gray-100 shadow-lg flex flex-col">
      <div className="text-2xl font-bold p-4 border-b border-blue-700">
        TPMS
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center p-2 rounded-lg transition-all 
                hover:bg-blue-800 hover:pl-4 
                ${isActive ? "bg-blue-800 font-semibold border-l-4 border-blue-400" : ""}`}
            >
              <Icon className="mr-3" size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
