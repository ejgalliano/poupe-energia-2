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
import SEO from "@/components/SEO";
import BackToTop from "@/components/BackToTop";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Info } from "lucide-react";

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

const RankingNacional = () => {
  const [companies, setCompanies] = useState<CompanyNacional[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: empresas } = await supabase
        .from("empresas")
        .select("id, nome, parceira, ativa, tipo_fornecedor")
        .eq("ativa", true);

      const { data: notas } = await supabase
        .from("notas_empresas")
        .select("empresa_id, distribuidora_id, nota_final, desconto_percentual, seguranca_juridica, reputacao_reclame_aqui, valor_minimo_fatura");

      const byEmpresa = new Map<string, any[]>();
      (notas ?? []).forEach((n) => {
        if (!byEmpresa.has(n.empresa_id)) byEmpresa.set(n.empresa_id, []);
        byEmpresa.get(n.empresa_id)!.push(n);
      });

      const avg = (arr: number[]) =>
        arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

      const list: CompanyNacional[] = (empresas ?? [])
        .map((e) => {
          const rows = byEmpresa.get(e.id) ?? [];
          if (rows.length === 0) return null;
          const distinctDistribuidoras = new Set(rows.map((r) => r.distribuidora_id));
          // Approx: estados count via distribuidoras grouping (1 distribuidora ~ 1 estado typically)
          const score = avg(rows.map((r) => Number(r.nota_final) || 0));
          const discount = avg(rows.map((r) => Number(r.desconto_percentual) || 0));
          const legal = avg(rows.map((r) => Number(r.seguranca_juridica) || 0));
          const rep = avg(rows.map((r) => Number(r.reputacao_reclame_aqui) || 0));
          const minVal = avg(rows.map((r) => Number(r.valor_minimo_fatura) || 0));

          return {
            rank: 0,
            name: e.nome,
            discount: `${discount.toFixed(0)}%`,
            legalSecurity: legal.toFixed(1).replace(".", ","),
            reputation: rep.toFixed(1).replace(".", ","),
            minValue: formatBRL(minVal),
            score: Number(score.toFixed(2)),
            partner: Boolean(e.parceira),
            empresaId: e.id,
            estadosCount: distinctDistribuidoras.size,
            tipoFornecedor: (e as any).tipo_fornecedor ?? null,
          } as CompanyNacional;
        })
        .filter(Boolean) as CompanyNacional[];

      // Need distinct estados count, fetch distribuidoras→estado mapping
      const { data: distribs } = await supabase
        .from("distribuidoras")
        .select("id, estado_id");
      const distMap = new Map<string, number>();
      (distribs ?? []).forEach((d) => distMap.set(d.id, d.estado_id));

      list.forEach((c) => {
        const rows = byEmpresa.get(c.empresaId!) ?? [];
        const estados = new Set(rows.map((r) => distMap.get(r.distribuidora_id)).filter(Boolean));
        c.estadosCount = estados.size;
      });

      setCompanies(list);
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
                As notas exibidas representam a média de desempenho de cada
                comercializadora em todas as regiões onde atua. Para ver o
                ranking específico da sua distribuidora,{" "}
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
              {sortedCompanies.length} comercializadoras avaliadas
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
