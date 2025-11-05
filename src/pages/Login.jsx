import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import CadastroModal from "../components/CadastroModal";
import LogoEstoque from "/carrinho-estoque.png";

export default function Login() {
  const [form, setForm] = useState({ identificador: "", senha: "" }); // <- pode ser email ou matrícula
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensagem("");
    setLoading(true);

    const { identificador, senha } = form;
    if (!identificador || !senha) {
      setMensagem("Preencha matrícula/e-mail e senha.");
      setLoading(false);
      return;
    }

    let emailParaLogin = identificador;

    // 🔎 Se o campo não for um e-mail (não contém "@"), assume que é matrícula e busca o e-mail correspondente
    if (!identificador.includes("@")) {
      const { data: usuario, error: fetchError } = await supabase
        .from("usuarios")
        .select("email")
        .eq("matricula", identificador)
        .single();

      if (fetchError || !usuario) {
        setMensagem("❌ Matrícula não encontrada.");
        setLoading(false);
        return;
      }

      emailParaLogin = usuario.email;
    }

    // 🔐 Faz login com o e-mail obtido
    const { error } = await supabase.auth.signInWithPassword({
      email: emailParaLogin,
      password: senha,
    });

    if (error) {
      setMensagem("❌ Matrícula/E-mail ou senha incorretos.");
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMensagem("❌ Erro ao autenticar usuário.");
      setLoading(false);
      return;
    }

    // 🧠 Busca dados adicionais da tabela 'usuarios'
    const { data: usuarioDB, error: dbError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("auth_id", user.id)
      .single();

    if (dbError) {
      console.error(dbError);
      setMensagem("❌ Erro ao buscar dados do usuário.");
      setLoading(false);
      return;
    }

    localStorage.setItem("usuario", JSON.stringify(usuarioDB));
    setMensagem("✅ Login realizado com sucesso!");

    setTimeout(() => {
      window.location.href = "/solicitacoes";
    }, 1500);

    setLoading(false);
  };

  // ==========================================================
  // ESTILIZAÇÃO - VISUAL MODERNO
  // ==========================================================
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-500/10 to-blue-500/10 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm transform hover:scale-[1.01] transition-transform duration-300 border border-gray-100">
        <div className="text-center mb-6">
          <img
            src={LogoEstoque}
            alt="Logo do Sistema de Estoque"
            className="mx-auto w-16 h-16 mb-2"
          />
          <h2 className="text-3xl font-extrabold text-gray-800">Sistema de Estoque</h2>
          <p className="text-gray-500 mt-1">Acesso à gestão de inventário</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            name="identificador"
            placeholder="Matrícula ou E-mail"
            value={form.identificador}
            onChange={handleChange}
            className="border border-gray-300 p-3 w-full rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 outline-none"
          />
          <input
            name="senha"
            type="password"
            placeholder="Senha"
            value={form.senha}
            onChange={handleChange}
            className="border border-gray-300 p-3 w-full rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 outline-none"
          />

          {mensagem && (
            <p
              className={`text-sm text-center font-medium p-2 rounded-lg ${
                mensagem.startsWith("✅")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {mensagem}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 transition duration-300 ease-in-out font-bold shadow-lg shadow-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="text-center mt-6 text-sm">
          <p className="text-gray-600">
            Não tem conta?{" "}
            <button
              onClick={() => setMostrarCadastro(true)}
              className="text-teal-600 font-semibold hover:text-teal-800 transition duration-150 hover:underline"
            >
              Cadastre-se
            </button>
          </p>
        </div>
      </div>

      {mostrarCadastro && (
        <CadastroModal onClose={() => setMostrarCadastro(false)} />
      )}
    </div>
  );
}
