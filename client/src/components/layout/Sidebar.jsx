import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FlaskConical, ClipboardList } from 'lucide-react';
import { useSelector } from 'react-redux';

const linksByRole = {
  admin: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/patients', icon: Users, label: 'Patients' },
    { to: '/reports', icon: ClipboardList, label: 'Reports' },
    { to: '/lab', icon: FlaskConical, label: 'Lab' },
  ],
  doctor: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/patients', icon: Users, label: 'Patients' },
  ],
  lab: [
    { to: '/lab', icon: FlaskConical, label: 'Lab' },
    { to: '/reports', icon: ClipboardList, label: 'Reports' },
  ],
};

export default function Sidebar() {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role || 'doctor'; // fallback for demo
  const navLinks = linksByRole[role] || [];

  return (
    <aside className="w-56 bg-sky-800 text-white flex flex-col">
      <div className="px-4 py-3 text-xl font-bold border-b border-sky-700">TPMS</div>
      <nav className="flex-1 p-2">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded mb-1 transition ${
                isActive ? 'bg-sky-600' : 'hover:bg-sky-700'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
