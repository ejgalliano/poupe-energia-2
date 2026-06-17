import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Coins, User, CreditCard, Phone, Mail, Zap, Building2, Key, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

interface Distribuidora { id: string; nome: string; }

const INPUT =
  "w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition bg-white";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {required && <span className="text-brand-blue mr-0.5">*</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function SectionTitle({ number, label }: { number: number; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="h-6 w-6 rounded-full bg-brand-blue flex items-center justify-center shrink-0">
        <span className="text-white text-xs font-bold">{number}</span>
      </div>
      <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">{label}</p>
    </div>
  );
}

function Checkbox({
  checked, onChange, children,
}: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`mt-0.5 h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition cursor-pointer ${
          checked ? "bg-brand-blue border-brand-blue" : "border-gray-300 bg-white hover:border-brand-blue/50"
        }`}
      >
        {checked && (
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-sm text-gray-600 leading-snug">{children}</span>
    </label>
  );
}

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
    distribuidora_nome: "",
    chave_pix: "",
    aceite_termos: false,
    ciente_parcela_unica: false,
    autoriza_validacao: false,
  });

  useEffect(() => {
    supabase.from("distribuidoras").select("id, nome").order("nome")
      .then(({ data }) => setDistribuidoras(data ?? []));
  }, []);

  const set = (field: string) => (value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleDistrib = (id: string) => {
    const d = distribuidoras.find((x) => x.id === id);
    setForm((f) => ({ ...f, distribuidora_id: id, distribuidora_nome: d?.nome ?? "" }));
  };

  const canSubmit =
    form.nome && form.cpf_cnpj && form.whatsapp && form.email &&
    form.numero_uc && form.distribuidora_id && form.chave_pix &&
    form.aceite_termos && form.ciente_parcela_unica && form.autoriza_validacao;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("cashback_cadastros").insert({
        nome: form.nome,
        cpf_cnpj: form.cpf_cnpj,
        email: form.email,
        telefone: form.whatsapp,
        whatsapp: form.whatsapp,
        distribuidora_id: form.distribuidora_id || null,
        distribuidora_nome: form.distribuidora_nome || null,
        numero_uc: form.numero_uc || null,
        chave_pix: form.chave_pix || null,
        aceite_termos: form.aceite_termos,
        ciente_parcela_unica: form.ciente_parcela_unica,
        autoriza_validacao: form.autoriza_validacao,
        status: "pendente",
      });
      if (error) throw error;
      setDone(true);
    } catch (e: unknown) {
      toast.error("Erro ao enviar cadastro. Tente novamente.");
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <SEO title="Cashback Ativado! | Poupe Energia" description="Seus dados foram recebidos com sucesso." />
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-brand-blue mb-3">Cadastro Enviado!</h1>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Seus dados foram recebidos. Após a validação da sua conta de energia e pagamento
              da primeira fatura, seu cashback será liberado.
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
        title="Ative seu Cashback | Poupe Energia"
        description="Preencha seus dados para ativar seu cashback na Poupe Energia."
      />
      <Header />

      <main className="flex-1 flex items-start justify-center px-3 sm:px-4 py-6 sm:py-10">
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">

            {/* Header do formulário */}
            <div className="px-6 sm:px-8 pt-7 pb-6 border-b border-gray-100 text-center">
              <div className="flex justify-center mb-3">
                <div className="h-14 w-14 rounded-full bg-brand-yellow/20 flex items-center justify-center">
                  <Coins className="h-7 w-7 text-brand-blue" />
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                Ative seu <span className="text-brand-blue">CASHBACK</span>
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Preencha os dados abaixo para receber seu cashback
              </p>
            </div>

            <div className="px-5 sm:px-8 py-6 space-y-6">

              {/* Seção 1: Dados do Titular */}
              <div className="border border-gray-100 rounded-xl p-4 sm:p-5 space-y-4">
                <SectionTitle number={1} label="Dados do Titular" />
                <Field label="Nome completo" required>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Digite seu nome completo"
                      value={form.nome}
                      onChange={(e) => set("nome")(e.target.value)}
                      className={INPUT}
                    />
                  </div>
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="CPF ou CNPJ" required>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="000.000.000-00"
                        value={form.cpf_cnpj}
                        onChange={(e) => set("cpf_cnpj")(e.target.value)}
                        className={INPUT}
                      />
                    </div>
                  </Field>
                  <Field label="WhatsApp" required>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="tel"
                        placeholder="(00) 00000-0000"
                        value={form.whatsapp}
                        onChange={(e) => set("whatsapp")(e.target.value)}
                        className={INPUT}
                      />
                    </div>
                  </Field>
                </div>
                <Field label="E-mail" required>
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
                </Field>
              </div>

              {/* Seção 2: Dados da Conta de Energia */}
              <div className="border border-gray-100 rounded-xl p-4 sm:p-5 space-y-4">
                <SectionTitle number={2} label="Dados da Conta de Energia" />
                <Field label="Número da UC" required>
                  <div className="relative">
                    <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Número da unidade consumidora"
                      value={form.numero_uc}
                      onChange={(e) => set("numero_uc")(e.target.value)}
                      className={INPUT}
                    />
                  </div>
                </Field>
                <Field label="Distribuidora de energia" required>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                    <select
                      value={form.distribuidora_id}
                      onChange={(e) => handleDistrib(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition bg-white appearance-none"
                    >
                      <option value="">Selecione a distribuidora</option>
                      {distribuidoras.map((d) => (
                        <option key={d.id} value={d.id}>{d.nome}</option>
                      ))}
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </Field>
              </div>

              {/* Seção 3: Dados para Recebimento */}
              <div className="border border-gray-100 rounded-xl p-4 sm:p-5">
                <SectionTitle number={3} label="Dados para Recebimento" />
                <Field label="Chave Pix" required>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="CPF, e-mail, celular ou chave aleatória"
                      value={form.chave_pix}
                      onChange={(e) => set("chave_pix")(e.target.value)}
                      className={INPUT}
                    />
                  </div>
                </Field>
              </div>

              {/* Seção 4: Confirmações */}
              <div className="border border-gray-100 rounded-xl p-4 sm:p-5 space-y-3">
                <SectionTitle number={4} label="Confirmações" />
                <Checkbox checked={form.aceite_termos} onChange={(v) => set("aceite_termos")(v)}>
                  Li e aceito os{" "}
                  <Link to="/termos-cashback" className="text-brand-blue font-semibold underline" target="_blank">
                    Termos e Condições
                  </Link>{" "}
                  da Poupe Energia
                </Checkbox>
                <Checkbox checked={form.ciente_parcela_unica} onChange={(v) => set("ciente_parcela_unica")(v)}>
                  Estou ciente de que o cashback é promocional e não recorrente, sendo pago em parcela única
                </Checkbox>
                <Checkbox checked={form.autoriza_validacao} onChange={(v) => set("autoriza_validacao")(v)}>
                  Autorizo a validação dos meus dados junto à comercializadora parceira e à Poupe Energia
                </Checkbox>
              </div>

              {/* Botão de envio */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className={`w-full py-4 rounded-xl font-extrabold text-white text-sm tracking-widest flex items-center justify-center gap-2 transition ${
                  canSubmit && !submitting
                    ? "bg-gray-900 hover:bg-gray-800 shadow-md"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "ATIVAR MEU CASHBACK 🔒"
                )}
              </button>

              {/* Nota informativa */}
              <p className="text-center text-xs text-gray-400 leading-relaxed">
                O cashback será liberado após a ativação da conta de energia, compensação dos créditos
                (quando aplicável) e pagamento da primeira fatura validada pela comercializadora
                parceira e pela Poupe Energia.
              </p>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
