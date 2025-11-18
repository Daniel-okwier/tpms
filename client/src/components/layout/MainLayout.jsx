import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function MainLayout() {
  return (
    <div className="flex bg-blue-950 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <main className="p-6 text-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
