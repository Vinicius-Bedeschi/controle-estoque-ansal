import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ClipboardList, PackagePlus, Trash2, X } from "lucide-react";

export default function Solicitacoes({ isAlmoxarifado = false }) {
  const [itens, setItens] = useState([]);
  const [form, setForm] = useState({
    matricula: "",
    nome: "",
    telefone: "",
    unidade: "",
    setor: "",
    urgente: false,
    responsavel_retirada: "",
    observacoes: "",
  });
  const [linhas, setLinhas] = useState([{ item_id: "", item_nome: "", quantidade: 1 }]);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  // ======== CARREGAR USUÁRIO LOGADO ========
  useEffect(() => {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuario"));
    if (usuarioLogado) {
      setForm((prev) => ({
        ...prev,
        matricula: usuarioLogado.matricula || "",
        nome: usuarioLogado.nome || "",
        telefone: usuarioLogado.telefone || "",
        setor: usuarioLogado.setor || "",
      }));
    }
  }, []);

  // ======== CARREGAR ITENS ========
  useEffect(() => {
    const fetchMasterData = async () => {
      const { data: itensData } = await supabase.from("itens").select("id, nome");
      setItens(itensData || []);
    };
    fetchMasterData();
  }, []);

  // ======== BUSCAR SOLICITAÇÕES ========
  const fetchSolicitacoes = async () => {
    setLoading(true);
    let q = supabase
      .from("solicitacoes")
      .select("*")
      .order("data_pedido", { ascending: false });

    if (!isAlmoxarifado) {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      if (usuario?.matricula) {
        q = q.eq("matricula", usuario.matricula);
      } else {
        setSolicitacoes([]);
        setLoading(false);
        return;
      }
    }

    const { data } = await q;
    setSolicitacoes(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSolicitacoes();
  }, [mensagem, isAlmoxarifado]);

  // ======== TOGGLE STATUS ========
  const toggleStatus = async (id, campo, valorAtual) => {
    const novoValor = !valorAtual;
    const { error } = await supabase
      .from("solicitacoes")
      .update({ [campo]: novoValor })
      .eq("id", id);

    if (error) setMensagem("❌ Erro ao atualizar status.");
    else {
      setSolicitacoes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, [campo]: novoValor } : s))
      );
      setMensagem(`✅ Status "${campo}" atualizado com sucesso.`);
    }
  };

  // ======== LINHAS DO FORM ========
  const addLinha = () =>
    setLinhas((prev) => [...prev, { item_id: "", item_nome: "", quantidade: 1 }]);
  const removeLinha = (idx) =>
    setLinhas((prev) => prev.filter((_, i) => i !== idx));
  const updateLinha = (idx, changes) =>
    setLinhas((prev) => prev.map((r, i) => (i === idx ? { ...r, ...changes } : r)));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleItemSelectByName = (idx, name) => {
    const found = itens.find((it) => it.nome === name);
    if (found) updateLinha(idx, { item_id: found.id, item_nome: found.nome });
  };

  // ======== SALVAR SOLICITAÇÃO ========
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");
    if (linhas.length === 0)
      return setMensagem("Adicione ao menos 1 item.");

    for (const l of linhas) {
      if (!l.item_id)
        return setMensagem("Escolha itens válidos da lista.");
      if (!l.quantidade || Number(l.quantidade) <= 0)
        return setMensagem("Informe quantidade válida.");
    }

    setLoading(true);
    const payload = {
      data_pedido: new Date().toISOString().slice(0, 10),
      ...form,
      itens: JSON.stringify(
        linhas.map((l) => ({
          item_id: l.item_id,
          item_nome: l.item_nome,
          quantidade: Number(l.quantidade),
        }))
      ),
      separado: false,
      enviado: false,
    };

    const { error } = await supabase.from("solicitacoes").insert([payload]);
    if (error) setMensagem("❌ Erro ao salvar solicitação.");
    else {
      setMensagem("✅ Solicitação registrada com sucesso!");
      setMostrarModal(false);
      setLinhas([{ item_id: "", item_nome: "", quantidade: 1 }]);
      setForm((f) => ({
        ...f,
        urgente: false,
        responsavel_retirada: "",
        observacoes: "",
      }));
      fetchSolicitacoes();
    }
    setLoading(false);
  };

  // ======== EXCLUIR ========
  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente excluir esta solicitação?")) return;
    const { error } = await supabase.from("solicitacoes").delete().eq("id", id);
    if (error) setMensagem("❌ Erro ao excluir solicitação.");
    else {
      setMensagem("✅ Solicitação excluída.");
      fetchSolicitacoes();
    }
  };

  // ======== RENDER ========
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center w-full max-w-6xl mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg">
            <ClipboardList size={26} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Solicitações de Materiais
          </h2>
        </div>
        {!isAlmoxarifado && (
          <button
            onClick={() => setMostrarModal(true)}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl shadow hover:bg-teal-700 transition"
          >
            <PackagePlus size={18} />
            Nova Solicitação
          </button>
        )}
      </div>

      {/* Lista */}
      <div className="w-full max-w-6xl bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          <ClipboardList className="text-teal-600" size={20} />
          Solicitações Recentes
        </h3>

        {loading ? (
          <p className="text-gray-500">Carregando...</p>
        ) : (
          <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="border p-2">Data</th>
                <th className="border p-2">Matrícula</th>
                <th className="border p-2">Nome</th>
                <th className="border p-2">Setor</th>
                <th className="border p-2">Unidade</th>
                <th className="border p-2">Itens</th>
                <th className="border p-2">Status</th>
                {isAlmoxarifado && <th className="border p-2">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {solicitacoes.length === 0 && (
                <tr>
                  <td
                    colSpan={isAlmoxarifado ? 8 : 7}
                    className="p-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    Nenhuma solicitação encontrada.
                  </td>
                </tr>
              )}
              {solicitacoes.map((s) => {
                let itensArray = [];
                try {
                  itensArray = JSON.parse(s.itens || "[]");
                } catch {}
                const statusLabel = s.enviado
                  ? "Enviado"
                  : s.separado
                  ? "Separado"
                  : "Pendente";
                const statusClass =
                  s.enviado
                    ? "bg-green-100 text-green-700"
                    : s.separado
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-600";

                return (
                  <tr
                    key={s.id}
                    className="text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="border p-2">{new Date(s.data_pedido).toLocaleDateString("pt-BR")}</td>
                    <td className="border p-2">{s.matricula}</td>
                    <td className="border p-2">{s.nome}</td>
                    <td className="border p-2">{s.setor || "-"}</td>
                    <td className="border p-2">{s.unidade || "-"}</td>
                    <td className="border p-2 text-left">
                      <ul className="list-disc pl-5">
                        {itensArray.map((it, i) => (
                          <li key={i}>{it.item_nome} — {it.quantidade}</li>
                        ))}
                      </ul>
                    </td>
                    <td className={`border p-2 ${statusClass} font-semibold`}>
                      {statusLabel}
                    </td>

                    {isAlmoxarifado && (
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-3 items-center">
                          {/* Toggle Separado */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <span className="text-xs">Separado</span>
                            <button
                              onClick={() => toggleStatus(s.id, "separado", s.separado)}
                              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all ${
                                s.separado ? "bg-green-500" : "bg-gray-400"
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-all ${
                                  s.separado ? "translate-x-5" : "translate-x-1"
                                }`}
                              />
                            </button>
                          </label>

                          {/* Toggle Enviado */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <span className="text-xs">Enviado</span>
                            <button
                              onClick={() => toggleStatus(s.id, "enviado", s.enviado)}
                              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all ${
                                s.enviado ? "bg-blue-500" : "bg-gray-400"
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-all ${
                                  s.enviado ? "translate-x-5" : "translate-x-1"
                                }`}
                              />
                            </button>
                          </label>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ======== MODAL NOVA SOLICITAÇÃO ======== */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-3xl relative">
            <button
              onClick={() => setMostrarModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X size={22} />
            </button>

            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
              Nova Solicitação
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input name="unidade" onChange={handleChange} value={form.unidade} placeholder="Unidade" className="p-2 border rounded" />
                <input name="setor" onChange={handleChange} value={form.setor} placeholder="Setor" className="p-2 border rounded" />
              </div>

              <div>
                {linhas.map((l, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <select
                      value={l.item_nome}
                      onChange={(e) => handleItemSelectByName(idx, e.target.value)}
                      className="flex-1 p-2 border rounded"
                    >
                      <option value="">Selecione o item</option>
                      {itens.map((it) => (
                        <option key={it.id} value={it.nome}>
                          {it.nome}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={l.quantidade}
                      onChange={(e) => updateLinha(idx, { quantidade: e.target.value })}
                      className="w-24 p-2 border rounded"
                    />
                    {idx > 0 && (
                      <button type="button" onClick={() => removeLinha(idx)} className="text-red-500">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addLinha} className="text-teal-600 font-medium">
                  + Adicionar item
                </button>
              </div>

              <textarea
                name="observacoes"
                onChange={handleChange}
                value={form.observacoes}
                placeholder="Observações..."
                className="w-full p-2 border rounded"
              />

              <button
                type="submit"
                className="w-full bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition"
              >
                {loading ? "Enviando..." : "Enviar Solicitação"}
              </button>

              {mensagem && <p className="text-center mt-2">{mensagem}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
