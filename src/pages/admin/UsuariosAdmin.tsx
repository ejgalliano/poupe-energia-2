import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  CheckCircle2, XCircle, Clock, ShieldCheck,
  ChevronRight, KeyRound, ShieldOff, User, Eye, EyeOff,
} from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
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

const NIVEL_DESC: Record<Nivel, string> = {
  super_admin: "Acesso total a todas as funcionalidades",
  gestor: "Comercial, comunicação e adesões",
  operacional: "Adesões e contestações apenas",
  visualizador: "Somente visualização do dashboard",
};

const ToggleBtn = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
  <button
    type="button"
    onClick={onToggle}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
  >
    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </button>
);

// ── Troca de senha para o PRÓPRIO usuário logado (precisa da senha atual) ──
function OwnPasswordForm() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAtual, setShowAtual] = useState(false);
  const [showNova, setShowNova] = useState(false);

  const senhasCoincide = novaSenha.length > 0 && confirmar === novaSenha;
  const senhaForte = novaSenha.length >= 8;
  const podeEnviar = senhaAtual && senhasCoincide && senhaForte;

  const handleSubmit = async () => {
    if (!podeEnviar) return;
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.email) throw new Error("Usuário não encontrado");

      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: senhaAtual,
      });
      if (signInErr) { toast.error("Senha atual incorreta."); return; }

      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) throw error;

      toast.success("Senha alterada com sucesso!");
      setSenhaAtual(""); setNovaSenha(""); setConfirmar("");
    } catch (err: any) {
      toast.error("Erro: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">Senha atual</Label>
        <div className="relative">
          <Input type={showAtual ? "text" : "password"} value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)} placeholder="••••••••"
            className="pr-10 h-9" autoComplete="current-password" />
          <ToggleBtn show={showAtual} onToggle={() => setShowAtual(!showAtual)} />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Nova senha</Label>
        <div className="relative">
          <Input type={showNova ? "text" : "password"} value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)} placeholder="••••••••"
            className="pr-10 h-9" autoComplete="new-password" />
          <ToggleBtn show={showNova} onToggle={() => setShowNova(!showNova)} />
        </div>
        {novaSenha && !senhaForte && <p className="text-xs text-red-500">Mínimo 8 caracteres</p>}
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Confirmar nova senha</Label>
        <Input type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)}
          placeholder="••••••••" autoComplete="new-password"
          className={`h-9 ${confirmar && !senhasCoincide ? "border-red-400" : ""}`} />
        {confirmar && !senhasCoincide && <p className="text-xs text-red-500">As senhas não coincidem</p>}
      </div>
      <Button onClick={handleSubmit} disabled={loading || !podeEnviar}
        className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white h-9">
        {loading ? "Alterando..." : "Alterar senha"}
      </Button>
    </div>
  );
}

// ── Definir nova senha para OUTRO usuário (admin override, sem senha atual) ──
function AdminSetPasswordForm({ userId }: { userId: string }) {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNova, setShowNova] = useState(false);

  const senhasCoincide = novaSenha.length > 0 && confirmar === novaSenha;
  const senhaForte = novaSenha.length >= 8;
  const podeEnviar = senhasCoincide && senhaForte;

  const handleSubmit = async () => {
    if (!podeEnviar) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        body: { action: "set_password", user_id: userId, new_password: novaSenha },
      });
      if (error || data?.error) throw new Error(data?.error ?? error?.message);
      toast.success("Senha definida com sucesso!");
      setNovaSenha(""); setConfirmar("");
    } catch (err: any) {
      toast.error("Erro: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">Nova senha</Label>
        <div className="relative">
          <Input type={showNova ? "text" : "password"} value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)} placeholder="••••••••"
            className="pr-10 h-9" autoComplete="new-password" />
          <ToggleBtn show={showNova} onToggle={() => setShowNova(!showNova)} />
        </div>
        {novaSenha && !senhaForte && <p className="text-xs text-red-500">Mínimo 8 caracteres</p>}
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Confirmar nova senha</Label>
        <Input type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)}
          placeholder="••••••••" autoComplete="new-password"
          className={`h-9 ${confirmar && !senhasCoincide ? "border-red-400" : ""}`} />
        {confirmar && !senhasCoincide && <p className="text-xs text-red-500">As senhas não coincidem</p>}
      </div>
      <Button onClick={handleSubmit} disabled={loading || !podeEnviar}
        className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white h-9">
        {loading ? "Definindo..." : "Definir nova senha"}
      </Button>
    </div>
  );
}

