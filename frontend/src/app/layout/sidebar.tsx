"use client";

import React from "react";

interface SidebarProps {
  userRole: string;
  userName: string;
  // onLogout: () => void;
}

export function Sidebar({ userRole, userName /*, onLogout*/ }: SidebarProps) {
  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-white shadow-md flex flex-col">
      <div className="p-6 border-b">
        <div className="font-bold text-lg">{userName}</div>
        <div className="text-sm text-gray-500">{userRole}</div>
      </div>
      <nav className="flex-1 p-6">
        {/* Add your navigation links here */}
        <a href="/dashboard" className="block mb-4">
          Dashboard
        </a>
        <a href="#" className="block mb-4">
          Profile
        </a>
        <a href="#" className="block mb-4">
          Settings
        </a>
      </nav>
      <button
        className="m-6 p-2 bg-red-500 text-white rounded"
        // onClick={onLogout}
      >
        Logout
      </button>
    </aside>
  );
}
