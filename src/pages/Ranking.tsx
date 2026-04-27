import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowRight, Home, Building2, MapPin } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CompanyCard, { Company } from "@/components/CompanyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import BusinessLeadDialog from "@/components/BusinessLeadDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import BackToTop from "@/components/BackToTop";
import LoadingSpinner from "@/components/LoadingSpinner";

type Profile = "home" | "business";

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

const getSortValue = (c: Company, key: SortKey): number => {
  switch (key) {
    case "score": return c.score;
    case "discount": return parseFloat(String(c.discount).replace("%", "").replace(",", ".")) || 0;
    case "legalSecurity": return parseFloat(String(c.legalSecurity).replace(",", ".")) || 0;
    case "reputation": return parseFloat(String(c.reputation).replace(",", ".")) || 0;
    case "minValue": return parseNum(c.minValue);
  }
};

interface Estado {
  id: number;
  sigla: string;
  nome: string;
}
interface Distribuidora {
  id: string;
  nome: string;
  estado_id: number;
}

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(n);

const Ranking = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const estadoSigla = searchParams.get("estado") ?? "";
  const distribuidoraId = searchParams.get("distribuidora") ?? "";

  const [estados, setEstados] = useState<Estado[]>([]);
  const [distribuidoras, setDistribuidoras] = useState<Distribuidora[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  // Form state (search card)
  const initialProfile = (searchParams.get("perfil") as Profile) || "home";
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [formEstadoId, setFormEstadoId] = useState<string>("");
  const [formDistribuidoraId, setFormDistribuidoraId] = useState<string>(distribuidoraId);
  const [formDistribuidoras, setFormDistribuidoras] = useState<Distribuidora[]>([]);
  const [accepted, setAccepted] = useState(true);
  const [businessOpen, setBusinessOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Carrega estados
  useEffect(() => {
    supabase
      .from("estados")
      .select("*")
      .order("nome")
      .then(({ data }) => setEstados(data ?? []));
  }, []);

  // Sincroniza estado do formulário com a sigla da URL
  useEffect(() => {
    if (estados.length === 0) return;
    const e = estados.find((x) => x.sigla === estadoSigla);
    if (e) setFormEstadoId(String(e.id));
  }, [estados, estadoSigla]);

  // Carrega distribuidoras do estado selecionado no formulário
  useEffect(() => {
    if (!formEstadoId) {
      setFormDistribuidoras([]);
      return;
    }
    supabase
      .from("distribuidoras")
      .select("*")
      .eq("estado_id", Number(formEstadoId))
      .order("nome")
      .then(({ data }) => setFormDistribuidoras(data ?? []));
  }, [formEstadoId]);

  const canSubmit = formEstadoId && formDistribuidoraId && accepted;

  const handleBuscar = () => {
    if (!canSubmit) return;
    const estado = estados.find((e) => String(e.id) === formEstadoId);
    setSearchParams({
      estado: estado?.sigla ?? "",
      distribuidora: formDistribuidoraId,
      perfil: profile,
    });
    setMobileFiltersOpen(false);
  };

  const estadoAtual = useMemo(
    () => estados.find((e) => e.sigla === estadoSigla),
    [estados, estadoSigla]
  );

  // Carrega distribuidoras do estado
  useEffect(() => {
    if (!estadoAtual) {
      setDistribuidoras([]);
      return;
    }
    supabase
      .from("distribuidoras")
      .select("*")
      .eq("estado_id", estadoAtual.id)
      .order("nome")
      .then(({ data }) => setDistribuidoras(data ?? []));
  }, [estadoAtual]);

  const distribuidoraAtual = useMemo(
    () => distribuidoras.find((d) => d.id === distribuidoraId),
    [distribuidoras, distribuidoraId]
  );

  // Carrega ranking (recalcula em tempo real e persiste no banco)
  useEffect(() => {
    if (!distribuidoraId) {
      setCompanies([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase.functions
      .invoke("recalc-ranking", { body: { distribuidora_id: distribuidoraId } })
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          setCompanies([]);
          setLoading(false);
          return;
        }
        const rows = (data?.rows ?? []) as any[];
        const mapped: Company[] = rows.map((row, idx) => ({
          rank: idx + 1,
          name: row.empresas?.nome ?? "Empresa",
          discount: `${Number(row.desconto_percentual)}%`,
          legalSecurity: Number(row.seguranca_juridica)
            .toFixed(1)
            .replace(".", ","),
          reputation: Number(row.reputacao_reclame_aqui)
            .toFixed(1)
            .replace(".", ","),
          minValue: formatBRL(Number(row.valor_minimo_fatura)),
          score: Number(row.nota_final),
          partner: Boolean(row.empresas?.parceira),
          estado: estadoSigla,
          distribuidora: distribuidoraAtual?.nome,
          empresaId: row.empresa_id,
          distribuidoraId: distribuidoraId,
          tipoFornecedor: row.empresas?.tipo_fornecedor ?? null,
        }));
        setCompanies(mapped);
        setLoading(false);
      });
  }, [distribuidoraId, estadoSigla, distribuidoraAtual?.nome]);


  const sortedCompanies = useMemo(() => {
    const arr = [...companies];
    arr.sort((a, b) => {
      const va = getSortValue(a, sortKey);
      const vb = getSortValue(b, sortKey);
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return arr;
  }, [companies, sortKey, sortDir]);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast({
      title: "Tudo certo!",
      description: "Avisaremos assim que tivermos ofertas para sua região.",
    });
    setEmail("");
  };

  const seoTitle =
    estadoAtual && distribuidoraAtual
      ? `Ranking de Comercializadoras — ${estadoAtual.nome} / ${distribuidoraAtual.nome} | Poupe Energia`
      : "Ranking de Comercializadoras | Poupe Energia";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title={seoTitle}
        description="Ranking transparente das melhores comercializadoras de energia para sua distribuidora."
      />
      <Header />

      {(() => {
        const formContent = (
          <>
            {/* Tabs */}
            <div className="flex border-b border-border mb-6">
              <button
                onClick={() => setProfile("home")}
                className={`flex-1 flex items-center justify-center gap-2 pb-3 text-sm md:text-base font-bold transition relative ${
                  profile === "home"
                    ? "text-brand-blue"
                    : "text-muted-foreground hover:text-brand-blue"
                }`}
              >
                <Home className="h-4 w-4" />
                Para minha Casa
                {profile === "home" && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue rounded-t-full" />
                )}
              </button>
              <button
                onClick={() => setProfile("business")}
                className={`flex-1 flex items-center justify-center gap-2 pb-3 text-sm md:text-base font-bold transition relative ${
                  profile === "business"
                    ? "text-brand-blue"
                    : "text-muted-foreground hover:text-brand-blue"
                }`}
              >
                <Building2 className="h-4 w-4" />
                Para minha Empresa
                {profile === "business" && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue rounded-t-full" />
                )}
              </button>
            </div>

            {/* Dropdowns */}
            <div className="grid md:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-sm font-bold text-brand-blue mb-2">
                  Seu Estado:
                </label>
                <Select
                  value={formEstadoId}
                  onValueChange={(v) => {
                    setFormEstadoId(v);
                    setFormDistribuidoraId("");
                  }}
                >
                  <SelectTrigger className="rounded-xl h-12 bg-background border-border">
                    <SelectValue placeholder="Selecione seu estado" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {estados.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.sigla} — {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-bold text-brand-blue mb-2">
                  Sua Distribuidora:
                </label>
                <Select
                  value={formDistribuidoraId}
                  onValueChange={setFormDistribuidoraId}
                  disabled={!formEstadoId}
                >
                  <SelectTrigger className="rounded-xl h-12 bg-background border-border disabled:opacity-60">
                    <SelectValue
                      placeholder={
                        formEstadoId
                          ? "Selecione a distribuidora"
                          : "Escolha um estado primeiro"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {formDistribuidoras.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Checkbox */}
            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <Checkbox
                checked={accepted}
                onCheckedChange={(v) => setAccepted(v === true)}
                className="mt-0.5"
              />
              <span className="text-sm text-brand-blue/80 leading-relaxed">
                Concordo com a{" "}
                <a href="/politica-de-privacidade" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-blue underline">
                  Política de Privacidade
                </a>{" "}
                e com os{" "}
                <a href="/termos-de-uso" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-blue underline">
                  Termos de Uso
                </a>{" "}
                e autorizo o uso dos meus dados.
              </span>
            </label>

            {/* CTA */}
            {profile === "home" ? (
              <Button
                onClick={handleBuscar}
                disabled={!canSubmit}
                className="w-full h-12 bg-brand-blue text-white hover:bg-brand-blue/90 rounded-xl font-bold text-base shadow-md disabled:opacity-50"
              >
                Buscar economia <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setBusinessOpen(true);
                  setMobileFiltersOpen(false);
                }}
                className="w-full h-12 bg-brand-blue text-white hover:bg-brand-blue/90 rounded-xl font-bold text-base shadow-md"
              >
                👉 Pregão de Energia para Empresas <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </>
        );

        return (
          <>
            {/* Desktop: card completo */}
            <section className="hidden md:block container mx-auto px-4 py-6 md:py-8">
              <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-border/60 p-6 md:p-8">
                {formContent}
              </div>
            </section>

            {/* Mobile: barra compacta + drawer */}
            <section className="md:hidden container mx-auto px-4 py-3">
              <div className="flex items-center justify-between gap-3 bg-white rounded-xl shadow-sm border border-border/60 px-4 py-3">
                <div className="flex items-center gap-2 min-w-0 text-sm text-brand-blue font-semibold">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {estadoAtual?.sigla ?? "—"} / {distribuidoraAtual?.nome ?? "Selecione"}
                  </span>
                </div>
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="text-sm font-bold text-brand-blue whitespace-nowrap hover:underline"
                >
                  Alterar →
                </button>
              </div>
            </section>

            <Drawer open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <DrawerContent className="px-4 pb-6 max-h-[90vh] overflow-y-auto">
                <DrawerHeader className="px-0">
                  <DrawerTitle className="text-brand-blue">Alterar filtros</DrawerTitle>
                </DrawerHeader>
                {formContent}
              </DrawerContent>
            </Drawer>

            <BusinessLeadDialog open={businessOpen} onOpenChange={setBusinessOpen} />
          </>
        );
      })()}

      <main className="flex-1">
        <section className="container mx-auto px-4 pt-8 pb-16">
          <div className="max-w-4xl mx-auto mb-4">
            <a
              href="/"
              className="inline-block text-sm font-medium px-3 py-1 hover:underline"
              style={{ color: "#1E3A5F" }}
            >
              ← Ir para Home
            </a>
          </div>
          <header className="max-w-3xl mx-auto text-center mb-8">
            {/* Mobile: mantém comportamento atual em uma linha */}
            <h1 className="md:hidden text-2xl font-extrabold text-brand-blue leading-tight">
              Ranking de Comercializadoras
              {estadoAtual && distribuidoraAtual && (
                <>
                  {" "}— {estadoAtual.nome} / {distribuidoraAtual.nome}
                </>
              )}
            </h1>
            {/* Desktop: hierarquia em duas linhas */}
            <div className="hidden md:block">
              <h1 className="text-3xl font-bold text-brand-blue leading-tight">
                Ranking de Comercializadoras
              </h1>
              {estadoAtual && distribuidoraAtual && (
                <p className="mt-1 text-xl font-normal text-gray-500">
                  {estadoAtual.nome} / {distribuidoraAtual.nome}
                </p>
              )}
            </div>
          </header>

          {/* Total + Ordenação (desktop + mobile) */}
          <div className="max-w-4xl mx-auto w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <span className="inline-flex items-center self-start sm:self-auto rounded-full bg-brand-blue/10 text-brand-blue text-sm font-semibold px-3 py-1">
              {sortedCompanies.length} {sortedCompanies.length === 1 ? "comercializadora avaliada" : "comercializadoras avaliadas"}
            </span>
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
                <SelectTrigger id="sort-select" className="rounded-xl h-10 w-auto min-w-[260px] bg-white border-border">
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

          <div className="max-w-4xl mx-auto flex flex-col gap-5">
            {loading && <LoadingSpinner label="Carregando ofertas..." />}

            {!loading && companies.length === 0 && distribuidoraId && (
              <div className="bg-white border border-border rounded-xl p-8 text-center max-w-xl mx-auto shadow-sm">
                <p className="text-brand-blue font-semibold mb-2 text-lg">
                  Ainda não temos empresas para essa distribuidora 😕
                </p>
                <p className="text-muted-foreground mb-5 text-sm">
                  Em breve teremos ofertas para sua região. Deixe seu contato e
                  te avisamos!
                </p>
                <form
                  onSubmit={handleNotify}
                  className="flex flex-col sm:flex-row gap-2"
                >
                  <Input
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl h-11"
                  />
                  <Button
                    type="submit"
                    className="bg-brand-blue text-white hover:bg-brand-blue/90 rounded-xl font-bold h-11 px-6"
                  >
                    Me avisa
                  </Button>
                </form>
              </div>
            )}

            {!loading &&
              sortedCompanies.map((c) => <CompanyCard key={c.name} company={c} />)}
          </div>

          {companies.length > 0 && (
            <div className="flex justify-center mt-10">
              <Button
                size="lg"
                className="bg-brand-yellow text-brand-blue hover:bg-brand-yellow/90 font-bold rounded-xl px-10 shadow-md"
              >
                Ver mais ofertas <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default Ranking;
