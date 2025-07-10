"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabaseClient";

interface Paciente {
  id: number;
  created_at: string;
  nome: string;
  telefone: string | null;
}

export default function PaginaPacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [novoPacienteNome, setNovoPacienteNome] = useState<string>("");
  const [novoPacienteTelefone, setNovoPacienteTelefone] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPacientes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("pacientes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Erro ao buscar pacientes:", error);
      } else {
        setPacientes(data as Paciente[]);
      }
      setLoading(false);
    };
    fetchPacientes();
  }, []);

  const handleAdicionarPaciente = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const { data, error } = await supabase
        .from("pacientes")
        .insert([{ nome: novoPacienteNome, telefone: novoPacienteTelefone }])
        .select();
      if (error) {
        alert("Ocorreu um erro ao adicionar o paciente.");
      } else if (data) {
        setPacientes((pacientes) => [data[0] as Paciente, ...pacientes]);
        setNovoPacienteNome("");
        setNovoPacienteTelefone("");
      }
    },
    [novoPacienteNome, novoPacienteTelefone]
  );

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
            Adicionar Paciente
          </button>
        </form>
      </div>
      <div className="space-y-3">
        {pacientes.map((paciente) => (
          <div
            key={paciente.id}
            className="flex justify-between items-center p-4 border rounded-lg shadow-sm bg-gray-900 border-gray-700"
          >
            <div>
              <p className="font-bold text-white">{paciente.nome}</p>
              <p className="text-sm text-gray-400">{paciente.telefone}</p>
            </div>
            <Link
              href={`/pacientes/${paciente.id}`}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 font-semibold"
            >
              Ver Sessões
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
