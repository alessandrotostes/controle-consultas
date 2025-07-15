// utils/supabase/server.ts

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// A função agora é 'async' para permitir o uso de 'await'
export async function createClient() {
  // Usamos 'await' para esperar que os cookies sejam carregados
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Este erro pode ser ignorado se você tiver um middleware
            // atualizando a sessão do usuário.
            // Para resolver o aviso do ESLint, podemos usar a variável ou prefixá-la:
            console.error("Failed to set cookie:", error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Este erro pode ser ignorado se você tiver um middleware
            // atualizando a sessão do usuário.
            console.error("Failed to remove cookie:", error);
          }
        },
      },
    }
  );
}
