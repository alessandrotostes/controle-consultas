// app/pacientes/[id]/page.tsx

import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { PacienteDetalheCliente } from "@/components/PacienteDetalheCliente";
import type { Paciente, Sessao } from "@/lib/types";
import type { Metadata } from "next";

// REMOVIDO: O 'type Props' foi removido para evitar conflito com os tipos internos do Next.js.

// CORREÇÃO: A tipagem é definida diretamente na assinatura da função.
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const supabase = await createClient();
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return { title: "ID Inválido" };
  }

  const { data: paciente } = await supabase
    .from("pacientes")
    .select("nome")
    .eq("id", id)
    .single();

  const title = paciente
    ? `Detalhes de ${paciente.nome}`
    : "Paciente não encontrado";

  return {
    title: title,
    description: "Visualização detalhada do paciente e suas sessões.",
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

// CORREÇÃO: A tipagem também é definida diretamente aqui.
export default async function PaginaPaciente({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white">
          ID de paciente inválido.
        </h1>
        <Link
          href="/pacientes"
          className="text-blue-400 hover:underline mt-4 inline-block"
        >
          &larr; Voltar para a lista de pacientes
        </Link>
      </div>
    );
  }

  const { data: paciente, error: pacienteError } = await supabase
    .from("pacientes")
    .select("*")
    .eq("id", id)
    .single();

  const { data: sessoes, error: sessoesError } = await supabase
    .from("sessoes")
    .select("*")
    .eq("paciente_id", id)
    .order("data", { ascending: false });

  if (pacienteError || !paciente) {
    console.error("Erro ao buscar paciente:", pacienteError);
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white">
          Paciente não encontrado.
        </h1>
        <Link
          href="/pacientes"
          className="text-blue-400 hover:underline mt-4 inline-block"
        >
          &larr; Voltar
        </Link>
      </div>
    );
  }

  if (sessoesError) {
    console.error("Erro ao buscar sessões:", sessoesError);
  }

  return (
    <PacienteDetalheCliente
      pacienteInicial={paciente as Paciente}
      sessoesIniciais={(sessoes as Sessao[]) || []}
    />
  );
}
