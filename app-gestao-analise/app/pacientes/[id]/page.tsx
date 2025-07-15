"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabaseClient";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  ArrowLeftIcon,
  PencilIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

// Interfaces
interface Paciente {
  id: number;
  nome: string;
  telefone: string | null;
  sessoes_iniciais: number;
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

// A CORREÇÃO: Definimos o tipo diretamente aqui
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
  const [isPacienteModalOpen, setIsPacienteModalOpen] =
    useState<boolean>(false);
  const [pacienteFormData, setPacienteFormData] = useState<{
    nome: string;
    telefone: string | null;
    sessoes_iniciais: number;
  }>({ nome: "", telefone: "", sessoes_iniciais: 0 });
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
  const handleFecharPacienteModal = useCallback(() => {
    setIsPacienteModalOpen(false);
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
      setPaciente(pacienteData as Paciente);
      const { data: sessoesData } = await supabase
        .from("sessoes")
        .select("*")
        .eq("paciente_id", idDoPaciente)
        .order("data", { ascending: false });
      setSessoes((sessoesData as Sessao[]) || []);
      setLoading(false);
    };
    fetchData();
  }, [params]);

  const handleAdicionarSessao = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Sessão expirada. Faça o login novamente.");
        return;
      }
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
            user_id: user.id,
          },
        ])
        .select()
        .single();
      if (error) {
        toast.error("Ocorreu um erro ao adicionar a sessão.");
      } else if (novaSessao) {
        setSessoes((sessoes) => [novaSessao, ...sessoes]);
        setNovaSessaoData("");
        setNovaSessaoValor("");
        setNovaSessaoNota("");
        setNovaSessaoTipo("Presencial");
        toast.success("Sessão adicionada com sucesso!");
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
        toast.error("Erro ao salvar alterações.");
      } else if (sessaoAtualizada) {
        setSessoes((sessoes) =>
          sessoes.map((s) =>
            s.id === sessaoAtualizada.id ? sessaoAtualizada : s
          )
        );
        handleFecharModalEdicao();
        toast.success("Sessão atualizada!");
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
      toast.error("Erro ao apagar a sessão.");
    } else {
      setSessoes((sessoes) =>
        sessoes.filter((s) => s.id !== sessaoEmEdicao.id)
      );
      handleFecharDeleteModal();
      toast.success("Sessão apagada.");
    }
  }, [sessaoEmEdicao, handleFecharDeleteModal]);

  const handleTrocarStatus = useCallback(
    async (sessaoParaAtualizar: Sessao, novoStatus: string) => {
      const { data: sessaoAtualizada, error } = await supabase
        .from("sessoes")
        .update({ status: novoStatus })
        .eq("id", sessaoParaAtualizar.id)
        .select()
        .single();
      if (error) {
        toast.error("Erro ao atualizar status.");
      } else if (sessaoAtualizada) {
        setSessoes((sessoes) =>
          sessoes.map((s) =>
            s.id === sessaoAtualizada.id ? sessaoAtualizada : s
          )
        );
        toast.success(`Status alterado para ${novoStatus}!`);
      }
    },
    []
  );

  const handleAbrirPacienteModal = useCallback(() => {
    if (paciente) {
      setPacienteFormData({
        nome: paciente.nome,
        telefone: paciente.telefone,
        sessoes_iniciais: paciente.sessoes_iniciais || 0,
      });
      setIsPacienteModalOpen(true);
    }
  }, [paciente]);

  const handleSalvarPaciente = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!paciente) return;
      const { data: pacienteAtualizado, error } = await supabase
        .from("pacientes")
        .update({
          nome: pacienteFormData.nome,
          telefone: pacienteFormData.telefone,
          sessoes_iniciais: pacienteFormData.sessoes_iniciais,
        })
        .eq("id", paciente.id)
        .select()
        .single();
      if (error) {
        toast.error("Erro ao atualizar dados do paciente.");
      } else if (pacienteAtualizado) {
        setPaciente(pacienteAtualizado as Paciente);
        toast.success("Paciente atualizado com sucesso!");
        handleFecharPacienteModal();
      }
    },
    [paciente, pacienteFormData, handleFecharPacienteModal]
  );

  if (loading)
    return (
      <div>
        <h1 className="text-3xl font-bold text-white">Carregando...</h1>
      </div>
    );
  if (!paciente)
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
        <Link
          href="/pacientes"
          className="flex items-center gap-2 text-blue-400 hover:underline mb-4 w-fit"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Voltar
        </Link>
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {paciente?.nome}
              </h1>
              <button
                onClick={handleAbrirPacienteModal}
                className="text-gray-400 hover:text-white mt-1"
                title="Editar Paciente"
              >
                <PencilIcon className="h-5 md:h-6 w-5 md:w-6" />
              </button>
            </div>
            <p className="text-base md:text-lg text-gray-400 mt-1">
              {paciente?.telefone}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-700 p-3 md:p-4 rounded-lg text-center flex-shrink-0">
            <h3 className="text-xs md:text-sm font-semibold text-gray-400">
              Total Sessões
            </h3>
            <p className="text-2xl md:text-3xl font-bold text-white">
              {(paciente.sessoes_iniciais || 0) +
                sessoes.filter((s) => s.status !== "Cancelado").length}
            </p>
          </div>
        </div>
      </div>
      <div className="my-8 p-6 bg-gray-900 border border-gray-700 rounded-lg">
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
                        <div className="flex flex-col gap-1">
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
                        </div>
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
                      className="text-blue-400 hover:text-blue-300"
                      title="Editar Sessão"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleAbrirDeleteModal(sessao)}
                      className="text-red-500 hover:text-red-400"
                      title="Apagar Sessão"
                    >
                      <TrashIcon className="h-5 w-5" />
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
      {isPacienteModalOpen && paciente && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 p-8 rounded-lg shadow-2xl w-full max-w-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-white">
              Editar Paciente
            </h2>
            <form onSubmit={handleSalvarPaciente} className="space-y-4">
              <div>
                <label
                  htmlFor="edit-paciente-nome"
                  className="block mb-1 text-sm font-medium text-gray-300"
                >
                  Nome
                </label>
                <input
                  type="text"
                  id="edit-paciente-nome"
                  value={pacienteFormData.nome}
                  onChange={(e) =>
                    setPacienteFormData({
                      ...pacienteFormData,
                      nome: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-paciente-telefone"
                  className="block mb-1 text-sm font-medium text-gray-300"
                >
                  Telefone
                </label>
                <input
                  type="text"
                  id="edit-paciente-telefone"
                  value={pacienteFormData.telefone || ""}
                  onChange={(e) =>
                    setPacienteFormData({
                      ...pacienteFormData,
                      telefone: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-paciente-sessoes"
                  className="block mb-1 text-sm font-medium text-gray-300"
                >
                  Sessões Anteriores
                </label>
                <input
                  type="number"
                  id="edit-paciente-sessoes"
                  value={pacienteFormData.sessoes_iniciais}
                  onChange={(e) =>
                    setPacienteFormData({
                      ...pacienteFormData,
                      sessoes_iniciais: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2 border rounded bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleFecharPacienteModal}
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
    </div>
  );
}
