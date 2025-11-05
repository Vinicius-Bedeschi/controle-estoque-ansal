import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ClipboardList, PackageCheck, Truck, PackageSearch } from "lucide-react";

export default function SolicitacoesEstoque() {
  const [solicitacoes, setSolicitacoes] = useState([]);

  useEffect(() => {
    carregarSolicitacoes();

    // Atualização em tempo real
    const subscription = supabase
      .channel("solicitacoes-estoque-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "solicitacoes" }, () => {
        carregarSolicitacoes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const carregarSolicitacoes = async () => {
    const { data, error } = await supabase
      .from("solicitacoes")
      .select("*")
      .order("data_pedido", { ascending: false });

    if (error) console.error(error);
    else setSolicitacoes(data || []);
  };

  const atualizarStatus = async (id, campo, valor) => {
    const { error } = await supabase
      .from("solicitacoes")
      .update({ [campo]: valor })
      .eq("id", id);

    if (error) console.error(error);
  };

  return (
    <div className="p-8">
      {/* Título com ícone e animação */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg animate-spin-slow">
          <ClipboardList size={26} />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">
          Solicitações do Estoque
        </h1>
      </div>

      {/* Nenhuma solicitação */}
      {solicitacoes.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl shadow-md text-center border border-gray-100">
          <PackageSearch
            size={40}
            className="mx-auto mb-3 text-gray-400 animate-pulse"
          />
          <p className="text-gray-500">Nenhuma solicitação registrada ainda.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-md border border-gray-100">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">#Pedido</th>
                <th className="px-4 py-3 text-left font-semibold">Data</th>
                <th className="px-4 py-3 text-left font-semibold">Matrícula</th>
                <th className="px-4 py-3 text-left font-semibold">Nome</th>
                <th className="px-4 py-3 text-left font-semibold">Itens</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {solicitacoes.map((s) => {
                let itensArray = [];
                try {
                  itensArray = JSON.parse(s.itens || "[]");
                } catch {}

                const statusLabel = s.enviado
                  ? "✅ Enviado"
                  : s.separado
                  ? "📦 Separado"
                  : "🕓 Pendente";
                const statusColor = s.enviado
                  ? "bg-green-100 text-green-700"
                  : s.separado
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-600";

                return (
                  <tr
                    key={s.id}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-700">{s.id}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(s.data_pedido).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{s.matricula}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {s.nome}
                    </td>
                    <td className="px-4 py-3">
                      <ul className="text-gray-600 text-sm list-disc pl-5">
                        {itensArray.map((item, i) => (
                          <li key={i}>
                            {item.item_nome || item.nome} — {item.quantidade}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        <div
                          className={`text-center px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}
                        >
                          {statusLabel}
                        </div>

                        <div className="flex gap-3 justify-center mt-1">
                          <label className="flex items-center gap-1 text-xs text-gray-700">
                            <input
                              type="checkbox"
                              checked={s.separado}
                              onChange={(e) =>
                                atualizarStatus(s.id, "separado", e.target.checked)
                              }
                            />
                            Separado
                          </label>
                          <label className="flex items-center gap-1 text-xs text-gray-700">
                            <input
                              type="checkbox"
                              checked={s.enviado}
                              onChange={(e) =>
                                atualizarStatus(s.id, "enviado", e.target.checked)
                              }
                            />
                            Enviado
                          </label>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
