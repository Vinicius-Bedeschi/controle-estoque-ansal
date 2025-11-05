import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function CadastroModal({ onClose }) {
  const [form, setForm] = useState({
    matricula: "",
    nome: "",
    email: "",
    telefone: "",
    setor: "",
    senha: "",
  });
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");
    setLoading(true);

    const { matricula, nome, email, telefone, setor, senha } = form;

    if (!matricula || !nome || !email || !telefone || !setor || !senha) {
      setMensagem("Preencha todos os campos.");
      setLoading(false);
      return;
    }

    // 1️⃣ Cria usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome, matricula, telefone, setor, cargo: "funcionario" },
      },
    });

    if (authError && authError.message.includes("User already registered")) {
      setMensagem("⚠️ Usuário já existe. Faça login.");
      setLoading(false);
      return;
    }

    if (authError) {
      console.error(authError);
      setMensagem("❌ Erro ao criar usuário no Auth.");
      setLoading(false);
      return;
    }

    const user = authData?.user;
    if (!user) {
      setMensagem("❌ Erro ao obter dados do usuário.");
      setLoading(false);
      return;
    }

    // 2️⃣ Insere dados na tabela 'usuarios'
    const { error: dbError } = await supabase.from("usuarios").insert([
      {
        auth_id: user.id,
        matricula,
        nome,
        email,
        telefone,
        setor,
        cargo: "funcionario",
        created_at: new Date(),
      },
    ]);

    if (dbError) {
      console.error(dbError);
      setMensagem("❌ Erro ao salvar dados no banco.");
      setLoading(false);
      return;
    }

    setMensagem("✅ Cadastro realizado com sucesso!");
    setTimeout(() => {
      onClose(); // Fecha modal
    }, 1500);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative mx-4 my-8">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-xl"
        >
          ×
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">📝 Novo Cadastro</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="matricula"
            placeholder="Matrícula"
            value={form.matricula}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
          <input
            name="nome"
            placeholder="Nome completo"
            value={form.nome}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
          <input
            name="email"
            placeholder="E-mail"
            value={form.email}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
          <input
            name="telefone"
            placeholder="Telefone"
            value={form.telefone}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
          <input
            name="setor"
            placeholder="Setor"
            value={form.setor}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
          <input
            name="senha"
            type="password"
            placeholder="Crie uma senha"
            value={form.senha}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />

          {mensagem && (
            <p
              className={`text-sm text-center ${
                mensagem.startsWith("✅")
                  ? "text-green-600"
                  : mensagem.startsWith("⚠️")
                  ? "text-yellow-600"
                  : "text-red-500"
              }`}
            >
              {mensagem}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700 transition font-semibold"
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
