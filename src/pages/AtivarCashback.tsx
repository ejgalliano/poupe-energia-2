import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User, Zap, Home, CreditCard, Shield, Lock, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

interface Distribuidora {
  id: string;
  nome: string;
}

const SectionTitle = ({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="h-10 w-10 rounded-full bg-brand-blue flex items-center justify-center shrink-0">
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div className="flex items-center gap-3 flex-1">
      <span className="text-lg font-bold text-brand-blue whitespace-nowrap">{title}</span>
      <div className="h-px flex-1 bg-brand-blue/20" />
    </div>
  </div>
);

const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1.5">
    {children}
    {required && <span className="text-brand-blue ml-0.5">*</span>}
  </label>
);

const InputField = ({
  icon: Icon,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  icon: React.ElementType;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition bg-white"
    />
  </div>
);

export default function AtivarCashback() {
  const [distribuidoras, setDistribuidoras] = useState<Distribuidora[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    cpf_cnpj: "",
    whatsapp: "",
    email: "",
    numero_uc: "",
    distribuidora_id: "",
    chave_pix: "",
    aceite_termos: false,
    ciente_parcela_unica: false,
    autoriza_validacao: false,
  });

  useEffect(() => {
    supabase
      .from("distribuidoras")
      .select("id, nome")
      .order("nome")
      .then(({ data }) => setDistribuidoras(data ?? []));
  }, []);

  const set = (field: string) => (value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const canSubmit =
    form.nome &&
    form.cpf_cnpj &&
    form.whatsapp &&
    form.email &&
    form.numero_uc &&
    form.distribuidora_id &&
    form.chave_pix &&
    form.aceite_termos &&
    form.ciente_parcela_unica &&
    form.autoriza_validacao;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const dist = distribuidoras.find((d) => d.id === form.distribuidora_id);
      const { error } = await supabase.from("cashback_cadastros").insert({
        nome: form.nome,
        cpf_cnpj: form.cpf_cnpj,
        whatsapp: form.whatsapp,
        email: form.email,
        numero_uc: form.numero_uc,
        distribuidora_id: form.distribuidora_id,
        distribuidora_nome: dist?.nome ?? null,
        chave_pix: form.chave_pix,
        aceite_termos: form.aceite_termos,
        ciente_parcela_unica: form.ciente_parcela_unica,
        autoriza_validacao: form.autoriza_validacao,
        status: "pendente",
      });
      if (error) throw error;
      setDone(true);
    } catch (e: any) {
      toast.error("Erro ao enviar cadastro. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SEO
          title="Cashback Ativado! | Poupe Energia"
          description="Seu cadastro de cashback foi recebido com sucesso."
        />
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-brand-blue mb-3">Cashback Ativado!</h1>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Seus dados foram recebidos com sucesso. O cashback será liberado após a
              ativação da sua unidade consumidora, compensação dos créditos (quando
              aplicável) e pagamento da primeira fatura validada pela comercializadora
              parceira e pela Poupe Energia.
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SEO
        title="Ativar Cashback | Poupe Energia"
        description="Preencha seus dados para participar do programa de Cashback da Poupe Energia."
      />
      <Header />

      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">

          {/* Header do formulário */}
          <div className="bg-white px-8 pt-8 pb-6 text-center border-b border-gray-100">
            <div className="flex justify-center mb-3">
              <div className="h-20 w-20 rounded-full border-4 border-brand-blue/10 bg-brand-blue/5 flex items-center justify-center">
                <span className="text-4xl">💰</span>
              </div>
            </div>
            <p className="text-brand-blue text-lg font-semibold tracking-wide">Ative seu</p>
            <h1 className="text-4xl font-extrabold text-brand-blue leading-none">CASHBACK</h1>
            <p className="text-gray-500 text-sm mt-2 leading-snug">
              Preencha seus dados abaixo para participar do programa de Cashback da{" "}
              <strong className="text-brand-blue">Poupe Energia</strong>.
            </p>
          </div>

          <div className="px-8 py-7 space-y-8">

            {/* Dados do Titular */}
            <div>
              <SectionTitle icon={User} title="Dados do Titular" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Nome completo</FieldLabel>
                  <InputField
                    icon={User}
                    placeholder="Digite seu nome completo"
                    value={form.nome}
                    onChange={set("nome")}
                  />
                </div>
                <div>
                  <FieldLabel required>CPF ou CNPJ</FieldLabel>
                  <InputField
                    icon={CreditCard}
                    placeholder="Digite seu CPF ou CNPJ"
                    value={form.cpf_cnpj}
                    onChange={set("cpf_cnpj")}
                  />
                </div>
                <div>
                  <FieldLabel required>WhatsApp</FieldLabel>
                  <InputField
                    icon={User}
                    placeholder="(00) 00000-0000"
                    value={form.whatsapp}
                    onChange={set("whatsapp")}
                    type="tel"
                  />
                </div>
                <div>
                  <FieldLabel required>E-mail</FieldLabel>
                  <InputField
                    icon={User}
                    placeholder="seu@email.com"
                    value={form.email}
                    onChange={set("email")}
                    type="email"
                  />
                </div>
              </div>
            </div>

            {/* Dados da Conta de Energia */}
            <div>
              <SectionTitle icon={Home} title="Dados da Conta de Energia" />
              <div className="space-y-4">
                <div>
                  <FieldLabel required>Número da Unidade Consumidora (UC)</FieldLabel>
                  <InputField
                    icon={Zap}
                    placeholder="Digite o número da UC"
                    value={form.numero_uc}
                    onChange={set("numero_uc")}
                  />
                </div>
                <div>
                  <FieldLabel required>Distribuidora de energia</FieldLabel>
                  <div className="relative">
                    <select
                      value={form.distribuidora_id}
                      onChange={(e) => set("distribuidora_id")(e.target.value)}
                      className="w-full appearance-none pl-4 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition bg-white text-gray-700"
                    >
                      <option value="">Selecione sua distribuidora</option>
                      {distribuidoras.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nome}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Dados para Recebimento */}
            <div>
              <SectionTitle icon={CreditCard} title="Dados para Recebimento" />
              <div>
                <FieldLabel required>Chave Pix</FieldLabel>
                <InputField
                  icon={CreditCard}
                  placeholder="Digite sua chave Pix"
                  value={form.chave_pix}
                  onChange={set("chave_pix")}
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  Utilizaremos sua chave Pix para realizar o pagamento do seu cashback.
                </p>
              </div>
            </div>

            {/* Confirmações */}
            <div>
              <SectionTitle icon={Shield} title="Confirmações" />
              <div className="space-y-3">
                {[
                  {
                    field: "aceite_termos",
                    label: (
                      <>
                        Declaro que li e aceito os{" "}
                        <Link to="/termos-cashback" className="text-brand-blue font-semibold underline" target="_blank">
                          Termos e Condições
                        </Link>{" "}
                        do Cashback.
                      </>
                    ),
                  },
                  {
                    field: "ciente_parcela_unica",
                    label: "Estou ciente de que o cashback é promocional, pago em parcela única e não recorrente.",
                  },
                  {
                    field: "autoriza_validacao",
                    label: "Autorizo a validação dos meus dados junto à comercializadora parceira.",
                  },
                ].map(({ field, label }) => (
                  <label key={field} className="flex items-start gap-3 cursor-pointer group">
                    <div
                      onClick={() => set(field)(!(form as any)[field])}
                      className={`mt-0.5 h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition cursor-pointer ${
                        (form as any)[field]
                          ? "bg-brand-blue border-brand-blue"
                          : "border-gray-300 bg-white group-hover:border-brand-blue/50"
                      }`}
                    >
                      {(form as any)[field] && (
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-600 leading-snug">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Botão */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className={`w-full py-4 rounded-xl font-extrabold text-white text-sm tracking-widest flex items-center justify-center gap-2 transition ${
                canSubmit && !submitting
                  ? "bg-brand-blue hover:bg-brand-blue/90 shadow-md"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              <Lock className="h-4 w-4" />
              {submitting ? "ENVIANDO..." : "ATIVAR MEU CASHBACK"}
            </button>

            {/* Nota informativa */}
            <div className="flex gap-2 text-xs text-gray-500 leading-relaxed">
              <Info className="h-4 w-4 shrink-0 text-brand-blue mt-0.5" />
              <p>
                O cashback será liberado após a ativação da conta de energia, compensação dos
                créditos (quando aplicável) e pagamento da primeira fatura validada pela
                comercializadora parceira e pela{" "}
                <strong className="text-brand-blue">Poupe Energia</strong>.
              </p>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
