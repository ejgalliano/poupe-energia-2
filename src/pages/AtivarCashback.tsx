import { useEffect, useState } from "react";
import { useRateLimit } from "@/hooks/useRateLimit";
import { getSubmitErrorMessage } from "@/lib/submitError";
import { Link } from "react-router-dom";
import { User, Home, CreditCard, Shield, Phone, Mail, Zap, Building2, CheckCircle2, Loader2, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

interface Distribuidora { id: string; nome: string; }
interface EmpresaParceira { id: string; nome: string; cashback_percentual: number; }

const INPUT =
  "w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition bg-white placeholder:text-gray-400";

const SELECT =
  "w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition bg-white appearance-none";

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="h-10 w-10 rounded-full bg-brand-blue flex items-center justify-center shrink-0 text-white">
        {icon}
      </div>
      <h3 className="text-base font-extrabold text-brand-blue">{label}</h3>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

function Checkbox({
  checked, onChange, children,
}: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
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
      <span className="text-sm text-gray-600 leading-snug pt-0.5">{children}</span>
    </label>
  );
}

const PixIcon = () => (
  <span className="absolute left-3 top-1/2 -translate-y-1/2">
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-400" fill="currentColor">
      <path d="M6.36 10.56L2.4 14.52a5.7 5.7 0 000 8.07l.01.01a5.7 5.7 0 008.07 0l3.95-3.95-2.83-2.83-3.95 3.95a1.8 1.8 0 01-2.54 0l-.01-.01a1.8 1.8 0 010-2.54l3.95-3.95-2.69-2.71zm11.27-7.13a5.7 5.7 0 00-8.07 0L5.61 7.38l2.83 2.83 3.95-3.95a1.8 1.8 0 012.54 0l.01.01a1.8 1.8 0 010 2.54l-3.95 3.95 2.69 2.7 3.95-3.95a5.7 5.7 0 000-8.07l-.01-.01zM8.1 14.03l5.93-5.93 1.87 1.87-5.93 5.93-1.87-1.87z"/>
    </svg>
  </span>
);

