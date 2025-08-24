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
import logo from "../../assets/Logoportal.png";

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
  const facilityName = import.meta.env.VITE_FACILITY_NAME || "TPMS";

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-blue-900 text-gray-100 shadow-lg flex flex-col">
      {/* Header with logo */}
      <div className="flex items-center gap-3 p-4 border-b border-blue-700">
        <img
          src={logo}
          alt="Facility logo"
          className="h-10 w-10 shrink-0"
          draggable="false"
        />
        <div className="leading-tight">
          <div className="text-lg font-bold">{facilityName}</div>
          <div className="text-[11px] text-blue-200">TB Patient Management</div>
        </div>
      </div>

      {/* Nav */}
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
