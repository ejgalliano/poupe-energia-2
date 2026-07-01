import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import {
  CheckCircle2, Loader2, DollarSign, Link2, BarChart3,
  Users, User, Mail, Phone, MapPin, ChevronDown,
} from "lucide-react";

const INPUT = "w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition bg-white placeholder:text-gray-400";
const SELECT = "w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition bg-white appearance-none disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed";

const ESTADOS = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT",
  "PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO",
];

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
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      <div className="flex gap-4">
        {options.map((o) => (
          <label key={o.value} className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => onChange(o.value)}
              className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition cursor-pointer ${
                value === o.value
                  ? "border-brand-blue bg-brand-blue"
                  : "border-gray-300 hover:border-brand-blue/50"
              }`}
            >
              {value === o.value && <div className="h-2 w-2 rounded-full bg-white" />}
            </div>
            <span className="text-sm text-gray-600">{o.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

const benefits = [
  {
    icon: <DollarSign className="h-7 w-7 text-brand-blue" />,
    title: "Comissão Atrativa",
    desc: "Ganhe comissão por cada cliente que aderir ao mercado livre de energia através do seu link exclusivo.",
  },
  {
    icon: <Link2 className="h-7 w-7 text-brand-blue" />,
    title: "Link Personalizado",
    desc: "Receba seu próprio link de indicação para compartilhar com clientes, amigos e na sua rede.",
  },
  {
    icon: <BarChart3 className="h-7 w-7 text-brand-blue" />,
    title: "Acompanhamento Completo",
    desc: "Acesso ao painel para visualizar seus leads, status de cada indicação e suas comissões.",
  },
  {
    icon: <Users className="h-7 w-7 text-brand-blue" />,
    title: "Suporte Dedicado",
    desc: "Nossa equipe te apoia com material de apoio, treinamento e suporte para você fechar mais negócios.",
  },
];

const steps = [
  { n: "01", title: "Preencha o formulário", desc: "Cadastre-se gratuitamente com seus dados." },
  { n: "02", title: "Análise pela equipe", desc: "Nossa equipe entrará em contato em até 2 dias úteis." },
  { n: "03", title: "Receba seu link", desc: "Após aprovação, você recebe seu código e link exclusivo." },
  { n: "04", title: "Comece a indicar", desc: "Compartilhe com clientes e comece a ganhar comissão." },
];

export default function SejaUmEmbaixador() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    cidade: "",
    uf: "",
    is_mei: "",
    tem_equipe: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [cidades, setCidades] = useState<string[]>([]);
  const [loadingCidades, setLoadingCidades] = useState(false);

  useEffect(() => {
    if (!form.uf) { setCidades([]); return; }
    setLoadingCidades(true);
    set("cidade")("");
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${form.uf}/municipios?orderBy=nome`)
      .then((r) => r.json())
      .then((data) => setCidades(data.map((m: { nome: string }) => m.nome)))
      .catch(() => toast.error("Erro ao carregar cidades."))
      .finally(() => setLoadingCidades(false));
  }, [form.uf]);

  const set = (field: string) => (value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const canSubmit =
    form.nome && form.email && form.telefone &&
    form.cidade && form.uf && form.is_mei && form.tem_equipe;

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
          cidade: form.cidade,
          uf: form.uf,
          is_mei: form.is_mei === "sim",
          tem_equipe: form.tem_equipe === "sim",
          status: "pendente",
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
        <SEO title="Cadastro Enviado! | Poupe Energia" description="Recebemos seu cadastro de embaixador." />
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-brand-blue mb-3">Cadastro Recebido!</h1>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Obrigado pelo interesse em ser um Embaixador Poupe Energia! Nossa equipe
              analisará seu cadastro e entrará em contato em até <strong>2 dias úteis</strong>.
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
        title="Seja um Embaixador | Poupe Energia"
        description="Torne-se um Embaixador Poupe Energia e ganhe comissão indicando o melhor comparador de energia do Brasil."
      />
      <Header />

      <main className="flex-1">

        {/* Hero */}
        <section className="bg-brand-blue text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-brand-yellow/20 text-brand-yellow px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              ⚡ Programa de Embaixadores
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-5">
              Seja um Embaixador<br />
              <span className="text-brand-yellow">Poupe Energia</span>
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              Transforme sua rede de contatos em renda extra indicando o melhor
              comparador de energia do Brasil. Modelo simples, comissionamento atrativo
              e suporte dedicado.
            </p>
            <a
              href="#formulario"
              className="inline-block bg-brand-yellow text-brand-blue font-extrabold px-8 py-4 rounded-xl text-sm hover:bg-brand-yellow/90 transition shadow-lg"
            >
              Quero ser Embaixador →
            </a>
          </div>
        </section>

        {/* Benefícios */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-extrabold text-brand-blue text-center mb-10">
              Por que ser um Embaixador Poupe Energia?
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((b) => (
                <div key={b.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                  <div className="h-14 w-14 rounded-full bg-brand-blue/10 flex items-center justify-center mx-auto mb-4">
                    {b.icon}
                  </div>
                  <h3 className="font-extrabold text-brand-blue mb-2 text-sm">{b.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-extrabold text-brand-blue text-center mb-10">
              Como funciona?
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <section id="formulario" className="py-16 px-4 bg-gray-50">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-brand-blue mb-2">
                Preencha seu cadastro
              </h2>
              <p className="text-gray-500 text-sm">
                Gratuito e sem compromisso. Nossa equipe analisará e entrará em contato.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8 space-y-5">

              {/* Nome */}
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

              {/* Email + Telefone */}
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
                      onBlur={(e) => set("telefone")(maskPhone(e.target.value))}
                      className={INPUT}
                    />
                  </div>
                </div>
              </div>

              {/* Estado + Cidade */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Estado <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.uf}
                      onChange={(e) => set("uf")(e.target.value)}
                      className={SELECT}
                    >
                      <option value="">UF</option>
                      {ESTADOS.map((uf) => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Cidade <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                    <select
                      value={form.cidade}
                      onChange={(e) => set("cidade")(e.target.value)}
                      disabled={!form.uf || loadingCidades}
                      className={`${SELECT} pl-10`}
                    >
                      <option value="">
                        {!form.uf ? "Selecione o estado primeiro" : loadingCidades ? "Carregando cidades..." : "Selecione sua cidade"}
                      </option>
                      {cidades.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* MEI + Equipe */}
              <div className="grid sm:grid-cols-2 gap-6 pt-1">
                <RadioGroup
                  label="Você é MEI?"
                  value={form.is_mei}
                  onChange={set("is_mei")}
                  options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]}
                />
                <RadioGroup
                  label="Possui equipe comercial?"
                  value={form.tem_equipe}
                  onChange={set("tem_equipe")}
                  options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]}
                />
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
                  "Quero ser Embaixador ⚡"
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
