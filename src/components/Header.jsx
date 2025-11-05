import React from "react";
import { useSidebar } from "../context/SidebarContext";
import { Menu } from "lucide-react";

export default function Header() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="flex items-center p-4 bg-white dark:bg-gray-900 shadow-md border-b dark:border-gray-700 md:hidden">
      <button
        onClick={toggleSidebar}
        className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400"
      >
        <Menu size={24} />
      </button>
      <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 ml-4">Sistema de Estoque</h1>
    </header>
  );
}
