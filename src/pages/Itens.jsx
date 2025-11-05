import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { PackageSearch } from "lucide-react";

export default function Itens() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarItens();
  }, []);

  async function buscarItens() {
    setLoading(true);
    const { data, error } = await supabase
      .from("itens")
      .select("*")
      .order("nome", { ascending: true });

    if (error) {
      console.error("Erro ao buscar itens:", error.message);
    } else {
      setItens(data || []);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg animate-spin-slow">
          <PackageSearch size={26} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Itens em Estoque</h1>
      </div>

      {/* Estado de carregamento */}
      {loading && (
        <p className="text-gray-600 dark:text-gray-400 text-lg animate-pulse">
          Carregando itens do estoque...
        </p>
      )}

      {/* Nenhum item */}
      {!loading && itens.length === 0 && (
        <p className="text-gray-600 dark:text-gray-400 italic">
          Nenhum item cadastrado no momento.
        </p>
      )}

      {/* Tabela */}
      {!loading && itens.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 w-full max-w-5xl">
          <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="border p-3 text-left text-gray-500 dark:text-gray-300">Código</th>
                <th className="border p-3 text-left text-gray-500 dark:text-gray-300">Nome</th>
                <th className="border p-3 text-left text-gray-500 dark:text-gray-300">Categoria</th>
                <th className="border p-3 text-center text-gray-500 dark:text-gray-300">Qtd Atual</th>
                <th className="border p-3 text-center text-gray-500 dark:text-gray-300">Estoque Mínimo</th>
                <th className="border p-3 text-center text-gray-500 dark:text-gray-300">Unidade</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item) => {
                const abaixoMinimo =
                  item.quantidade_atual <= item.estoque_minimo;

                return (
<tr
	                    key={item.id}
	                    className={`transition hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
	                      abaixoMinimo ? "bg-red-50 dark:bg-red-900/30" : "dark:bg-gray-800"
	                    }`}
	                  >
                    <td className="border p-3 text-gray-700 dark:text-gray-300">{item.codigo}</td>
                    <td
                      className={`border p-3 font-semibold ${
                        abaixoMinimo ? "text-red-600" : "text-gray-600"
                      }`}
                    >
                      {item.nome}
                    </td>
                    <td className="border p-3 text-gray-600 dark:text-gray-400">
                      {item.categoria}
                    </td>
                    <td
                      className={`border p-3 text-center font-medium ${
                        abaixoMinimo ? "text-red-600" : "text-red-600"
                      }`}
                    >
                      {item.quantidade_atual}
                    </td>
                    <td className="border p-3 text-center text-gray-600 dark:text-gray-400">
                      {item.estoque_minimo}
                    </td>
                    <td className="border p-3 text-center text-gray-600 dark:text-gray-400">
                      {item.unidade}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Legenda */}
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full" />
            <span>Itens abaixo do estoque mínimo</span>
          </div>
        </div>
      )}
    </div>
  );
}
