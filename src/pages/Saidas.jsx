import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Truck, ClipboardList, PlusCircle, Trash2, UserPlus } from "lucide-react";

export default function Saidas() {
  const [itens, setItens] = useState([]);
  const [form, setForm] = useState({
    item_id: "",
    item_nome: "",
    quantidade: "",
    funcionario_id: "",
    funcionario_nome: "",
    setor: "",
    unidade: "",
    responsavel_entrega: "",
    data_saida: "",
    observacoes: "",
  });
  const [saidas, setSaidas] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [funcionarioNaoEncontrado, setFuncionarioNaoEncontrado] = useState(false);
  const [novoFuncionario, setNovoFuncionario] = useState({
    matricula: "",
    nome: "",
    setor: "",
  });

  // Carregar itens
  useEffect(() => {
    const fetchData = async () => {
      const { data: itensData } = await supabase.from("itens").select("id, nome");
      setItens(itensData || []);
    };
    fetchData();
  }, []);

  // Buscar saídas
  useEffect(() => {
    const fetchSaidas = async () => {
      const { data } = await supabase
        .from("saidas")
        .select("*")
        .order("data_saida", { ascending: false });
      setSaidas(data || []);
    };
    fetchSaidas();
  }, [mensagem]);

  // Buscar funcionário pela matrícula
  useEffect(() => {
    const buscarFuncionario = async () => {
      if (!form.funcionario_id || form.funcionario_id.trim() === "") return;

      const { data } = await supabase
        .from("funcionarios")
        .select("nome, setor")
        .eq("matricula", form.funcionario_id)
        .single();

      if (data) {
        setForm((f) => ({
          ...f,
          funcionario_nome: data.nome,
          setor: data.setor,
        }));
        setFuncionarioNaoEncontrado(false);
      } else {
        setForm((f) => ({ ...f, funcionario_nome: "", setor: "" }));
        setFuncionarioNaoEncontrado(true);
      }
    };

    buscarFuncionario();
  }, [form.funcionario_id]);

  // Atualizar campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "item_id") {
      const itemSelecionado = itens.find((item) => item.id === value);
      setForm((prev) => ({
        ...prev,
        item_id: value,
        item_nome: itemSelecionado ? itemSelecionado.nome : "",
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Registrar saída
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");

    const { data: itemData } = await supabase
      .from("itens")
      .select("quantidade_atual")
      .eq("id", form.item_id)
      .single();

    if (!itemData) return setMensagem("❌ Erro ao buscar o item.");

    const novaQtd = itemData.quantidade_atual - parseFloat(form.quantidade);
    if (novaQtd < 0) return setMensagem("❌ Estoque insuficiente!");

    await supabase
      .from("itens")
      .update({ quantidade_atual: novaQtd })
      .eq("id", form.item_id);

    const { error } = await supabase.from("saidas").insert([form]);
    if (error) setMensagem("❌ Erro ao salvar a saída.");
    else {
      setMensagem("✅ Saída registrada e estoque atualizado!");
      setForm({
        item_id: "",
        item_nome: "",
        quantidade: "",
        funcionario_id: "",
        funcionario_nome: "",
        setor: "",
        unidade: "",
        responsavel_entrega: "",
        data_saida: "",
        observacoes: "",
      });
    }
  };

  // Cadastrar novo funcionário
  const handleCadastrarFuncionario = async () => {
    if (!novoFuncionario.matricula || !novoFuncionario.nome || !novoFuncionario.setor) {
      alert("Preencha todos os campos!");
      return;
    }

    const { data, error } = await supabase
      .from("funcionarios")
      .insert([{ ...novoFuncionario, ativo: true }])
      .select()
      .single();

    if (error) {
      alert("Erro ao cadastrar funcionário!");
    } else {
      alert("✅ Funcionário cadastrado!");
      setMostrarModal(false);
      setForm((f) => ({
        ...f,
        funcionario_id: data.matricula,
        funcionario_nome: data.nome,
        setor: data.setor,
      }));
      setNovoFuncionario({ matricula: "", nome: "", setor: "" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja excluir esta saída?")) return;
    await supabase.from("saidas").delete().eq("id", id);
    setMensagem("✅ Saída excluída com sucesso!");
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg animate-spin-slow">
          <Truck size={26} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Registrar Saída</h2>
      </div>

      {/* Formulário */}
      <form
        onSubmit={handleSubmit}
        className="
          w-full sm:max-w-3xl lg:max-w-4xl xl:max-w-5xl
          bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700
          space-y-5 mx-auto transition-all duration-300 hover:shadow-xl
        "
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Item */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Item</label>
            <select
              name="item_id"
              value={form.item_id}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-lg focus:ring-2 focus:ring-rose-500 dark:bg-gray-700 dark:text-gray-100"
              required
            >
              <option value="">Selecione o item</option>
              {itens.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Quantidade */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Quantidade</label>
            <input
              type="number"
              name="quantidade"
              value={form.quantidade}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-lg focus:ring-2 focus:ring-rose-500 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>

          {/* Matrícula */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Matrícula do Funcionário
            </label>
            <input
              type="text"
              name="funcionario_id"
              value={form.funcionario_id}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-lg dark:bg-gray-700 dark:text-gray-100"
              placeholder="Digite a matrícula"
            />
            {funcionarioNaoEncontrado && (
              <div className="mt-2 text-sm text-rose-500 dark:text-rose-400 flex items-center justify-between">
                <span>Funcionário não encontrado.</span>
                <button
                  type="button"
                  onClick={() => {
                    setNovoFuncionario({ matricula: form.funcionario_id, nome: "", setor: "" });
                    setMostrarModal(true);
                  }}
                  className="text-rose-600 font-semibold hover:underline"
                >
                  Cadastrar novo
                </button>
              </div>
            )}
          </div>

          {/* Unidade */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Unidade</label>
            <select
              name="unidade"
              value={form.unidade}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-lg dark:bg-gray-700 dark:text-gray-100"
              required
            >
              <option value="">Selecione a unidade</option>
              <option>Bandeirantes</option>
              <option>Vitorino</option>
              <option>São Francisco</option>
              <option>Manoel Honório</option>
              <option>ASTRANSP</option>
              <option>Tráfego</option>
              <option>Externo</option>
            </select>
          </div>

          {/* Responsável */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Responsável pela Entrega
            </label>
            <input
              name="responsavel_entrega"
              value={form.responsavel_entrega}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-lg dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>

          {/* Data */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Data da Saída</label>
            <input
              type="date"
              name="data_saida"
              value={form.data_saida}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-lg dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>
        </div>

        {form.funcionario_nome && (
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300">
            <strong>Funcionário:</strong> {form.funcionario_nome} —{" "}
            <strong>Setor:</strong> {form.setor}
          </div>
        )}

        <div>
          <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Observações</label>
          <textarea
            name="observacoes"
            value={form.observacoes}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-lg h-20 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-red-500 hover:opacity-90 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-all"
        >
          <PlusCircle size={20} />
          Registrar Saída
        </button>
      </form>

      {mensagem && (
        <p className="mt-4 text-center font-semibold text-gray-700 dark:text-gray-300">{mensagem}</p>
      )}

      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 my-8 border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <UserPlus className="text-rose-600" /> Novo Funcionário
            </h3>

            <input
              type="text"
              placeholder="Matrícula"
              value={novoFuncionario.matricula || form.funcionario_id}
              onChange={(e) =>
                setNovoFuncionario((f) => ({ ...f, matricula: e.target.value }))
              }
              className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-lg mb-3 dark:bg-gray-700 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="Nome completo"
              value={novoFuncionario.nome}
              onChange={(e) =>
                setNovoFuncionario((f) => ({ ...f, nome: e.target.value }))
              }
              className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-lg mb-3 dark:bg-gray-700 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="Setor"
              value={novoFuncionario.setor}
              onChange={(e) =>
                setNovoFuncionario((f) => ({ ...f, setor: e.target.value }))
              }
              className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-lg mb-5 dark:bg-gray-700 dark:text-gray-100"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setMostrarModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCadastrarFuncionario}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-red-500 text-white font-semibold hover:opacity-90 transition-colors"
              >
                Cadastrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="mt-10 w-full sm:max-w-3xl lg:max-w-4xl xl:max-w-5xl bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="text-rose-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Saídas Registradas
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="border p-2 text-gray-500 dark:text-gray-300">Item</th>
                <th className="border p-2 text-gray-500 dark:text-gray-300">Qtd</th>
                <th className="border p-2 text-gray-500 dark:text-gray-300">Funcionário</th>
                <th className="border p-2 text-gray-500 dark:text-gray-300">Setor</th>
                <th className="border p-2 text-gray-500 dark:text-gray-300">Unidade</th>
                <th className="border p-2 text-gray-500 dark:text-gray-300">Data</th>
                <th className="border p-2 text-gray-500 dark:text-gray-300">Ações</th>
              </tr>
            </thead>
            <tbody>
              {saidas.length > 0 ? (
                saidas.map((s, i) => (
                  <tr key={i} className="text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="border p-2 text-gray-700 dark:text-gray-300">{s.item_nome}</td>
                    <td className="border p-2 text-gray-700 dark:text-gray-300">{s.quantidade}</td>
                    <td className="border p-2 text-gray-700 dark:text-gray-300">{s.funcionario_nome}</td>
                    <td className="border p-2 text-gray-700 dark:text-gray-300">{s.setor}</td>
                    <td className="border p-2 text-gray-700 dark:text-gray-300">{s.unidade}</td>
                    <td className="border p-2 text-gray-700 dark:text-gray-300">
                      {new Date(s.data_saida).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="border p-2 text-gray-700 dark:text-gray-300">
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
                      >
                        <Trash2 size={14} /> Excluir
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500 dark:text-gray-400">
                    Nenhuma saída registrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
