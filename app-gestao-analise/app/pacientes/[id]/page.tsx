"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabaseClient";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

// Interfaces para tipagem dos nossos dados
interface Paciente {
  id: number;
  nome: string;
  telefone: string | null;
}

interface Sessao {
  id: number;
  data: string;
  tipo: string;
  valor: number;
  status: string;
  paciente_id: number;
  nota: string | null;
}

export default function PaginaDetalhePaciente({
  params,
}: {
  params: { id: string };
}) {
  // States
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [sessaoEmEdicao, setSessaoEmEdicao] = useState<Sessao | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [novaSessaoData, setNovaSessaoData] = useState<string>("");
  const [novaSessaoTipo, setNovaSessaoTipo] = useState<string>("Presencial");
  const [novaSessaoValor, setNovaSessaoValor] = useState<string>("");
  const [novaSessaoNota, setNovaSessaoNota] = useState<string>("");

  const handleFecharModalEdicao = useCallback(() => {
    setIsEditModalOpen(false);
    setSessaoEmEdicao(null);
  }, []);

  const handleFecharDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setSessaoEmEdicao(null);
  }, []);

  useEffect(() => {
    const idDoPaciente = parseInt(params.id);
    if (isNaN(idDoPaciente)) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      const { data: pacienteData } = await supabase
        .from("pacientes")
        .select("*")
        .eq("id", idDoPaciente)
        .single();
      setPaciente(pacienteData);

      // A MUDANÇA ESTÁ AQUI: ascending: true
      const { data: sessoesData } = await supabase
        .from("sessoes")
        .select("*")
        .eq("paciente_id", idDoPaciente)
        .order("data", { ascending: false }); // DE 'true' PARA 'false' -> a ideia é que as sessões mais recentes apareçam primeiro

      setSessoes(sessoesData || []);
      setLoading(false);
    };
    fetchData();
  }, [params]);

  const handleAdicionarSessao = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const idDoPaciente = parseInt(params.id);
      const { data: novaSessao, error } = await supabase
        .from("sessoes")
        .insert([
          {
            data: novaSessaoData,
            tipo: novaSessaoTipo,
            valor: parseFloat(novaSessaoValor),
            status: "Pendente",
            paciente_id: idDoPaciente,
            nota: novaSessaoNota,
          },
        ])
        .select()
        .single();
      if (error) {
        alert("Ocorreu um erro ao adicionar a sessão.");
      } else if (novaSessao) {
        setSessoes((sessoes) => [novaSessao, ...sessoes]);
        setNovaSessaoData("");
        setNovaSessaoValor("");
        setNovaSessaoNota("");
        setNovaSessaoTipo("Presencial");
      }
    },
    [params, novaSessaoData, novaSessaoNota, novaSessaoTipo, novaSessaoValor]
  );

  const handleAbrirModalEdicao = useCallback((sessao: Sessao) => {
    setSessaoEmEdicao({ ...sessao });
    setIsEditModalOpen(true);
  }, []);

  const handleSalvarEdicao = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!sessaoEmEdicao) return;
      const { data: sessaoAtualizada, error } = await supabase
        .from("sessoes")
        .update({
          data: sessaoEmEdicao.data,
          tipo: sessaoEmEdicao.tipo,
          valor: sessaoEmEdicao.valor,
          status: sessaoEmEdicao.status,
          nota: sessaoEmEdicao.nota,
        })
        .eq("id", sessaoEmEdicao.id)
        .select()
        .single();
      if (error) {
        alert("Erro ao salvar alterações.");
      } else if (sessaoAtualizada) {
        setSessoes((sessoes) =>
          sessoes.map((s) =>
            s.id === sessaoAtualizada.id ? sessaoAtualizada : s
          )
        );
        handleFecharModalEdicao();
      }
    },
    [sessaoEmEdicao, handleFecharModalEdicao]
  );

  const handleAbrirDeleteModal = useCallback((sessao: Sessao) => {
    setSessaoEmEdicao(sessao);
    setIsDeleteModalOpen(true);
  }, []);

  const handleApagarSessao = useCallback(async () => {
    if (!sessaoEmEdicao) return;
    const { error } = await supabase
      .from("sessoes")
      .delete()
      .eq("id", sessaoEmEdicao.id);
    if (error) {
      alert("Erro ao apagar a sessão.");
    } else {
      setSessoes((sessoes) =>
        sessoes.filter((s) => s.id !== sessaoEmEdicao.id)
      );
      handleFecharDeleteModal();
    }
  }, [sessaoEmEdicao, handleFecharDeleteModal]);

  // Função para a mudança rápida de status com o dropdown
  const handleTrocarStatus = useCallback(
    async (sessaoParaAtualizar: Sessao, novoStatus: string) => {
      const { data: sessaoAtualizada, error } = await supabase
        .from("sessoes")
        .update({ status: novoStatus })
        .eq("id", sessaoParaAtualizar.id)
        .select()
        .single();
      if (error) {
        alert("Erro ao atualizar status.");
      } else if (sessaoAtualizada) {
        setSessoes((sessoes) =>
          sessoes.map((s) =>
            s.id === sessaoAtualizada.id ? sessaoAtualizada : s
          )
        );
      }
    },
    []
  );

  if (loading)
    return (
      <div>
        <h1 className="text-3xl font-bold text-white">Carregando...</h1>
      </div>
    );
  if (!paciente && !loading)
    return (
      <div>
        <h1 className="text-3xl font-bold text-white">
          Paciente não encontrado ou ID inválido.
        </h1>
      </div>
    );

  return (
    <div>
      <div className="mb-8">
        <Link href="/pacientes" className="text-blue-400 hover:underline">
          &larr; Voltar para todos os pacientes
        </Link>
        <h1 className="text-4xl font-bold mt-2 text-white">{paciente?.nome}</h1>
        <p className="text-lg text-gray-400">{paciente?.telefone}</p>
      </div>

      <div className="mb-8 p-6 bg-gray-900 border border-gray-700 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 text-white">
          Adicionar Nova Sessão
        </h2>
        <form onSubmit={handleAdicionarSessao} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="data"
                className="block mb-1 font-medium text-gray-300"
              >
                Data:
              </label>
              <input
                type="date"
                id="data"
                value={novaSessaoData}
                onChange={(e) => setNovaSessaoData(e.target.value)}
                className="w-full p-2 border rounded bg-gray-800 border-gray-600 text-white"
                required
              />
            </div>
            <div>
              <label
                htmlFor="valor"
                className="block mb-1 font-medium text-gray-300"
              >
                Valor (R$):
              </label>
              <input
                type="number"
                step="0.01"
                id="valor"
                value={novaSessaoValor}
                onChange={(e) => setNovaSessaoValor(e.target.value)}
                placeholder="220.00"
                className="w-full p-2 border rounded bg-gray-800 border-gray-600 text-white"
                required
              />
            </div>
            <div>
              <label
                htmlFor="tipo"
                className="block mb-1 font-medium text-gray-300"
              >
                Tipo:
              </label>
              <select
                id="tipo"
                value={novaSessaoTipo}
                onChange={(e) => setNovaSessaoTipo(e.target.value)}
                className="w-full p-2 border rounded bg-gray-800 border-gray-600 text-white"
              >
                <option>Presencial</option>
                <option>Online</option>
                <option>Aula</option>
              </select>
            </div>
          </div>
          <div>
            <label
              htmlFor="nota"
              className="block mb-1 font-medium text-gray-300"
            >
              Anotações:
            </label>
            <textarea
              id="nota"
              value={novaSessaoNota}
              onChange={(e) => setNovaSessaoNota(e.target.value)}
              rows={2}
              placeholder="Adicione uma nota sobre a sessão..."
              className="w-full p-2 border rounded bg-gray-800 border-gray-600 text-white"
            ></textarea>
          </div>
          <div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              Adicionar Sessão
            </button>
          </div>
        </form>
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-white">
        Histórico de Sessões
      </h2>
      <div className="overflow-x-auto bg-gray-900 border border-gray-700 rounded-lg">
        <table className="min-w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="py-3 px-4 text-left text-gray-300 font-semibold">
                Data
              </th>
              <th className="py-3 px-4 text-left text-gray-300 font-semibold">
                Tipo
              </th>
              <th className="py-3 px-4 text-left text-gray-300 font-semibold">
                Valor
              </th>
              <th className="py-3 px-4 text-left text-gray-300 font-semibold">
                Status
              </th>
              <th className="py-3 px-4 text-left text-gray-300 font-semibold">
                Nota
              </th>
              <th className="py-3 px-4 text-left text-gray-300 font-semibold">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {sessoes.map((sessao) => (
              <tr
                key={sessao.id}
                className="border-t border-gray-700 hover:bg-gray-800/50"
              >
                <td className="py-3 px-4">
                  {new Date(sessao.data + "T00:00:00").toLocaleDateString(
                    "pt-BR"
                  )}
                </td>
                <td className="py-3 px-4">{sessao.tipo}</td>
                <td className="py-3 px-4">
                  R$ {sessao.valor.toFixed(2).replace(".", ",")}
                </td>
                <td className="py-3 px-4">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button
                        className="flex items-center outline-none rounded-full"
                        title="Clique para alterar o status"
                      >
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                            sessao.status === "Paga"
                              ? "bg-green-900 text-green-200"
                              : sessao.status === "Cancelado"
                              ? "bg-red-900 text-red-200"
                              : "bg-yellow-900 text-yellow-200"
                          }`}
                        >
                          {sessao.status}
                        </span>
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        className="min-w-[140px] bg-gray-700 rounded-md p-1 shadow-lg z-20"
                        sideOffset={5}
                      >
                        {["Pendente", "Paga", "Cancelado"].map(
                          (statusOption) => (
                            <DropdownMenu.Item
                              key={statusOption}
                              className="text-gray-200 text-sm rounded flex items-center p-2 select-none outline-none data-[highlighted]:bg-blue-600 data-[highlighted]:text-white cursor-pointer"
                              onSelect={() =>
                                handleTrocarStatus(sessao, statusOption)
                              }
                            >
                              {statusOption}
                            </DropdownMenu.Item>
                          )
                        )}
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </td>
                <td className="py-3 px-4 text-sm text-gray-400">
                  {sessao.nota}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleAbrirModalEdicao(sessao)}
                      className="text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleAbrirDeleteModal(sessao)}
                      className="text-red-500 hover:text-red-400 font-semibold"
                    >
                      Apagar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditModalOpen && sessaoEmEdicao && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 p-8 rounded-lg shadow-2xl w-full max-w-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-white">
              Editar Sessão
            </h2>
            <form onSubmit={handleSalvarEdicao} className="space-y-4">
              <div>
                <label
                  htmlFor="edit-data"
                  className="block mb-1 text-sm font-medium text-gray-300"
                >
                  Data
                </label>
                <input
                  type="date"
                  id="edit-data"
                  value={sessaoEmEdicao.data}
                  onChange={(e) =>
                    setSessaoEmEdicao({
                      ...sessaoEmEdicao,
                      data: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-tipo"
                  className="block mb-1 text-sm font-medium text-gray-300"
                >
                  Tipo
                </label>
                <select
                  id="edit-tipo"
                  value={sessaoEmEdicao.tipo}
                  onChange={(e) =>
                    setSessaoEmEdicao({
                      ...sessaoEmEdicao,
                      tipo: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded bg-gray-800 border-gray-600 text-white"
                >
                  <option>Presencial</option>
                  <option>Online</option>
                  <option>Aula</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="edit-valor"
                  className="block mb-1 text-sm font-medium text-gray-300"
                >
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="edit-valor"
                  value={sessaoEmEdicao.valor}
                  onChange={(e) =>
                    setSessaoEmEdicao({
                      ...sessaoEmEdicao,
                      valor: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2 border rounded bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-status"
                  className="block mb-1 text-sm font-medium text-gray-300"
                >
                  Status
                </label>
                <select
                  id="edit-status"
                  value={sessaoEmEdicao.status}
                  onChange={(e) =>
                    setSessaoEmEdicao({
                      ...sessaoEmEdicao,
                      status: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded bg-gray-800 border-gray-600 text-white"
                >
                  <option>Pendente</option>
                  <option>Paga</option>
                  <option>Cancelado</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="edit-nota"
                  className="block mb-1 text-sm font-medium text-gray-300"
                >
                  Anotações
                </label>
                <textarea
                  id="edit-nota"
                  value={sessaoEmEdicao.nota || ""}
                  onChange={(e) =>
                    setSessaoEmEdicao({
                      ...sessaoEmEdicao,
                      nota: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full p-2 border rounded bg-gray-800 border-gray-600 text-white"
                ></textarea>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleFecharModalEdicao}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && sessaoEmEdicao && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 p-8 rounded-lg shadow-2xl w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-white">
              Confirmar Exclusão
            </h3>
            <p className="text-gray-400 mb-6">
              Tem certeza que deseja apagar a sessão do dia{" "}
              <span className="font-bold">
                {new Date(sessaoEmEdicao.data + "T00:00:00").toLocaleDateString(
                  "pt-BR"
                )}
              </span>
              ?<br />
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleFecharDeleteModal}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApagarSessao}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700"
              >
                Sim, Apagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
