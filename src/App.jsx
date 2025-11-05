import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Itens from "./pages/Itens";
import Entradas from "./pages/Entradas";
import Saidas from "./pages/Saidas";
import Solicitacoes from "./pages/Solicitacoes";
import PainelAlmoxarifado from "./pages/PainelAlmoxarifado";
import SolicitacoesEstoque from "./pages/SolicitacoesEstoque";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Perfil from "./pages/Perfil";
import Funcionarios from "./pages/Funcionarios";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página de Login */}
        <Route path="/login" element={<Login />} />

        {/* Sistema (somente logado) -> Layout permanece como wrapper */}
<Route
	          path="/"
	          element={
	            <ProtectedRoute allowedRoles={["admin", "estoquista", "funcionario"]}>
	              <Layout />
	            </ProtectedRoute>
	          }
	        >
          {/* Dashboard - todos os cargos têm acesso */}
<Route index element={<Dashboard />} />
	          <Route path="dashboard" element={<Dashboard />} />

          {/* Itens (estoquista + admin) */}
<Route path="itens" element={
	            <ProtectedRoute allowedRoles={["admin", "estoquista"]}>
	              <Itens />
	            </ProtectedRoute>
	          } />

          {/* Entradas (estoquista + admin) */}
<Route path="entradas" element={
	            <ProtectedRoute allowedRoles={["admin", "estoquista"]}>
	              <Entradas />
	            </ProtectedRoute>
	          } />

          {/* Saídas (estoquista + admin) */}
<Route path="saidas" element={
	            <ProtectedRoute allowedRoles={["admin", "estoquista"]}>
	              <Saidas />
	            </ProtectedRoute>
	          } />

          {/* Solicitações:
              - rota pública interna para usuários comuns (funcionário) ver suas solicitações
              - rota de almoxarifado (admin/estoquista) para ver todas (neste app já existe isAlmoxarifado flag)
          */}
<Route
	            path="solicitacoes"
	            element={
	              <ProtectedRoute allowedRoles={["admin", "estoquista", "funcionario"]}>
	                <Solicitacoes isAlmoxarifado={false} />
	              </ProtectedRoute>
	            }
	          />

<Route
	            path="admin/solicitacoes"
	            element={
	              <ProtectedRoute allowedRoles={["admin", "estoquista"]}>
	                <Solicitacoes isAlmoxarifado={true} />
	              </ProtectedRoute>
	            }
	          />

          {/* Painel do Estoque / Relatórios (estoquista + admin) */}
<Route
	            path="relatorios"
	            element={
	              <ProtectedRoute allowedRoles={["admin", "estoquista"]}>
	                <PainelAlmoxarifado />
	              </ProtectedRoute>
	            }
	          />

          {/* Solicitações do estoque (estoquista + admin) */}
<Route
            path="solicitacoes-estoque"
            element={
              <ProtectedRoute allowedRoles={["admin", "estoquista"]}>
                <SolicitacoesEstoque />
              </ProtectedRoute>
            }
          />

          {/* Funcionários (somente admin) */}
          <Route
            path="funcionarios"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Funcionarios />
              </ProtectedRoute>
            }
          />

          {/* Perfil (todos) */}
          <Route
            path="perfil"
            element={
              <ProtectedRoute allowedRoles={["admin", "estoquista", "funcionario"]}>
                <Perfil />
              </ProtectedRoute>
            }
          />

          {/* rota fallback? você pode adicionar se quiser */}
        </Route>

        {/* rota catch-all: se alguém acessar algo inválido e não estiver logado -> manda para login,
            caso contrário manda para dashboard */}
<Route
	          path="*"
	          element={
	            JSON.parse(localStorage.getItem("usuario")) ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
	          }
	        />
      </Routes>
    </BrowserRouter>
  );
}
