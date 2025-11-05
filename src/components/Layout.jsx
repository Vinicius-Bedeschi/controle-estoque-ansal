import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useSidebar } from "../context/SidebarContext";
import { useTheme } from "../context/ThemeContext";
import { Outlet } from "react-router-dom";

export default function Layout() {
  // ✅ CORREÇÃO: Os Hooks e a lógica devem vir AQUI, antes do return principal.
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const { theme } = useTheme();

  useEffect(() => {
    // Verifica se é mobile (largura < 768px) ao carregar
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true); // Abre o Sidebar no Desktop
      } else {
        setIsSidebarOpen(false); // Fecha o Sidebar no Mobile
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Executa a verificação na montagem

    return () => window.removeEventListener('resize', handleResize);
  }, [setIsSidebarOpen]); // Dependência necessária para o ESLint

  return (
    <div className={`h-screen flex flex-col md:flex-row ${theme === 'dark' ? 'dark' : ''}`}>
      <Sidebar />
      {/* 👈 AQUI! A classe "flex-1" e as margens controlam o espaço do conteúdo */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'} overflow-y-auto`}>
        <Header />
        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}