import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock, ShieldCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Nivel, NIVEL_LABELS, NIVEL_COLORS } from "@/hooks/useAdminNivel";

type Request = {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  celular: string;
  cargo: string | null;
  status: "pendente" | "aprovado" | "rejeitado";
  nivel: Nivel;
  created_at: string;
};

const NIVEIS: Nivel[] = ["super_admin", "gestor", "operacional", "visualizador"];

export default function UsuariosAdmin() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  // nivel selecionado por request (antes de aprovar)
  const [nivelSelecionado, setNivelSelecionado] = useState<Record<string, Nivel>>({});

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_requests")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setRequests((data ?? []) as Request[]);
  };

  useEffect(() => { load(); }, []);

  const nivelParaAprovar = (id: string): Nivel =>
    nivelSelecionado[id] ?? "operacional";

  const approve = async (r: Request, nivel?: Nivel) => {
    const nivelFinal = nivel ?? nivelParaAprovar(r.id);
    setActing(r.id);
    try {
      // Concede role admin com nivel
      const { error: roleErr } = await supabase
        .from("user_roles")
        .upsert({ user_id: r.user_id, role: "admin", nivel: nivelFinal });
      if (roleErr) throw roleErr;

      // Atualiza status e nivel na solicitação
      const { error: updErr } = await supabase
        .from("admin_requests")
        .update({ status: "aprovado", nivel: nivelFinal })
        .eq("id", r.id);
      if (updErr) throw updErr;

      toast.success(`${r.nome} aprovado como ${NIVEL_LABELS[nivelFinal]}`);
      load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActing(null);
    }
  };

  const changeNivel = async (r: Request, novoNivel: Nivel) => {
    setActing(r.id);
    try {
      await supabase
        .from("user_roles")
        .update({ nivel: novoNivel })
        .eq("user_id", r.user_id)
        .eq("role", "admin");
      await supabase
        .from("admin_requests")
        .update({ nivel: novoNivel })
        .eq("id", r.id);
      toast.success(`Nível de ${r.nome} atualizado para ${NIVEL_LABELS[novoNivel]}`);
      load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActing(null);
    }
  };

  const reject = async (r: Request) => {
    if (!confirm(`Rejeitar acesso de ${r.nome}?`)) return;
    setActing(r.id);
    const { error } = await supabase
      .from("admin_requests")
      .update({ status: "rejeitado" })
      .eq("id", r.id);
    setActing(null);
    if (error) toast.error(error.message);
    else { toast.success("Solicitação rejeitada"); load(); }
  };

  const revoke = async (r: Request) => {
    if (!confirm(`Revogar acesso admin de ${r.nome}?`)) return;
    setActing(r.id);
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", r.user_id)
      .eq("role", "admin");
    if (error) { toast.error(error.message); setActing(null); return; }
    await supabase.from("admin_requests").update({ status: "rejeitado" }).eq("id", r.id);
    setActing(null);
    toast.success("Acesso revogado");
    load();
  };

  const pendentes  = requests.filter((r) => r.status === "pendente");
  const aprovados  = requests.filter((r) => r.status === "aprovado");
  const rejeitados = requests.filter((r) => r.status === "rejeitado");

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold">Usuários Admin</h1>

      {/* ── Pendentes ── */}
      {pendentes.length > 0 && (
        <Card className="border-brand-yellow border-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-brand-yellow" />
              Solicitações pendentes
              <Badge className="bg-brand-yellow text-brand-blue ml-1">{pendentes.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3">Nome</th>
                    <th className="text-left p-3">E-mail</th>
                    <th className="text-left p-3">Celular</th>
                    <th className="text-left p-3">Nível de acesso</th>
                    <th className="text-left p-3">Solicitado em</th>
                    <th className="text-right p-3">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {pendentes.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="p-3 font-semibold">{r.nome}</td>
                      <td className="p-3">{r.email}</td>
                      <td className="p-3">{r.celular}</td>
                      <td className="p-3">
                        <Select
                          value={nivelSelecionado[r.id] ?? "operacional"}
                          onValueChange={(v) =>
                            setNivelSelecionado((prev) => ({ ...prev, [r.id]: v as Nivel }))
                          }
                        >
                          <SelectTrigger className="h-8 w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {NIVEIS.map((n) => (
                              <SelectItem key={n} value={n}>
                                {NIVEL_LABELS[n]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">{fmt(r.created_at)}</td>
                      <td className="p-3 text-right space-x-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={acting === r.id}
                          onClick={() => approve(r)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={acting === r.id}
                          onClick={() => reject(r)}
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Rejeitar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {pendentes.length === 0 && !loading && (
        <div className="text-sm text-muted-foreground bg-muted/30 rounded-xl px-4 py-3">
          Nenhuma solicitação pendente.
        </div>
      )}

      {/* ── Aprovados ── */}
      {aprovados.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              Com acesso liberado
              <Badge variant="secondary" className="ml-1">{aprovados.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3">Nome</th>
                    <th className="text-left p-3">E-mail</th>
                    <th className="text-left p-3">Celular</th>
                    <th className="text-left p-3">Nível atual</th>
                    <th className="text-left p-3">Aprovado em</th>
                    <th className="text-right p-3">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {aprovados.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="p-3 font-semibold">{r.nome}</td>
                      <td className="p-3">{r.email}</td>
                      <td className="p-3">{r.celular}</td>
                      <td className="p-3">
                        <Select
                          value={r.nivel ?? "operacional"}
                          onValueChange={(v) => changeNivel(r, v as Nivel)}
                          disabled={acting === r.id}
                        >
                          <SelectTrigger className="h-8 w-36">
                            <SelectValue>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${NIVEL_COLORS[r.nivel ?? "operacional"]}`}>
                                {NIVEL_LABELS[r.nivel ?? "operacional"]}
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {NIVEIS.map((n) => (
                              <SelectItem key={n} value={n}>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${NIVEL_COLORS[n]}`}>
                                  {NIVEL_LABELS[n]}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">{fmt(r.created_at)}</td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={acting === r.id}
                          onClick={() => revoke(r)}
                        >
                          Revogar acesso
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Rejeitados ── */}
      {rejeitados.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-muted-foreground">
              <XCircle className="h-5 w-5" />
              Solicitações rejeitadas
              <Badge variant="secondary" className="ml-1">{rejeitados.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3">Nome</th>
                    <th className="text-left p-3">E-mail</th>
                    <th className="text-left p-3">Celular</th>
                    <th className="text-left p-3">Data</th>
                    <th className="text-right p-3">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {rejeitados.map((r) => (
                    <tr key={r.id} className="border-t opacity-60">
                      <td className="p-3">{r.nome}</td>
                      <td className="p-3">{r.email}</td>
                      <td className="p-3">{r.celular}</td>
                      <td className="p-3 text-xs text-muted-foreground">{fmt(r.created_at)}</td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={acting === r.id}
                          onClick={() => approve(r, "operacional")}
                        >
                          Aprovar mesmo assim
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="text-center text-muted-foreground py-8">Carregando...</div>
      )}
    </div>
  );
}
