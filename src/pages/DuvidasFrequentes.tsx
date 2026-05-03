import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import BackToTop from "@/components/BackToTop";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs: { q: string; a: string }[] = [
  { q: "O que é energia por assinatura?", a: "É um modelo em que você usa energia gerada por usinas (geralmente solares) sem precisar instalar nada. Você continua recebendo energia pela sua distribuidora, mas paga mais barato." },
  { q: "Eu preciso instalar placas solares?", a: "Não. Toda a geração acontece em usinas remotas. Você só recebe o benefício na conta." },
  { q: "Como eu economizo na prática?", a: "A usina gera créditos de energia para você. Esses créditos reduzem o valor da sua fatura mensal." },
  { q: "Vou trocar de concessionária?", a: "Não. Você continua com a mesma distribuidora (Copel, Enel, CPFL, etc.). Nada muda no fornecimento." },
  { q: "Existe algum custo para aderir?", a: "Não. Sem investimento, sem taxa de adesão e sem instalação." },
  { q: "Tem fidelidade ou multa?", a: "Depende da empresa. Por isso o ranking da Poupe Energia analisa esse ponto antes de recomendar." },
  { q: "A economia é garantida?", a: "Sim, desde que esteja prevista em contrato. A Poupe Energia considera apenas o desconto mínimo garantido, não promessas." },
  { q: "Posso cancelar quando quiser?", a: "Sim, mas pode existir aviso prévio ou multa, dependendo do contrato. Isso é avaliado no critério de segurança jurídica." },
  { q: "Em quanto tempo começo a economizar?", a: "Normalmente entre 60 e 90 dias após a adesão." },
  { q: "Falta energia ou muda a qualidade?", a: "Não. A energia continua vindo da mesma rede elétrica. A qualidade é exatamente a mesma." },
  { q: "É seguro?", a: "Sim. O modelo é regulamentado pela lei da Geração Distribuída (Lei 14.300/2022)." },
  { q: "Quem pode contratar?", a: "Pessoas físicas e jurídicas — Residências, comércios e Indústrias. Cada empresa tem um valor mínimo de conta para adesão." },
  { q: "Minha conta muda muito?", a: "Não. Você continuará recebendo a conta da distribuidora normalmente, além da cobrança da empresa de energia com o desconto aplicado. Em alguns casos, a cobrança pode vir em um único boleto, dependendo da empresa." },
  { q: "O que acontece se eu mudar de endereço?", a: "Você pode transferir ou cancelar o contrato, dependendo das regras da empresa." },
  { q: "Por que existem várias empresas oferecendo isso?", a: "Porque o mercado de energia está aberto no Brasil. Cada empresa tem condições, contratos e descontos diferentes — por isso comparar é essencial." },
  { q: "Como escolher a melhor empresa?", a: "Avalie 4 pontos: Desconto inicial, Segurança do contrato, Reputação e Facilidade de adesão. É exatamente isso que o Ranking Poupe Energia faz para você." },
];

const DuvidasFrequentes = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Dúvidas Frequentes | Poupe Energia"
        description="Respostas para as principais dúvidas sobre energia por assinatura e o Ranking Poupe Energia."
      />
      <Header />

      {/* Hero */}
      <section className="bg-brand-blue text-white">
        <div className="container mx-auto px-4 py-16 md:py-24 text-center max-w-4xl">
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
            Dúvidas <span className="text-brand-yellow">Frequentes</span>
          </h1>
          <p className="text-lg md:text-xl text-white/85 leading-relaxed">
            Encontre respostas para as principais dúvidas sobre energia por assinatura e o Ranking Poupe Energia.
          </p>
        </div>
      </section>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-14 max-w-3xl">
          <div className="bg-white border border-border rounded-2xl p-4 md:p-6 shadow-sm">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left text-brand-blue font-bold hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16 text-center">
          <Button
            asChild
            size="lg"
            className="bg-brand-yellow text-brand-blue hover:bg-brand-yellow/90 font-extrabold rounded-xl px-10 h-14 shadow-md text-base"
          >
            <Link to="/ranking">
              Ver o Ranking PE <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default DuvidasFrequentes;
