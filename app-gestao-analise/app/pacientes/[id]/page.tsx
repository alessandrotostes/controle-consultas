// app/pacientes/[id]/page.tsx

import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { PacienteDetalheCliente } from "@/components/PacienteDetalheCliente";
import type { Paciente, Sessao } from "@/lib/types";

type PageProps = {
  params: { id: string };
};

export default async function PaginaPaciente({ params }: PageProps) {
  const supabase = createClient();
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return (
      <div className="p-8 text-white">
        <h1 className="text-2xl">ID de paciente inválido.</h1>
        <Link
          href="/pacientes"
          className="text-blue-400 hover:underline mt-4 inline-block"
        >
          &larr; Voltar
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
      <div className="p-8 text-white">
        <h1 className="text-2xl">Paciente não encontrado.</h1>
        <Link
          href="/pacientes"
          className="text-blue-400 hover:underline mt-4 inline-block"
        >
          &larr; Voltar
        </Link>
      </div>
    );
  }

  return (
    <PacienteDetalheCliente
      pacienteInicial={paciente as Paciente}
      sessoesIniciais={(sessoes as Sessao[]) || []}
    />
  );
}
