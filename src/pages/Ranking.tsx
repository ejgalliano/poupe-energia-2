import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowRight, Home, Building2 } from "lucide-react";
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

  // Carrega estados
  useEffect(() => {
    supabase
      .from("estados")
      .select("*")
      .order("sigla")
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
        }));
        setCompanies(mapped);
        setLoading(false);
      });
  }, [distribuidoraId, estadoSigla, distribuidoraAtual?.nome]);


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

      {/* Filtros — mesmo card de busca da home */}
      <section className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-border/60 p-6 md:p-8">
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
              <a href="#" className="font-semibold text-brand-blue underline">
                Política de Privacidade
              </a>{" "}
              e com o uso dos meus dados.
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
              onClick={() => setBusinessOpen(true)}
              className="w-full h-12 bg-brand-blue text-white hover:bg-brand-blue/90 rounded-xl font-bold text-base shadow-md"
            >
              Comparar Propostas para minha Empresa <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        <BusinessLeadDialog open={businessOpen} onOpenChange={setBusinessOpen} />
      </section>

      <main className="flex-1">
        <section className="container mx-auto px-4 pt-8 pb-16">
          <header className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-2xl md:text-4xl font-extrabold text-brand-blue leading-tight">
              Ranking de Comercializadoras
              {estadoAtual && distribuidoraAtual && (
                <>
                  {" "}— {estadoAtual.nome} / {distribuidoraAtual.nome}
                </>
              )}
            </h1>
          </header>

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
              companies.map((c) => <CompanyCard key={c.name} company={c} />)}
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
