import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy } from "lucide-react";

type AdminUser = { id: string; email: string; created_at: string; is_admin: boolean };

export default function UsuariosAdmin() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("admin-users", { body: { action: "list" } });
    setLoading(false);
    if (error) return toast.error(error.message);
    setUsers(data.users ?? []);
  };

  useEffect(() => { load(); }, []);

  const promote = async (u: AdminUser) => {
    const { error } = await supabase.functions.invoke("admin-users", { body: { action: "promote", user_id: u.id } });
    if (error) toast.error(error.message);
    else { toast.success(`${u.email} promovido a admin`); load(); }
  };
  const demote = async (u: AdminUser) => {
    if (!confirm(`Remover acesso admin de ${u.email}?`)) return;
    const { error } = await supabase.functions.invoke("admin-users", { body: { action: "demote", user_id: u.id } });
    if (error) toast.error(error.message);
    else { toast.success("Acesso removido"); load(); }
  };

  const inviteLink = `${window.location.origin}/admin/auth`;
  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success("Link copiado");
  };

  const filtered = users.filter((u) => u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4 max-w-4xl">
      <h1 className="text-2xl font-bold">Usuários Admin</h1>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="text-sm text-muted-foreground">
            Para conceder acesso: envie o link de cadastro abaixo. Após o cadastro, promova o usuário a admin nesta tela.
          </div>
          <div className="flex gap-2">
            <Input value={inviteLink} readOnly className="font-mono text-xs" />
            <Button variant="outline" onClick={copyLink}><Copy className="h-4 w-4 mr-2" />Copiar</Button>
          </div>
        </CardContent>
      </Card>

      <Input placeholder="Buscar por email..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Cadastrado em</th>
                <th className="text-left p-3">Status</th>
                <th className="text-right p-3">Ação</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">Carregando...</td></tr>}
              {!loading && filtered.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{new Date(u.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${u.is_admin ? "bg-[hsl(38,92%,90%)] text-[hsl(214,50%,24%)]" : "bg-muted text-muted-foreground"}`}>
                      {u.is_admin ? "Admin" : "Usuário"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {u.is_admin ? (
                      <Button size="sm" variant="destructive" onClick={() => demote(u)}>Remover admin</Button>
                    ) : (
                      <Button size="sm" onClick={() => promote(u)}>Promover a admin</Button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">Nenhum usuário encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
