import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  Globe,
  Zap,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import BackToTop from "@/components/BackToTop";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/slug";

const formatBRL = (n: number | null | undefined) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }).format(Number(n));

const Stars = ({ score }: { score: number }) => {
  const full = Math.round(score / 2); // 0-10 -> 0-5 stars
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${
            i < full ? "fill-brand-yellow text-brand-yellow" : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
};

const Block = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="bg-white border border-border rounded-2xl p-6 shadow-sm">
    <h2 className="text-xl font-extrabold text-brand-blue mb-5">{title}</h2>
    {children}
  </section>
);

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="py-2.5 border-b border-border last:border-0 flex justify-between gap-4">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-semibold text-brand-blue text-right">
      {value}
    </span>
  </div>
);

const SJ_ITEMS: { key: string; label: string }[] = [
  { key: "conformidade_lei_14300", label: "Conformidade Lei 14.300/22" },
  { key: "creditos_scee_rescisao", label: "Créditos SCEE na rescisão" },
  { key: "equilibrio_contratual_cdc", label: "Equilíbrio contratual (CDC)" },
  { key: "boa_fe_objetiva", label: "Boa-fé objetiva (Código Civil)" },
  { key: "limites_multa", label: "Limites de multa" },
  { key: "aviso_previo_90_dias", label: "Aviso prévio ≤ 90 dias" },
  { key: "protecao_dados_lgpd", label: "Proteção de dados (LGPD)" },
  { key: "transparencia_tarifaria", label: "Transparência tarifária" },
  { key: "responsabilidade_injecao", label: "Responsabilidade por injeção" },
  { key: "foro_consumidor", label: "Foro no domicílio do consumidor" },
];

