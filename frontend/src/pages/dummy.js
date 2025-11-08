// src/components/DashboardLayout.jsx
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { FaHome, FaPlusCircle, FaCog, FaUser } from "react-icons/fa";

export default function DashboardLayout() {
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "/dashboard", icon: <FaHome /> },
    { name: "Create Capsule", path: "/dashboard/create", icon: <FaPlusCircle /> },
    { name: "Settings", path: "/dashboard/settings", icon: <FaCog /> },
    { name: "Account", path: "/dashboard/account", icon: <FaUser /> }, 
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          isNavOpen ? "w-60" : "w-16"
        } bg-blue-600 text-white flex flex-col transition-all duration-300`}
      >
        <button
          onClick={() => setIsNavOpen(!isNavOpen)}
          className="p-4 focus:outline-none"
        >
          {isNavOpen ? "←" : "☰"}
        </button>

        <nav className="flex-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-blue-500 ${
                location.pathname === item.path ? "bg-blue-700" : ""
              }`}
            >
              {item.icon}
              {isNavOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
