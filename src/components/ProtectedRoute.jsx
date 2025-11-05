import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

if (allowedRoles && !allowedRoles.includes(usuario.cargo)) {
	    // Redireciona para a dashboard (ou a rota principal) se não tiver o cargo permitido
	    return <Navigate to="/" replace />;
	  }

  return children;
}
