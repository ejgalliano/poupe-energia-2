import { useRef, useState } from "react";
import { useRateLimit } from "@/hooks/useRateLimit";
import { CheckCircle2, AlertCircle, Paperclip, Shield, FileSearch, Send, Clock, BarChart2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const MOTIVOS = [
  "Informações desatualizadas",
  "Divergência técnica nos dados",
  "Documentação complementar a apresentar",
  "Alterações operacionais recentes",
  "Erro de cálculo / nota incorreta",
  "Outro",
];

function FileUploadField({
  label, sublabel, accept, file, onChange,
}: {
  label: string; sublabel?: string; accept: string;
  file: File | null; onChange: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`w-full flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3 transition text-left ${
          file
            ? "border-brand-blue/50 bg-brand-blue/5"
            : "border-gray-200 bg-white hover:border-brand-blue/40 hover:bg-gray-50"
        }`}
      >
        {file ? (
          <CheckCircle2 className="h-5 w-5 text-brand-blue shrink-0" />
        ) : (
          <Paperclip className="h-5 w-5 text-gray-400 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${file ? "text-brand-blue" : "text-gray-500"}`}>
            {file ? file.name : label}
          </p>
          {sublabel && !file && (
            <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>
          )}
          {file && (
            <p className="text-xs text-gray-400 mt-0.5">
              {(file.size / 1024).toFixed(0)} KB — clique para trocar
            </p>
          )}
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

const INPUT =
  "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition bg-white";

export default function Contestacao() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [documento, setDocumento] = useState<File | null>(null);
  const { blocked, secondsLeft, markSubmitted } = useRateLimit("contestacao", 300);

  const [form, setForm] = useState({
    nome_empresa: "",
    cnpj: "",
    nome_responsavel: "",
    email_corporativo: "",
    telefone: "",
    motivo: "",
    descricao: "",
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const canSubmit =
    form.nome_empresa && form.cnpj && form.nome_responsavel &&
    form.email_corporativo && form.telefone && form.motivo && form.descricao;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) { toast.error("Preencha todos os campos obrigatórios."); return; }
    if (blocked) { toast.error(`Aguarde ${secondsLeft}s antes de enviar novamente.`); return; }
    setSubmitting(true);
    try {
      let documento_url: string | null = null;
      if (documento) {
        const ts = Date.now();
        const ext = documento.name.split(".").pop();
        const path = `${ts}_${form.cnpj.replace(/\D/g, "").slice(0, 14)}/documento.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("documentos-contestacao")
          .upload(path, documento, { upsert: true, contentType: documento.type });
        if (uploadError) {
          toast.error("Erro ao enviar documento. Tente sem arquivo ou tente novamente.");
          setSubmitting(false);
          return;
        }
        documento_url = uploadData.path;
      }

      const { error } = await supabase.from("contestacoes").insert({
        nome_empresa: form.nome_empresa,
        cnpj: form.cnpj,
        nome_responsavel: form.nome_responsavel,
        email_corporativo: form.email_corporativo,
        telefone: form.telefone,
        motivo: form.motivo,
        descricao: form.descricao,
        documento_url,
        status: "pendente",
      });
      if (error) throw error;
      markSubmitted();
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error("Erro ao enviar contestação. Tente novamente.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SEO
          title="Contestação enviada | Poupe Energia"
          description="Sua contestação foi recebida com sucesso."
        />
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Contestação recebida!</h1>
            <p className="text-gray-600 mb-2">
              Nossa equipe técnica analisará as informações enviadas e entrará em contato pelo e-mail informado.
            </p>
            <p className="text-sm text-gray-400 mb-8">
              O prazo de análise pode variar conforme a complexidade da solicitação.
            </p>
            <a
              href="/"
              className="inline-block bg-brand-blue text-white font-semibold px-8 py-3 rounded-xl hover:bg-brand-blue/90 transition"
            >
              Voltar ao início
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Contestação e Revisão Técnica | Poupe Energia"
        description="Canal oficial para empresas contestarem informações ou solicitarem revisão técnica no ranking da Poupe Energia."
      />
      <Header />

      {/* Hero */}
      <section className="bg-brand-blue text-white">
        <div className="container mx-auto px-4 py-14 md:py-20 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Shield className="h-3.5 w-3.5" />
            Canal Oficial
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
            Contestação e <span className="text-brand-yellow">Revisão Técnica</span>
          </h1>
          <p className="text-lg text-white/85 leading-relaxed">
            Compromisso com transparência e imparcialidade
          </p>
        </div>
      </section>

      <main className="flex-1">
        {/* Intro */}
        <section className="py-12 bg-white border-b">
          <div className="container mx-auto px-4 max-w-3xl">
            <p className="text-gray-700 text-base leading-relaxed mb-6">
              A Poupe Energia mantém um sistema independente de avaliação baseado em critérios objetivos,
              públicos e auditáveis. Caso sua empresa identifique alguma inconsistência, você poderá
              solicitar revisão através deste canal oficial.
            </p>

            <p className="font-semibold text-gray-800 mb-3">Motivos aceitos para contestação:</p>
            <ul className="space-y-2">
              {[
                "Informações desatualizadas",
                "Divergências técnicas nos dados",
                "Documentação complementar a apresentar",
                "Alterações operacionais recentes",
                "Qualquer outra inconsistência identificada",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-gray-700 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-brand-blue mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Como funciona */}
        <section className="py-12 bg-gray-50 border-b">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">Como funciona</h2>
            <div className="grid sm:grid-cols-4 gap-6 text-center">
              {[
                { icon: Send, label: "1. Envio", desc: "A empresa envia a solicitação pelo formulário abaixo." },
                { icon: FileSearch, label: "2. Análise", desc: "Nossa equipe técnica analisa os documentos enviados." },
                { icon: AlertCircle, label: "3. Complementação", desc: "Informações adicionais poderão ser solicitadas se necessário." },
                { icon: BarChart2, label: "4. Revisão", desc: "Revisões poderão ser realizadas conforme a metodologia oficial." },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-brand-blue" />
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">{label}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Independência */}
        <section className="py-10 bg-white border-b">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="flex items-start gap-4 bg-brand-blue/5 border border-brand-blue/20 rounded-2xl p-5">
              <Shield className="h-6 w-6 text-brand-blue shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-gray-900 mb-1">Independência e Transparência</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  A Poupe Energia não comercializa posicionamento em ranking e opera sob política de
                  independência denominada <strong>"Muralha da China"</strong>. Todas as análises seguem
                  critérios técnicos e metodológicos.
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-4 bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <Clock className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-800 mb-1">Importante</p>
                <p className="text-sm text-amber-700 leading-relaxed">
                  O envio da contestação <strong>não garante alteração automática</strong> de classificação,
                  nota ou posicionamento. As análises são realizadas com base em critérios objetivos,
                  documentos comprobatórios e na metodologia oficial da plataforma.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Formulário */}
        <section className="py-14 bg-gray-50">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Formulário de Contestação</h2>
            <p className="text-sm text-gray-500 text-center mb-8">
              Preencha todos os campos. Nossa equipe responderá pelo e-mail informado.
            </p>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    <span className="text-brand-blue mr-0.5">*</span>Nome da empresa
                  </label>
                  <input
                    type="text"
                    placeholder="Razão social"
                    value={form.nome_empresa}
                    onChange={set("nome_empresa")}
                    className={INPUT}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    <span className="text-brand-blue mr-0.5">*</span>CNPJ
                  </label>
                  <input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={form.cnpj}
                    onChange={set("cnpj")}
                    className={INPUT}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  <span className="text-brand-blue mr-0.5">*</span>Nome do responsável
                </label>
                <input
                  type="text"
                  placeholder="Nome completo do responsável"
                  value={form.nome_responsavel}
                  onChange={set("nome_responsavel")}
                  className={INPUT}
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    <span className="text-brand-blue mr-0.5">*</span>E-mail corporativo
                  </label>
                  <input
                    type="email"
                    placeholder="email@empresa.com"
                    value={form.email_corporativo}
                    onChange={set("email_corporativo")}
                    className={INPUT}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    <span className="text-brand-blue mr-0.5">*</span>Telefone
                  </label>
                  <input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={form.telefone}
                    onChange={set("telefone")}
                    className={INPUT}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  <span className="text-brand-blue mr-0.5">*</span>Motivo da contestação
                </label>
                <select
                  value={form.motivo}
                  onChange={set("motivo")}
                  className={INPUT}
                  required
                >
                  <option value="">Selecione o motivo</option>
                  {MOTIVOS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Upload de documentos <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <FileUploadField
                  label="Anexar documento comprobatório"
                  sublabel="PDF, JPG ou PNG — até 10 MB"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  file={documento}
                  onChange={setDocumento}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  <span className="text-brand-blue mr-0.5">*</span>Descrição detalhada
                </label>
                <textarea
                  placeholder="Descreva detalhadamente a contestação, informando os dados que considera incorretos e as correções necessárias..."
                  value={form.descricao}
                  onChange={set("descricao")}
                  rows={5}
                  className={INPUT + " resize-none"}
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || !canSubmit}
                  className="w-full bg-brand-blue text-white font-bold py-4 rounded-xl hover:bg-brand-blue/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm tracking-wide"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      ENVIAR CONTESTAÇÃO
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-400 text-center mt-3">
                  Ao enviar, você concorda que as informações fornecidas são verdadeiras e serão analisadas
                  pela equipe técnica da Poupe Energia.
                </p>
              </div>
            </form>

            <p className="text-xs text-gray-400 text-center mt-4">
              Dúvidas? Entre em contato:{" "}
              <a href="mailto:revisao.poupeenergia@hotmail.com" className="text-brand-blue hover:underline">
                revisao.poupeenergia@hotmail.com
              </a>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
