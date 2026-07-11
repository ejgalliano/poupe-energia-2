import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Building2, Star, MapPin, Users, LogOut,
  Handshake, Briefcase, Award, Gift, FlaskConical,
  MessageSquareWarning, Zap, Mail,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAdminNivel, canAccess, NIVEL_LABELS, NIVEL_COLORS, type Nivel } from "@/hooks/useAdminNivel";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type NavItem = {
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
  badge?: boolean;
  section: string; // chave usada para verificar permissão
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const groups: NavGroup[] = [
  {
    title: "Geral",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true, section: "dashboard" },
    ],
  },
  {
    title: "Ranking",
    items: [
      { to: "/admin/empresas",        label: "Empresas",           icon: Building2,   section: "empresas" },
      { to: "/admin/notas",           label: "Notas",              icon: Star,        section: "notas" },
      { to: "/admin/formula",         label: "Fórmula do Ranking", icon: FlaskConical,section: "formula" },
      { to: "/admin/distribuidoras",  label: "Distribuidoras",     icon: MapPin,      section: "distribuidoras" },
      { to: "/admin/intermediadoras", label: "Intermediadoras",    icon: Zap,         section: "intermediadoras" },
    ],
  },
  {
    title: "Comercial",
    items: [
      { to: "/admin/parceiros",           label: "Parceiros & Leads",  icon: Handshake, section: "parceiros" },
      { to: "/admin/leads-empresariais",  label: "Leads Empresariais", icon: Briefcase, section: "leads-empresariais" },
      { to: "/admin/embaixadores",        label: "Embaixadores",       icon: Award,     section: "embaixadores" },
      { to: "/admin/cashback",            label: "Adesões / Cashback", icon: Gift,      section: "cashback" },
    ],
  },
  {
    title: "Comunicação",
    items: [
      { to: "/admin/email-templates", label: "Templates de Email", icon: Mail,                  section: "email-templates" },
      { to: "/admin/contestacoes",    label: "Contestações",       icon: MessageSquareWarning,  section: "contestacoes", badge: true },
    ],
  },
  {
    title: "Sistema",
    items: [
      { to: "/admin/usuarios", label: "Usuários Admin", icon: Users, section: "usuarios" },
    ],
  },
];

export default function AdminLayout() {
  const { isAdmin, loading: authLoading, signOut, user } = useAdminAuth();
  const { nivel, loading: nivelLoading } = useAdminNivel();
  const navigate = useNavigate();
  const [contestacoesPendentes, setContestacoesPendentes] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const { count } = await supabase
        .from("contestacoes")
        .select("id", { count: "exact", head: true })
        .eq("status", "pendente");
      setContestacoesPendentes(count ?? 0);
    };
    fetch();
    const interval = setInterval(fetch, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/admin/auth", { replace: true });
    }
  }, [authLoading, isAdmin, user, navigate]);

  const loading = authLoading || nivelLoading;

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  // Filtra itens de acordo com o nível
  const visibleGroups = groups
    .map((g) => ({
      ...g,
      items: g.items.filter((it) => canAccess(nivel, it.section)),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen flex w-full bg-muted/20">
      <aside className="w-60 bg-[hsl(214,50%,24%)] text-white flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center justify-center bg-white">
          <img
            src="https://tvyjosqitdgwqjpzvgib.supabase.co/storage/v1/object/public/assets//logo poupe energia.jpeg"
            alt="Poupe Energia"
            className="h-8 w-auto object-contain"
          />
        </div>

        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {visibleGroups.map((group) => (
            <div key={group.title}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 px-3 mb-1">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((it) => (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    end={it.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive
                          ? "bg-[hsl(38,92%,50%)] text-[hsl(214,50%,24%)] font-semibold"
                          : "hover:bg-white/10"
                      }`
                    }
                  >
                    <it.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{it.label}</span>
                    {it.badge && contestacoesPendentes > 0 && (
                      <span className="bg-orange-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none">
                        {contestacoesPendentes}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-2">
          <div className="px-2 space-y-0.5">
            <div className="text-xs text-white/60 truncate">{user?.email}</div>
            <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${NIVEL_COLORS[nivel as Nivel]}`}>
              {NIVEL_LABELS[nivel as Nivel]}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-white hover:bg-white/10 hover:text-white"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
