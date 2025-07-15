// lib/types.ts
export interface Paciente {
  id: number;
  created_at: string;
  nome: string;
  telefone: string | null;
  sessoes_iniciais: number;
  user_id: string;
}

export interface Sessao {
  id: number;
  data: string;
  tipo: string;
  valor: number;
  status: string;
  paciente_id: number;
  nota: string | null;
  user_id: string;
}
