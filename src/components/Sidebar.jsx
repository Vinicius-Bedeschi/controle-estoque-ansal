import React, { useEffect, useState } from "react";
import { useSidebar } from "../context/SidebarContext";
import { useTheme } from "../context/ThemeContext";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  LogIn,
  LogOut,
  ClipboardList,
  Users,
  FileText,
  Settings,
  Moon,
  Sun,
  User,
  X,
  Menu,
  ArrowRightLeft,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Sidebar() {
  const [usuario, setUsuario] = useState(null);
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const dados = localStorage.getItem("usuario");
    if (dados) {
      setUsuario(JSON.parse(dados));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    window.location.href = "/login";
  };

  if (!usuario) {
    return null;
  }

  const menus = [
    {
      to: "/",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      roles: ["admin", "estoquista", "funcionario"],
    },
    {
      to: "/itens",
      label: "Estoque",
      icon: <Package size={18} />,
      roles: ["admin", "estoquista"],
    },
    {
      to: "/entradas",
      label: "Entradas",
      icon: <ArrowRightLeft size={18} className="rotate-90" />,
      roles: ["admin", "estoquista"],
    },
    {
      to: "/saidas",
      label: "Saídas",
      icon: <ArrowRightLeft size={18} className="-rotate-90" />,
      roles: ["admin", "estoquista"],
    },
    {
      to:
        usuario.cargo === "admin" || usuario.cargo === "estoquista"
          ? "/admin/solicitacoes"
          : "/solicitacoes",
      label: "Solicitações",
      icon: <ClipboardList size={18} />,
      roles: ["admin", "estoquista", "funcionario"],
    },
    {
      to: "/funcionarios",
      label: "Funcionários",
      icon: <Users size={18} />,
      roles: ["admin"],
    },
    {
      to: "/relatorios",
      label: "Relatórios",
      icon: <FileText size={18} />,
      roles: ["admin", "estoquista"],
    },
    {
      to: "/perfil",
      label: "Perfil",
      icon: <User size={18} />,
      roles: ["admin", "estoquista", "funcionario"],
    },
  ];

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-40 bg-white dark:bg-gray-900 border-r dark:border-gray-700 shadow-xl transition-transform duration-300 flex flex-col justify-between w-64 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <img
              src="https://assinatura.grupocsc.com.br/images/logo_csc.png"
              alt="Logo CSC"
              className="w-16 md:w-20"
            />
            <div>
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-sm leading-tight">
                Grupo CSC - Ansal
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Sistema de Estoque
              </p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="md:hidden text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
          <p className="font-semibold text-gray-800 dark:text-gray-100">
            Olá, {typeof usuario?.nome === "string"
                ? usuario.nome.split(" ")[0]
                : Array.isArray(usuario?.nome)
                ? usuario.nome.join("").split(" ")[0]
                : "Usuário"}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Acesso: {usuario?.cargo || "N/A"}
          </p>
        </div>

        <div className="px-5 mt-4 text-xs text-gray-500 font-semibold tracking-wider">
          NAVEGAÇÃO
        </div>

        <nav className="mt-2 flex-1 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {menus
              .filter((item) => item.roles.includes(usuario.cargo))
              .map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        toggleSidebar();
                      }
                    }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      location.pathname === item.to
                        ? "bg-teal-600 text-white shadow"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </nav>

        <div className="px-5 mt-8 mb-2 flex items-center justify-between">
        <span className="text-sm text-gray-800 dark:text-gray-300 font-medium">
         {theme === "light" ? "Tema Escuro" : "Tema Claro"}
        </span>
        <ThemeToggle />
        </div>

        <div className="p-5 border-t dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:text-yellow-300 dark:text-yellow-300 dark:hover:text-yellow-300 text-sm font-medium mb-3"
          >
            <LogOut size={16} />
            Sair
          </button>

          <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-3 tracking-wide select-none">
           Sistema de Estoque v1.7.23 <br />
          <span className="text-[10px] text-gray-400">Desenvolvido por Vinícius Bedeschi</span>
          </p>
        </div>
      </aside>
    </>
  );
}
