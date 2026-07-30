import { Link } from "react-router-dom";
import {
  ArrowRight, ArrowDown, CheckCircle2, Zap, ShieldCheck, Banknote,
  Home, Building2, Search, Calculator, FileText, Star, AlertCircle,
  Plug, Wifi, HelpCircle
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import BackToTop from "@/components/BackToTop";
import { Button } from "@/components/ui/button";

const steps = [
  {
    n: 1,
    icon: Search,
    title: "Acesse o Ranking",
    desc: "Selecione seu estado e distribuidora. Em segundos você vê todas as fornecedoras disponíveis para a sua região, ordenadas da melhor para a pior.",
  },
  {
    n: 2,
    icon: Star,
    title: "Compare as empresas",
    desc: "Analise desconto real (não promessa), segurança jurídica do contrato, reputação no Reclame Aqui e acessibilidade. Tudo numa nota única e transparente.",
  },
  {
    n: 3,
    icon: Calculator,
    title: "Simule sua economia",
    desc: "Informe o valor da sua fatura e veja exatamente quanto vai economizar por mês com cada empresa. Sem enrolação.",
  },
  {
    n: 4,
    icon: Zap,
    title: "Ative o Cashback",
    desc: "Antes de assinar qualquer contrato, faça o cadastro em \"Ativar Cashback\". Esse passo garante que você receba o retorno financeiro após a adesão ser concluída.",
    highlight: true,
  },
  {
    n: 5,
    icon: FileText,
    title: "Aderir ao plano",
    desc: "Se a empresa for parceira da Poupe, o processo é 100% digital aqui mesmo. Se não for parceira, te redirecionamos para o site dela. Você decide, a gente facilita.",
  },
];

const beneficios = [
  {
    icon: Banknote,
    title: "Economia real na conta",
    desc: "Desconto garantido em contrato, todo mês, sem precisar instalar nada nem trocar de distribuidora.",
    color: "bg-green-50 text-green-700 border-green-200",
    iconColor: "text-green-600",
  },
  {
    icon: Zap,
    title: "Cashback na adesão",
    desc: "Ao contratar uma empresa parceira pela Poupe, você recebe um percentual de volta via Pix. Dinheiro de volta por uma decisão inteligente.",
    color: "bg-brand-yellow/10 text-brand-blue border-brand-yellow/30",
    iconColor: "text-brand-yellow",
  },
  {
    icon: ShieldCheck,
    title: "Segurança jurídica",
    desc: "Analisamos os contratos com base no CDC, Lei 14.300/2022 e LGPD. Você sabe o que está assinando antes de assinar.",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    iconColor: "text-blue-600",
  },
];

const naoMuda = [
  { icon: Plug, text: "Sua distribuidora continua a mesma (Copel, Enel, CPFL, etc.)" },
  { icon: Wifi, text: "A qualidade da energia é idêntica — mesma rede elétrica" },
  { icon: Home, text: "Nada para instalar, nenhuma obra, nenhum técnico" },
  { icon: Banknote, text: "Sem taxa de adesão, sem custo para usar a Poupe Energia" },
];

const cashbackSteps = [
  "Ativação da unidade consumidora na fornecedora",
  "Injeção ou compensação de créditos de energia",
  "Emissão da 1ª fatura do novo plano",
  "Pagamento integral da 1ª fatura pelo consumidor",
  "Validação pela fornecedora parceira e aprovação pela Poupe",
];

const faqs = [
  {
    q: "Quando começo a economizar?",
    a: "Normalmente entre 60 e 90 dias após a adesão, que é o tempo para a UC ser ativada e os créditos começarem a aparecer na sua conta.",
  },
  {
    q: "A Poupe Energia cobra alguma taxa?",
    a: "Não. O serviço é 100% gratuito para o consumidor. A Poupe ganha comissão das empresas parceiras, sem repassar nenhum custo para você.",
  },
  {
    q: "Posso cancelar depois de contratar?",
    a: "Sim, mas as condições de cancelamento (aviso prévio, multa) dependem do contrato de cada empresa. Por isso o ranking analisa esse ponto antes de recomendar.",
  },
  {
    q: "Pessoa jurídica também pode usar?",
    a: "Sim. Comércios, indústrias e empresas de qualquer porte podem acessar o mercado livre de energia. Cada fornecedora tem um valor mínimo de fatura para adesão.",
  },
  {
    q: "E se eu escolher uma empresa não parceira da Poupe?",
    a: "Sem problema. Te redirecionamos direto para o site dela. Nesse caso, não há cashback, mas a economia na conta continua valendo.",
  },
];

const ComoFunciona = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Como Funciona | Poupe Energia"
        description="Entenda como a Poupe Energia ajuda você a comparar fornecedoras de energia, economizar na conta de luz e ainda receber cashback na adesão."
      />
      <Header />

      {/* Hero */}
      <section className="bg-brand-blue text-white">
        <div className="container mx-auto px-4 py-16 md:py-24 text-center max-w-4xl">
          <p className="text-brand-yellow text-sm font-bold uppercase tracking-widest mb-3">Simples assim</p>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
            Como funciona a <span className="text-brand-yellow">Poupe Energia</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
            Compare fornecedoras de energia, escolha com segurança e ainda receba cashback — tudo de graça, sem instalar nada.
          </p>
        </div>
      </section>

      <main className="flex-1">

        {/* Para quem é */}
        <section className="container mx-auto px-4 py-14 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue text-center mb-10">
            Para quem é?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center mb-4">
                <Home className="h-7 w-7 text-brand-blue" />
              </div>
              <h3 className="text-xl font-extrabold text-brand-blue mb-2">Pessoa Física</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Moradores e autônomos que querem reduzir o valor da conta de energia elétrica em casa ou no escritório.
              </p>
              <ul className="space-y-2">
                {["Residências", "Autônomos e profissionais liberais", "Pequenos negócios informais"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                    <CheckCircle2 className="h-4 w-4 text-brand-success shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center mb-4">
                <Building2 className="h-7 w-7 text-brand-blue" />
              </div>
              <h3 className="text-xl font-extrabold text-brand-blue mb-2">Pessoa Jurídica</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Empresas que buscam reduzir custos operacionais com energia sem alterar a operação do negócio.
              </p>
              <ul className="space-y-2">
                {["Comércios e lojas", "Indústrias (Grupo A e B)", "Condomínios e edifícios comerciais"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                    <CheckCircle2 className="h-4 w-4 text-brand-success shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Cada fornecedora exige um valor mínimo de fatura para adesão — isso aparece no ranking para você comparar antes de decidir.
          </p>
        </section>

        {/* O que você ganha */}
        <section className="bg-muted/40 py-14">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue text-center mb-10">
              O que você ganha
            </h2>
            <div className="grid md:grid-cols-3 gap-5">
              {beneficios.map((b) => (
                <div key={b.title} className={`bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow ${b.color.split(' ')[2]}`}>
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${b.color.split(' ')[0]}`}>
                    <b.icon className={`h-6 w-6 ${b.iconColor}`} />
                  </div>
                  <h3 className="font-extrabold text-brand-blue mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Passo a passo */}
        <section className="container mx-auto px-4 py-14 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue text-center mb-3">
            Passo a passo
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Do ranking ao cashback em 5 etapas simples.
          </p>

          <div className="space-y-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.n}>
                  <div className={`flex gap-5 items-start bg-white rounded-2xl p-6 shadow-sm border transition-shadow hover:shadow-md ${step.highlight ? "border-brand-yellow/50 ring-1 ring-brand-yellow/30" : "border-border"}`}>
                    {/* Número */}
                    <div className={`shrink-0 h-11 w-11 rounded-xl flex items-center justify-center font-extrabold text-lg ${step.highlight ? "bg-brand-yellow text-brand-blue" : "bg-brand-blue text-white"}`}>
                      {step.n}
                    </div>
                    {/* Ícone + conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Icon className={`h-4 w-4 shrink-0 ${step.highlight ? "text-brand-yellow" : "text-brand-blue"}`} />
                        <h3 className="font-extrabold text-brand-blue">{step.title}</h3>
                        {step.highlight && (
                          <span className="text-[10px] font-extrabold bg-brand-yellow text-brand-blue px-2 py-0.5 rounded-full uppercase tracking-wide">
                            Importante
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="flex justify-center py-1">
                      <ArrowDown className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Como funciona o cashback */}
        <section className="bg-muted/40 py-14">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue text-center mb-3">
              Como funciona o cashback
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
              O cashback é pago uma única vez por adesão, via Pix, após 5 condições serem cumpridas. Prazo de até 60 dias após a última etapa.
            </p>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="space-y-3">
                {cashbackSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white border border-border rounded-xl p-4 shadow-sm">
                    <div className="shrink-0 h-7 w-7 rounded-full bg-brand-blue text-white text-xs font-extrabold flex items-center justify-center">
                      {i + 1}
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>

              <div className="bg-brand-yellow/15 border border-brand-yellow/40 rounded-2xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-brand-blue text-sm mb-1">Ative antes de contratar</p>
                    <p className="text-sm text-foreground/75 leading-relaxed">
                      O cadastro em "Ativar Cashback" precisa ser feito <strong>antes</strong> de assinar com a fornecedora. Quem não ativa antecipadamente perde o direito ao benefício.
                    </p>
                  </div>
                </div>
                <hr className="border-brand-yellow/30" />
                <div className="flex items-start gap-3">
                  <Banknote className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-brand-blue text-sm mb-1">Pagamento via Pix</p>
                    <p className="text-sm text-foreground/75 leading-relaxed">
                      O valor é depositado direto na sua chave Pix em até 60 dias após as 5 condições serem validadas.
                    </p>
                  </div>
                </div>
                <hr className="border-brand-yellow/30" />
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-brand-blue text-sm mb-1">Disponível para parceiras</p>
                    <p className="text-sm text-foreground/75 leading-relaxed">
                      Apenas empresas com o selo ⚡ de cashback no ranking participam. O percentual aparece visível antes de você decidir.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* O que NÃO muda */}
        <section className="container mx-auto px-4 py-14 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue text-center mb-3">
            O que <span className="text-brand-success">não muda</span> para você
          </h2>
          <p className="text-center text-muted-foreground mb-10">
            Mudar de fornecedora é mais simples do que parece.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {naoMuda.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="flex items-start gap-4 bg-white border border-border rounded-xl p-5 shadow-sm">
                  <div className="h-10 w-10 rounded-lg bg-brand-success/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-brand-success" />
                  </div>
                  <p className="text-sm font-semibold text-brand-blue leading-relaxed">{item.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Dúvidas rápidas */}
        <section className="bg-muted/40 py-14">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue text-center mb-10">
              Dúvidas rápidas
            </h2>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <div key={faq.q} className="bg-white border border-border rounded-xl p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-4 w-4 text-brand-blue shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-brand-blue text-sm mb-1">{faq.q}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Mais dúvidas?{" "}
              <Link to="/duvidas-frequentes" className="text-brand-blue font-semibold hover:underline">
                Veja todas as perguntas frequentes →
              </Link>
            </p>
          </div>
        </section>

        {/* CTA duplo */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue mb-3">
            Pronto para começar?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Compare as empresas no ranking e ative o cashback antes de contratar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-brand-yellow text-brand-blue hover:bg-brand-yellow/90 font-extrabold rounded-xl px-10 h-14 shadow-md text-base"
            >
              <Link to="/">
                Ver o Ranking <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-brand-blue text-brand-blue hover:bg-brand-blue/10 font-extrabold rounded-xl px-10 h-14 text-base"
            >
              <Link to="/ativar-cashback">
                <Zap className="mr-2 h-5 w-5" />
                Ativar Cashback
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default ComoFunciona;
