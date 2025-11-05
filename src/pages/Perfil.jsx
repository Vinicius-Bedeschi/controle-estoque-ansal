import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useTheme } from "../context/ThemeContext";
import { User, Mail, Phone, Lock, Save } from "lucide-react";

export default function Perfil() {
  const { isDarkMode } = useTheme();
  const [usuario, setUsuario] = useState(null);
  const [form, setForm] = useState({});
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("usuario"));
    if (user) {
      setUsuario(user);
      setForm({
        email: user.email || "",
        telefone: user.telefone || "",
        unidade: user.unidade || "",
        setor: user.setor || "",
        senha: "",
        confirmarSenha: "",
      });
    }
    setLoading(false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMensagem("");

    if (form.senha && form.senha !== form.confirmarSenha) {
      return setMensagem("❌ As senhas não coincidem.");
    }

    setLoading(true);

    // Atualiza dados do usuário na tabela
    const { error } = await supabase
      .from("usuarios")
      .update({
        email: form.email,
        telefone: form.telefone,
        unidade: form.unidade,
        setor: form.setor,
      })
      .eq("id", usuario.id);

    if (error) {
      console.error(error);
      setMensagem("❌ Erro ao atualizar dados.");
      setLoading(false);
      return;
    }

    // Atualiza senha via Supabase Auth
    if (form.senha) {
      const { error: senhaError } = await supabase.auth.updateUser({
        password: form.senha,
      });

      if (senhaError) {
        console.error(senhaError);
        setMensagem("❌ Erro ao atualizar a senha.");
      } else {
        setMensagem("✅ Senha atualizada com sucesso!");
      }
    } else {
      setMensagem("✅ Dados atualizados com sucesso!");
    }

    const updatedUser = { ...usuario, ...form };
    localStorage.setItem("usuario", JSON.stringify(updatedUser));
    setUsuario(updatedUser);
    setLoading(false);
  };

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className={`p-8 ${isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800"} min-h-screen`}>
      <h1 className="text-3xl font-extrabold mb-8 flex items-center gap-3">
        <User className="text-teal-600 w-8 h-8" /> Meu Perfil
      </h1>

      {mensagem && (
        <div className={`p-3 mb-4 rounded-lg font-medium ${mensagem.startsWith("❌") ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
          {mensagem}
        </div>
      )}

      <div className={`bg-white ${isDarkMode ? "dark:bg-gray-800" : ""} rounded-2xl shadow-lg p-6`}>
        <form onSubmit={handleSave} className="space-y-6">
          {/* === Informações pessoais === */}
          <h3 className="text-xl font-semibold border-b pb-3 mb-4">Informações Pessoais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input readOnly value={usuario?.nome} className="border p-2 rounded bg-gray-100" />
            <input readOnly value={usuario?.matricula} className="border p-2 rounded bg-gray-100" />
          </div>

          {/* === Contato === */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="email" value={form.email} onChange={handleChange} className="border p-2 rounded" placeholder="Email" />
            <input name="telefone" value={form.telefone} onChange={handleChange} className="border p-2 rounded" placeholder="Telefone" />
          </div>

          {/* === Unidade e Setor === */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="unidade" value={form.unidade} onChange={handleChange} className="border p-2 rounded" placeholder="Unidade" />
            <input name="setor" value={form.setor} onChange={handleChange} className="border p-2 rounded" placeholder="Setor" />
          </div>

          {/* === Alterar Senha === */}
          <h3 className="text-xl font-semibold border-b pb-3 mb-4 flex items-center gap-2">
            <Lock size={18} /> Alterar Senha (Opcional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="password" name="senha" value={form.senha} onChange={handleChange} className="border p-2 rounded" placeholder="Nova senha" />
            <input type="password" name="confirmarSenha" value={form.confirmarSenha} onChange={handleChange} className="border p-2 rounded" placeholder="Confirmar senha" />
          </div>

          <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700 flex items-center justify-center gap-2">
            <Save size={20} /> Salvar Alterações
          </button>
        </form>
      </div>
    </div>
  );
}
