import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowLeft, User, Zap, FileText, CheckCircle2, XCircle,
  DollarSign, MessageSquare, Phone, Mail, Clock, ChevronRight, Eye,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Checklist = {
  docs_conferidos?: boolean;
  dados_validados?: boolean;
  cadastrado_parceiro?: boolean;
  contrato_emitido?: boolean;
  contrato_enviado?: boolean;
  contrato_assinado?: boolean;
};

type HistoricoEvento = { status: string; data: string };

type Cadastro = {
  id: string;
  created_at: string;
  nome: string;
  cpf_cnpj: string;
  whatsapp: string;
  telefone: string | null;
  email: string;
  distribuidora_nome: string | null;
  empresa_nome: string | null;
  empresa_id: string | null;
  codigo_embaixador: string | null;
  doc_frente_url: string | null;
  doc_verso_url: string | null;
  fatura_url: string | null;
  chave_pix: string | null;
  numero_uc: string | null;
  aceite_termos: boolean;
  ciente_parcela_unica: boolean;
  autoriza_validacao: boolean;
  status: string;
  cashback_percentual: number | null;
  valor_cashback: number | null;
  observacoes: string | null;
  data_pagamento: string | null;
  checklist: Checklist | null;
  historico: HistoricoEvento[] | null;
  consumo_kwh: number | null;
  valor_conta: number | null;
  classe_consumo: string | null;
  nome_titular: string | null;
  endereco_instalacao: string | null;
};

// ─── Configuração de status ───────────────────────────────────────────────────

const STATUS_FLOW = ["pendente", "em_analise", "cadastrado_parceiro", "contrato_enviado", "ativo", "pago"];

const STATUS_LABELS: Record<string, string> = {
  pendente:            "Pendente",
  em_analise:          "Em análise",
  cadastrado_parceiro: "Cadastrado no parceiro",
  contrato_enviado:    "Contrato enviado",
  ativo:               "Ativo",
  pago:                "Pago",
  cancelado:           "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  pendente:            "bg-yellow-100 text-yellow-800",
  em_analise:          "bg-blue-100 text-blue-700",
  cadastrado_parceiro: "bg-purple-100 text-purple-700",
  contrato_enviado:    "bg-indigo-100 text-indigo-700",
  ativo:               "bg-green-100 text-green-700",
  pago:                "bg-emerald-100 text-emerald-800",
  cancelado:           "bg-red-100 text-red-700",
};

const STATUS_OPTIONS = [...STATUS_FLOW, "cancelado"];

const CHECKLIST_ITEMS: { key: keyof Checklist; label: string }[] = [
  { key: "docs_conferidos",     label: "Documentos conferidos" },
  { key: "dados_validados",     label: "Dados do cliente validados" },
  { key: "cadastrado_parceiro", label: "Cadastrado na comercializadora" },
  { key: "contrato_emitido",    label: "Contrato gerado/emitido" },
  { key: "contrato_enviado",    label: "Contrato enviado ao cliente" },
  { key: "contrato_assinado",   label: "Contrato assinado pelo cliente" },
];

// ─── Utilitários ──────────────────────────────────────────────────────────────

const SUPABASE_URL = "https://sdmbkayjipowfkxaohxo.supabase.co";

function docUrl(path: string | null) {
  if (!path) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/documentos-adesao/${path}`;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800 break-all">{value || "—"}</p>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-5 space-y-4 ${className}`}>
      {children}
    </div>
  );
}

function CardTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
      {icon}{label}
    </p>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function CashbackDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rec, setRec] = useState<Cadastro | null>(null);
  const [loading, setLoading] = useState(true);
  const [obsLocal, setObsLocal] = useState("");
  const [valorLocal, setValorLocal] = useState("");
  const [savingObs, setSavingObs] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("cashback_cadastros" as any)
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error) { toast.error("Adesão não encontrada."); navigate("/admin/cashback"); return; }
        setRec(data as Cadastro);
        setObsLocal((data as Cadastro).observacoes ?? "");
        setValorLocal((data as Cadastro).valor_cashback != null ? String((data as Cadastro).valor_cashback) : "");
        setLoading(false);
      });
  }, [id]);

  const updateStatus = async (status: string) => {
    if (!rec) return;
    const novoEvento: HistoricoEvento = { status, data: new Date().toISOString() };
    const novoHistorico = [...(rec.historico ?? []), novoEvento];
    const extra: any = {};
    if (status === "pago") extra.data_pagamento = new Date().toISOString();

    const { error } = await supabase
      .from("cashback_cadastros" as any)
      .update({ status, historico: novoHistorico, ...extra } as any)
      .eq("id", rec.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Status atualizado!");
    setRec((r) => r ? { ...r, status, historico: novoHistorico, ...extra } : r);
  };

  const toggleChecklist = async (key: keyof Checklist, value: boolean) => {
    if (!rec) return;
    const novoChecklist: Checklist = { ...(rec.checklist ?? {}), [key]: value };
    const { error } = await supabase
      .from("cashback_cadastros" as any)
      .update({ checklist: novoChecklist } as any)
      .eq("id", rec.id);
    if (error) { toast.error(error.message); return; }
    setRec((r) => r ? { ...r, checklist: novoChecklist } : r);
  };

  const saveObs = async () => {
    if (!rec) return;
    setSavingObs(true);
    const valor = valorLocal ? parseFloat(valorLocal.replace(",", ".")) : null;
    const { error } = await supabase
      .from("cashback_cadastros" as any)
      .update({ observacoes: obsLocal || null, valor_cashback: valor } as any)
      .eq("id", rec.id);
    if (error) { toast.error(error.message); }
    else {
      toast.success("Salvo!");
      setRec((r) => r ? { ...r, observacoes: obsLocal || null, valor_cashback: valor } : r);
    }
    setSavingObs(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando...</div>
  );
  if (!rec) return null;

  const checkedCount = CHECKLIST_ITEMS.filter(({ key }) => rec.checklist?.[key]).length;
  const fone = rec.telefone ?? rec.whatsapp;

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/cashback")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">{rec.nome}</h1>
          <p className="text-xs text-muted-foreground">
            Adesão em {new Date(rec.created_at).toLocaleString("pt-BR")}
            {rec.empresa_nome && <span> · {rec.empresa_nome}</span>}
          </p>
        </div>
        <Badge className={`${STATUS_COLORS[rec.status] ?? "bg-gray-100 text-gray-700"} text-sm px-3 py-1`}>
          {STATUS_LABELS[rec.status] ?? rec.status}
        </Badge>
      </div>

      {/* Layout duas colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ═══ COLUNA ESQUERDA ═══════════════════════════════════════════════ */}
        <div className="space-y-5">

          {/* Dados do solicitante */}
          <Card>
            <CardTitle icon={<User className="h-3.5 w-3.5" />} label="Dados do solicitante" />
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="col-span-2"><InfoRow label="Nome completo" value={rec.nome} /></div>
              <InfoRow label="CPF/CNPJ" value={<span className="font-mono">{rec.cpf_cnpj}</span>} />
              <InfoRow label="Data de cadastro" value={new Date(rec.created_at).toLocaleDateString("pt-BR")} />
              <InfoRow label="Telefone / WhatsApp" value={fone} />
              <div className="col-span-2"><InfoRow label="E-mail" value={rec.email} /></div>
              {rec.codigo_embaixador && (
                <div className="col-span-2"><InfoRow label="Código do Parceiro" value={rec.codigo_embaixador} /></div>
              )}
            </div>
          </Card>

          {/* Dados da energia */}
          <Card>
            <CardTitle icon={<Zap className="h-3.5 w-3.5" />} label="Dados da energia" />
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <InfoRow label="Distribuidora" value={rec.distribuidora_nome} />
              <InfoRow label="Comercializadora" value={
                rec.empresa_nome
                  ? <span>{rec.empresa_nome}{rec.cashback_percentual != null && rec.cashback_percentual > 0 && <span className="ml-2 text-brand-blue font-bold">⚡ {rec.cashback_percentual}%</span>}</span>
                  : null
              } />
              {rec.numero_uc && <InfoRow label="Número UC" value={<span className="font-mono">{rec.numero_uc}</span>} />}
              {rec.classe_consumo && <InfoRow label="Classe" value={rec.classe_consumo} />}
              {rec.consumo_kwh != null && <InfoRow label="Consumo médio" value={`${rec.consumo_kwh} kWh/mês`} />}
              {rec.valor_conta != null && <InfoRow label="Valor médio da conta" value={`R$ ${rec.valor_conta.toFixed(2)}`} />}
              {rec.nome_titular && <div className="col-span-2"><InfoRow label="Titular na fatura" value={rec.nome_titular} /></div>}
              {rec.endereco_instalacao && <div className="col-span-2"><InfoRow label="Endereço da instalação" value={rec.endereco_instalacao} /></div>}
              {rec.chave_pix && (
                <div className="col-span-2">
                  <InfoRow label="Chave Pix" value={
                    <span className="font-mono bg-green-50 text-green-800 px-2 py-0.5 rounded text-xs">{rec.chave_pix}</span>
                  } />
                </div>
              )}
            </div>
          </Card>

          {/* Documentos */}
          <Card>
            <CardTitle icon={<FileText className="h-3.5 w-3.5" />} label="Documentos anexados" />
            <div className="space-y-3">
              {[
                { label: "RG/CNH — Frente", path: rec.doc_frente_url },
                { label: "RG/CNH — Verso",  path: rec.doc_verso_url  },
                { label: "Fatura de Luz",   path: rec.fatura_url     },
              ].map(({ label, path }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600">{label}</span>
                  {path ? (
                    <a
                      href={docUrl(path)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:underline"
                    >
                      <Eye className="h-4 w-4" /> Abrir
                    </a>
                  ) : (
                    <span className="text-sm text-gray-300">Não enviado</span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Confirmações */}
          <Card>
            <CardTitle icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Confirmações do cliente" />
            <div className="space-y-2">
              {[
                { label: "Aceite dos Termos",       val: rec.aceite_termos },
                { label: "Ciente da parcela única", val: rec.ciente_parcela_unica },
                { label: "Autoriza validação",      val: rec.autoriza_validacao },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  {item.val
                    ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    : <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
              {rec.data_pagamento && (
                <div className="flex items-center gap-2 pt-2 border-t mt-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="text-sm">Pago em: <strong>{new Date(rec.data_pagamento).toLocaleDateString("pt-BR")}</strong></span>
                </div>
              )}
            </div>
          </Card>

        </div>

        {/* ═══ COLUNA DIREITA ════════════════════════════════════════════════ */}
        <div className="space-y-5">

          {/* Status */}
          <Card>
            <CardTitle icon={<ChevronRight className="h-3.5 w-3.5" />} label="Status da adesão" />

            {/* Barra de progresso */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {STATUS_FLOW.map((s, i) => {
                const idx = STATUS_FLOW.indexOf(rec.status);
                const done = i < idx;
                const active = s === rec.status && rec.status !== "cancelado";
                return (
                  <div key={s} className="flex items-center gap-1 shrink-0">
                    <div className={`h-2.5 w-2.5 rounded-full shrink-0 transition ${done || active ? "bg-brand-blue" : "bg-gray-200"}`} />
                    <span className={`text-[10px] whitespace-nowrap ${active ? "font-bold text-brand-blue" : done ? "text-gray-500" : "text-gray-300"}`}>
                      {STATUS_LABELS[s]}
                    </span>
                    {i < STATUS_FLOW.length - 1 && (
                      <div className={`h-px w-4 ${done ? "bg-brand-blue" : "bg-gray-200"}`} />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Badge className={`${STATUS_COLORS[rec.status] ?? "bg-gray-100 text-gray-700"} shrink-0`}>
                {STATUS_LABELS[rec.status] ?? rec.status}
              </Badge>
              <Select value={rec.status} onValueChange={updateStatus}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Checklist */}
          <Card>
            <CardTitle icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Checklist interno" />
            <div className="space-y-3">
              {CHECKLIST_ITEMS.map(({ key, label }) => {
                const checked = !!(rec.checklist?.[key]);
                return (
                  <label key={key} className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => toggleChecklist(key, !checked)}
                      className={`h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition ${
                        checked ? "bg-green-500 border-green-500" : "border-gray-300 group-hover:border-green-400"
                      }`}
                    >
                      {checked && (
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${checked ? "line-through text-gray-400" : "text-gray-700"}`}>{label}</span>
                  </label>
                );
              })}
            </div>
            <div className="pt-3 border-t">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Progresso</span>
                <span className="font-semibold">{checkedCount} / {CHECKLIST_ITEMS.length}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${(checkedCount / CHECKLIST_ITEMS.length) * 100}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Gestão interna */}
          <Card>
            <CardTitle icon={<DollarSign className="h-3.5 w-3.5" />} label="Gestão interna" />
            <div>
              <label className="text-xs font-semibold block mb-1">Valor do Cashback (R$)</label>
              <input
                type="number" min="0" step="0.01" placeholder="0,00"
                value={valorLocal}
                onChange={(e) => setValorLocal(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold flex items-center gap-1.5 mb-1">
                <MessageSquare className="h-3.5 w-3.5" /> Observações internas
              </label>
              <Textarea
                placeholder="Anotações da equipe sobre esta adesão..."
                value={obsLocal}
                onChange={(e) => setObsLocal(e.target.value)}
                rows={4}
                className="text-sm resize-none"
              />
            </div>
            <Button onClick={saveObs} disabled={savingObs} className="w-full">
              {savingObs ? "Salvando..." : "Salvar"}
            </Button>
          </Card>

          {/* Histórico */}
          <Card>
            <CardTitle icon={<Clock className="h-3.5 w-3.5" />} label="Histórico" />
            <div className="space-y-2">
              <div className="flex items-start gap-3 text-sm text-gray-500">
                <div className="h-2 w-2 rounded-full bg-gray-300 shrink-0 mt-1.5" />
                <span>Adesão criada — {new Date(rec.created_at).toLocaleString("pt-BR")}</span>
              </div>
              {(rec.historico ?? []).map((ev, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-gray-600">
                  <div className="h-2 w-2 rounded-full bg-brand-blue shrink-0 mt-1.5" />
                  <span>
                    <span className="font-semibold">{STATUS_LABELS[ev.status] ?? ev.status}</span>
                    {" — "}
                    {new Date(ev.data).toLocaleString("pt-BR")}
                  </span>
                </div>
              ))}
              {(!rec.historico || rec.historico.length === 0) && (
                <p className="text-xs text-gray-400">Nenhuma mudança de status ainda.</p>
              )}
            </div>
          </Card>

          {/* Contato */}
          <Card>
            <CardTitle icon={<Phone className="h-3.5 w-3.5" />} label="Contato" />
            <div className="space-y-2">
              <a
                href={`https://wa.me/55${fone.replace(/\D/g, "")}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20b958] text-white font-semibold text-sm px-4 py-3 rounded-xl transition"
              >
                <Phone className="h-4 w-4" /> Contatar via WhatsApp
              </a>
              <a
                href={`mailto:${rec.email}`}
                className="flex items-center justify-center gap-2 w-full bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue font-semibold text-sm px-4 py-3 rounded-xl transition"
              >
                <Mail className="h-4 w-4" /> Enviar e-mail
              </a>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
