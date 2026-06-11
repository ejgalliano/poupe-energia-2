import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CompanyCard, { Company } from "@/components/CompanyCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { fetchAll } from "@/lib/fetchAll";
import SEO from "@/components/SEO";
import BackToTop from "@/components/BackToTop";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Info, ArrowRight } from "lucide-react";

type SortKey = "score" | "discount" | "legalSecurity" | "reputation" | "minValue";
type SortDir = "asc" | "desc";

type SortOptionValue =
  | "score-desc"
  | "discount-desc"
  | "discount-asc"
  | "legalSecurity-desc"
  | "legalSecurity-asc"
  | "reputation-desc"
  | "reputation-asc"
  | "minValue-asc"
  | "minValue-desc";

const SORT_SELECT_OPTIONS: { value: SortOptionValue; label: string }[] = [
  { value: "score-desc", label: "Nota Final ↓" },
  { value: "discount-desc", label: "Desconto Inicial — Maior primeiro" },
  { value: "discount-asc", label: "Desconto Inicial — Menor primeiro" },
  { value: "legalSecurity-desc", label: "Segurança Jurídica — Maior primeiro" },
  { value: "legalSecurity-asc", label: "Segurança Jurídica — Menor primeiro" },
  { value: "reputation-desc", label: "Reputação Reclame Aqui — Maior primeiro" },
  { value: "reputation-asc", label: "Reputação Reclame Aqui — Menor primeiro" },
  { value: "minValue-asc", label: "Valor Mínimo de Adesão — Menor primeiro" },
  { value: "minValue-desc", label: "Valor Mínimo de Adesão — Maior primeiro" },
];

const parseSortValue = (v: SortOptionValue): { key: SortKey; dir: SortDir } => {
  const [key, dir] = v.split("-") as [SortKey, SortDir];
  return { key, dir };
};

const parseNum = (s: string) =>
  parseFloat(String(s).replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".")) || 0;

const getSortValue = (c: Company & { _raw?: any }, key: SortKey): number => {
  switch (key) {
    case "score": return c.score;
    case "discount": return parseFloat(String(c.discount).replace("%", "").replace(",", ".")) || 0;
    case "legalSecurity": return parseFloat(String(c.legalSecurity).replace(",", ".")) || 0;
    case "reputation": return parseFloat(String(c.reputation).replace(",", ".")) || 0;
    case "minValue": return parseNum(c.minValue);
  }
};

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(n);

interface CompanyNacional extends Company {
  estadosCount: number;
}

interface BronzeEmpresa {
  id: string;
  nome: string;
  site_url: string | null;
}