// ── Página principal ──
export default function UsuariosAdmin() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [selected, setSelected] = useState<Request | null>(null);
  const [nivelEdit, setNivelEdit] = useState<Nivel>("operacional");
  const [nivelPendente, setNivelPendente] = useState<Record<string, Nivel>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: authData }, { data: reqData, error }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("admin_requests").select("*").order("created_at", { ascending: false }),
    ]);
    setCurrentUserId(authData.user?.id ?? null);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setRequests((reqData ?? []) as Request[]);
  };

  useEffect(() => { load(); }, []);

  const openSheet = (r: Request) => {
    setSelected(r);
    setNivelEdit(r.nivel ?? "operacional");
  };

  const approve = async (r: Request, nivelFinal: Nivel) => {
    setActing(true);
    try {
      const { data: existing } = await supabase
        .from("user_roles").select("user_id")
        .eq("user_id", r.user_id).eq("role", "admin").maybeSingle();

      if (existing) {
        const { error } = await supabase.from("user_roles")
          .update({ nivel: nivelFinal }).eq("user_id", r.user_id).eq("role", "admin");
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_roles")
          .insert({ user_id: r.user_id, role: "admin", nivel: nivelFinal });
        if (error) throw error;
      }

      const { error: updErr } = await supabase.from("admin_requests")
        .update({ status: "aprovado", nivel: nivelFinal }).eq("id", r.id);
      if (updErr) throw updErr;

      toast.success(`${r.nome} aprovado como ${NIVEL_LABELS[nivelFinal]}`);
      setSelected(null);
      load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActing(false);
    }
  };

  const changeNivel = async () => {
    if (!selected) return;
    setActing(true);
    try {
      await supabase.from("user_roles").update({ nivel: nivelEdit })
        .eq("user_id", selected.user_id).eq("role", "admin");
      await supabase.from("admin_requests").update({ nivel: nivelEdit }).eq("id", selected.id);
      toast.success(`Nível atualizado para ${NIVEL_LABELS[nivelEdit]}`);
      setSelected(null);
      load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActing(false);
    }
  };


  const reject = async (r: Request) => {
    if (!confirm(`Rejeitar acesso de ${r.nome}?`)) return;
    setActing(true);
    const { error } = await supabase.from("admin_requests")
      .update({ status: "rejeitado" }).eq("id", r.id);
    setActing(false);
    if (error) toast.error(error.message);
    else { toast.success("Solicitação rejeitada"); setSelected(null); load(); }
  };

  const revoke = async () => {
    if (!selected) return;
    if (!confirm(`Revogar acesso admin de ${selected.nome}?`)) return;
    setActing(true);
    const { error } = await supabase.from("user_roles").delete()
      .eq("user_id", selected.user_id).eq("role", "admin");
    if (!error) {
      await supabase.from("admin_requests").update({ status: "rejeitado" }).eq("id", selected.id);
    }
    setActing(false);
    if (error) toast.error(error.message);
    else { toast.success("Acesso revogado"); setSelected(null); load(); }
  };

  const pendentes  = requests.filter((r) => r.status === "pendente");
  const aprovados  = requests.filter((r) => r.status === "aprovado");
  const rejeitados = requests.filter((r) => r.status === "rejeitado");

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const NivelBadge = ({ nivel }: { nivel: Nivel }) => (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${NIVEL_COLORS[nivel ?? "operacional"]}`}>
      {NIVEL_LABELS[nivel ?? "operacional"]}
    </span>
  );

  const Row = ({ r, children }: { r: Request; children: React.ReactNode }) => (
    <tr
      key={r.id}
      className="border-t hover:bg-muted/30 cursor-pointer transition-colors"
      onClick={() => openSheet(r)}
    >
      {children}
    </tr>
  );

  const isOwnUser = selected?.user_id === currentUserId;

  return (
    <div className="space-y-6 max-w-4xl">
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
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">E-mail</th>
                  <th className="text-left p-3">Nível</th>
                  <th className="text-left p-3">Solicitado em</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {pendentes.map((r) => (
                  <Row key={r.id} r={r}>
                    <td className="p-3 font-semibold">{r.nome}</td>
                    <td className="p-3 text-muted-foreground">{r.email}</td>
                    <td className="p-3">
                      <Select
                        value={nivelPendente[r.id] ?? "operacional"}
                        onValueChange={(v) =>
                          setNivelPendente((prev) => ({ ...prev, [r.id]: v as Nivel }))
                        }
                      >
                        <SelectTrigger className="h-7 w-32 text-xs" onClick={(e) => e.stopPropagation()}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {NIVEIS.map((n) => (
                            <SelectItem key={n} value={n} className="text-xs">{NIVEL_LABELS[n]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">{fmt(r.created_at)}</td>
                    <td className="p-3 text-right text-muted-foreground">
                      <ChevronRight className="h-4 w-4 inline" />
                    </td>
                  </Row>
                ))}
              </tbody>
            </table>
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
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">E-mail</th>
                  <th className="text-left p-3">Nível</th>
                  <th className="text-left p-3">Aprovado em</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {aprovados.map((r) => (
                  <Row key={r.id} r={r}>
                    <td className="p-3 font-semibold">{r.nome}</td>
                    <td className="p-3 text-muted-foreground">{r.email}</td>
                    <td className="p-3"><NivelBadge nivel={r.nivel ?? "operacional"} /></td>
                    <td className="p-3 text-muted-foreground text-xs">{fmt(r.created_at)}</td>
                    <td className="p-3 text-right text-muted-foreground">
                      <ChevronRight className="h-4 w-4 inline" />
                    </td>
                  </Row>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* ── Rejeitados ── */}
      {rejeitados.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-muted-foreground">
              <XCircle className="h-5 w-5" />
              Rejeitados
              <Badge variant="secondary" className="ml-1">{rejeitados.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">E-mail</th>
                  <th className="text-left p-3">Data</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {rejeitados.map((r) => (
                  <Row key={r.id} r={r}>
                    <td className="p-3 opacity-60">{r.nome}</td>
                    <td className="p-3 text-muted-foreground opacity-60">{r.email}</td>
                    <td className="p-3 text-xs text-muted-foreground opacity-60">{fmt(r.created_at)}</td>
                    <td className="p-3 text-right text-muted-foreground">
                      <ChevronRight className="h-4 w-4 inline" />
                    </td>
                  </Row>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {loading && <div className="text-center text-muted-foreground py-8">Carregando...</div>}

      {/* ── Painel lateral ── */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-[360px] sm:w-[420px] flex flex-col gap-0 p-0">
          {selected && (
            <>
              {/* Cabeçalho */}
              <SheetHeader className="px-6 py-5 border-b shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-brand-blue" />
                  </div>
                  <div className="min-w-0">
                    <SheetTitle className="text-base truncate">{selected.nome}</SheetTitle>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{selected.email}</p>
                    {selected.celular && (
                      <p className="text-xs text-muted-foreground">{selected.celular}</p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    selected.status === "aprovado" ? "bg-green-100 text-green-700" :
                    selected.status === "pendente" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    {selected.status === "aprovado" ? "Acesso ativo" :
                     selected.status === "pendente" ? "Aguardando aprovação" : "Rejeitado"}
                  </span>
                  {isOwnUser && (
                    <span className="text-xs bg-brand-blue/10 text-brand-blue px-2 py-1 rounded-full font-medium">
                      Você
                    </span>
                  )}
                </div>
              </SheetHeader>

              {/* Conteúdo rolável */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                {/* Nível de acesso */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Nível de acesso</Label>
                  <Select value={nivelEdit} onValueChange={(v) => setNivelEdit(v as Nivel)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NIVEIS.map((n) => (
                        <SelectItem key={n} value={n}>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${NIVEL_COLORS[n]}`}>
                              {NIVEL_LABELS[n]}
                            </span>
                            <span className="text-xs text-muted-foreground">{NIVEL_DESC[n]}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selected.status === "pendente" && (
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        disabled={acting}
                        onClick={() => approve(selected, nivelEdit)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1.5" /> Aprovar
                      </Button>
                      <Button variant="destructive" disabled={acting} onClick={() => reject(selected)}>
                        <XCircle className="h-4 w-4 mr-1.5" /> Rejeitar
                      </Button>
                    </div>
                  )}

                  {selected.status === "aprovado" && nivelEdit !== (selected.nivel ?? "operacional") && (
                    <Button
                      className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white"
                      disabled={acting}
                      onClick={changeNivel}
                    >
                      Salvar novo nível
                    </Button>
                  )}

                  {selected.status === "rejeitado" && (
                    <Button variant="outline" className="w-full" disabled={acting}
                      onClick={() => approve(selected, nivelEdit)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Aprovar mesmo assim
                    </Button>
                  )}
                </div>

                {/* Senha */}
                {selected.status === "aprovado" && (
                  <div className="border-t pt-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-semibold">Senha</Label>
                    </div>

                    {isOwnUser ? (
                      <OwnPasswordForm />
                    ) : (
                      <AdminSetPasswordForm userId={selected.user_id} />
                    )}
                  </div>
                )}
              </div>

              {/* Rodapé — revogar */}
              {selected.status === "aprovado" && !isOwnUser && (
                <div className="px-6 py-4 border-t shrink-0">
                  <Button variant="destructive" className="w-full" disabled={acting} onClick={revoke}>
                    <ShieldOff className="h-4 w-4 mr-2" /> Revogar acesso
                  </Button>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
