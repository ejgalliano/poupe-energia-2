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
  Clock,
  AlertTriangle,
  Shield,
  ExternalLink,
  MessageCircle,
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
import LeadCaptureDialog from "@/components/LeadCaptureDialog";
import SupplierBadge, { SUPPLIER_TIERS, TipoFornecedor } from "@/components/SupplierBadge";

const formatBRL = (n: number | null | undefined) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }).format(Number(n));

const NI = () => <span className="text-muted-foreground/70 italic">Não informado</span>;

const Stars = ({ score }: { score: number }) => {
  const full = Math.round(score / 2);
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
      {value ?? <NI />}
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
  const [captureOpen, setCaptureOpen] = useState(false);

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
    empresa.grupo_economico ||
    empresa.estados_atuacao;

  const hasOperacional =
    (empresa.fontes_geracao && empresa.fontes_geracao.length) ||
    empresa.possui_usina_propria != null ||
    empresa.modelo_infraestrutura ||
    empresa.meses_fidelidade != null ||
    empresa.multa_cancelamento != null ||
    empresa.aviso_previo_dias != null ||
    empresa.taxa_adesao != null ||
    empresa.indice_reajuste ||
    empresa.desconto_divulgado ||
    empresa.tipo_desconto ||
    empresa.incide_sobre ||
    empresa.economia_minima_garantida != null ||
    empresa.consumo_minimo != null ||
    empresa.prazo_ativacao ||
    empresa.modelo_billing ||
    (empresa.canais_atendimento && empresa.canais_atendimento.length) ||
    empresa.reputacao_reclame_aqui != null ||
    empresa.numero_reclamacoes_ra != null ||
    empresa.avaliacao_google != null ||
    empresa.processos_judiciais != null;

  const hasAnalise =
    empresa.vantagens || empresa.pontos_atencao || empresa.parecer_tecnico || empresa.arquetipo;

  const hasCancel =
    empresa.cancel_email ||
    empresa.cancel_ouvidoria ||
    empresa.cancel_telefone ||
    empresa.cancel_site ||
    empresa.cancel_processo ||
    empresa.cancel_dicas ||
    empresa.cancel_recorrer ||
    empresa.cancel_aviso_previo != null;

  const vantagens = (empresa.vantagens ?? "")
    .split(/\n+/)
    .map((s: string) => s.trim())
    .filter(Boolean);
  const pontos = (empresa.pontos_atencao ?? "")
    .split(/\n+/)
    .map((s: string) => s.trim())
    .filter(Boolean);

  const reputacaoLabel = empresa.reputacao_reclame_aqui != null
    ? `${Number(empresa.reputacao_reclame_aqui).toFixed(1).replace(".", ",")}/10${
        empresa.numero_reclamacoes_ra != null
          ? ` (${empresa.numero_reclamacoes_ra} reclamações)`
          : ""
      }`
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <SEO
        title={`${empresa.nome} — Ficha Técnica e Avaliação | Poupe Energia`}
        description={
          empresa.parecer_tecnico
            ? String(empresa.parecer_tecnico).slice(0, 160)
            : `Ficha técnica completa de ${empresa.nome}: desconto, segurança jurídica, reputação e guia de cancelamento.`
        }
      />
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

              {/* Selo de classificação */}
              {(() => {
                const tipo = (empresa.tipo_fornecedor ?? "intermediador") as TipoFornecedor;
                const tier = SUPPLIER_TIERS[tipo];
                return (
                  <div className="mt-3 inline-flex flex-col gap-2 bg-muted/50 border border-border rounded-xl p-3">
                    <SupplierBadge tipo={tipo} size="lg" showLabel />
                    <p className="text-sm text-muted-foreground max-w-xl">
                      <span className="font-semibold text-brand-blue">{tier.label}:</span>{" "}
                      {tier.description}
                    </p>
                  </div>
                );
              })()}

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
                  <Field label="Razão Social" value={empresa.razao_social} />
                  <Field label="CNPJ" value={empresa.cnpj} />
                  <Field label="Fundação" value={empresa.fundacao} />
                  <Field label="Sede" value={empresa.sede} />
                  <Field
                    label="Área de Atuação"
                    value={empresa.estados_atuacao}
                  />
                  <Field
                    label="Grupo Econômico"
                    value={empresa.grupo_economico}
                  />
                </div>
              </Block>
            )}

            {hasOperacional && (
              <Block title="Atributos Operacionais">
                <div>
                  <Field
                    label="Fonte de Geração"
                    value={
                      empresa.fontes_geracao?.length
                        ? empresa.fontes_geracao.join(", ")
                        : null
                    }
                  />
                  <Field
                    label="Infraestrutura"
                    value={
                      empresa.modelo_infraestrutura ||
                      (empresa.possui_usina_propria != null
                        ? empresa.possui_usina_propria
                          ? "Usina Própria"
                          : "Consórcio / Cooperativa"
                        : null)
                    }
                  />
                  <Field
                    label="Fidelidade"
                    value={
                      empresa.meses_fidelidade != null
                        ? `${empresa.meses_fidelidade} meses`
                        : null
                    }
                  />
                  <Field
                    label="Multa de Cancelamento"
                    value={
                      empresa.multa_cancelamento != null
                        ? `${empresa.multa_cancelamento}%`
                        : null
                    }
                  />
                  <Field
                    label="Aviso Prévio"
                    value={
                      empresa.aviso_previo_dias != null
                        ? `${empresa.aviso_previo_dias} dias`
                        : null
                    }
                  />
                  <Field
                    label="Taxa de Adesão"
                    value={
                      empresa.taxa_adesao != null
                        ? formatBRL(empresa.taxa_adesao)
                        : null
                    }
                  />
                  <Field
                    label="Índice de Reajuste"
                    value={empresa.indice_reajuste}
                  />
                  <Field
                    label="Desconto Divulgado"
                    value={empresa.desconto_divulgado}
                  />
                  <Field
                    label="Tipo de Desconto"
                    value={empresa.tipo_desconto}
                  />
                  <Field label="Incide Sobre" value={empresa.incide_sobre} />
                  <Field
                    label="Economia Mínima Garantida"
                    value={
                      empresa.economia_minima_garantida != null
                        ? empresa.economia_minima_garantida
                          ? "Sim"
                          : "Não"
                        : null
                    }
                  />
                  <Field
                    label="Consumo Mínimo"
                    value={
                      empresa.consumo_minimo != null
                        ? formatBRL(empresa.consumo_minimo)
                        : null
                    }
                  />
                  <Field
                    label="Prazo de Ativação"
                    value={empresa.prazo_ativacao}
                  />
                  <Field
                    label="Modelo de Billing"
                    value={empresa.modelo_billing}
                  />
                  <Field
                    label="Canais de Atendimento"
                    value={
                      empresa.canais_atendimento?.length
                        ? empresa.canais_atendimento.join(", ")
                        : null
                    }
                  />
                  <Field
                    label="Reputação Reclame Aqui"
                    value={reputacaoLabel}
                  />
                  <Field
                    label="Avaliação Google"
                    value={
                      empresa.avaliacao_google != null
                        ? `${Number(empresa.avaliacao_google)
                            .toFixed(1)
                            .replace(".", ",")}/5`
                        : null
                    }
                  />
                  <Field
                    label="Processos Judiciais Relevantes"
                    value={
                      empresa.processos_judiciais != null
                        ? empresa.processos_judiciais
                          ? "Sim"
                          : "Não"
                        : null
                    }
                  />
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
                    <h3 className="font-bold text-brand-success mb-3 flex items-center gap-2">
                      ✅ Vantagens Competitivas
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {vantagens.map((v: string, i: number) => (
                        <div
                          key={i}
                          className="bg-brand-success/10 border border-brand-success/30 rounded-xl p-3 text-sm text-foreground"
                        >
                          {v}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {pontos.length > 0 && (
                  <div className="mb-5">
                    <h3 className="font-bold text-brand-yellow mb-3 flex items-center gap-2">
                      ⚠️ Pontos de Atenção
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {pontos.map((p: string, i: number) => (
                        <div
                          key={i}
                          className="bg-brand-yellow/15 border border-brand-yellow/40 rounded-xl p-3 text-sm text-foreground"
                        >
                          {p}
                        </div>
                      ))}
                    </div>
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
                {/* Canais oficiais */}
                <h3 className="font-bold text-brand-blue mb-3">
                  Canais Oficiais
                </h3>
                <div className="grid md:grid-cols-2 gap-3 mb-5">
                  {empresa.cancel_email && (
                    <a
                      href={`mailto:${empresa.cancel_email}`}
                      className="flex items-center gap-2 p-3 border border-border rounded-lg text-sm hover:bg-muted/50"
                    >
                      <Mail className="h-4 w-4 text-brand-blue shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground">E-mail principal</div>
                        <div className="truncate font-medium">{empresa.cancel_email}</div>
                      </div>
                    </a>
                  )}
                  {empresa.cancel_ouvidoria && (
                    <a
                      href={`mailto:${empresa.cancel_ouvidoria}`}
                      className="flex items-center gap-2 p-3 border border-border rounded-lg text-sm hover:bg-muted/50"
                    >
                      <Shield className="h-4 w-4 text-brand-blue shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground">Ouvidoria</div>
                        <div className="truncate font-medium">{empresa.cancel_ouvidoria}</div>
                      </div>
                    </a>
                  )}
                  {empresa.cancel_telefone && (
                    <a
                      href={`tel:${empresa.cancel_telefone.replace(/\D/g, "")}`}
                      className="flex items-center gap-2 p-3 border border-border rounded-lg text-sm hover:bg-muted/50"
                    >
                      <Phone className="h-4 w-4 text-brand-blue shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground">Telefone / WhatsApp</div>
                        <div className="truncate font-medium">{empresa.cancel_telefone}</div>
                      </div>
                    </a>
                  )}
                  {empresa.cancel_site && (
                    <a
                      href={empresa.cancel_site}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 p-3 border border-border rounded-lg text-sm hover:bg-muted/50"
                    >
                      <Globe className="h-4 w-4 text-brand-blue shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground">Área do cliente</div>
                        <div className="truncate font-medium">Acessar site</div>
                      </div>
                    </a>
                  )}
                </div>

                {/* Aviso prévio destaque */}
                {empresa.cancel_aviso_previo != null && (
                  <div className="inline-flex items-center gap-2 bg-brand-yellow/20 text-brand-blue px-4 py-2 rounded-full text-sm font-bold mb-5">
                    <Clock className="h-4 w-4" />
                    {empresa.cancel_aviso_previo} dias de aviso prévio
                  </div>
                )}

                {/* Forma oficial */}
                {empresa.cancel_processo && (
                  <div className="mb-5">
                    <h3 className="font-bold text-brand-blue mb-2">
                      Forma Oficial de Cancelamento
                    </h3>
                    <p className="text-sm whitespace-pre-line text-muted-foreground leading-relaxed">
                      {empresa.cancel_processo}
                    </p>
                  </div>
                )}

                {/* Dicas */}
                {empresa.cancel_dicas && (
                  <div className="mb-5">
                    <h3 className="font-bold text-brand-blue mb-2">
                      Dicas ao consumidor
                    </h3>
                    <ul className="space-y-2">
                      {empresa.cancel_dicas
                        .split(/\n+/)
                        .map((s: string) => s.trim())
                        .filter(Boolean)
                        .map((dica: string, i: number) => (
                          <li
                            key={i}
                            className="flex gap-2 items-start text-sm text-foreground bg-muted/40 rounded-lg p-3"
                          >
                            <AlertTriangle className="h-4 w-4 text-brand-yellow shrink-0 mt-0.5" />
                            <span>{dica}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {/* Onde recorrer */}
                <div>
                  <h3 className="font-bold text-brand-blue mb-3">
                    Onde recorrer
                  </h3>
                  {empresa.cancel_recorrer && (
                    <p className="text-sm whitespace-pre-line text-muted-foreground mb-3">
                      {empresa.cancel_recorrer}
                    </p>
                  )}
                  <div className="grid sm:grid-cols-3 gap-3">
                    <a
                      href="https://www.consumidor.gov.br"
                      target="_blank"
                      rel="noreferrer"
                      className="border border-border rounded-xl p-4 hover:border-brand-blue hover:bg-brand-blue/5 transition"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <MessageCircle className="h-4 w-4 text-brand-blue" />
                        <span className="font-bold text-sm text-brand-blue">
                          Consumidor.gov.br
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Plataforma pública da Senacon
                      </p>
                    </a>
                    <a
                      href="https://www.procon.sp.gov.br"
                      target="_blank"
                      rel="noreferrer"
                      className="border border-border rounded-xl p-4 hover:border-brand-blue hover:bg-brand-blue/5 transition"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="h-4 w-4 text-brand-blue" />
                        <span className="font-bold text-sm text-brand-blue">
                          Procon
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Mediação no seu estado
                      </p>
                    </a>
                    <a
                      href="https://www.aneel.gov.br"
                      target="_blank"
                      rel="noreferrer"
                      className="border border-border rounded-xl p-4 hover:border-brand-blue hover:bg-brand-blue/5 transition"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <ExternalLink className="h-4 w-4 text-brand-blue" />
                        <span className="font-bold text-sm text-brand-blue">
                          ANEEL (167)
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Regulação da GD
                      </p>
                    </a>
                  </div>
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

            {empresa.tipo_fornecedor !== "intermediador" && (
              <>
                <Button
                  onClick={() => {
                    if (!empresa?.id) return;
                    setCaptureOpen(true);
                  }}
                  className="w-full bg-brand-success hover:bg-brand-success/90 text-white rounded-xl h-12 font-bold"
                >
                  <Zap className="h-4 w-4 mr-2" fill="currentColor" />
                  Ver plano e Aderir
                </Button>

                {empresa?.id && (
                  <LeadCaptureDialog
                    open={captureOpen}
                    onOpenChange={setCaptureOpen}
                    empresaId={empresa.id}
                    empresaNome={empresa.nome}
                    distribuidoraId={distribuidoraId || null}
                    estadoSigla={estadoSigla || null}
                  />
                )}
              </>
            )}

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
      <BackToTop />
    </div>
  );
};

export default Empresa;
