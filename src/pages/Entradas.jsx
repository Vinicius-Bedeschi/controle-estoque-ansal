import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { PlusCircle, Package, ClipboardList, Trash2 } from "lucide-react";

export default function Entradas() {
  const [itens, setItens] = useState([]);
  const [form, setForm] = useState({
    item_id: "",
    item_nome: "",
    quantidade: "",
    preco_unitario: "",
    preco_total: "",
    nota_fiscal: "",
    data_entrada: "",
    observacoes: "",
    responsavel: "",
  });
  const [mensagem, setMensagem] = useState("");
  const [entradas, setEntradas] = useState([]);
  const [showForm, setShowForm] = useState(false); // Para animar o formulário

  // Animação ao carregar
  useEffect(() => {
    const timer = setTimeout(() => setShowForm(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Carrega os itens do estoque
  useEffect(() => {
    const fetchItens = async () => {
      const { data, error } = await supabase.from("itens").select("id, nome");
      if (error) console.error("Erro ao buscar itens:", error);
      else setItens(data);
    };
    fetchItens();
  }, []);

  // Atualiza nome e total automaticamente
  useEffect(() => {
    const itemSelecionado = itens.find((i) => i.id === form.item_id);
    if (itemSelecionado) {
      setForm((f) => ({ ...f, item_nome: itemSelecionado.nome }));
    }

    if (form.quantidade && form.preco_unitario) {
      const total = parseFloat(form.quantidade) * parseFloat(form.preco_unitario);
      setForm((f) => ({ ...f, preco_total: total.toFixed(2) }));
    }
  }, [form.item_id, form.quantidade, form.preco_unitario]);

  // Busca entradas
  useEffect(() => {
    const buscarEntradas = async () => {
      const { data, error } = await supabase
        .from("entradas")
        .select("*")
        .order("data_entrada", { ascending: false });
      if (error) console.error("Erro ao buscar entradas:", error);
      else setEntradas(data);
    };
    buscarEntradas();
  }, [mensagem]);

  // Atualiza formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submete entrada
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");

    const { error: insertError } = await supabase.from("entradas").insert([form]);
    if (insertError) {
      console.error("Erro ao registrar entrada:", insertError);
      setMensagem("❌ Erro ao salvar a entrada.");
      return;
    }

    const { data: itemData, error: fetchError } = await supabase
      .from("itens")
      .select("quantidade_atual")
      .eq("id", form.item_id)
      .single();

    if (fetchError) {
      setMensagem("⚠️ Entrada registrada, mas erro ao atualizar estoque.");
      return;
    }

    const novaQuantidade = (itemData.quantidade_atual || 0) + parseFloat(form.quantidade);
    const { error: updateError } = await supabase
      .from("itens")
      .update({ quantidade_atual: novaQuantidade })
      .eq("id", form.item_id);

    if (updateError) {
      setMensagem("⚠️ Entrada salva, mas erro ao atualizar o estoque.");
    } else {
      setMensagem("✅ Entrada registrada e estoque atualizado com sucesso!");
    }

    setForm({
      item_id: "",
      item_nome: "",
      quantidade: "",
      preco_unitario: "",
      preco_total: "",
      nota_fiscal: "",
      data_entrada: "",
      observacoes: "",
      responsavel: "",
    });
  };

  // Excluir entrada
  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta entrada?")) return;
    const { error } = await supabase.from("entradas").delete().eq("id", id);
    if (!error) {
      alert("✅ Entrada excluída com sucesso!");
      setEntradas((prev) => prev.filter((e) => e.id !== id));
    } else {
      alert("❌ Erro ao excluir a entrada.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Título animado */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg animate-spin-slow">
          <Package size={28} />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
          Registrar Entrada
        </h2>
      </div>

      {/* Formulário centralizado e animado */}
<form
	        onSubmit={handleSubmit}
	        className={`transform transition-all duration-700 ease-out ${
	          showForm
	            ? "opacity-100 translate-y-0"
	            : "opacity-0 translate-y-8"
	        } space-y-5 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 w-full max-w-2xl sm:max-w-full`}
	      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Item */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Item</label>
<select
	              name="item_id"
	              value={form.item_id}
	              onChange={handleChange}
	              className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-gray-100"
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
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Quantidade
            </label>
<input
	              type="number"
	              name="quantidade"
	              value={form.quantidade}
	              onChange={handleChange}
	              className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-gray-100"
	              required
	            />
          </div>

          {/* Preço Unitário */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Preço Unitário (R$)
            </label>
<input
	              type="number"
	              step="0.01"
	              name="preco_unitario"
	              value={form.preco_unitario}
	              onChange={handleChange}
	              className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-gray-100"
	              required
	            />
          </div>

          {/* Preço Total */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Preço Total (R$)
            </label>
<input
	              type="text"
	              name="preco_total"
	              value={form.preco_total}
	              readOnly
	              className="border dark:border-gray-600 p-2 w-full rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-gray-300"
	            />
          </div>

          {/* Nota Fiscal */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Nota Fiscal
            </label>
<input
	              type="text"
	              name="nota_fiscal"
	              value={form.nota_fiscal}
	              onChange={handleChange}
	              className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-lg dark:bg-gray-700 dark:text-gray-100"
	            />
          </div>

          {/* Data */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Data da Entrada
            </label>
<input
	              type="date"
	              name="data_entrada"
	              value={form.data_entrada}
	              onChange={handleChange}
	              className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-lg dark:bg-gray-700 dark:text-gray-100"
	              required
	            />
          </div>

          {/* Responsável */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Responsável
            </label>
<input
	              type="text"
	              name="responsavel"
	              value={form.responsavel}
	              onChange={handleChange}
	              className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-lg dark:bg-gray-700 dark:text-gray-100"
	              required
	            />
          </div>
        </div>

        {/* Observações */}
        <div>
          <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Observações
          </label>
<textarea
	            name="observacoes"
	            value={form.observacoes}
	            onChange={handleChange}
	            className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-lg h-20 dark:bg-gray-700 dark:text-gray-100"
	          />
        </div>

        {/* Botão */}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-500 hover:opacity-90 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all w-full"
        >
          <PlusCircle size={20} />
          Registrar Entrada
        </button>
      </form>

      {/* Mensagem */}
      {mensagem && (
        <p className="mt-4 text-center font-semibold text-gray-700 dark:text-gray-300">
          {mensagem}
        </p>
      )}

      {/* Tabela */}
      <div className="mt-10 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 w-full max-w-5xl sm:max-w-full">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="text-teal-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Entradas Registradas
          </h3>
        </div>

        <div className="overflow-x-auto"><table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="border p-2 text-gray-500 dark:text-gray-300">Item</th>
              <th className="border p-2 text-gray-500 dark:text-gray-300">Qtd</th>
              <th className="border p-2 text-gray-500 dark:text-gray-300">Unitário</th>
              <th className="border p-2 text-gray-500 dark:text-gray-300">Total</th>
              <th className="border p-2 text-gray-500 dark:text-gray-300">NF</th>
              <th className="border p-2 text-gray-500 dark:text-gray-300">Data</th>
              <th className="border p-2 text-gray-500 dark:text-gray-300">Resp.</th>
              <th className="border p-2 text-gray-500 dark:text-gray-300">Ações</th>
            </tr>
          </thead>
          <tbody>
            {entradas.length > 0 ? (
              entradas.map((e, i) => (
                <tr key={i} className="text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="border p-2 text-gray-700 dark:text-gray-300">{e.item_nome}</td>
                  <td className="border p-2 text-gray-700 dark:text-gray-300">{e.quantidade}</td>
                  <td className="border p-2 text-gray-700 dark:text-gray-300">
                    R$ {Number(e.preco_unitario).toFixed(2)}
                  </td>
                  <td className="border p-2 text-gray-700 dark:text-gray-300">
                    R$ {Number(e.preco_total).toFixed(2)}
                  </td>
                  <td className="border p-2 text-gray-700 dark:text-gray-300">{e.nota_fiscal}</td>
                  <td className="border p-2 text-gray-700 dark:text-gray-300">
                    {new Date(e.data_entrada).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="border p-2 text-gray-700 dark:text-gray-300">{e.responsavel}</td>
                  <td className="border p-2 text-gray-700 dark:text-gray-300">
<button
	                      onClick={() => handleDelete(e.id)}
	                      className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
	                    >
                      <Trash2 size={14} /> Excluir
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4 text-gray-500 dark:text-gray-400">
                  Nenhuma entrada registrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
