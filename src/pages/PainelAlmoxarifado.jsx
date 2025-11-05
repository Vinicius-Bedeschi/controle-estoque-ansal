import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Package,
  ClipboardList,
  AlertTriangle,
  Truck,
  Clock,
  Box,
} from "lucide-react";

export default function PainelAlmoxarifado() {
  const [dados, setDados] = useState({
    totalItens: 0,
    pendentes: 0,
    separados: 0,
    enviados: 0,
  });
  const [solicitacoesRecentes, setSolicitacoesRecentes] = useState([]);
  const [estoqueBaixo, setEstoqueBaixo] = useState([]);
  const [loading, setLoading] = useState(true);

  // ======== BUSCA INICIAL ========
  useEffect(() => {
    const carregarTudo = async () => {
      setLoading(true);
      await Promise.all([
        buscarIndicadores(),
        buscarSolicitacoes(),
        buscarEstoqueBaixo(),
      ]);
      setLoading(false);
    };
    carregarTudo();

    // === LISTENERS EM TEMPO REAL ===
    const subsSolicitacoes = supabase
      .channel("solicitacoes-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "solicitacoes" }, () => {
        buscarIndicadores();
        buscarSolicitacoes();
      })
      .subscribe();

    const subsItens = supabase
      .channel("itens-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "itens" }, () => {
        buscarIndicadores();
        buscarEstoqueBaixo();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subsSolicitacoes);
      supabase.removeChannel(subsItens);
    };
  }, []);

  // ======== FUNÇÕES DE BUSCA ========
  const buscarIndicadores = async () => {
    const { count: totalItens } = await supabase
      .from("itens")
      .select("*", { count: "exact", head: true });

    const { count: pendentes } = await supabase
      .from("solicitacoes")
      .select("*", { count: "exact", head: true })
      .eq("separado", false)
      .eq("enviado", false);

    const { count: separados } = await supabase
      .from("solicitacoes")
      .select("*", { count: "exact", head: true })
      .eq("separado", true)
      .eq("enviado", false);

    const { count: enviados } = await supabase
      .from("solicitacoes")
      .select("*", { count: "exact", head: true })
      .eq("enviado", true);

    setDados({
      totalItens: totalItens || 0,
      pendentes: pendentes || 0,
      separados: separados || 0,
      enviados: enviados || 0,
    });
  };

  const buscarSolicitacoes = async () => {
    const { data } = await supabase
      .from("solicitacoes")
      .select("id, data_pedido, nome, matricula, separado, enviado, itens")
      .order("data_pedido", { ascending: false })
      .limit(5);
    setSolicitacoesRecentes(data || []);
  };

  const buscarEstoqueBaixo = async () => {
    const { data, error } = await supabase
      .from("itens")
      .select("id, nome, quantidade_atual, estoque_minimo")
      .order("quantidade_atual", { ascending: true });

    if (error) {
      console.error("Erro ao buscar estoque baixo:", error);
      return;
    }

    // Filtro final para garantir consistência
    const filtrados = (data || []).filter(
      (it) => Number(it.quantidade_atual) <= Number(it.estoque_minimo || 10)
    );

    setEstoqueBaixo(filtrados);
  };

  // ======== COMPONENTE ========
  const cards = [
    {
      titulo: "Itens em Estoque",
      valor: dados.totalItens,
      icone: <Box size={26} />,
      gradiente: "from-sky-500 to-blue-600",
    },
    {
      titulo: "Pendentes",
      valor: dados.pendentes,
      icone: <Clock size={26} />,
      gradiente: "from-amber-400 to-yellow-500",
    },
    {
      titulo: "Separados",
      valor: dados.separados,
      icone: <ClipboardList size={26} />,
      gradiente: "from-orange-500 to-red-400",
    },
    {
      titulo: "Enviados",
      valor: dados.enviados,
      icone: <Truck size={26} />,
      gradiente: "from-emerald-500 to-teal-600",
    },
  ];

  return (
    <div className="p-8">
      {/* Título com ícone animado */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg animate-spin-slow">
          <Package size={26} />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Painel do Estoque</h1>
      </div>

      {/* === CARDS === */}
      {loading ? (
        <p className="text-gray-500 animate-pulse">Carregando dados...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {cards.map((c, i) => (
            <div
              key={i}
              className={`flex items-center justify-between p-6 rounded-2xl shadow-md text-white bg-gradient-to-r ${c.gradiente} transform transition hover:scale-105`}
            >
              <div>
                <h2 className="text-lg font-semibold">{c.titulo}</h2>
                <p className="text-4xl font-bold mt-2">{c.valor}</p>
              </div>
              <div className="opacity-80">{c.icone}</div>
            </div>
          ))}
        </div>
      )}

      {/* === SEÇÕES === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* === Solicitações Recentes === */}
        <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="text-sky-600" size={22} />
            <h3 className="text-xl font-bold text-gray-800">Solicitações Recentes</h3>
          </div>
          {solicitacoesRecentes.length === 0 ? (
            <p className="text-gray-500">Nenhuma solicitação registrada.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {solicitacoesRecentes.map((s) => {
                let itensCount = 0;
                try {
                  const itens = JSON.parse(s.itens || "[]");
                  itensCount = itens.length;
                } catch {}
                const status = s.enviado
                  ? "✅ Enviado"
                  : s.separado
                  ? "📦 Separado"
                  : "🕓 Pendente";
                return (
                  <li key={s.id} className="py-3 hover:bg-gray-50 transition rounded-lg px-2">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {s.nome} — Mat. {s.matricula}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(s.data_pedido).toLocaleDateString("pt-BR")} —{" "}
                          {itensCount} itens
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-gray-600">
                        {status}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* === Estoque Baixo === */}
        <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-red-500" size={22} />
            <h3 className="text-xl font-bold text-gray-800">Itens com Estoque Baixo</h3>
          </div>
          {estoqueBaixo.length === 0 ? (
            <p className="text-gray-500">Nenhum item com estoque baixo.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {estoqueBaixo.map((it) => (
                <li
                  key={it.id}
                  className="py-3 flex justify-between items-center hover:bg-red-50 transition rounded-lg px-2"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{it.nome}</p>
                    <p className="text-sm text-gray-500">
                      Atual: {it.quantidade_atual} — Mínimo: {it.estoque_minimo || 10}
                    </p>
                  </div>
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                    Repor
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
