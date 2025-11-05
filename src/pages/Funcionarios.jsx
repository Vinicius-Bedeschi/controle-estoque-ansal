import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useTheme } from "../context/ThemeContext";
import { Users, Edit, Trash2, CheckCircle } from "lucide-react";

export default function Funcionarios() {
  const { isDarkMode } = useTheme();
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const [editando, setEditando] = useState(null);
  const [novoCargo, setNovoCargo] = useState("");

  const fetchFuncionarios = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .order("nome", { ascending: true });

    if (error) {
      setMensagem("❌ Erro ao carregar funcionários.");
      console.error(error);
    } else {
      setFuncionarios(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  const handleEdit = (funcionario) => {
    setEditando(funcionario.id);
    setNovoCargo(funcionario.cargo);
  };

  const handleSave = async (id) => {
    setLoading(true);
    const { error } = await supabase
      .from("usuarios")
      .update({ cargo: novoCargo })
      .eq("id", id);

    if (error) {
      setMensagem("❌ Erro ao atualizar cargo.");
      console.error(error);
    } else {
      setMensagem("✅ Cargo atualizado com sucesso!");
      setEditando(null);
      fetchFuncionarios();
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente excluir este funcionário?")) return;
    setLoading(true);
    const { error } = await supabase.from("usuarios").delete().eq("id", id);

    if (error) {
      setMensagem("❌ Erro ao excluir funcionário.");
      console.error(error);
    } else {
      setMensagem("✅ Funcionário excluído com sucesso!");
      fetchFuncionarios();
    }
    setLoading(false);
  };

  const cargoOptions = ["admin", "estoquista", "funcionario"];

  return (
    <div className={`p-8 ${isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800"} min-h-screen transition-colors`}>
      <h1 className="text-3xl font-extrabold mb-8 flex items-center gap-3">
        <Users className="text-teal-600 w-8 h-8" />
        Gestão de Funcionários
      </h1>

      {mensagem && (
        <div className={`p-3 mb-4 rounded-lg font-medium ${mensagem.startsWith("❌") ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"}`}>
          {mensagem}
        </div>
      )}

      <div className={`bg-white ${isDarkMode ? "dark:bg-gray-800" : ""} rounded-2xl shadow-lg p-6 border ${isDarkMode ? "dark:border-gray-700" : "border-gray-100"} transition-all`}>
        <h3 className="text-xl font-semibold mb-4">Lista de Usuários</h3>
        {loading ? (
          <p className="text-gray-500">Carregando...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Matrícula</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cargo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Setor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {funcionarios.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{f.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{f.matricula}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {editando === f.id ? (
                        <select
                          value={novoCargo}
                          onChange={(e) => setNovoCargo(e.target.value)}
                          className="border border-gray-300 dark:border-gray-600 p-1 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          {cargoOptions.map((cargo) => (
                            <option key={cargo} value={cargo}>
                              {cargo.charAt(0).toUpperCase() + cargo.slice(1)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${f.cargo === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : f.cargo === 'estoquista' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'}`}>
                          {f.cargo.charAt(0).toUpperCase() + f.cargo.slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{f.setor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {editando === f.id ? (
                        <button
                          onClick={() => handleSave(f.id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                          title="Salvar"
                        >
                          <CheckCircle size={20} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(f)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                          title="Editar Cargo"
                        >
                          <Edit size={20} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
