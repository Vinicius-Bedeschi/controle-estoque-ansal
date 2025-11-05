import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  LabelList,
} from "recharts";
import {
  Package,
  ArrowDownRight,
  DollarSign,
  RefreshCcw,
  BarChart3,
  Building2,
  LineChart as LineIcon,
  PieChart as PieIcon,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [itens, setItens] = useState([]);
  const [saidas, setSaidas] = useState([]);
  const [entradas, setEntradas] = useState([]);

  useEffect(() => {
    const carregarDados = async () => {
      const { data: itensData } = await supabase.from("itens").select("*");
      const { data: saidasData } = await supabase.from("saidas").select("*");
      const { data: entradasData } = await supabase.from("entradas").select("*");
      setItens(itensData || []);
      setSaidas(saidasData || []);
      setEntradas(entradasData || []);
    };
    carregarDados();
  }, []);

  const mesAtual = new Date().getMonth() + 1;
  const totalItens = itens.length;

  const itensComEstoqueBaixo = itens.filter(
    (item) => Number(item.quantidade_atual) <= Number(item.estoque_minimo)
  );

  const saidasMes = saidas.filter((s) => {
    const data = new Date(s.data_saida);
    return data.getMonth() + 1 === mesAtual;
  });

  // Função utilitária para calcular custo por saída usando entradas relacionadas
  const custoDeSaida = (s) => {
    const itemRelacionado = entradas.find((e) => e.item_id === s.item_id);
    const precoUnit = Number(itemRelacionado?.preco_unitario || 0);
    return Number(s.quantidade || 0) * precoUnit;
  };

  const custoMensal = saidasMes.reduce((acc, s) => acc + custoDeSaida(s), 0);

  const totalSaidasMes = saidasMes.reduce(
    (acc, s) => acc + Number(s.quantidade || 0),
    0
  );

  const consumoPorSetor = Object.values(
    saidasMes.reduce((acc, s) => {
      const custo = custoDeSaida(s);
      if (!acc[s.setor]) acc[s.setor] = { setor: s.setor, valor: 0 };
      acc[s.setor].valor += custo;
      return acc;
    }, {})
  ).sort((a, b) => b.valor - a.valor);

  const consumoPorUnidade = Object.values(
    saidasMes.reduce((acc, s) => {
      const custo = custoDeSaida(s);
      if (!acc[s.unidade]) acc[s.unidade] = { unidade: s.unidade, valor: 0 };
      acc[s.unidade].valor += custo;
      return acc;
    }, {})
  ).sort((a, b) => b.valor - a.valor);

  // === Histórico de custos (últimos 6 meses) ===
  const historicoCustos = Array.from({ length: 6 }).map((_, i) => {
    const mes = new Date();
    mes.setMonth(mes.getMonth() - (5 - i));
    const mesNum = mes.getMonth() + 1;
    const mesNome = mes.toLocaleString("pt-BR", { month: "short" });

    const totalMes = saidas
      .filter((s) => new Date(s.data_saida).getMonth() + 1 === mesNum)
      .reduce((acc, s) => acc + custoDeSaida(s), 0);

    return { mes: mesNome, valor: totalMes };
  });

  // === Consumo Mensal (últimos 12 meses) ===
  const consumoMensal = Array.from({ length: 12 }).map((_, i) => {
    const mes = new Date();
    mes.setMonth(mes.getMonth() - (11 - i));
    const mesNum = mes.getMonth() + 1;
    const mesNome = mes.toLocaleString("pt-BR", { month: "short" });

    const totalMes = saidas
      .filter((s) => new Date(s.data_saida).getMonth() + 1 === mesNum)
      .reduce((acc, s) => acc + custoDeSaida(s), 0);

    return { mes: mesNome, valor: totalMes };
  });

  // === Função para calcular variação percentual entre mês atual e anterior ===
  const calcPercentChange = (currentValue, prevValue) => {
    if (prevValue === 0) return currentValue === 0 ? 0 : 100;
    const diff = currentValue - prevValue;
    return (diff / Math.abs(prevValue)) * 100;
  };

  // Exemplo: calcular variação de custo mensal (mês atual vs mês anterior)
  const mesAtualNum = new Date().getMonth() + 1;
  const mesAnteriorNum = mesAtualNum === 1 ? 12 : mesAtualNum - 1;
  const custoMesAtual = saidas
    .filter((s) => new Date(s.data_saida).getMonth() + 1 === mesAtualNum)
    .reduce((acc, s) => acc + custoDeSaida(s), 0);
  const custoMesAnterior = saidas
    .filter((s) => new Date(s.data_saida).getMonth() + 1 === mesAnteriorNum)
    .reduce((acc, s) => acc + custoDeSaida(s), 0);
  const pctCusto = calcPercentChange(custoMesAtual, custoMesAnterior);

  // === Cards com visual aprimorado ===
  const cards = [
    {
      key: "itens",
      label: "Total de Itens",
      valor: totalItens,
      icone: <Package className="w-6 h-6 text-emerald-600" />,
      colorBg: "bg-emerald-50/60",
      colorIconBg: "bg-emerald-100/60",
      small: "+ info",
      percent: null,
    },
    {
      key: "saidas",
      label: "Total de Saídas no Mês",
      valor: totalSaidasMes,
      icone: <ArrowDownRight className="w-6 h-6 text-sky-600" />,
      colorBg: "bg-sky-50/60",
      colorIconBg: "bg-sky-100/60",
      percent: null,
    },
    {
      key: "custo",
      label: "Custo Mensal das Saídas",
      valor: `R$ ${custoMensal.toFixed(2)}`,
      icone: <DollarSign className="w-6 h-6 text-amber-600" />,
      colorBg: "bg-amber-50/60",
      colorIconBg: "bg-amber-100/60",
      percent: pctCusto,
    },
    {
      key: "atual",
      label: "Última Atualização",
      valor: new Date().toLocaleDateString("pt-BR"),
      icone: <RefreshCcw className="w-6 h-6 text-gray-600" />,
      colorBg: "bg-gray-50/60",
      colorIconBg: "bg-gray-100/60",
      percent: null,
    },
  ];

  return (
    <motion.div
      className="p-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
  Dashboard <span className="text-blue-500">Geral</span>
</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Visão geral rápida dos principais indicadores do estoque.
        </p>
      </div>

      {/* CARDS */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
  {cards.map((c) => (
    <motion.div
      key={c.key}
      whileHover={{ scale: 1.04 }}
      className={`relative overflow-hidden rounded-2xl p-6 shadow-lg text-white bg-gradient-to-br ${
        c.key === "itens"
          ? "from-emerald-500 to-green-600"
          : c.key === "saidas"
          ? "from-sky-500 to-blue-600"
          : c.key === "custo"
          ? "from-amber-500 to-orange-600"
          : "from-gray-500 to-gray-700"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            {c.icone}
          </div>
          <div>
            <p className="text-sm opacity-90">{c.label}</p>
          </div>
        </div>

        {typeof c.percent === "number" && (
          <div
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              c.percent >= 0 ? "bg-white/20" : "bg-black/20"
            }`}
          >
            {c.percent >= 0 ? "+" : ""}
            {c.percent.toFixed(0)}%
          </div>
        )}
      </div>

      <p className="text-3xl font-extrabold">{c.valor}</p>
      <div className="text-xs opacity-90 mt-2">{c.small}</div>
    </motion.div>
  ))}
</div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Consumo por Setor */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <BarChart3 className="text-sky-600" /> Consumo por Setor (R$)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={consumoPorSetor}>
              <defs>
                <linearGradient id="gradSetor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={1} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <XAxis dataKey="setor" axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v) => `R$ ${v.toFixed(2)}`} />
              <Bar dataKey="valor" fill="url(#gradSetor)" radius={[12, 12, 0, 0]}>
                <LabelList
                  dataKey="valor"
                  position="insideTop"
                  formatter={(v) => `R$ ${v.toFixed(0)}`}
                  style={{ fill: "white", fontWeight: 700, fontSize: 13 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Consumo por Unidade */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Building2 className="text-emerald-600" /> Consumo por Unidade (R$)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={consumoPorUnidade}>
              <defs>
                <linearGradient id="gradUnidade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <XAxis dataKey="unidade" axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v) => `R$ ${v.toFixed(2)}`} />
              <Bar dataKey="valor" fill="url(#gradUnidade)" radius={[12, 12, 0, 0]}>
                <LabelList
                  dataKey="valor"
                  position="insideTop"
                  formatter={(v) => `R$ ${v.toFixed(0)}`}
                  style={{ fill: "white", fontWeight: 700, fontSize: 13 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Consumo Mensal (12 meses) */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 col-span-1 lg:col-span-2 hover:shadow-xl transition-all">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <LineIcon className="text-amber-600" /> Consumo Mensal (Últimos 12 Meses)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={consumoMensal} margin={{ top: 30, right: 20, bottom: 10, left: 0 }}>
    {/* Tooltip aparece só ao passar o mouse */}
    <Tooltip
      formatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`}
      contentStyle={{
        backgroundColor: "white",
        borderRadius: "10px",
        border: "1px solid #eee",
        fontSize: "12px",
      }}
    />
    {/* Linha principal */}
    <Line
      type="monotone"
      dataKey="valor"
      stroke="#14B8A6"
      strokeWidth={3}
      dot={{ r: 5, fill: "#14B8A6", stroke: "white", strokeWidth: 2 }}
      activeDot={{ r: 7 }}
    >
      <LabelList
        dataKey="valor"
        position="top"
        formatter={(v) => `R$ ${v.toLocaleString("pt-BR")}`}
        className="text-xs font-semibold fill-gray-700"
      />
    </Line>
  </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ITENS COM ESTOQUE BAIXO */}
      <div className="mt-10 bg-gradient-to-br from-red-50 to-white dark:from-red-900/10 dark:to-gray-800 p-6 rounded-2xl border border-red-100 dark:border-red-800/40 shadow-md transition-all">
        <h3 className="font-semibold mb-4 flex items-center gap-3 text-red-600">
          <span className="p-2 rounded-full bg-red-100/70 dark:bg-red-900/30 animate-pulse">
            <Package className="w-5 h-5" />
          </span>
          Itens com Estoque Baixo
        </h3>

        {itensComEstoqueBaixo.length > 0 ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {itensComEstoqueBaixo.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center p-3 rounded-lg bg-white dark:bg-red-900/10 border border-red-200 dark:border-red-800/30"
              >
                <div>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {item.nome}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Mínimo: {item.estoque_minimo} • Local: {item.local || "-"}
                  </div>
                </div>
                <div className="text-xs font-bold text-red-600 dark:text-red-400">
                  {item.quantidade_atual} / {item.estoque_minimo}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">🎉 Nenhum item abaixo do estoque mínimo.</p>
        )}
      </div>
    </motion.div>
  );
}