const Empresa = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const estadoSigla = searchParams.get("estado") ?? "";
  const distribuidoraId = searchParams.get("distribuidora") ?? "";

  const [empresa, setEmpresa] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [nota, setNota] = useState<any | null>(null);
  const [scorecard, setScorecard] = useState<any | null>(null);
  const [rankPos, setRankPos] = useState<number | null>(null);
  const [distribuidoraNome, setDistribuidoraNome] = useState<string>("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: empresas } = await supabase
        .from("empresas")
        .select("*")
        .eq("ativa", true);
      const found = (empresas ?? []).find((e: any) => slugify(e.nome) === slug);
      setEmpresa(found ?? null);

      if (found && distribuidoraId) {
        const { data: notas } = await supabase
          .from("notas_empresas")
          .select("*")
          .eq("distribuidora_id", distribuidoraId)
          .order("nota_final", { ascending: false });
        const idx = (notas ?? []).findIndex((n: any) => n.empresa_id === found.id);
        if (idx >= 0) {
          setNota(notas![idx]);
          setRankPos(idx + 1);
          const { data: sc } = await supabase
            .from("scorecard_sj")
            .select("*")
            .eq("nota_empresa_id", notas![idx].id)
            .maybeSingle();
          setScorecard(sc ?? null);
        }
        const { data: dist } = await supabase
          .from("distribuidoras")
          .select("nome")
          .eq("id", distribuidoraId)
          .maybeSingle();
        if (dist) setDistribuidoraNome(dist.nome);
      }
      setLoading(false);
    })();
  }, [slug, distribuidoraId]);

  const sjCount = useMemo(() => {
    if (!scorecard) return null;
    return SJ_ITEMS.reduce((acc, i) => acc + (scorecard[i.key] ? 1 : 0), 0);
  }, [scorecard]);

  const backLink = useMemo(() => {
    const p = new URLSearchParams();
    if (estadoSigla) p.set("estado", estadoSigla);
    if (distribuidoraId) p.set("distribuidora", distribuidoraId);
    const q = p.toString();
    return q ? `/ranking?${q}` : "/ranking";
  }, [estadoSigla, distribuidoraId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          <LoadingSpinner label="Carregando empresa..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-brand-blue mb-4">
            Empresa não encontrada
          </h1>
          <Button asChild>
            <Link to="/ranking">Voltar ao Ranking</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const initial = empresa.nome.trim().charAt(0).toUpperCase();
  const score = nota ? Number(nota.nota_final) : null;
  const estados = (empresa.estados_atuacao ?? "")
    .split(/[,;]/)
    .map((s: string) => s.trim())
    .filter(Boolean);

  const hasCadastro =
    empresa.razao_social ||
    empresa.cnpj ||
    empresa.fundacao ||
    empresa.sede ||
    empresa.grupo_economico;

  const hasOperacional =
    (empresa.fontes_geracao && empresa.fontes_geracao.length) ||
    empresa.possui_usina_propria != null ||
    empresa.meses_fidelidade != null ||
    empresa.multa_cancelamento != null ||
    empresa.aviso_previo_dias != null ||
    empresa.taxa_adesao != null ||
    empresa.desconto_divulgado ||
    empresa.consumo_minimo != null ||
    empresa.prazo_ativacao ||
    empresa.modelo_billing ||
    (empresa.canais_atendimento && empresa.canais_atendimento.length) ||
    empresa.reputacao_reclame_aqui != null ||
    empresa.avaliacao_google != null;

  const hasAnalise =
    empresa.vantagens || empresa.pontos_atencao || empresa.parecer_tecnico;

  const hasCancel =
    empresa.cancel_email ||
    empresa.cancel_telefone ||
    empresa.cancel_site ||
    empresa.cancel_processo ||
    empresa.cancel_dicas ||
    empresa.cancel_recorrer;

  const vantagens = (empresa.vantagens ?? "")
    .split(/\n+/)
    .map((s: string) => s.trim())
    .filter(Boolean);
  const pontos = (empresa.pontos_atencao ?? "")
    .split(/\n+/)
    .map((s: string) => s.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <Button
          asChild
          variant="ghost"
          className="mb-4 text-brand-blue hover:bg-brand-blue/10"
        >
          <Link to={backLink}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao Ranking
          </Link>
        </Button>

        {/* Header empresa */}
        <section className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="h-20 w-20 shrink-0 rounded-2xl bg-brand-blue/10 flex items-center justify-center overflow-hidden">
              {empresa.logo_url ? (
                <img
                  src={empresa.logo_url}
                  alt={empresa.nome}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-4xl font-extrabold text-brand-blue">
                  {initial}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-extrabold text-brand-blue leading-tight">
                {empresa.nome}
              </h1>
              <div className="flex flex-wrap gap-2 mt-3">
                {empresa.arquetipo && (
                  <Badge className="bg-brand-blue text-white hover:bg-brand-blue/90">
                    {empresa.arquetipo}
                  </Badge>
                )}
                {estados.map((e: string) => (
                  <Badge
                    key={e}
                    variant="secondary"
                    className="bg-muted text-muted-foreground"
                  >
                    {e}
                  </Badge>
                ))}
              </div>
              {score != null && (
                <div className="mt-4 flex items-center gap-3">
                  <div className="text-3xl font-extrabold text-brand-blue">
                    {score.toFixed(1).replace(".", ",")}
                  </div>
                  <Stars score={score} />
                  <span className="text-sm text-muted-foreground">
                    Nota Geral
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="flex flex-col gap-6 min-w-0">
            {hasCadastro && (
              <Block title="Dados Cadastrais">
                <div>
                  {empresa.razao_social && (
                    <Field label="Razão Social" value={empresa.razao_social} />
                  )}
                  {empresa.cnpj && <Field label="CNPJ" value={empresa.cnpj} />}
                  {empresa.fundacao && (
                    <Field label="Fundação" value={empresa.fundacao} />
                  )}
                  {empresa.sede && <Field label="Sede" value={empresa.sede} />}
                  {empresa.grupo_economico && (
                    <Field
                      label="Grupo Econômico"
                      value={empresa.grupo_economico}
                    />
                  )}
                </div>
              </Block>
            )}

            {hasOperacional && (
              <Block title="Atributos Operacionais">
                <div>
                  {empresa.fontes_geracao?.length > 0 && (
                    <Field
                      label="Fontes de Geração"
                      value={empresa.fontes_geracao.join(", ")}
                    />
                  )}
                  <Field
                    label="Usina Própria"
                    value={empresa.possui_usina_propria ? "Sim" : "Não"}
                  />
                  {empresa.modelo_infraestrutura && (
                    <Field
                      label="Modelo de Infraestrutura"
                      value={empresa.modelo_infraestrutura}
                    />
                  )}
                  <Field
                    label="Fidelidade"
                    value={`${empresa.meses_fidelidade ?? 0} meses`}
                  />
                  <Field
                    label="Multa de Cancelamento"
                    value={`${empresa.multa_cancelamento ?? 0}%`}
                  />
                  <Field
                    label="Aviso Prévio"
                    value={`${empresa.aviso_previo_dias ?? 0} dias`}
                  />
                  <Field
                    label="Taxa de Adesão"
                    value={formatBRL(empresa.taxa_adesao)}
                  />
                  {empresa.desconto_divulgado && (
                    <Field
                      label="Desconto Divulgado"
                      value={empresa.desconto_divulgado}
                    />
                  )}
                  {empresa.tipo_desconto && (
                    <Field
                      label="Tipo de Desconto"
                      value={empresa.tipo_desconto}
                    />
                  )}
                  {empresa.incide_sobre && (
                    <Field label="Incide Sobre" value={empresa.incide_sobre} />
                  )}
                  {empresa.consumo_minimo != null && (
                    <Field
                      label="Consumo Mínimo"
                      value={formatBRL(empresa.consumo_minimo)}
                    />
                  )}
                  {empresa.prazo_ativacao && (
                    <Field
                      label="Prazo de Ativação"
                      value={empresa.prazo_ativacao}
                    />
                  )}
                  {empresa.modelo_billing && (
                    <Field
                      label="Modelo de Billing"
                      value={empresa.modelo_billing}
                    />
                  )}
                  {empresa.canais_atendimento?.length > 0 && (
                    <Field
                      label="Canais de Atendimento"
                      value={empresa.canais_atendimento.join(", ")}
                    />
                  )}
                  {empresa.reputacao_reclame_aqui != null && (
                    <Field
                      label="Reclame Aqui"
                      value={`${Number(empresa.reputacao_reclame_aqui)
                        .toFixed(1)
                        .replace(".", ",")}/10`}
                    />
                  )}
                  {empresa.avaliacao_google != null && (
                    <Field
                      label="Avaliação Google"
                      value={`${Number(empresa.avaliacao_google)
                        .toFixed(1)
                        .replace(".", ",")}/5`}
                    />
                  )}
                </div>
              </Block>
            )}

            {scorecard && (
              <Block title="Scorecard de Segurança Jurídica">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-extrabold text-brand-blue">
                    {sjCount}
                  </span>
                  <span className="text-muted-foreground font-semibold">
                    /10
                  </span>
                </div>
                <ul className="space-y-2">
                  {SJ_ITEMS.map((item) => {
                    const ok = !!scorecard[item.key];
                    return (
                      <li
                        key={item.key}
                        className="flex items-center gap-2 text-sm"
                      >
                        {ok ? (
                          <CheckCircle2 className="h-5 w-5 text-brand-success shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive shrink-0" />
                        )}
                        <span className={ok ? "text-foreground" : "text-muted-foreground"}>
                          {item.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </Block>
            )}

            {hasAnalise && (
              <Block title="Análise Crítica">
                {vantagens.length > 0 && (
                  <div className="mb-5">
                    <h3 className="font-bold text-brand-success mb-2">
                      ✅ Vantagens
                    </h3>
                    <ul className="space-y-1.5 list-disc pl-5 text-sm">
                      {vantagens.map((v: string, i: number) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {pontos.length > 0 && (
                  <div className="mb-5">
                    <h3 className="font-bold text-brand-yellow mb-2">
                      ⚠️ Pontos de Atenção
                    </h3>
                    <ul className="space-y-1.5 list-disc pl-5 text-sm">
                      {pontos.map((p: string, i: number) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {empresa.parecer_tecnico && (
                  <div className="bg-brand-blue text-white rounded-xl p-5 mt-4">
                    <h3 className="font-bold mb-2">Parecer Técnico</h3>
                    <p className="text-sm leading-relaxed whitespace-pre-line">
                      {empresa.parecer_tecnico}
                    </p>
                  </div>
                )}
              </Block>
            )}

            {hasCancel && (
              <Block title="Guia de Cancelamento">
                <div className="grid md:grid-cols-3 gap-3 mb-5">
                  {empresa.cancel_email && (
                    <a
                      href={`mailto:${empresa.cancel_email}`}
                      className="flex items-center gap-2 p-3 border border-border rounded-lg text-sm hover:bg-muted/50"
                    >
                      <Mail className="h-4 w-4 text-brand-blue" />
                      <span className="truncate">{empresa.cancel_email}</span>
                    </a>
                  )}
                  {empresa.cancel_telefone && (
                    <a
                      href={`tel:${empresa.cancel_telefone}`}
                      className="flex items-center gap-2 p-3 border border-border rounded-lg text-sm hover:bg-muted/50"
                    >
                      <Phone className="h-4 w-4 text-brand-blue" />
                      <span className="truncate">
                        {empresa.cancel_telefone}
                      </span>
                    </a>
                  )}
                  {empresa.cancel_site && (
                    <a
                      href={empresa.cancel_site}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 p-3 border border-border rounded-lg text-sm hover:bg-muted/50"
                    >
                      <Globe className="h-4 w-4 text-brand-blue" />
                      <span className="truncate">Site de cancelamento</span>
                    </a>
                  )}
                </div>

                {empresa.cancel_processo && (
                  <div className="mb-4">
                    <h3 className="font-bold text-brand-blue mb-1.5">
                      Processo de Cancelamento
                    </h3>
                    <p className="text-sm whitespace-pre-line text-muted-foreground">
                      {empresa.cancel_processo}
                    </p>
                  </div>
                )}
                {empresa.cancel_aviso_previo != null && (
                  <Field
                    label="Aviso prévio"
                    value={`${empresa.cancel_aviso_previo} dias`}
                  />
                )}
                {empresa.cancel_dicas && (
                  <div className="mt-4">
                    <h3 className="font-bold text-brand-blue mb-1.5">
                      Dicas ao consumidor
                    </h3>
                    <p className="text-sm whitespace-pre-line text-muted-foreground">
                      {empresa.cancel_dicas}
                    </p>
                  </div>
                )}
                <div className="mt-4">
                  <h3 className="font-bold text-brand-blue mb-1.5">
                    Onde recorrer
                  </h3>
                  {empresa.cancel_recorrer ? (
                    <p className="text-sm whitespace-pre-line text-muted-foreground mb-2">
                      {empresa.cancel_recorrer}
                    </p>
                  ) : null}
                  <ul className="text-sm space-y-1">
                    <li>
                      <a
                        href="https://www.aneel.gov.br"
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-blue underline"
                      >
                        ANEEL
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.consumidor.gov.br"
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-blue underline"
                      >
                        Consumidor.gov.br
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.procon.sp.gov.br"
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-blue underline"
                      >
                        Procon
                      </a>
                    </li>
                  </ul>
                </div>
              </Block>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-6 self-start bg-white border border-border rounded-2xl p-6 shadow-sm">
            {score != null && (
              <div className="text-center mb-5">
                <div className="text-5xl font-extrabold text-brand-blue leading-none">
                  {score.toFixed(1).replace(".", ",")}
                </div>
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-1">
                  Nota Geral
                </div>
                <div className="flex justify-center mt-2">
                  <Stars score={score} />
                </div>
              </div>
            )}

            {rankPos && distribuidoraNome && (
              <div className="bg-muted/50 rounded-xl p-3 text-center mb-4">
                <div className="text-xs text-muted-foreground">
                  Ranking em {distribuidoraNome}
                </div>
                <div className="text-lg font-extrabold text-brand-blue">
                  {rankPos}º lugar
                </div>
              </div>
            )}

            <Button className="w-full bg-brand-success hover:bg-brand-success/90 text-white rounded-xl h-12 font-bold">
              <Zap className="h-4 w-4 mr-2" fill="currentColor" />
              Ver plano e Aderir
            </Button>

            {empresa.parceira && (
              <div className="mt-3 inline-flex w-full items-center justify-center gap-1.5 bg-brand-yellow/20 text-brand-blue px-3 py-2 rounded-full text-xs font-bold">
                ⚡ 10% de cashback na adesão
              </div>
            )}

            <Button
              asChild
              variant="outline"
              className="w-full mt-3 rounded-xl"
            >
              <Link to={backLink}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao Ranking
              </Link>
            </Button>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Empresa;
