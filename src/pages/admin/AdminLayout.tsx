import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Building2, Star, MapPin, Users, LogOut, Handshake, Briefcase } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/empresas", label: "Empresas", icon: Building2 },
  { to: "/admin/notas", label: "Notas", icon: Star },
  { to: "/admin/distribuidoras", label: "Distribuidoras", icon: MapPin },
  { to: "/admin/parceiros", label: "Parceiros & Leads", icon: Handshake },
  { to: "/admin/leads-empresariais", label: "Leads Empresariais", icon: Briefcase },
  { to: "/admin/usuarios", label: "Usuários Admin", icon: Users },
];

export default function AdminLayout() {
  const { isAdmin, loading, signOut, user } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin/auth", { replace: true });
    }
  }, [loading, isAdmin, user, navigate]);

  if (loading || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;
  }

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
        <nav className="flex-1 p-3 space-y-1">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive ? "bg-[hsl(38,92%,50%)] text-[hsl(214,50%,24%)] font-semibold" : "hover:bg-white/10"
                }`
              }
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-2">
          <div className="text-xs text-white/60 px-2 truncate">{user?.email}</div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-white hover:bg-white/10 hover:text-white" onClick={signOut}>
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
