import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Nivel = "super_admin" | "gestor" | "operacional" | "visualizador";

export const NIVEL_LABELS: Record<Nivel, string> = {
  super_admin: "Super Admin",
  gestor: "Gestor",
  operacional: "Operacional",
  visualizador: "Visualizador",
};

export const NIVEL_COLORS: Record<Nivel, string> = {
  super_admin: "bg-purple-100 text-purple-800",
  gestor: "bg-blue-100 text-blue-700",
  operacional: "bg-green-100 text-green-700",
  visualizador: "bg-gray-100 text-gray-500",
};

// Seções que cada nível pode acessar. '*' = tudo.
export const NIVEL_ACCESS: Record<Nivel, string[]> = {
  super_admin: ["*"],
  gestor: [
    "dashboard",
    "parceiros",
    "leads-empresariais",
    "embaixadores",
    "cashback",
    "email-templates",
    "contestacoes",
    "analises-fatura",
  ],
  operacional: ["dashboard", "cashback", "contestacoes"],
  visualizador: ["dashboard"],
};

export function canAccess(nivel: Nivel, section: string): boolean {
  const allowed = NIVEL_ACCESS[nivel];
  return allowed.includes("*") || allowed.includes(section);
}

export function useAdminNivel() {
  // Começa como super_admin para evitar flash de menu colapsado
  const [nivel, setNivel] = useState<Nivel>("super_admin");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { setLoading(false); return; }
      supabase
        .from("user_roles")
        .select("nivel")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle()
        .then(({ data: roleData }) => {
          if (roleData?.nivel) setNivel(roleData.nivel as Nivel);
          setLoading(false);
        });
    });
  }, []);

  return { nivel, loading };
}
