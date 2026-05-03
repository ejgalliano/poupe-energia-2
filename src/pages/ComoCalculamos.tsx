import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Search, RefreshCw, MessageSquare, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import BackToTop from "@/components/BackToTop";
import { Button } from "@/components/ui/button";

const pillars = [
  {
    icon: "💰",
    title: "Desconto inicial",
    weight: "40%",
    desc: "Consideramos apenas o desconto real garantido em contrato, em bandeira verde. Sem \"até X%\".",
  },
  {
    icon: "⚖️",
    title: "Segurança Jurídica",
    weight: "30%",
    desc: "Auditoria de cláusulas com base na Lei 14.300/2022, CDC e LGPD.",
  },
  {
    icon: "⭐",
    title: "Reputação",
    weight: "20%",
    desc: "Nota histórica do Reclame Aqui. Empresas novas recebem nota provisória 6,0.",
  },
  {
    icon: "🏠",
    title: "Acessibilidade",
    weight: "10%",
    desc: "Quanto menor o valor mínimo para adesão, maior a nota.",
  },
];

const garantias = [
  "Comparação justa entre empresas",
  "Foco em economia real, não promessa",
  "Proteção contra contratos abusivos",
  "Transparência para o consumidor",
];

const principios = [
  { icon: ShieldCheck, title: "Independência", desc: "O ranking não é influenciado por vendas ou parcerias." },
  { icon: Search, title: "Rastreabilidade", desc: "Toda nota tem base em contrato ou dado público." },
  { icon: RefreshCw, title: "Atualização contínua", desc: "Os dados são revisados periodicamente." },
  { icon: MessageSquare, title: "Direito de revisão", desc: "Empresas podem solicitar reavaliação com novos documentos." },
];

const ComoCalculamos = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Como Calculamos o Ranking | Poupe Energia"
        description="Metodologia técnica, transparente e independente do Ranking Poupe Energia."
      />
      <Header />

      {/* Hero */}
      <section className="bg-brand-blue text-white">
        <div className="container mx-auto px-4 py-16 md:py-24 text-center max-w-4xl">
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
            Como Calculamos o <span className="text-brand-yellow">Ranking</span>
          </h1>
          <p className="text-lg md:text-xl text-white/85 leading-relaxed">
            Uma metodologia técnica, transparente e independente para proteger o consumidor.
          </p>
        </div>
      </section>

      <main className="flex-1">
        {/* Destaque */}
        <section className="container mx-auto px-4 py-14 max-w-4xl">
          <div className="bg-brand-yellow/15 border-l-4 border-brand-yellow rounded-md p-5 shadow-sm">
            <p className="text-brand-blue font-bold text-lg">
              ⚠️ Empresas não podem pagar para melhorar posição.
            </p>
            <p className="text-foreground/80 text-sm mt-1">
              Parcerias comerciais não influenciam a nota.
            </p>
          </div>
        </section>

        {/* 4 Pilares */}
        <section className="container mx-auto px-4 pb-14 max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue text-center mb-10">
            Os 4 Pilares da Avaliação
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="bg-white border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl">{p.icon}</div>
                  <span className="bg-brand-yellow text-brand-blue text-xs font-extrabold px-3 py-1 rounded-full">
                    Peso {p.weight}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-brand-blue mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Fórmula */}
        <section className="bg-muted/40 py-14">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue text-center mb-8">
              Como a nota é calculada
            </h2>
            <div className="bg-brand-blue text-white rounded-2xl p-6 md:p-8 shadow-md text-center">
              <p className="text-base md:text-xl font-mono leading-relaxed">
                (Desconto × <span className="text-brand-yellow">40%</span>) +
                (Segurança × <span className="text-brand-yellow">30%</span>) +
                (Reputação × <span className="text-brand-yellow">20%</span>) +
                (Acessibilidade × <span className="text-brand-yellow">10%</span>)
              </p>
            </div>
          </div>
        </section>

        {/* O que isso garante */}
        <section className="container mx-auto px-4 py-14 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue text-center mb-8">
            O que isso garante
          </h2>
          <ul className="grid sm:grid-cols-2 gap-4">
            {garantias.map((g) => (
              <li
                key={g}
                className="flex items-start gap-3 bg-white border border-border rounded-xl p-4 shadow-sm"
              >
                <CheckCircle2 className="h-5 w-5 text-brand-success shrink-0 mt-0.5" />
                <span className="text-sm font-semibold text-brand-blue">{g}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Princípios */}
        <section className="bg-muted/40 py-14">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue text-center mb-10">
              Princípios do Ranking
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {principios.map((pr) => (
                <div
                  key={pr.title}
                  className="bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-12 w-12 rounded-xl bg-brand-blue/10 flex items-center justify-center mb-4">
                    <pr.icon className="h-6 w-6 text-brand-blue" />
                  </div>
                  <h3 className="font-extrabold text-brand-blue mb-1.5">{pr.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pr.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Texto final */}
        <section className="container mx-auto px-4 py-14 max-w-4xl">
          <div className="bg-white border border-border rounded-2xl p-8 shadow-sm text-center">
            <p className="text-lg md:text-xl text-brand-blue font-semibold leading-relaxed">
              O mercado de energia é complexo e pouco transparente. O Ranking Poupe Energia transforma informações técnicas em uma decisão simples, segura e comparável.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 pb-16 text-center">
          <Button
            asChild
            size="lg"
            className="bg-brand-yellow text-brand-blue hover:bg-brand-yellow/90 font-extrabold rounded-xl px-10 h-14 shadow-md text-base"
          >
            <Link to="/">
              Ver o Ranking Agora <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default ComoCalculamos;
