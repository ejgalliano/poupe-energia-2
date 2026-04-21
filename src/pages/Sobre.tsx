import { Link } from "react-router-dom";
import {
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Building2,
  Lightbulb,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import BackToTop from "@/components/BackToTop";
import { Button } from "@/components/ui/button";

const missao = [
  {
    icon: "🛡️",
    title: "Proteger o consumidor",
    desc: "Eliminar assimetrias de informação no mercado de energia.",
  },
  {
    icon: "📊",
    title: "Organizar o mercado",
    desc: "Criar padrões de transparência e comparação.",
  },
  {
    icon: "🤝",
    title: "Fortalecer parcerias",
    desc: "Conectar consumidores às melhores opções com confiança.",
  },
];

const pilares = [
  {
    icon: "💰",
    title: "Valor do desconto",
    desc: "Economia real e clara na conta de energia.",
  },
  {
    icon: "⚖️",
    title: "Segurança jurídica",
    desc: "Contratos sólidos e transparentes.",
  },
  {
    icon: "⭐",
    title: "Reputação da empresa",
    desc: "Análise do histórico e avaliação pública.",
  },
  {
    icon: "🏠",
    title: "Valor mínimo para adesão",
    desc: "Acessibilidade para mais consumidores.",
  },
];

const numeros = [
  { value: "23", label: "Estados + DF" },
  { value: "36+", label: "Comercializadoras avaliadas" },
  { value: "40+", label: "Distribuidoras cobertas" },
  { value: "4", label: "Pilares de avaliação" },
];

const Sobre = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="bg-brand-blue text-white">
        <div className="container mx-auto px-4 py-16 md:py-24 text-center max-w-4xl">
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
            Sobre o <span className="text-brand-yellow">Poupe Energia</span>
          </h1>
          <p className="text-lg md:text-xl text-white/85 leading-relaxed">
            O primeiro comparador independente de comercializadoras de energia
            elétrica do Brasil.
          </p>
        </div>
      </section>

      <main className="flex-1">
        {/* Quem Somos */}
        <section className="container mx-auto px-4 py-14 max-w-4xl">
          <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue mb-5">
              Quem Somos
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A Poupe Energia é uma startup brasileira de energias renováveis
              criada para organizar, comparar e dar transparência ao mercado
              de energia, com foco em Geração Distribuída e Mercado Livre.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Fundada em Londrina, no Paraná, a Poupe Energia atua em{" "}
              <strong className="text-brand-blue">
                23 estados + Distrito Federal
              </strong>
              , conectando consumidores, parceiros comerciais e as melhores
              comercializadoras de energia do país.
            </p>
          </div>
        </section>

        {/* Missão */}
        <section className="container mx-auto px-4 pb-14 max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue text-center mb-10">
            Nossa Missão
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {missao.map((m) => (
              <div
                key={m.title}
                className="bg-white border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="text-5xl mb-4">{m.icon}</div>
                <h3 className="text-lg font-extrabold text-brand-blue mb-2">
                  {m.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Pilares */}
        <section className="bg-muted/40 py-14">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue text-center mb-10">
              Nossos 4 Pilares
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {pilares.map((p) => (
                <div
                  key={p.title}
                  className="bg-white border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="text-4xl mb-3">{p.icon}</div>
                  <h3 className="font-extrabold text-brand-blue mb-1.5">
                    {p.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Logomarca */}
        <section className="container mx-auto px-4 py-14 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue text-center mb-10">
            Significado da Logomarca
          </h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="flex justify-center">
              <div className="h-48 w-48 md:h-64 md:w-64 rounded-full bg-brand-blue flex items-center justify-center shadow-xl">
                <Lightbulb
                  className="h-24 w-24 md:h-32 md:w-32 text-brand-yellow"
                  fill="hsl(var(--brand-yellow))"
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <div>
              <p className="text-muted-foreground leading-relaxed mb-5">
                A mordida na lâmpada representa{" "}
                <strong className="text-brand-blue">economia</strong> — um
                pedaço da sua conta de luz foi removido.
              </p>
              <div className="bg-white border border-border rounded-xl overflow-hidden mb-5">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="p-3 font-bold text-brand-blue bg-muted/30">
                        Lâmpada
                      </td>
                      <td className="p-3 text-muted-foreground">
                        Energia e tradição
                      </td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-3 font-bold text-brand-blue bg-muted/30">
                        Mordida
                      </td>
                      <td className="p-3 text-muted-foreground">
                        Escolha e economia
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-brand-blue bg-muted/30">
                        Poupe Energia
                      </td>
                      <td className="p-3 text-muted-foreground">
                        Inteligência e liberdade
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-brand-yellow/15 border-l-4 border-brand-yellow rounded-md p-4">
                <p className="text-brand-blue font-extrabold text-lg">
                  "A mordida é o que você deixa de pagar."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Números */}
        <section className="bg-brand-blue text-white py-14">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-10">
              Poupe Energia em <span className="text-brand-yellow">Números</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {numeros.map((n) => (
                <div key={n.label} className="text-center">
                  <div className="text-4xl md:text-6xl font-extrabold text-brand-yellow leading-none mb-2">
                    {n.value}
                  </div>
                  <div className="text-sm text-white/80 font-semibold">
                    {n.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contato */}
        <section className="container mx-auto px-4 py-14 max-w-4xl">
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
                <div className="text-xs text-muted-foreground font-semibold uppercase mb-0.5">
                  Email
                </div>
                <div className="text-sm font-bold text-brand-blue truncate">
                  contato.poupeenergia@hotmail.com
                </div>
              </div>
            </a>
            <a
              href="tel:+554396796546"
              className="flex items-start gap-3 bg-white border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-10 w-10 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5 text-brand-blue" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold uppercase mb-0.5">
                  Telefone
                </div>
                <div className="text-sm font-bold text-brand-blue">
                  (43) 99679-6546
                </div>
              </div>
            </a>
            <div className="flex items-start gap-3 bg-white border border-border rounded-xl p-5 shadow-sm sm:col-span-2">
              <div className="h-10 w-10 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-brand-blue" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold uppercase mb-0.5">
                  Endereço
                </div>
                <div className="text-sm font-bold text-brand-blue">
                  Av. Paraná, 427 Sala 201 Edif. Metrópole — Londrina/PR —
                  86010-920
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white border border-border rounded-xl p-5 shadow-sm sm:col-span-2">
              <div className="h-10 w-10 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-brand-blue" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold uppercase mb-0.5">
                  CNPJ
                </div>
                <div className="text-sm font-bold text-brand-blue">
                  64.498.960/0001-06
                </div>
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
    </div>
  );
};

export default Sobre;
