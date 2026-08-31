import { Link } from "react-router-dom";
import { ArrowRight, Mail, Phone, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import BackToTop from "@/components/BackToTop";
import { Button } from "@/components/ui/button";

const oQueFazemos = [
  {
    icon: "📊",
    title: "Comparador de Fornecedoras",
    desc: "Apresentamos um ranking estruturado com base em critérios objetivos, permitindo a comparação real entre empresas.",
  },
  {
    icon: "🛒",
    title: "Marketplace de Energia",
    desc: "Conectamos consumidores às melhores ofertas disponíveis, de forma simples, digital e sem burocracia.",
  },
];

const missao = [
  "Proteger o consumidor com informação clara e confiável",
  "Reduzir a complexidade do mercado de energia",
  "Estabelecer padrões de transparência e comparação",
  "Conectar consumidores às melhores oportunidades",
];

const pilares = [
  { icon: "💰", title: "Valor do desconto inicial", desc: "Economia real na conta de energia." },
  { icon: "⚖️", title: "Segurança jurídica", desc: "Contratos claros e confiáveis." },
  { icon: "⭐", title: "Reputação da empresa", desc: "Histórico, avaliações e presença no mercado." },
  { icon: "🏠", title: "Acessibilidade", desc: "Facilidade de adesão e valor mínimo exigido." },
];

const numeros = [
  { value: "23", label: "Estados + DF" },
  { value: "100+", label: "Fornecedoras avaliadas" },
  { value: "40+", label: "Distribuidoras cobertas" },
  { value: "4", label: "Pilares de análise" },
];

const Sobre = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Sobre a Poupe Energia | Comparador de Energia"
        description="O primeiro comparador independente de fornecedoras de energia elétrica do Brasil."
      />
      <Header />

      {/* Hero */}
      <section className="bg-brand-blue text-white">
        <div className="container mx-auto px-4 py-16 md:py-24 text-center max-w-4xl">
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
            Sobre a <span className="text-brand-yellow">Poupe Energia</span>
          </h1>
          <p className="text-lg md:text-xl text-white/85 leading-relaxed">
            O primeiro comparador independente de fornecedoras de energia elétrica do Brasil.
          </p>
        </div>
      </section>

      <main className="flex-1">
        {/* Abertura */}
        <section className="container mx-auto px-4 py-14 max-w-4xl">
          <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
            <p className="text-muted-foreground leading-relaxed">
              Nossa plataforma foi criada para trazer clareza a um mercado historicamente complexo,
              permitindo que consumidores e empresas encontrem, comparem e escolham as melhores opções
              de energia com segurança. Atuamos como um hub de inteligência e conexão, reunindo em um só
              lugar as principais fornecedoras do país e organizando suas ofertas de forma transparente,
              padronizada e acessível.
            </p>
          </div>
        </section>

        {/* O que fazemos */}
        <section className="container mx-auto px-4 pb-14 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue text-center mb-10">
            O que fazemos
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {oQueFazemos.map((c) => (
              <div
                key={c.title}
                className="bg-white border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-5xl mb-4">{c.icon}</div>
                <h3 className="text-lg font-extrabold text-brand-blue mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Missão */}
        <section className="bg-muted/40 py-14">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue text-center mb-8">
              Nossa missão
            </h2>
            <ul className="grid sm:grid-cols-2 gap-4">
              {missao.map((m) => (
                <li
                  key={m}
                  className="bg-white border border-border rounded-xl p-4 shadow-sm flex items-start gap-3"
                >
                  <div className="h-2 w-2 rounded-full bg-brand-yellow mt-2 shrink-0" />
                  <span className="text-sm font-semibold text-brand-blue">{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Como avaliamos */}
        <section className="container mx-auto px-4 py-14 max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue text-center mb-10">
            Como avaliamos as empresas
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pilares.map((p) => (
              <div
                key={p.title}
                className="bg-white border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-3">{p.icon}</div>
                <h3 className="font-extrabold text-brand-blue mb-1.5">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Por que existimos */}
        <section className="bg-muted/40 py-14">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue text-center mb-6">
              Por que a Poupe Energia existe
            </h2>
            <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
              <p className="text-muted-foreground leading-relaxed">
                O mercado de energia no Brasil sempre foi marcado por falta de transparência e dificuldade
                de comparação. A Poupe Energia nasce para mudar isso. Aqui, o consumidor deixa de depender
                de promessas e passa a tomar decisões com base em dados, critérios e comparação real.
              </p>
            </div>
          </div>
        </section>

        {/* Números */}
        <section className="bg-brand-blue text-white py-14">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-10">
              Nossos <span className="text-brand-yellow">Números</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {numeros.map((n) => (
                <div key={n.label} className="text-center">
                  <div className="text-4xl md:text-6xl font-extrabold text-brand-yellow leading-none mb-2">
                    {n.value}
                  </div>
                  <div className="text-sm text-white/80 font-semibold">{n.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Conceito da marca */}
        <section className="container mx-auto px-4 py-14 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue text-center mb-6">
            Conceito da marca
          </h2>
          <div className="bg-white border border-border rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-center gap-6">
            <img
              src="/logo-dark.png"
              alt="Poupe Energia"
              className="h-20 md:h-28 w-auto object-contain"
            />
            <p className="text-muted-foreground leading-relaxed text-center md:text-left">
              A mordida na lâmpada simboliza economia. Representa a parte da conta de energia que o consumidor
              deixa de pagar ao escolher melhor.{" "}
              <strong className="text-brand-blue">Poupe Energia é escolha inteligente.</strong>
            </p>
          </div>
        </section>

        {/* Contato */}
        <section className="container mx-auto px-4 pb-14 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue text-center mb-10">
            Contato
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <a
              href="mailto:contato.poupeenergia@hotmail.com"
              className="flex items-start gap-3 bg-white border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-10 w-10 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-brand-blue" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground font-semibold uppercase mb-0.5">Email</div>
                <div className="text-sm font-bold text-brand-blue truncate">
                  contato.poupeenergia@hotmail.com
                </div>
              </div>
            </a>
            <a
              href="tel:+5543996796546"
              className="flex items-start gap-3 bg-white border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-10 w-10 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5 text-brand-blue" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold uppercase mb-0.5">Telefone</div>
                <div className="text-sm font-bold text-brand-blue">(43) 99679-6546</div>
              </div>
            </a>
            <div className="flex items-start gap-3 bg-white border border-border rounded-xl p-5 shadow-sm sm:col-span-2">
              <div className="h-10 w-10 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-brand-blue" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold uppercase mb-0.5">Endereço</div>
                <div className="text-sm font-bold text-brand-blue">Londrina/PR</div>
              </div>
            </div>
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
              Comparar Empresas Agora <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default Sobre;
