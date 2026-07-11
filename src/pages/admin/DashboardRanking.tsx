import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle, Building2, MapPin, Globe, RefreshCw,
  CheckCircle2, Star, ExternalLink,
} from "lucide-react";

type Empresa = { id: string; nome: string; slug?: string; estado?: string };
type Nota = { empresa_id: string; nota_final: number; updated_at: string; empresa_nome?: string; dist_nome?: string; estado?: string };

type ModalKey = "semNota" | "semDistribuidora" | "notasAntigas" | null;

const MODAL_TITLES: Record<Exclude<ModalKey, null>, string> = {
  semNota:           "Empresas sem nota lançada",
  semDistribuidora:  "Empresas sem estado preenchido",
  notasAntigas:      "Notas desatualizadas (+30 dias)",
};

export default function DashboardRanking() {
  const [loading, setLoading] = useState(true);
  const [recalcState, setRecalcState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [modal, setModal] = useState<ModalKey>(null);

  // Dados gerais
  const [totais, setTotais] = useState({ empresas: 0, distribuidoras: 0, estados: 0, parceiras: 0 });

  // Alertas (listas para o modal)
  const [semNota, setSemNota] = useState<Empresa[]>([]);
  const [semDist, setSemDist]  = useState<Empresa[]>([]);
  const [antigas, setAntigas]  = useState<Nota[]>([]);

  // Top ranking
  const [topNotas, setTopNotas] = useState<Nota[]>([]);

  // Empresas por estado
  const [porEstado, setPorEstado] = useState<{ estado: string; count: number }[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);

      // 1. Totais simples
      const [eCount, dCount, sCount, pCount] = await Promise.all([
        supabase.from("empresas").select("id", { count: "exact", head: true }),
        supabase.from("distribuidoras").select("id", { count: "exact", head: true }),
        supabase.from("estados").select("id", { count: "exact", head: true }),
        supabase.from("empresas").select("id", { count: "exact", head: true }).eq("is_partner", true),
      ]);
      setTotais({
        empresas: eCount.count ?? 0,
        distribuidoras: dCount.count ?? 0,
        estados: sCount.count ?? 0,
        parceiras: pCount.count ?? 0,
      });

      // 2. Todas as empresas
      const { data: todasEmpresas } = await supabase
        .from("empresas")
        .select("id, nome, slug, estados_atuacao")
        .order("nome");

      const empresasList = (todasEmpresas ?? []).map((e: any) => ({
        id: e.id,
        nome: e.nome,
        slug: e.slug,
        estado: e.estados_atuacao ? e.estados_atuacao.split(",")[0].trim() : null,
      }));

      // 3. IDs que têm nota
      const { data: notasIds } = await supabase
        .from("notas_empresas")
        .select("empresa_id");
      const comNotaIds = new Set((notasIds ?? []).map((n: any) => n.empresa_id));

      // Sem nota
      setSemNota(empresasList.filter((e) => !comNotaIds.has(e.id)));

      // Sem estado preenchido
      setSemDist(empresasList.filter((e) => !e.estado));

      // 4. Todas as notas para top ranking + antigas
      const { data: todasNotas } = await supabase
        .from("notas_empresas")
        .select("empresa_id, nota_final, updated_at, empresas(nome, slug, estados_atuacao), distribuidoras(nome)")
        .order("nota_final", { ascending: false });

      const notasList: Nota[] = (todasNotas ?? []).map((n: any) => ({
        empresa_id: n.empresa_id,
        nota_final: Number(n.nota_final ?? 0),
        updated_at: n.updated_at,
        empresa_nome: n.empresas?.nome ?? "—",
        dist_nome: n.distribuidoras?.nome ?? "—",
        estado: n.empresas?.estados_atuacao
          ? n.empresas.estados_atuacao.split(",")[0].trim()
          : "—",
      }));

      setTopNotas(notasList.slice(0, 10));

      // Notas com +30 dias sem atualizar
      const limite = new Date();
      limite.setDate(limite.getDate() - 30);
      setAntigas(notasList.filter((n) => new Date(n.updated_at) < limite));

      // 5. Empresas por estado
      const estadoMap: Record<string, number> = {};
      empresasList.forEach((e) => {
        const est = e.estado ?? "Sem estado";
        estadoMap[est] = (estadoMap[est] || 0) + 1;
      });
      const sorted = Object.entries(estadoMap)
        .map(([estado, count]) => ({ estado, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      setPorEstado(sorted);

      setLoading(false);
    })();
  }, []);

  const handleRecalc = async () => {
    setRecalcState("loading");
    const { error } = await supabase.functions.invoke("recalc-ranking", { body: { distribuidora_id: "ALL" } });
    setRecalcState(error ? "error" : "done");
    setTimeout(() => setRecalcState("idle"), 4000);
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");
  const diasSem = (d: string) => Math.floor((Date.now() - new Date(d).getTime()) / 86400000);

  // Lista exibida no modal
  const modalRows: any[] = modal === "semNota" ? semNota : modal === "semDistribuidora" ? semDist : antigas;

  if (loading) return <div className="text-muted-foreground p-6">Carregando...</div>;

  const maxEstado = porEstado[0]?.count || 1;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ranking — Visão Geral</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Saúde dos dados e distribuição do ranking</p>
        </div>
        <Button onClick={handleRecalc} disabled={recalcState === "loading"}
          variant={recalcState === "error" ? "destructive" : "outline"} size="sm" className="gap-2">
          {recalcState === "loading" && <RefreshCw className="h-4 w-4 animate-spin" />}
          {recalcState === "done"    && <CheckCircle2 className="h-4 w-4 text-green-600" />}
          {recalcState === "idle"    && <RefreshCw className="h-4 w-4" />}
          {recalcState === "loading" ? "Recalculando..." : recalcState === "done" ? "Recalculado!" : "Recalcular Ranking"}
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Empresas", value: totais.empresas, icon: Building2, color: "text-brand-blue", bg: "bg-brand-blue/10" },
          { label: "Distribuidoras", value: totais.distribuidoras, icon: MapPin, color: "text-purple-600", bg: "bg-purple-100" },
          { label: "Estados cobertos", value: totais.estados, icon: Globe, color: "text-green-600", bg: "bg-green-100" },
          { label: "Empresas parceiras", value: totais.parceiras, icon: Star, color: "text-brand-yellow", bg: "bg-brand-yellow/20" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="pt-5 pb-4 flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
                <p className="text-3xl font-extrabold mt-1">{value}</p>
              </div>
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alertas de qualidade de dados — clicáveis */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Alertas de qualidade
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Sem nota */}
          <button onClick={() => setModal("semNota")} disabled={semNota.length === 0}
            className="text-left rounded-xl border-2 p-4 transition hover:shadow-md disabled:opacity-40 disabled:cursor-default
              border-red-200 bg-red-50 hover:border-red-400">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
              <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">Sem nota</span>
            </div>
            <p className="text-3xl font-extrabold text-red-600">{semNota.length}</p>
            <p className="text-xs text-red-500 mt-0.5">empresas sem nota lançada</p>
            {semNota.length > 0 && <p className="text-xs text-red-400 mt-2 underline">Clique para ver a lista →</p>}
          </button>

          {/* Sem distribuidora */}
          <button onClick={() => setModal("semDistribuidora")} disabled={semDist.length === 0}
            className="text-left rounded-xl border-2 p-4 transition hover:shadow-md disabled:opacity-40 disabled:cursor-default
              border-orange-200 bg-orange-50 hover:border-orange-400">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
              <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Sem estado</span>
            </div>
            <p className="text-3xl font-extrabold text-orange-600">{semDist.length}</p>
            <p className="text-xs text-orange-500 mt-0.5">empresas sem estado preenchido</p>
            {semDist.length > 0 && <p className="text-xs text-orange-400 mt-2 underline">Clique para ver a lista →</p>}
          </button>

          {/* Notas antigas */}
          <button onClick={() => setModal("notasAntigas")} disabled={antigas.length === 0}
            className="text-left rounded-xl border-2 p-4 transition hover:shadow-md disabled:opacity-40 disabled:cursor-default
              border-yellow-200 bg-yellow-50 hover:border-yellow-400">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0" />
              <span className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">Desatualizadas</span>
            </div>
            <p className="text-3xl font-extrabold text-yellow-700">{antigas.length}</p>
            <p className="text-xs text-yellow-600 mt-0.5">notas sem atualização há +30 dias</p>
            {antigas.length > 0 && <p className="text-xs text-yellow-500 mt-2 underline">Clique para ver a lista →</p>}
          </button>
        </div>
      </div>

      {/* Top 10 + Por estado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top 10 notas */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Top 10 do ranking</CardTitle>
            <Link to="/admin/notas" className="text-xs text-brand-blue hover:underline">Gerenciar notas →</Link>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left px-4 py-2 text-xs text-muted-foreground font-medium w-8">#</th>
                  <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">Empresa</th>
                  <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">Distribuidora</th>
                  <th className="text-center px-3 py-2 text-xs text-muted-foreground font-medium">UF</th>
                  <th className="text-right px-4 py-2 text-xs text-muted-foreground font-medium">Nota</th>
                </tr>
              </thead>
              <tbody>
                {topNotas.map((n, i) => (
                  <tr key={n.empresa_id} className="border-t hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 text-muted-foreground text-xs font-medium">{i + 1}</td>
                    <td className="px-3 py-2.5 font-semibold">{n.empresa_nome}</td>
                    <td className="px-3 py-2.5 text-muted-foreground text-xs truncate max-w-[140px]">{n.dist_nome}</td>
                    <td className="px-3 py-2.5 text-center">
                      <Badge variant="outline" className="text-xs px-1.5">{n.estado}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right font-extrabold text-brand-blue">
                      {n.nota_final.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {topNotas.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-4 text-muted-foreground text-sm text-center">Nenhuma nota lançada ainda.</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Empresas por estado */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Empresas por estado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {porEstado.map(({ estado, count }) => (
              <div key={estado}>
                <div className="flex justify-between text-sm mb-0.5">
                  <span className="font-medium">{estado}</span>
                  <span className="text-muted-foreground">{count}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-brand-blue"
                    style={{ width: `${Math.round((count / maxEstado) * 100)}%` }} />
                </div>
              </div>
            ))}
            {porEstado.length === 0 && <p className="text-sm text-muted-foreground">Nenhum dado.</p>}
          </CardContent>
        </Card>
      </div>

      {/* Modal de detalhe */}
      <Dialog open={!!modal} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              {modal ? MODAL_TITLES[modal] : ""}
              <Badge variant="secondary" className="ml-1">{modalRows.length}</Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 mt-2">
            {modalRows.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum item encontrado.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {modalRows.map((row: any, i) => (
                    <tr key={row.id ?? row.empresa_id ?? i} className="border-b last:border-0 hover:bg-muted/30">
                      {/* Sem nota / Sem distribuidora */}
                      {(modal === "semNota" || modal === "semDistribuidora") && (
                        <>
                          <td className="py-2.5 pr-3 font-medium">{row.nome}</td>
                          <td className="py-2.5 pr-3 text-muted-foreground text-xs">
                            {row.distribuidora_nome ?? <span className="text-red-500 font-medium">Sem distribuidora</span>}
                          </td>
                          <td className="py-2.5 text-right">
                            {row.estado && <Badge variant="outline" className="text-xs">{row.estado}</Badge>}
                          </td>
                          <td className="py-2.5 pl-3 text-right">
                            <Link to="/admin/notas"
                              className="text-xs text-brand-blue hover:underline flex items-center gap-1 justify-end"
                              onClick={() => setModal(null)}>
                              Lançar <ExternalLink className="h-3 w-3" />
                            </Link>
                          </td>
                        </>
                      )}

                      {/* Notas antigas */}
                      {modal === "notasAntigas" && (
                        <>
                          <td className="py-2.5 pr-3 font-medium">{row.empresa_nome}</td>
                          <td className="py-2.5 pr-3 text-muted-foreground text-xs">{row.dist_nome}</td>
                          <td className="py-2.5 text-right">
                            <span className="text-xs text-orange-600 font-semibold">
                              {diasSem(row.updated_at)}d atrás
                            </span>
                          </td>
                          <td className="py-2.5 pl-3 text-right">
                            <Link to="/admin/notas"
                              className="text-xs text-brand-blue hover:underline flex items-center gap-1 justify-end"
                              onClick={() => setModal(null)}>
                              Atualizar <ExternalLink className="h-3 w-3" />
                            </Link>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