const RankingNacional = () => {
  const [companies, setCompanies] = useState<CompanyNacional[]>([]);
  const [bronzeCompanies, setBronzeCompanies] = useState<BronzeEmpresa[]>([]);
  const [showBronze, setShowBronze] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // Buscar TODAS as empresas ativas não-bronze (sem filtro de perfil)
      const { data: empresas } = await supabase
        .from("empresas")
        .select("id, nome, parceira, ativa, tipo_fornecedor, logo_url, cashback_percentual, desconto_ate_1mwh, desconto_1a3mwh, desconto_3a5mwh, desconto_acima_5mwh")
        .eq("ativa", true)
        .neq("tipo_fornecedor", "intermediador");

      // Buscar empresas bronze (intermediadoras) em ordem alfabética
      const { data: bronze } = await supabase
        .from("empresas")
        .select("id, nome, site_url")
        .eq("ativa", true)
        .eq("tipo_fornecedor", "intermediador")
        .order("nome");

      // Buscar todas as notas (paginado via fetchAll — Supabase limita 1000 por request)
      const notas = await fetchAll((from, to) =>
        supabase
          .from("notas_empresas")
          .select("empresa_id, distribuidora_id, nota_final, desconto_percentual, seguranca_juridica, reputacao_reclame_aqui, valor_minimo_fatura, nivel_risco")
          .range(from, to)
      );

      const byEmpresa = new Map<string, any[]>();
      (notas ?? []).forEach((n) => {
        if (!byEmpresa.has(n.empresa_id)) byEmpresa.set(n.empresa_id, []);
        byEmpresa.get(n.empresa_id)!.push(n);
      });

      const list: CompanyNacional[] = (empresas ?? [])
        .map((e) => {
          const rows = byEmpresa.get(e.id) ?? [];
          if (rows.length === 0) return null;
          // Usa a média da nota_final entre todas as distribuidoras da empresa
          const validRows = rows.filter((r: any) => Number(r.nota_final) > 0);
          const avgNota = validRows.length > 0
            ? validRows.reduce((sum: number, r: any) => sum + (Number(r.nota_final) || 0), 0) / validRows.length
            : 0;
          // Usa a linha com maior nota_final como referência dos campos individuais
          const refRow = validRows.length > 0
            ? validRows.reduce((best: any, r: any) => Number(r.nota_final) > Number(best.nota_final) ? r : best)
            : rows[0];
          const score    = Math.round(avgNota * 100) / 100;
          const discount = Number(refRow.desconto_percentual) || 0;
          const legal    = Number(refRow.seguranca_juridica) || 0;
          const rep      = Number(refRow.reputacao_reclame_aqui) || 0;
          const minVal   = Number(refRow.valor_minimo_fatura) || 0;
          // Nível de risco mais frequente
          const riscos = rows.map((r) => r.nivel_risco).filter(Boolean);
          const nivelRisco = riscos.length
            ? riscos.sort((a: string, b: string) =>
                riscos.filter((v: string) => v === b).length - riscos.filter((v: string) => v === a).length
              )[0]
            : null;

          return {
            rank: 0,
            name: e.nome,
            discount: `${discount.toFixed(0)}%`,
            legalSecurity: legal.toFixed(1).replace(".", ","),
            reputation: rep.toFixed(1).replace(".", ","),
            minValue: formatBRL(minVal),
            score: Number(score.toFixed(2)),
            partner: Boolean(e.parceira),
            cashbackPercentual: e.parceira && (e as any).cashback_percentual ? (e as any).cashback_percentual : null,
            descontoAte1mwh: (e as any).desconto_ate_1mwh ?? null,
            desconto1a3mwh: (e as any).desconto_1a3mwh ?? null,
            desconto3a5mwh: (e as any).desconto_3a5mwh ?? null,
            descontoAcima5mwh: (e as any).desconto_acima_5mwh ?? null,
            empresaId: e.id,
            estadosCount: new Set(rows.map((r: any) => r.distribuidora_id)).size,
            tipoFornecedor: (e as any).tipo_fornecedor ?? null,
            logoUrl: (e as any).logo_url ?? null,
            nivelRisco,
          } as CompanyNacional;
        })
        .filter(Boolean) as CompanyNacional[];

      // Calcular estadosCount via distribuidoras→estado
      const { data: distribs } = await supabase
        .from("distribuidoras")
        .select("id, estado_id");
      const distMap = new Map<string, number>();
      (distribs ?? []).forEach((d) => distMap.set(d.id, d.estado_id));

      list.forEach((c) => {
        const rows = byEmpresa.get(c.empresaId!) ?? [];
        const estados = new Set(rows.map((r: any) => distMap.get(r.distribuidora_id)).filter(Boolean));
        c.estadosCount = estados.size;
      });

      // Aplicar bônus de cobertura: min(10, nota_média + (estados/27) × 2)
      list.forEach((c) => {
        const bonus = (c.estadosCount / 27) * 2;
        c.score = Math.min(10, Math.round((c.score + bonus) * 100) / 100);
      });

      setCompanies(list);
      setBronzeCompanies((bronze ?? []) as BronzeEmpresa[]);
      setLoading(false);
    };
    load();
  }, []);

  const sortedCompanies = useMemo(() => {
    const arr = [...companies];
    arr.sort((a, b) => {
      const va = getSortValue(a, sortKey);
      const vb = getSortValue(b, sortKey);
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return arr.map((c, idx) => ({ ...c, rank: idx + 1 }));
  }, [companies, sortKey, sortDir]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Ranking Nacional de Comercializadoras | Poupe Energia"
        description="Ranking nacional consolidado de todas as comercializadoras de energia avaliadas pela Poupe Energia."
      />
      <Header />

      <main className="flex-1">
        <section className="container mx-auto px-4 pt-8 pb-16">
          <header className="max-w-3xl mx-auto text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-blue leading-tight">
              Ranking Nacional de Comercializadoras
            </h1>
            <p className="mt-1 text-base md:text-xl font-normal text-gray-500">
              Todas as empresas avaliadas pela Poupe Energia
            </p>
          </header>

          {/* Aviso */}
          <div className="max-w-4xl mx-auto mb-6">
            <div className="flex gap-3 bg-blue-50 border border-blue-200 text-brand-blue rounded-xl p-4 text-sm">
              <Info className="h-5 w-5 shrink-0 mt-0.5" />
              <p>
                A nota exibida é a média das notas obtidas pela comercializadora
                em todas as distribuidoras onde atua. Para ver o ranking
                específico da sua distribuidora,{" "}
                <a href="/" className="font-semibold underline">
                  acesse a página inicial
                </a>
                .
              </p>
            </div>
          </div>

          {/* Total + Sort */}
          <div className="max-w-4xl mx-auto w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <p className="text-sm font-semibold text-brand-blue">
              {sortedCompanies.length + bronzeCompanies.length} empresas avaliadas
            </p>
            <div className="flex items-center gap-3">
              <label htmlFor="sort-select" className="text-sm font-semibold text-brand-blue whitespace-nowrap">
                Ordenar por:
              </label>
              <Select
                value={`${sortKey}-${sortDir}` as SortOptionValue}
                onValueChange={(v) => {
                  const { key, dir } = parseSortValue(v as SortOptionValue);
                  setSortKey(key);
                  setSortDir(dir);
                }}
              >
                <SelectTrigger id="sort-select" className="rounded-xl bg-white min-w-[260px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_SELECT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : sortedCompanies.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Nenhuma comercializadora avaliada ainda.
            </p>
          ) : (
            <div className="max-w-4xl mx-auto space-y-5">
              {sortedCompanies.map((c) => (
                <div key={c.empresaId} className="space-y-1">
                  <CompanyCard company={c} hideActions />
                  <p className="text-xs text-muted-foreground pl-2">
                    Atua em {c.estadosCount} {c.estadosCount === 1 ? "estado" : "estados"}
                  </p>
                </div>
              ))}

              {/* Botão Ver mais ofertas */}
              {!showBronze && bronzeCompanies.length > 0 && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => setShowBronze(true)}
                    className="inline-flex items-center gap-2 bg-brand-yellow text-brand-blue font-bold px-10 py-3 rounded-xl shadow-md hover:bg-brand-yellow/90 transition-colors"
                  >
                    Ver mais ofertas <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Lista bronze */}
              {showBronze && bronzeCompanies.length > 0 && (
                <div className="mt-4">
                  <div className="h-px w-full bg-border mb-4" />
                  <div className="flex flex-col gap-2">
                    {bronzeCompanies.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between gap-4 bg-white border border-border rounded-xl px-4 py-3 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 shrink-0 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                            <span className="text-sm font-extrabold text-brand-blue">
                              {b.nome.trim().charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-brand-blue text-sm truncate block">{b.nome}</span>
                            <span className="text-[11px] text-muted-foreground">Intermediadora</span>
                          </div>
                        </div>
                        {b.site_url && (
                          <a
                            href={b.site_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 inline-flex items-center gap-1.5 bg-brand-blue text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-brand-blue/90 transition-colors whitespace-nowrap"
                          >
                            Ir para o site
                          </a>
                        )}
                      </div>
                    ))}
                    <div className="flex justify-center mt-2">
                      <button
                        onClick={() => setShowBronze(false)}
                        className="text-sm font-semibold text-brand-blue/70 hover:text-brand-blue underline underline-offset-2 transition-colors"
                      >
                        Ocultar representantes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <BackToTop />
      <Footer />
    </div>
  );
};

export default RankingNacional;
