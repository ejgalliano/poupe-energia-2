import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle, RefreshCw, CheckCircle2,
  Gift, Users, TrendingUp, ArrowRight, ChevronRight,
} from "lucide-react";

const fmt = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });

type StatusKey =
  | "pendente" | "em_analise" | "contrato_enviado"
  | "ativo" | "pago" | "cancelado" | "cadastrado_parceiro";

const STATUS_CFG: Record<StatusKey, { label: string; badgeCls: string; cardCls: string }> = {
  pendente:            { label: "Pendente",          badgeCls: "bg-yellow-100 text-yellow-800",  cardCls: "border-yellow-300 bg-yellow-50" },
  em_analise:          { label: "Em Análise",         badgeCls: "bg-blue-100 text-blue-700",      cardCls: "border-blue-300 bg-blue-50" },
  contrato_enviado:    { label: "Contrato Enviado",   badgeCls: "bg-purple-100 text-purple-700",  cardCls: "border-purple-300 bg-purple-50" },
  ativo:               { label: "Ativo",              badgeCls: "bg-green-100 text-green-700",    cardCls: "border-green-300 bg-green-50" },
  pago:                { label: "Pago",               badgeCls: "bg-emerald-100 text-emerald-700",cardCls: "border-emerald-300 bg-emerald-50" },
  cancelado:           { label: "Cancelado",          badgeCls: "bg-gray-100 text-gray-500",      cardCls: "border-gray-200 bg-gray-50" },
  cadastrado_parceiro: { label: "Via Parceiro",       badgeCls: "bg-indigo-100 text-indigo-700",  cardCls: "border-indigo-300 bg-indigo-50" },
};

// Funil em ordem de progresso
const FUNIL: StatusKey[] = [
  "pendente", "em_analise", "contrato_enviado", "cadastrado_parceiro", "ativo",
];
const FINAIS: StatusKey[] = ["pago", "cancelado"];

type AdesaoRow = {
  id: string;
  nome: string;
  empresa_nome?: string;
  status: StatusKey;
  valor_cashback?: number;
  created_at: string;
};

