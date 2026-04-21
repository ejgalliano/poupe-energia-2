import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Search,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const sjItems = [
  "Conformidade com a Lei 14.300/2022",
  "Devolução de créditos SCEE em caso de rescisão",
  "Equilíbrio contratual conforme CDC",
  "Boa-fé objetiva (Código Civil)",
  "Limites razoáveis de multa de cancelamento",
  "Aviso prévio de no máximo 90 dias",
  "Proteção de dados pessoais (LGPD)",
  "Transparência tarifária na fatura",
  "Responsabilidade clara por injeção de energia",
  "Foro no domicílio do consumidor",
];

const pillars = [
  {
    icon: "💰",
    title: "Desconto na Conta",
    weight: "40%",
    desc: "Usamos apenas o desconto mínimo garantido em contrato em Bandeira Verde. Proibido o uso do termo \"até X%\".",
    formula: "Nota = (Desconto da Empresa ÷ Maior Desconto do Mercado) × 10",
  },
  {
    icon: "⚖️",
    title: "Segurança Jurídica",
    weight: "30%",
    desc: "Auditoria de 10 itens contratuais baseados na Lei 14.300/2022 e no Código de Defesa do Consumidor.",
    list: sjItems,
  },
  {
    icon: "⭐",
    title: "Reputação Reclame Aqui",
    weight: "20%",
    desc: "Usamos a Nota Geral histórica do Reclame Aqui. Empresas novas recebem nota provisória 6,0.",
  },
  {
    icon: "🏠",
    title: "Valor Mínimo para Adesão",
    weight: "10%",
    desc: "Valorizamos empresas que atendem consumidores com faturas a partir de R$ 100.",
    formula: "Nota = max(0, min(10, (1000 − Valor Mínimo) ÷ 900 × 10))",
  },
];

const principios = [
  {
    icon: ShieldCheck,
    title: "Isenção Comercial",
    desc: "Separação total entre o ranking editorial e o marketplace. Empresas não pagam para melhorar suas notas.",
  },
  {
    icon: Search,
    title: "Rastreabilidade",
    desc: "Toda nota tem fonte verificável: contrato, scorecard jurídico e histórico Reclame Aqui.",
  },
  {
    icon: RefreshCw,
    title: "Atualização Contínua",
    desc: "O ranking é revisado periodicamente conforme novos contratos e dados são publicados.",
  },
  {
    icon: MessageSquare,
    title: "Direito de Contestação",
    desc: "Empresas podem enviar novos contratos e documentos para reavaliação a qualquer momento.",
  },
];

const ComoCalculamos = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="bg-brand-blue text-white">
        <div className="container mx-auto px-4 py-16 md:py-24 text-center max-w-4xl">
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
            Como Calculamos o Ranking{" "}
            <span className="text-brand-yellow">Poupe Energia</span>
          </h1>
          <p className="text-lg md:text-xl text-white/85 leading-relaxed">
            Uma metodologia técnica, transparente e independente para proteger
            o consumidor de energia.
          </p>
        </div>
      </section>

      <main className="flex-1">
        {/* Introdução */}
        <section className="container mx-auto px-4 py-14 max-w-4xl">
          <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue mb-4">
              Um sistema multicritério, à prova de marketing
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              O ranking Poupe Energia avalia comercializadoras de energia em{" "}
              <strong className="text-brand-blue">4 pilares objetivos</strong>:
              desconto real, segurança jurídica, reputação pública e
              acessibilidade. Cada pilar tem um peso definido tecnicamente,
              gerando uma nota final de 0 a 10.
            </p>
            <div className="bg-brand-yellow/15 border-l-4 border-brand-yellow rounded-md p-4 mt-5">
              <p className="text-brand-blue font-bold">
                ⚠️ Não vendemos posições no ranking.
              </p>
              <p className="text-sm text-foreground/80 mt-1">
                Empresas não podem pagar para melhorar a nota. Parceiras de
                cashback aparecem com selo, mas seguem o mesmo critério técnico
                de qualquer outra.
              </p>
            </div>
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
                <h3 className="text-xl font-extrabold text-brand-blue mb-2">
                  {p.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {p.desc}
                </p>
                {p.formula && (
                  <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-lg p-3 font-mono text-xs md:text-sm text-brand-blue mt-auto">
                    {p.formula}
                  </div>
                )}
                {p.list && (
                  <ul className="space-y-1.5 mt-2">
                    {p.list.map((it) => (
                      <li
                        key={it}
                        className="flex items-start gap-2 text-sm text-foreground/80"
                      >
                        <CheckCircle2 className="h-4 w-4 text-brand-success shrink-0 mt-0.5" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Fórmula final */}
        <section className="bg-muted/40 py-14">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue text-center mb-8">
              A Fórmula Final
            </h2>
            <div className="bg-brand-blue text-white rounded-2xl p-6 md:p-8 shadow-md text-center">
              <p className="text-sm uppercase tracking-wider text-brand-yellow font-bold mb-3">
                Nota Final
              </p>
              <p className="text-base md:text-xl font-mono leading-relaxed">
                (Desconto × <span className="text-brand-yellow">40%</span>) +
                (Seg. Jurídica ×{" "}
                <span className="text-brand-yellow">30%</span>) + (Reputação ×{" "}
                <span className="text-brand-yellow">20%</span>) +
                (Acessibilidade ×{" "}
                <span className="text-brand-yellow">10%</span>)
              </p>
            </div>

            <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm mt-6">
              <h3 className="font-extrabold text-brand-blue mb-4">
                Exemplo prático
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Empresa fictícia "Solar Brasil" na distribuidora COPEL/PR, onde
                o maior desconto do mercado é 15%:
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <strong>Desconto:</strong> 15% → (15 ÷ 15) × 10 ={" "}
                  <strong className="text-brand-blue">10,0</strong>
                </li>
                <li>
                  <strong>Segurança Jurídica:</strong> 9 itens marcados ={" "}
                  <strong className="text-brand-blue">9,0</strong>
                </li>
                <li>
                  <strong>Reputação Reclame Aqui:</strong>{" "}
                  <strong className="text-brand-blue">8,9</strong>
                </li>
                <li>
                  <strong>Valor mínimo R$ 100:</strong> max(0, min(10, (1000 −
                  100) ÷ 900 × 10)) ={" "}
                  <strong className="text-brand-blue">10,0</strong>
                </li>
              </ul>
              <div className="bg-brand-yellow/15 border-l-4 border-brand-yellow rounded-md p-4 mt-5 font-mono text-sm">
                (10 × 0,4) + (9,0 × 0,3) + (8,9 × 0,2) + (10 × 0,1) ={" "}
                <strong className="text-brand-blue">9,48 → 9,5</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Princípios */}
        <section className="container mx-auto px-4 py-14 max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue text-center mb-10">
            Princípios de Governança
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
                <h3 className="font-extrabold text-brand-blue mb-1.5">
                  {pr.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pr.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Selos */}
        <section className="bg-muted/40 py-14">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-xl md:text-2xl font-extrabold text-brand-blue mb-6">
              Selos de Credibilidade
            </h2>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {["ANEEL", "PROCON", "Lei 14.300/2022", "CDC"].map((s) => (
                <div
                  key={s}
                  className="bg-white border-2 border-brand-blue/20 rounded-xl px-6 py-3 font-extrabold text-brand-blue shadow-sm"
                >
                  {s}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Critérios baseados nas diretrizes da Agência Nacional de Energia
              Elétrica, Procon e Código Civil Brasileiro.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue mb-6">
            Pronto para encontrar a melhor empresa para você?
          </h2>
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
    </div>
  );
};

export default ComoCalculamos;
