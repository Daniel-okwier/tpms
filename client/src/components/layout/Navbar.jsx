import { useSelector, useDispatch } from 'react-redux';
import { LogOut, User } from 'lucide-react';
import { logout } from '../../features/auth/authSlice'; // adjust path if different

export default function Navbar() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="flex items-center justify-between bg-white shadow px-4 py-2">
      <h1 className="text-lg font-semibold text-sky-700">TPMS</h1>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">{user.name}</span>
          </div>
        )}
        <button
          onClick={() => dispatch(logout())}
          className="flex items-center gap-1 px-3 py-1 bg-sky-600 text-white rounded hover:bg-sky-700 transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </header>
  );
}