export default function Dashboard() {
  const [recalcState, setRecalcState] = useState<"idle" | "loading" | "done" | "error">("idle");

  // Contadores por status
  const [contadores, setContadores] = useState<Record<StatusKey, number>>({
    pendente: 0, em_analise: 0, contrato_enviado: 0,
    ativo: 0, pago: 0, cancelado: 0, cadastrado_parceiro: 0,
  });
  const [kpis, setKpis] = useState({
    hoje: 0, mes: 0, mesPasado: 0, cashbackPagar: 0, contestacoes: 0,
  });
  const [recentes, setRecentes] = useState<AdesaoRow[]>([]);
  const [topEmpresas, setTopEmpresas] = useState<{ nome: string; count: number }[]>([]);

  useEffect(() => {
    (async () => {
      const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
      const inicioMes = new Date(); inicioMes.setDate(1); inicioMes.setHours(0, 0, 0, 0);
      const inicioMesPasado = new Date(); inicioMesPasado.setMonth(inicioMesPasado.getMonth() - 1); inicioMesPasado.setDate(1); inicioMesPasado.setHours(0, 0, 0, 0);
      const fimMesPasado = new Date(inicioMes); fimMesPasado.setMilliseconds(-1);

      // Busca todos os registros de uma vez (até 1000)
      const { data: todos } = await supabase
        .from("cashback_cadastros")
        .select("id, nome, empresa_nome, status, valor_cashback, created_at")
        .order("created_at", { ascending: false })
        .limit(1000);

      const rows = (todos ?? []) as AdesaoRow[];

      // Contadores por status
      const cnt: Record<StatusKey, number> = {
        pendente: 0, em_analise: 0, contrato_enviado: 0,
        ativo: 0, pago: 0, cancelado: 0, cadastrado_parceiro: 0,
      };
      rows.forEach((r) => {
        if (cnt[r.status] !== undefined) cnt[r.status]++;
      });
      setContadores(cnt);

      // KPIs
      const hojeIso = hoje.toISOString();
      const mesIso = inicioMes.toISOString();
      const mesPasadoIso = inicioMesPasado.toISOString();
      const fimMesPasadoIso = fimMesPasado.toISOString();

      const kHoje = rows.filter((r) => r.created_at >= hojeIso).length;
      const kMes  = rows.filter((r) => r.created_at >= mesIso).length;
      const kMesP = rows.filter((r) => r.created_at >= mesPasadoIso && r.created_at <= fimMesPasadoIso).length;
      const kPagar = rows
        .filter((r) => ["pendente","em_analise","contrato_enviado","ativo"].includes(r.status))
        .reduce((acc, r) => acc + (Number(r.valor_cashback) || 0), 0);

      const { count: contestacoes } = await supabase
        .from("contestacoes").select("id", { count: "exact", head: true }).eq("status", "pendente");

      setKpis({ hoje: kHoje, mes: kMes, mesPasado: kMesP, cashbackPagar: kPagar, contestacoes: contestacoes ?? 0 });

      // Últimas 8 adesões
      setRecentes(rows.slice(0, 8));

      // Top empresas
      const emp: Record<string, number> = {};
      rows.forEach((r) => {
        const nome = r.empresa_nome || "Sem empresa";
        emp[nome] = (emp[nome] || 0) + 1;
      });
      const sorted = Object.entries(emp)
        .map(([nome, count]) => ({ nome, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setTopEmpresas(sorted);
    })();
  }, []);

  const handleRecalc = async () => {
    setRecalcState("loading");
    const { error } = await supabase.functions.invoke("recalc-ranking", { body: { distribuidora_id: "ALL" } });
    setRecalcState(error ? "error" : "done");
    setTimeout(() => setRecalcState("idle"), 4000);
  };

  const tendencia = kpis.mesPasado > 0
    ? Math.round(((kpis.mes - kpis.mesPasado) / kpis.mesPasado) * 100)
    : null;

  const totalFunil = FUNIL.reduce((acc, s) => acc + contadores[s], 0);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button
          onClick={handleRecalc}
          disabled={recalcState === "loading"}
          variant={recalcState === "error" ? "destructive" : "outline"}
          size="sm"
          className="gap-2"
        >
          {recalcState === "loading" && <RefreshCw className="h-4 w-4 animate-spin" />}
          {recalcState === "done"    && <CheckCircle2 className="h-4 w-4 text-green-600" />}
          {recalcState === "error"   && <AlertTriangle className="h-4 w-4" />}
          {recalcState === "idle"    && <RefreshCw className="h-4 w-4" />}
          {recalcState === "loading" ? "Recalculando..." :
           recalcState === "done"    ? "Recalculado!" :
           recalcState === "error"   ? "Erro" : "Recalcular Ranking"}
        </Button>
      </div>

      {/* Alertas */}
      {kpis.contestacoes > 0 && (
        <Link to="/admin/contestacoes">
          <div className="flex items-center gap-3 bg-orange-50 border border-orange-300 rounded-xl px-5 py-3 hover:bg-orange-100 transition">
            <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />
            <p className="text-sm font-semibold text-orange-700">
              {kpis.contestacoes} contestaç{kpis.contestacoes > 1 ? "ões pendentes" : "ão pendente"} aguardando análise
            </p>
            <span className="ml-auto text-xs text-orange-500 font-medium">Ver →</span>
          </div>
        </Link>
      )}

      {/* KPIs principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Adesões hoje */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Adesões hoje</p>
                <p className="text-3xl font-extrabold text-foreground mt-1">{kpis.hoje}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-brand-yellow/20 flex items-center justify-center">
                <Gift className="h-5 w-5 text-brand-yellow" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adesões este mês */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Este mês</p>
                <p className="text-3xl font-extrabold text-foreground mt-1">{kpis.mes}</p>
                {tendencia !== null && (
                  <p className={`text-xs mt-1 font-medium ${tendencia >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {tendencia >= 0 ? "+" : ""}{tendencia}% vs mês anterior
                  </p>
                )}
              </div>
              <div className="w-9 h-9 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-brand-blue" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total em pipeline ativo */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Em pipeline</p>
                <p className="text-3xl font-extrabold text-foreground mt-1">{totalFunil}</p>
                <p className="text-xs text-muted-foreground mt-1">Em andamento</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ativos */}
        <Card className="border-0 shadow-sm bg-green-50 border-green-200">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-green-700 font-medium uppercase tracking-wide">Ativos</p>
                <p className="text-3xl font-extrabold text-green-700 mt-1">{contadores.ativo + contadores.pago}</p>
                <p className="text-xs text-green-600 mt-1">{contadores.pago} pagos</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-green-200 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funil de adesões */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Funil de adesões
        </h2>
        <div className="flex items-stretch gap-1 overflow-x-auto pb-1">
          {FUNIL.map((status, i) => {
            const cfg = STATUS_CFG[status];
            const count = contadores[status];
            const pct = totalFunil > 0 ? Math.round((count / totalFunil) * 100) : 0;
            return (
              <div key={status} className="flex items-center gap-1 flex-1 min-w-[110px]">
                <Link to="/admin/cashback" className="flex-1">
                  <div className={`rounded-xl border-2 p-4 text-center hover:opacity-80 transition ${cfg.cardCls}`}>
                    <p className="text-2xl font-extrabold">{count}</p>
                    <p className="text-xs font-semibold mt-0.5">{cfg.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{pct}%</p>
                  </div>
                </Link>
                {i < FUNIL.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </div>
            );
          })}

          {/* Separador */}
          <div className="flex items-center px-2 text-muted-foreground/40 text-lg font-thin select-none">|</div>

          {/* Status finais */}
          {FINAIS.map((status) => {
            const cfg = STATUS_CFG[status];
            return (
              <Link key={status} to="/admin/cashback" className="min-w-[90px]">
                <div className={`rounded-xl border-2 p-4 text-center hover:opacity-80 transition ${cfg.cardCls}`}>
                  <p className="text-2xl font-extrabold">{contadores[status]}</p>
                  <p className="text-xs font-semibold mt-0.5">{cfg.label}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Linha inferior: últimas adesões + top empresas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Últimas adesões */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Últimas adesões</CardTitle>
            <Link to="/admin/cashback" className="text-xs text-brand-blue hover:underline flex items-center gap-1">
              Ver todas <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentes.length === 0 ? (
              <p className="text-sm text-muted-foreground px-6 py-4">Nenhuma adesão ainda.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {recentes.map((r) => {
                    const cfg = STATUS_CFG[r.status] ?? STATUS_CFG.pendente;
                    return (
                      <Link key={r.id} to={`/admin/cashback/${r.id}`}>
                        <tr className="border-t hover:bg-muted/30 cursor-pointer transition-colors">
                          <td className="px-5 py-2.5 font-medium">{r.nome}</td>
                          <td className="px-3 py-2.5 text-muted-foreground text-xs truncate max-w-[130px]">
                            {r.empresa_nome || "—"}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badgeCls}`}>
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-5 py-2.5 text-xs text-muted-foreground text-right">
                            {fmtDate(r.created_at)}
                          </td>
                        </tr>
                      </Link>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Top empresas + cashback a pagar */}
        <div className="space-y-4">
          {/* Cashback a pagar */}
          {kpis.cashbackPagar > 0 && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide">Cashback a pagar</p>
                <p className="text-2xl font-extrabold text-amber-800 mt-1">{fmt(kpis.cashbackPagar)}</p>
                <p className="text-xs text-amber-600 mt-0.5">Total acumulado em aberto</p>
              </CardContent>
            </Card>
          )}

          {/* Top parceiros */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top empresas por adesões</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topEmpresas.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum dado ainda.</p>
              )}
              {topEmpresas.map((e, i) => {
                const max = topEmpresas[0]?.count || 1;
                const pct = Math.round((e.count / max) * 100);
                return (
                  <div key={e.nome}>
                    <div className="flex justify-between text-sm mb-0.5">
                      <span className="font-medium truncate max-w-[160px]">{e.nome}</span>
                      <span className="text-muted-foreground shrink-0 ml-2">{e.count}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-blue"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
