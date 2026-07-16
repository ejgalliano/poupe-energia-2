import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import {
  CheckCircle2, Loader2, User, Mail, Phone, ChevronDown,
  Search, TrendingUp, Shield, DollarSign, BarChart3, Handshake,
} from "lucide-react";

const INPUT = "w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition bg-white placeholder:text-gray-400";

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function RadioGroup({
  label, value, onChange, options, cols = 2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  cols?: number;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>
      <div className={`grid gap-2 ${cols === 1 ? "grid-cols-1" : cols === 3 ? "grid-cols-3" : "grid-cols-2"} sm:grid-cols-${cols}`}>
        {options.map((o) => (
          <label
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`flex items-center gap-2.5 cursor-pointer border rounded-xl px-3 py-2.5 text-sm transition ${
              value === o.value
                ? "border-brand-blue bg-brand-blue/5 text-brand-blue font-medium"
                : "border-gray-200 hover:border-brand-blue/40 text-gray-600"
            }`}
          >
            <div className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
              value === o.value ? "border-brand-blue bg-brand-blue" : "border-gray-300"
            }`}>
              {value === o.value && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
            </div>
            {o.label}
          </label>
        ))}
      </div>
    </div>
  );
}

const PERFIS = [
  { value: "contabilidade", label: "Escritório de Contabilidade" },
  { value: "imobiliaria", label: "Imobiliária" },
  { value: "condominio", label: "Administradora de Condomínio" },
  { value: "solar", label: "Empresa de Energia Solar" },
  { value: "seguros", label: "Corretor de Seguros" },
  { value: "bancario", label: "Correspondente Bancário" },
  { value: "consultor", label: "Consultor Empresarial" },
  { value: "associacao", label: "Associação Comercial ou Cooperativa" },
  { value: "outro", label: "Outro" },
];

const QTD_CLIENTES = [
  { value: "menos50", label: "Menos de 50" },
  { value: "50a200", label: "50 a 200" },
  { value: "200a500", label: "200 a 500" },
  { value: "mais500", label: "Mais de 500" },
];

const benefits = [
  {
    emoji: "🔎",
    title: "Independência",
    desc: "Ofereça uma solução completa que não é sua, sem precisar montar uma estrutura do zero.",
  },
  {
    emoji: "📈",
    title: "Sempre atualizado",
    desc: "Nossas cotações e rankings são atualizados em tempo real, automaticamente.",
  },
  {
    emoji: "🛡️",
    title: "Credibilidade",
    desc: "Nossa metodologia independente reforça a confiança do seu cliente na indicação.",
  },
  {
    emoji: "💰",
    title: "Nova receita",
    desc: "Receba remuneração por cada cliente que aderir à plataforma através do seu credenciamento.",
  },
  {
    emoji: "📊",
    title: "Plataforma completa",
    desc: "Acesso exclusivo ao portal do parceiro com: ranking de distribuidoras, comparativo de preços, histórico de contratos, gestão de leads, relatórios de economia, suporte técnico dedicado e painel de acompanhamento em tempo real.",
  },
  {
    emoji: "🤝",
    title: "Suporte",
    desc: "Time dedicado para apoiar você e seus clientes em cada etapa do processo.",
  },
];

const quemPode = [
  "Escritórios de Contabilidade",
  "Imobiliárias",
  "Administradoras de Condomínio",
  "Empresas de Energia Solar",
  "Corretores de Seguros",
  "Correspondentes Bancários",
  "Consultores Empresariais",
  "Associações Comerciais e Cooperativas",
  "Empresas com carteira ativa de clientes",
];

const steps = [
  { n: "01", title: "Solicitar credenciamento", desc: "Preencha o formulário abaixo e aguarde nossa equipe entrar em contato." },
  { n: "02", title: "Conhecer a plataforma", desc: "Nossa equipe apresenta a plataforma, funcionalidades e modelo de remuneração." },
  { n: "03", title: "Acesso exclusivo", desc: "Você recebe seu acesso ao portal do parceiro e materiais de apoio." },
  { n: "04", title: "Atender clientes", desc: "Indique a Poupe Energia para sua carteira e acompanhe cada oportunidade." },
  { n: "05", title: "Receber remuneração", desc: "Receba sua comissão por cada cliente que aderir à plataforma." },
];

export default function SejaUmEmbaixador() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    perfil: "",
    carteira_ativa: "",
    qtd_clientes: "",
    tem_equipe: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (field: string) => (value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const canSubmit =
    form.nome && form.email && form.telefone &&
    form.perfil && form.carteira_ativa && form.qtd_clientes && form.tem_equipe;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const { error } = await (supabase as any)
        .from("embaixadores_candidatos")
        .insert({
          nome: form.nome,
          email: form.email,
          telefone: form.telefone,
          cidade: null,
          uf: null,
          is_mei: null,
          tem_equipe: form.tem_equipe === "sim",
          status: "pendente",
          observacoes: JSON.stringify({
            perfil: form.perfil,
            carteira_ativa: form.carteira_ativa === "sim",
            qtd_clientes: form.qtd_clientes,
          }),
        });
      if (error) throw error;
      setDone(true);
    } catch {
      toast.error("Erro ao enviar cadastro. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <SEO title="Solicitação Enviada! | Poupe Energia" description="Recebemos sua solicitação de credenciamento." />
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-brand-blue mb-3">Solicitação Enviada!</h1>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Recebemos sua solicitação de credenciamento ao Programa de Parceiros Oficiais
              Poupe Energia. Nossa equipe entrará em contato em até <strong>2 dias úteis</strong>.
            </p>
            <Link
              to="/"
              className="inline-block bg-brand-blue text-white font-bold px-8 py-3 rounded-xl text-sm hover:bg-brand-blue/90 transition"
            >
              Voltar ao início
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEO
        title="Programa de Parceiros Oficiais | Poupe Energia"
        description="Torne-se um Parceiro Oficial da Poupe Energia e ajude seus clientes a economizar com segurança."
      />
      <Header />

      <main className="flex-1">

        {/* Hero */}
        <section className="bg-brand-blue text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-brand-yellow/20 text-brand-yellow px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              ⚡ Programa de Parceiros Oficiais Poupe Energia
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-5">
              Torne-se um Parceiro Oficial<br />
              <span className="text-brand-yellow">da Poupe Energia</span>
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              Ajude seus clientes a economizar com segurança. Ofereça a plataforma mais
              completa de comparação de energia do Brasil e receba remuneração por cada adesão.
            </p>
            <a
              href="#credenciamento"
              className="inline-block bg-brand-yellow text-brand-blue font-extrabold px-8 py-4 rounded-xl text-sm hover:bg-brand-yellow/90 transition shadow-lg"
            >
              Solicitar Credenciamento →
            </a>
          </div>
        </section>

        {/* Benefícios */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-extrabold text-brand-blue text-center mb-10">
              Por que ser um Parceiro Oficial Poupe Energia?
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((b) => (
                <div key={b.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="text-3xl mb-3">{b.emoji}</div>
                  <h3 className="font-extrabold text-brand-blue mb-2">{b.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quem pode */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-extrabold text-brand-blue text-center mb-3">
              Quem pode ser Parceiro Oficial?
            </h2>
            <p className="text-center text-gray-500 text-sm mb-10 max-w-xl mx-auto">
              O programa é ideal para profissionais e empresas que já possuem uma carteira ativa de clientes.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {quemPode.map((item) => (
                <div key={item} className="flex items-center gap-3 bg-brand-blue/5 border border-brand-blue/10 rounded-xl px-4 py-3">
                  <CheckCircle2 className="h-4 w-4 text-brand-blue shrink-0" />
                  <span className="text-sm font-medium text-brand-blue">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-extrabold text-brand-blue text-center mb-10">
              Como funciona?
            </h2>
            <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {steps.map((s) => (
                <div key={s.n} className="text-center">
                  <div className="text-4xl font-extrabold text-brand-yellow mb-3">{s.n}</div>
                  <h3 className="font-extrabold text-brand-blue mb-1 text-sm">{s.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Formulário */}
        <section id="credenciamento" className="py-16 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-brand-blue mb-2">
                Solicite seu Credenciamento
              </h2>
              <p className="text-gray-500 text-sm">
                Gratuito e sem compromisso. Nossa equipe analisará seu perfil e entrará em contato.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8 space-y-6">

              {/* Dados de contato */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Seus dados</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nome completo <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Seu nome completo"
                        value={form.nome}
                        onChange={(e) => set("nome")(e.target.value)}
                        className={INPUT}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        E-mail <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          placeholder="seu@email.com"
                          value={form.email}
                          onChange={(e) => set("email")(e.target.value)}
                          className={INPUT}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="tel"
                          placeholder="(00) 00000-0000"
                          value={form.telefone}
                          onChange={(e) => set("telefone")(maskPhone(e.target.value))}
                          className={INPUT}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Perfil */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Seu perfil</p>
                <div className="space-y-5">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Qual é o seu perfil? <span className="text-red-500">*</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {PERFIS.map((o) => (
                        <label
                          key={o.value}
                          onClick={() => set("perfil")(o.value)}
                          className={`flex items-center gap-2.5 cursor-pointer border rounded-xl px-3 py-2.5 text-sm transition ${
                            form.perfil === o.value
                              ? "border-brand-blue bg-brand-blue/5 text-brand-blue font-medium"
                              : "border-gray-200 hover:border-brand-blue/40 text-gray-600"
                          }`}
                        >
                          <div className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                            form.perfil === o.value ? "border-brand-blue bg-brand-blue" : "border-gray-300"
                          }`}>
                            {form.perfil === o.value && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                          {o.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <RadioGroup
                    label="Você possui carteira ativa de clientes? *"
                    value={form.carteira_ativa}
                    onChange={set("carteira_ativa")}
                    options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]}
                    cols={2}
                  />

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Quantos clientes você atende? <span className="text-red-500">*</span>
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {QTD_CLIENTES.map((o) => (
                        <label
                          key={o.value}
                          onClick={() => set("qtd_clientes")(o.value)}
                          className={`flex items-center gap-2.5 cursor-pointer border rounded-xl px-3 py-2.5 text-sm transition ${
                            form.qtd_clientes === o.value
                              ? "border-brand-blue bg-brand-blue/5 text-brand-blue font-medium"
                              : "border-gray-200 hover:border-brand-blue/40 text-gray-600"
                          }`}
                        >
                          <div className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                            form.qtd_clientes === o.value ? "border-brand-blue bg-brand-blue" : "border-gray-300"
                          }`}>
                            {form.qtd_clientes === o.value && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                          {o.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <RadioGroup
                    label="Possui equipe comercial? *"
                    value={form.tem_equipe}
                    onChange={set("tem_equipe")}
                    options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]}
                    cols={2}
                  />
                </div>
              </div>

              {/* Botão */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className={`w-full py-4 rounded-xl font-extrabold text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition ${
                  canSubmit && !submitting
                    ? "bg-brand-blue text-white hover:bg-brand-blue/90 shadow-md"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                ) : (
                  "Solicitar Credenciamento ⚡"
                )}
              </button>

              <p className="text-xs text-gray-400 text-center">
                Ao enviar, você concorda que nossa equipe entre em contato pelo WhatsApp ou e-mail informado.
              </p>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