const ChevronDown = () => (
  <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export default function AtivarCashback() {
  const [distribuidoras, setDistribuidoras] = useState<Distribuidora[]>([]);
  const [empresasParceiras, setEmpresasParceiras] = useState<EmpresaParceira[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const { blocked, secondsLeft, markSubmitted } = useRateLimit("ativar-cashback", 1800);

  const [form, setForm] = useState({
    empresa_id: "",
    empresa_nome: "",
    cashback_percentual: null as number | null,
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

    supabase
      .from("empresas")
      .select("id, nome, cashback_percentual")
      .eq("parceira", true)
      .not("cashback_percentual", "is", null)
      .order("nome")
      .then(({ data }) => setEmpresasParceiras((data ?? []) as EmpresaParceira[]));
  }, []);

  const set = (field: string) => (value: string | boolean | number | null) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleEmpresa = (id: string) => {
    const e = empresasParceiras.find((x) => x.id === id);
    setForm((f) => ({
      ...f,
      empresa_id: id,
      empresa_nome: e?.nome ?? "",
      cashback_percentual: e?.cashback_percentual ?? null,
    }));
  };

  const handleDistrib = (id: string) => {
    const d = distribuidoras.find((x) => x.id === id);
    setForm((f) => ({ ...f, distribuidora_id: id, distribuidora_nome: d?.nome ?? "" }));
  };

  const canSubmit =
    form.empresa_id &&
    form.nome && form.cpf_cnpj && form.whatsapp && form.email &&
    form.numero_uc && form.distribuidora_id && form.chave_pix &&
    form.aceite_termos && form.ciente_parcela_unica && form.autoriza_validacao;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (blocked) { toast.error(`Aguarde ${secondsLeft}s antes de enviar novamente.`); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("cashback_cadastros").insert({
        empresa_id: form.empresa_id || null,
        empresa_nome: form.empresa_nome || null,
        cashback_percentual: form.cashback_percentual,
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
      if (error) {
        if ((error as { code?: string }).code === "23505") {
          toast.error("Este CPF/CNPJ já possui um cadastro ativo. Entre em contato pelo WhatsApp se precisar de ajuda.", { duration: 6000 });
          return;
        }
        throw error;
      }
      markSubmitted();
      setDone(true);
    } catch (e: unknown) {
      toast.error(getSubmitErrorMessage(e, "Erro ao enviar cadastro. Tente novamente."));
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
            <h1 className="text-2xl font-extrabold text-brand-blue mb-3">Cashback Ativado!</h1>
            {form.cashback_percentual != null && (
              <div className="inline-flex items-center gap-2 bg-brand-yellow/20 text-brand-blue px-4 py-2 rounded-full text-sm font-bold mb-4">
                ⚡ {form.cashback_percentual}% de cashback com {form.empresa_nome}
              </div>
            )}
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Seus dados foram recebidos. Após a validação da sua conta de energia e pagamento
              da primeira fatura, seu cashback será liberado em até 60 dias.
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

      <main className="flex-1 flex items-start justify-center px-3 sm:px-4 py-8 sm:py-12">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">

            {/* ── Hero ── */}
            <div className="px-6 sm:px-10 pt-8 pb-7 text-center border-b border-gray-100">
              <div className="flex justify-center mb-4">
                <svg viewBox="0 0 120 100" className="w-24 h-20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 50 A40 40 0 0 1 60 10" stroke="#1E3A5F" strokeWidth="5" fill="none" strokeLinecap="round"/>
                  <polygon points="60,4 68,14 52,14" fill="#1E3A5F"/>
                  <path d="M100 50 A40 40 0 0 1 60 90" stroke="#1E3A5F" strokeWidth="5" fill="none" strokeLinecap="round"/>
                  <polygon points="60,96 52,86 68,86" fill="#1E3A5F"/>
                  <circle cx="60" cy="50" r="28" fill="#FACC15" stroke="#CA8A04" strokeWidth="2"/>
                  <circle cx="60" cy="50" r="22" fill="#FDE68A" stroke="#CA8A04" strokeWidth="1"/>
                  <text x="60" y="57" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#92400E">$</text>
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-blue leading-tight">
                Ative seu
              </h1>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-blue leading-tight mb-3">
                CASHBACK
              </h1>
              <p className="text-sm sm:text-base text-gray-500 max-w-sm mx-auto leading-relaxed">
                Preencha seus dados abaixo para participar do programa de Cashback da{" "}
                <span className="font-bold text-brand-blue">Poupe Energia</span>.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Importante: realize este cadastro <span className="font-semibold text-gray-500">antes</span> de assinar com a fornecedora. Ativações após a adesão não serão válidas.
              </p>
            </div>

            <div className="px-5 sm:px-8 py-7 space-y-8">

              {/* Seção 1: Empresa Parceira */}
              <div>
                <SectionHeader icon={<Building2 className="h-5 w-5" />} label="Empresa Parceira" />
                <Field
                  label="Fornecedora escolhida"
                  required
                  hint="Selecione a empresa com a qual você vai aderir ao plano de energia."
                >
                  <div className="relative">
                    <select
                      value={form.empresa_id}
                      onChange={(e) => handleEmpresa(e.target.value)}
                      className={SELECT}
                    >
                      <option value="">Selecione a empresa</option>
                      {empresasParceiras.map((e) => (
                        <option key={e.id} value={e.id}>{e.nome}</option>
                      ))}
                    </select>
                    <ChevronDown />
                  </div>
                </Field>

                {form.empresa_id && form.cashback_percentual != null && (
                  <div className="mt-3 inline-flex items-center gap-2 bg-brand-yellow/20 text-brand-blue px-4 py-2 rounded-full text-sm font-bold">
                    ⚡ Você receberá <span className="text-lg mx-1">{form.cashback_percentual}%</span> de cashback com {form.empresa_nome}
                  </div>
                )}
              </div>

              {/* Seção 2: Dados do Titular */}
              <div>
                <SectionHeader icon={<User className="h-5 w-5" />} label="Dados do Titular" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <Field label="CPF ou CNPJ" required>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Digite seu CPF ou CNPJ"
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
              </div>

              {/* Seção 3: Dados da Conta de Energia */}
              <div>
                <SectionHeader icon={<Home className="h-5 w-5" />} label="Dados da Conta de Energia" />
                <div className="space-y-4">
                  <Field label="Número da Unidade Consumidora (UC)" required>
                    <div className="relative">
                      <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Digite o número da UC"
                        value={form.numero_uc}
                        onChange={(e) => set("numero_uc")(e.target.value)}
                        className={INPUT}
                      />
                    </div>
                  </Field>
                  <Field label="Distribuidora de energia" required>
                    <div className="relative">
                      <select
                        value={form.distribuidora_id}
                        onChange={(e) => handleDistrib(e.target.value)}
                        className={SELECT}
                      >
                        <option value="">Selecione sua distribuidora</option>
                        {distribuidoras.map((d) => (
                          <option key={d.id} value={d.id}>{d.nome}</option>
                        ))}
                      </select>
                      <ChevronDown />
                    </div>
                  </Field>
                </div>
              </div>

              {/* Seção 4: Dados para Recebimento */}
              <div>
                <SectionHeader icon={<CreditCard className="h-5 w-5" />} label="Dados para Recebimento" />
                <Field
                  label="Chave Pix"
                  required
                  hint="A conta deve ser de sua titularidade. Utilizaremos sua chave Pix para realizar o pagamento do cashback."
                >
                  <div className="relative">
                    <PixIcon />
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

              {/* Seção 5: Confirmações */}
              <div>
                <SectionHeader icon={<Shield className="h-5 w-5" />} label="Confirmações" />
                <div className="space-y-3.5">
                  <Checkbox checked={form.aceite_termos} onChange={(v) => set("aceite_termos")(v)}>
                    Declaro que li e aceito os{" "}
                    <Link to="/termos-cashback" className="text-brand-blue font-semibold underline" target="_blank">
                      Termos e Condições
                    </Link>{" "}
                    do Cashback.
                  </Checkbox>
                  <Checkbox checked={form.ciente_parcela_unica} onChange={(v) => set("ciente_parcela_unica")(v)}>
                    Estou ciente de que o cashback é promocional, pago em parcela única e não recorrente.
                  </Checkbox>
                  <Checkbox checked={form.autoriza_validacao} onChange={(v) => set("autoriza_validacao")(v)}>
                    Autorizo a validação dos meus dados junto à fornecedora parceira.
                  </Checkbox>
                </div>
              </div>

              {/* Botão */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className={`w-full py-4 rounded-xl font-extrabold text-white text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition ${
                  canSubmit && !submitting
                    ? "bg-[#1E3A5F] hover:bg-[#162d4a] shadow-md"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>ATIVAR MEU CASHBACK 🔒</>
                )}
              </button>

              {/* Nota informativa */}
              <div className="flex items-start gap-2 pt-1">
                <div className="h-5 w-5 rounded-full border-2 border-brand-blue/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="h-3 w-3 text-brand-blue/60" />
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  O cashback será liberado após a ativação da conta de energia,
                  compensação dos créditos (quando aplicável) e pagamento da primeira
                  fatura validada pela fornecedora parceira e pela{" "}
                  <span className="font-bold text-brand-blue">Poupe Energia</span>.
                  O prazo de pagamento é de até 60 dias após a conclusão das etapas.
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
