// app/pacientes/[id]/page.tsx

// Importações para o Componente de Servidor
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { PacienteDetalheCliente } from "@/components/PacienteDetalheCliente";
import type { Paciente, Sessao } from "@/lib/types";

// Tipo para as propriedades que o Next.js passa para a página
type PageProps = {
  params: { id: string };
};

// A PÁGINA AGORA É UM COMPONENTE DE SERVIDOR ASSÍNCRONO
export default async function PaginaPaciente({ params }: PageProps) {
  const supabase = createClient();
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
          &larr; Voltar
        </Link>
      </div>
    );
  }

  // Busca os dados iniciais diretamente no servidor, de forma segura
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

  // Renderiza o Componente de Cliente, passando os dados JÁ BUSCADOS como propriedades
  return (
    <PacienteDetalheCliente
      pacienteInicial={paciente as Paciente}
      sessoesIniciais={(sessoes as Sessao[]) || []}
    />
  );
}
