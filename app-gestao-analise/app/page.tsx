"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import Link from "next/link";

// 1. A interface agora reflete a REALIDADE: 'paciente' é um objeto único.
interface SessaoComPaciente {
  data: string;
  valor: number;
  status: string;
  paciente: {
    nome: string;
  } | null;
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    sessoesRealizadas: 0,
    sessoesAgendadas: 0,
    valorRecebido: 0,
    valorPendente: 0,
  });
  const [sessoesPendentes, setSessoesPendentes] = useState<SessaoComPaciente[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [nomeMes, setNomeMes] = useState("");
  const [anoSelecionado, setAnoSelecionado] = useState(
    new Date().getFullYear()
  );
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());

  const anosDisponiveis = [2025, 2024, 2023];
  const nomesDosMeses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  useEffect(() => {
    const fetchMonthlyData = async () => {
      setLoading(true);
      const primeiroDiaDoMes = new Date(anoSelecionado, mesSelecionado, 1);
      const ultimoDiaDoMes = new Date(anoSelecionado, mesSelecionado + 1, 0);
      const dataDeReferencia = new Date(anoSelecionado, mesSelecionado, 1);
      const nomeDoMesAtual = dataDeReferencia.toLocaleString("pt-BR", {
        month: "long",
        year: "numeric",
      });
      setNomeMes(
        nomeDoMesAtual.charAt(0).toUpperCase() + nomeDoMesAtual.slice(1)
      );

      const { data, error } = await supabase
        .from("sessoes")
        .select("data, valor, status, paciente:pacientes(nome)")
        .gte("data", primeiroDiaDoMes.toISOString())
        .lte("data", ultimoDiaDoMes.toISOString())
        .order("data", { ascending: true });

      if (error) {
        console.error("Erro ao buscar dados do mês:", error);
      } else if (data) {
        let valorRecebidoCalc = 0,
          valorPendenteCalc = 0,
          sessoesRealizadasCount = 0,
          sessoesAgendadasCount = 0;
        const dataDeHoje = new Date();
        dataDeHoje.setHours(0, 0, 0, 0);

        for (const sessao of data) {
          if (sessao.status === "Paga") valorRecebidoCalc += sessao.valor;
          else if (
            sessao.status === "Pendente" ||
            sessao.status === "Cancelado"
          )
            valorPendenteCalc += sessao.valor;

          if (sessao.status !== "Cancelado") {
            const dataSessao = new Date(sessao.data + "T00:00:00Z");
            if (dataSessao <= dataDeHoje) sessoesRealizadasCount++;
            else sessoesAgendadasCount++;
          }
        }
        setStats({
          sessoesRealizadas: sessoesRealizadasCount,
          sessoesAgendadas: sessoesAgendadasCount,
          valorRecebido: valorRecebidoCalc,
          valorPendente: valorPendenteCalc,
        });

        const pendentes = data.filter(
          (s) => s.status === "Pendente" || s.status === "Cancelado"
        );
        // 2. Usamos 'as any' para forçar o TypeScript a aceitar a estrutura real dos dados
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setSessoesPendentes(pendentes as any);
      }
      setLoading(false);
    };

    fetchMonthlyData();
  }, [anoSelecionado, mesSelecionado]);

  if (loading)
    return (
      <div>
        <h1 className="text-3xl font-bold text-white">Carregando...</h1>
      </div>
    );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <div className="flex items-center gap-2">
          <select
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(parseInt(e.target.value))}
            className="p-2 border rounded bg-gray-800 border-gray-600 text-white"
          >
            {nomesDosMeses.map((mes, index) => (
              <option key={index} value={index}>
                {mes}
              </option>
            ))}
          </select>
          <select
            value={anoSelecionado}
            onChange={(e) => setAnoSelecionado(parseInt(e.target.value))}
            className="p-2 border rounded bg-gray-800 border-gray-600 text-white"
          >
            {anosDisponiveis.map((ano) => (
              <option key={ano} value={ano}>
                {ano}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-lg text-gray-400 mb-8">Exibindo resumo de {nomeMes}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 p-6 rounded-lg shadow-md border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-400 mb-2">
            Sessões Realizadas
          </h2>
          <p className="text-4xl font-bold text-white">
            {stats.sessoesRealizadas}
          </p>
        </div>
        <div className="bg-gray-900 p-6 rounded-lg shadow-md border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-400 mb-2">
            Sessões Agendadas
          </h2>
          <p className="text-4xl font-bold text-white">
            {stats.sessoesAgendadas}
          </p>
        </div>
        <div className="bg-green-900/50 p-6 rounded-lg shadow-md border border-green-700">
          <h2 className="text-lg font-semibold text-green-300 mb-2">
            Total Recebido
          </h2>
          <p className="text-4xl font-bold text-white">
            R$ {stats.valorRecebido.toFixed(2).replace(".", ",")}
          </p>
        </div>
        <div className="bg-yellow-900/50 p-6 rounded-lg shadow-md border border-yellow-700">
          <h2 className="text-lg font-semibold text-yellow-300 mb-2">
            Total Pendente
          </h2>
          <p className="text-4xl font-bold text-white">
            R$ {stats.valorPendente.toFixed(2).replace(".", ",")}
          </p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4 text-white">
          Lançamentos Pendentes no Mês
        </h2>
        <div className="overflow-x-auto bg-gray-900 border border-gray-700 rounded-lg">
          <table className="min-w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="py-3 px-4 text-left text-gray-300 font-semibold">
                  Paciente
                </th>
                <th className="py-3 px-4 text-left text-gray-300 font-semibold">
                  Data
                </th>
                <th className="py-3 px-4 text-left text-gray-300 font-semibold">
                  Valor
                </th>
                <th className="py-3 px-4 text-left text-gray-300 font-semibold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {sessoesPendentes.length > 0 ? (
                sessoesPendentes.map((sessao, index) => (
                  <tr key={index} className="border-t border-gray-700">
                    <td className="py-3 px-4 font-medium">
                      {sessao.paciente?.nome || "Paciente não encontrado"}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(sessao.data + "T00:00:00Z").toLocaleDateString(
                        "pt-BR"
                      )}
                    </td>
                    <td className="py-3 px-4">
                      R$ {sessao.valor.toFixed(2).replace(".", ",")}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          sessao.status === "Cancelado"
                            ? "bg-red-900 text-red-200"
                            : "bg-yellow-900 text-yellow-200"
                        }`}
                      >
                        {sessao.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-gray-700">
                  <td colSpan={4} className="text-center py-6 text-gray-500">
                    Nenhuma pendência este mês!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-10">
        <Link
          href="/pacientes"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          Gerenciar Pacientes e Sessões
        </Link>
      </div>
    </div>
  );
}
