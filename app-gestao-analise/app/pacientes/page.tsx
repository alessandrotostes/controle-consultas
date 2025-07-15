"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
// CORREÇÃO: Importa a FUNÇÃO createClient do caminho correto
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { TrashIcon } from "@heroicons/react/24/outline";

// Interface
interface Paciente {
  id: number;
  created_at: string;
  nome: string;
  telefone: string | null;
  status: string;
}

export default function PaginaPacientes() {
  // Cria a instância do cliente Supabase aqui
  const supabase = createClient();

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [novoPacienteNome, setNovoPacienteNome] = useState<string>("");
  const [novoPacienteTelefone, setNovoPacienteTelefone] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pacienteParaApagar, setPacienteParaApagar] = useState<Paciente | null>(
    null
  );

  const fetchPacientes = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("pacientes")
        .select("*")
        .eq("user_id", user.id)
        .order("status", { ascending: true })
        .order("nome", { ascending: true });

      if (error) {
        toast.error("Não foi possível carregar os pacientes.");
      } else {
        setPacientes(data || []);
      }
    }
    setLoading(false);
  }, [supabase]); // Adicionamos supabase como dependência

  useEffect(() => {
    fetchPacientes();
  }, [fetchPacientes]);

  const handleAdicionarPaciente = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado para adicionar um paciente.");
        return;
      }
      const { data, error } = await supabase
        .from("pacientes")
        .insert([
          {
            nome: novoPacienteNome,
            telefone: novoPacienteTelefone,
            user_id: user.id,
            status: "Ativo",
          },
        ])
        .select()
        .single();

      if (error) {
        toast.error("Ocorreu um erro ao adicionar o paciente.");
      } else if (data) {
        const novaLista = [...pacientes, data].sort((a, b) => {
          if (a.status === b.status) return a.nome.localeCompare(b.nome);
          return a.status === "Ativo" ? -1 : 1;
        });
        setPacientes(novaLista);
        setNovoPacienteNome("");
        setNovoPacienteTelefone("");
        toast.success("Paciente adicionado com sucesso!");
      }
    },
    [novoPacienteNome, novoPacienteTelefone, pacientes, supabase]
  );

  const handleToggleStatus = useCallback(
    async (paciente: Paciente) => {
      const novoStatus = paciente.status === "Ativo" ? "Inativo" : "Ativo";
      const { data: pacienteAtualizado, error } = await supabase
        .from("pacientes")
        .update({ status: novoStatus })
        .eq("id", paciente.id)
        .select()
        .single();

      if (error) {
        toast.error("Erro ao alterar o status.");
      } else if (pacienteAtualizado) {
        const novaLista = pacientes
          .map((p) => (p.id === pacienteAtualizado.id ? pacienteAtualizado : p))
          .sort((a, b) => {
            if (a.status === b.status) return a.nome.localeCompare(b.nome);
            return a.status === "Ativo" ? -1 : 1;
          });
        setPacientes(novaLista);
        toast.success(
          `Status de ${paciente.nome} alterado para ${novoStatus}!`
        );
      }
    },
    [pacientes, supabase]
  );

  const handleAbrirDeleteModal = useCallback((paciente: Paciente) => {
    setPacienteParaApagar(paciente);
    setIsDeleteModalOpen(true);
  }, []);

  const handleFecharDeleteModal = useCallback(() => {
    setPacienteParaApagar(null);
    setIsDeleteModalOpen(false);
  }, []);

  const handleApagarPaciente = useCallback(async () => {
    if (!pacienteParaApagar) return;
    const { error: sessoesError } = await supabase
      .from("sessoes")
      .delete()
      .eq("paciente_id", pacienteParaApagar.id);
    if (sessoesError) {
      toast.error("Erro ao apagar as sessões do paciente.");
      return;
    }
    const { error: pacienteError } = await supabase
      .from("pacientes")
      .delete()
      .eq("id", pacienteParaApagar.id);
    if (pacienteError) {
      toast.error("Erro ao apagar o paciente.");
    } else {
      setPacientes((prev) =>
        prev.filter((p) => p.id !== pacienteParaApagar.id)
      );
      toast.success(
        `Paciente "${pacienteParaApagar.nome}" e todas as suas sessões foram apagados.`
      );
      handleFecharDeleteModal();
    }
  }, [pacienteParaApagar, handleFecharDeleteModal, supabase]);

  if (loading)
    return (
      <div>
        <h1 className="text-3xl font-bold text-white">
          Carregando pacientes...
        </h1>
      </div>
    );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-white">Meus Pacientes</h1>
      <div className="mb-8 p-6 bg-gray-900 border border-gray-700 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Adicionar Novo Paciente</h2>
        <form onSubmit={handleAdicionarPaciente} className="space-y-4">
          <div>
            <label htmlFor="nome" className="block mb-1">
              Nome:
            </label>
            <input
              id="nome"
              type="text"
              value={novoPacienteNome}
              onChange={(e) => setNovoPacienteNome(e.target.value)}
              className="w-full p-2 border rounded bg-gray-800 border-gray-600 text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="telefone" className="block mb-1">
              Telefone:
            </label>
            <input
              id="telefone"
              type="text"
              value={novoPacienteTelefone}
              onChange={(e) => setNovoPacienteTelefone(e.target.value)}
              className="w-full p-2 border rounded bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            Adicionar
          </button>
        </form>
      </div>
      <div className="space-y-3">
        {pacientes.map((paciente) => (
          <div
            key={paciente.id}
            className={`flex justify-between items-center p-4 border rounded-lg shadow-sm bg-gray-900 transition-opacity ${
              paciente.status === "Ativo"
                ? "border-gray-700"
                : "border-gray-800 opacity-60"
            }`}
          >
            <div className="flex items-center gap-4">
              <span
                className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                  paciente.status === "Ativo"
                    ? "bg-green-500/20 text-green-300"
                    : "bg-gray-500/20 text-gray-400"
                }`}
              >
                {paciente.status}
              </span>
              <div>
                <p className="font-bold text-white">{paciente.nome}</p>
                <p className="text-sm text-gray-400">{paciente.telefone}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleToggleStatus(paciente)}
                className="text-sm text-gray-400 hover:text-white hover:underline"
                title={
                  paciente.status === "Ativo"
                    ? "Marcar como inativo"
                    : "Marcar como ativo"
                }
              >
                {paciente.status === "Ativo" ? "Inativar" : "Ativar"}
              </button>
              <Link
                href={`/pacientes/${paciente.id}`}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-semibold text-sm"
              >
                Ver Sessões
              </Link>
              <button
                onClick={() => handleAbrirDeleteModal(paciente)}
                className="p-2 text-gray-500 hover:text-red-500"
                title="Apagar Paciente"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isDeleteModalOpen && pacienteParaApagar && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 p-8 rounded-lg shadow-2xl w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-white">
              Confirmar Exclusão
            </h3>
            <p className="text-gray-400 mb-6">
              Tem certeza que deseja apagar o paciente{" "}
              <span className="font-bold text-white">
                {pacienteParaApagar.nome}
              </span>
              ?<br />
              <strong className="text-red-400">Atenção:</strong> Todas as
              sessões associadas a este paciente também serão permanentemente
              apagadas.
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
                onClick={handleApagarPaciente}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700"
              >
                Sim, Apagar Tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
