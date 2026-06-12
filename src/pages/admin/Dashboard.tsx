import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, CheckCircle2 } from "lucide-react";

export default function Dashboard() {
  const [recalcState, setRecalcState] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handleRecalc = async () => {
    setRecalcState("loading");
    const { error } = await supabase.functions.invoke("recalc-ranking", {
      body: { distribuidora_id: "ALL" },
    });
    setRecalcState(error ? "error" : "done");
    setTimeout(() => setRecalcState("idle"), 4000);
  };

  const [stats, setStats] = useState({
    empresas: 0,
    distribuidoras: 0,
    estados: 0,
    leadsHoje: 0,
    leadsMes: 0,
    leadsComContato: 0,
    leadsEmpHoje: 0,
    leadsEmpPendentes: 0,
    leadsEmbHoje: 0,
    comissoesPendentes: 0,
    contestacoesPendentes: 0,
  });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [e, d, s, r, lh, lm, lc, leh, lep, leb, com, cont] = await Promise.all([
        supabase.from("empresas").select("id", { count: "exact", head: true }),
        supabase.from("distribuidoras").select("id", { count: "exact", head: true }),
        supabase.from("estados").select("id", { count: "exact", head: true }),
        supabase
          .from("notas_empresas")
          .select("nota_final, updated_at, empresas(nome), distribuidoras(nome)")
          .order("updated_at", { ascending: false })
          .limit(10),
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .gte("created_at", startOfDay.toISOString()),
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .gte("created_at", startOfMonth.toISOString()),
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .not("email", "is", null),
        supabase
          .from("leads_empresariais")
          .select("id", { count: "exact", head: true })
          .gte("created_at", startOfDay.toISOString()),
        supabase
          .from("leads_empresariais")
          .select("id", { count: "exact", head: true })
          .eq("status", "novo"),
        supabase
          .from("leads_embaixadores")
          .select("id", { count: "exact", head: true })
          .gte("created_at", startOfDay.toISOString()),
        supabase
          .from("leads_embaixadores")
          .select("valor_comissao")
          .in("status_comissao", ["pendente", "validado"]),
        supabase
          .from("contestacoes")
          .select("id", { count: "exact", head: true })
          .eq("status", "pendente"),
      ]);
      const comissoesPendentes = (com.data ?? []).reduce(
        (acc: number, r: any) => acc + (Number(r.valor_comissao) || 0),
        0,
      );
      setStats({
        empresas: e.count ?? 0,
        distribuidoras: d.count ?? 0,
        estados: s.count ?? 0,
        leadsHoje: lh.count ?? 0,
        leadsMes: lm.count ?? 0,
        leadsComContato: lc.count ?? 0,
        leadsEmpHoje: leh.count ?? 0,
        leadsEmpPendentes: lep.count ?? 0,
        leadsEmbHoje: leb.count ?? 0,
        comissoesPendentes,
        contestacoesPendentes: cont.count ?? 0,
      });
      setRecent(r.data ?? []);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button
          onClick={handleRecalc}
          disabled={recalcState === "loading"}
          variant={recalcState === "done" ? "outline" : recalcState === "error" ? "destructive" : "default"}
          className="gap-2"
        >
          {recalcState === "loading" && <RefreshCw className="h-4 w-4 animate-spin" />}
          {recalcState === "done" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
          {recalcState === "error" && <AlertTriangle className="h-4 w-4" />}
          {recalcState === "idle" && <RefreshCw className="h-4 w-4" />}
          {recalcState === "loading" ? "Recalculando..." : recalcState === "done" ? "Recalculado!" : recalcState === "error" ? "Erro ao recalcular" : "Recalcular Ranking"}
        </Button>
      </div>

      {stats.contestacoesPendentes > 0 && (
        <Link to="/admin/contestacoes">
          <div className="flex items-center gap-3 bg-orange-50 border border-orange-300 rounded-xl px-5 py-3 hover:bg-orange-100 transition cursor-pointer">
            <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />
            <p className="text-sm font-semibold text-orange-700">
              {stats.contestacoesPendentes} contestaç{stats.contestacoesPendentes > 1 ? "ões pendentes" : "ão pendente"} aguardando análise
            </p>
            <span className="ml-auto text-xs text-orange-500 font-medium">Ver todas →</span>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: "Empresas", value: stats.empresas },
          { label: "Distribuidoras", value: stats.distribuidoras },
          { label: "Estados cobertos", value: stats.estados },
          { label: "Leads hoje", value: stats.leadsHoje },
          { label: "Leads este mês", value: stats.leadsMes },
          { label: "Leads com contato", value: stats.leadsComContato },
          { label: "Leads Empresariais hoje", value: stats.leadsEmpHoje },
          { label: "Leads Empresariais pendentes", value: stats.leadsEmpPendentes },
          { label: "Leads c/ embaixador hoje", value: stats.leadsEmbHoje },
          { label: "Comissões pendentes", value: stats.comissoesPendentes.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) },
        ].map((c) => (
          <Card key={c.label}>
            <CardHeader><CardTitle className="text-sm text-muted-foreground">{c.label}</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-[hsl(214,50%,24%)]">{c.value}</div></CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Últimas notas atualizadas</CardTitle></CardHeader>
        <CardContent>
          <ul className="divide-y">
            {recent.map((r, i) => (
              <li key={i} className="py-2 flex justify-between text-sm">
                <span>{(r.empresas as any)?.nome} — {(r.distribuidoras as any)?.nome}</span>
                <span className="font-semibold">{Number(r.nota_final).toFixed(1)}</span>
              </li>
            ))}
            {recent.length === 0 && <li className="text-muted-foreground text-sm">Nenhum registro.</li>}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
