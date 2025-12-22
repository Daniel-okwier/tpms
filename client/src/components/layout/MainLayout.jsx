import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function MainLayout() {
  return (
    // ✅ Changed bg-blue-950 to bg-gray-50 for a clean, single-background look
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        {/* ✅ Changed text-gray-100 to text-gray-900 for readability on light BG */}
        <main className="p-6 text-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}