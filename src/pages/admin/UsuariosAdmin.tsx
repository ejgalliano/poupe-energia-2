import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function UsuariosAdmin() {
  const [admins, setAdmins] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase.from("user_roles").select("*").eq("role", "admin");
    setAdmins(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("Remover acesso admin?")) return;
    const { error } = await supabase.from("user_roles").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Removido"); load(); }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">Usuários Admin</h1>
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Para conceder acesso: peça que a pessoa se cadastre em <code className="bg-muted px-1 rounded">/admin/auth</code>, copie o ID dela e use a opção abaixo (em breve via convite por email).
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr><th className="text-left p-3">User ID</th><th className="text-left p-3">Desde</th><th className="text-right p-3">Ação</th></tr></thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="p-3 font-mono text-xs">{a.user_id}</td>
                  <td className="p-3">{new Date(a.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="destructive" onClick={() => remove(a.id)}>Remover</Button>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-muted-foreground">Nenhum admin cadastrado.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
