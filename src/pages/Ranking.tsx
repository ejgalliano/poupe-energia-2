import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CompanyCard, { Company } from "@/components/CompanyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

  // Carrega estados
  useEffect(() => {
    supabase
      .from("estados")
      .select("*")
      .order("sigla")
      .then(({ data }) => setEstados(data ?? []));
  }, []);

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
        }));
        setCompanies(mapped);
        setLoading(false);
      });
  }, [distribuidoraId, estadoSigla, distribuidoraAtual?.nome]);

  const handleEstadoChange = (sigla: string) => {
    setSearchParams({ estado: sigla, distribuidora: "" });
  };

  const handleDistribuidoraChange = (id: string) => {
    setSearchParams({ estado: estadoSigla, distribuidora: id });
  };

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast({
      title: "Tudo certo!",
      description: "Avisaremos assim que tivermos ofertas para sua região.",
    });
    setEmail("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Filtros sticky */}
      <div className="bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 grid md:grid-cols-2 gap-3 max-w-4xl">
          <div>
            <label className="block text-xs font-bold text-brand-blue mb-1.5">
              Estado
            </label>
            <Select value={estadoSigla} onValueChange={handleEstadoChange}>
              <SelectTrigger className="rounded-xl h-11 bg-background">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {estados.map((s) => (
                  <SelectItem key={s.id} value={s.sigla}>
                    {s.sigla} — {s.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-blue mb-1.5">
              Distribuidora
            </label>
            <Select
              value={distribuidoraId}
              onValueChange={handleDistribuidoraChange}
              disabled={!estadoSigla}
            >
              <SelectTrigger className="rounded-xl h-11 bg-background disabled:opacity-60">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {distribuidoras.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

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
            {loading && (
              <p className="text-center text-muted-foreground">
                Carregando ofertas...
              </p>
            )}

            {!loading && companies.length === 0 && distribuidoraId && (
              <div className="bg-white border border-border rounded-xl p-8 text-center max-w-xl mx-auto shadow-sm">
                <p className="text-brand-blue font-semibold mb-5">
                  Em breve teremos empresas disponíveis para sua região. Deixe
                  seu contato e te avisamos!
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
    </div>
  );
};

export default Ranking;
