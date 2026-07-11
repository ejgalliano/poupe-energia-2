import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import {
  Download, Search, FileText, Phone, Mail,
  Building2, User, Calendar, CheckCircle2, XCircle,
  DollarSign, MessageSquare, Eye, Zap, Clock, ChevronRight,
} from "lucide-react";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Checklist = {
  docs_conferidos?: boolean;
  dados_validados?: boolean;
  cadastrado_parceiro?: boolean;
  contrato_emitido?: boolean;
  contrato_enviado?: boolean;
  contrato_assinado?: boolean;
};

type HistoricoEvento = {
  status: string;
  data: string;
};

type Cadastro = {
  id: string;
  created_at: string;
  nome: string;
  cpf_cnpj: string;
  whatsapp: string;
  telefone: string | null;
  email: string;
  distribuidora_id: string | null;
  distribuidora_nome: string | null;
  empresa_id: string | null;
  empresa_nome: string | null;
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

const STATUS_FLOW = [
  "pendente",
  "em_analise",
  "cadastrado_parceiro",
  "contrato_enviado",
  "ativo",
  "pago",
];

const STATUS_LABELS: Record<string, string> = {
  pendente:             "Pendente",
  em_analise:           "Em análise",
  cadastrado_parceiro:  "Cadastrado no parceiro",
  contrato_enviado:     "Contrato enviado",
  ativo:                "Ativo",
  pago:                 "Pago",
  cancelado:            "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  pendente:             "bg-yellow-100 text-yellow-800",
  em_analise:           "bg-blue-100 text-blue-700",
  cadastrado_parceiro:  "bg-purple-100 text-purple-700",
  contrato_enviado:     "bg-indigo-100 text-indigo-700",
  ativo:                "bg-green-100 text-green-700",
  pago:                 "bg-emerald-100 text-emerald-800",
  cancelado:            "bg-red-100 text-red-700",
};

const STATUS_OPTIONS = [...STATUS_FLOW, "cancelado"];

// ─── Checklist ───────────────────────────────────────────────────────────────

const CHECKLIST_ITEMS: { key: keyof Checklist; label: string }[] = [
  { key: "docs_conferidos",    label: "Documentos conferidos" },
  { key: "dados_validados",    label: "Dados do cliente validados" },
  { key: "cadastrado_parceiro", label: "Cadastrado na comercializadora" },
  { key: "contrato_emitido",   label: "Contrato gerado/emitido" },
  { key: "contrato_enviado",   label: "Contrato enviado ao cliente" },
  { key: "contrato_assinado",  label: "Contrato assinado pelo cliente" },
];

// ─── Utilitários ─────────────────────────────────────────────────────────────

const SUPABASE_URL = "https://sdmbkayjipowfkxaohxo.supabase.co";

function docUrl(path: string | null) {
  if (!path) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/documentos-adesao/${path}`;
}

function DocLink({ path, label }: { path: string | null; label: string }) {
  if (!path) return <span className="text-xs text-gray-400">—</span>;
  return (
    <a
      href={docUrl(path)!}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:underline"
    >
      <Eye className="h-3 w-3" />
      {label}
    </a>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800 break-all">{value || "—"}</p>
    </div>
  );
}

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5 mb-3">
      {icon}{label}
    </p>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CashbackCadastros() {
  const [cadastros, setCadastros] = useState<Cadastro[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sel, setSel] = useState<Cadastro | null>(null);
  const [savingObs, setSavingObs] = useState(false);
  const [obsLocal, setObsLocal] = useState("");
  const [valorLocal, setValorLocal] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cashback_cadastros" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) toast.error(error.message);
    else setCadastros((data ?? []) as Cadastro[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    setObsLocal(sel?.observacoes ?? "");
    setValorLocal(sel?.valor_cashback != null ? String(sel.valor_cashback) : "");
  }, [sel?.id]);

  const filtrados = useMemo(() => {
    const q = search.toLowerCase();
    return cadastros.filter((c) => {
      if (filterStatus !== "all" && c.status !== filterStatus) return false;
      if (q && ![c.nome, c.email, c.cpf_cnpj, c.distribuidora_nome ?? "", c.empresa_nome ?? "", c.telefone ?? "", c.whatsapp].some((v) => v.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [cadastros, search, filterStatus]);

  // ── Atualiza status e registra no histórico ──
  const updateStatus = async (id: string, status: string) => {
    const cadastro = cadastros.find((c) => c.id === id);
    const historicoAtual: HistoricoEvento[] = cadastro?.historico ?? [];
    const novoEvento: HistoricoEvento = { status, data: new Date().toISOString() };
    const novoHistorico = [...historicoAtual, novoEvento];

    const extra: any = {};
    if (status === "pago") extra.data_pagamento = new Date().toISOString();

    const { error } = await supabase
      .from("cashback_cadastros" as any)
      .update({ status, historico: novoHistorico, ...extra } as any)
      .eq("id", id);

    if (error) { toast.error(error.message); return; }
    toast.success("Status atualizado!");
    setCadastros((prev) => prev.map((c) => c.id === id ? { ...c, status, historico: novoHistorico, ...extra } : c));
    if (sel?.id === id) setSel((s) => s ? { ...s, status, historico: novoHistorico, ...extra } : s);
  };

  // ── Atualiza checklist ──
  const toggleChecklist = async (key: keyof Checklist, value: boolean) => {
    if (!sel) return;
    const novoChecklist: Checklist = { ...(sel.checklist ?? {}), [key]: value };
    const { error } = await supabase
      .from("cashback_cadastros" as any)
      .update({ checklist: novoChecklist } as any)
      .eq("id", sel.id);
    if (error) { toast.error(error.message); return; }
    setCadastros((prev) => prev.map((c) => c.id === sel.id ? { ...c, checklist: novoChecklist } : c));
    setSel((s) => s ? { ...s, checklist: novoChecklist } : s);
  };

  // ── Salva observações e valor cashback ──
  const saveObs = async () => {
    if (!sel) return;
    setSavingObs(true);
    const valor = valorLocal ? parseFloat(valorLocal.replace(",", ".")) : null;
    const { error } = await supabase
      .from("cashback_cadastros" as any)
      .update({ observacoes: obsLocal || null, valor_cashback: valor } as any)
      .eq("id", sel.id);
    if (error) { toast.error(error.message); }
    else {
      toast.success("Salvo!");
      setCadastros((prev) => prev.map((c) => c.id === sel.id ? { ...c, observacoes: obsLocal || null, valor_cashback: valor } : c));
      setSel((s) => s ? { ...s, observacoes: obsLocal || null, valor_cashback: valor } : s);
    }
    setSavingObs(false);
  };

  // ── Export CSV ──
  const exportCSV = () => {
    const header = ["Data", "Nome", "CPF/CNPJ", "Telefone", "Email", "Distribuidora", "Empresa", "UC", "Consumo kWh", "Valor Conta", "Classe", "Cód Embaixador", "Valor Cashback", "Status", "Data Pagamento"];
    const rows = filtrados.map((c) => [
      new Date(c.created_at).toLocaleString("pt-BR"),
      c.nome, c.cpf_cnpj, c.telefone ?? c.whatsapp, c.email,
      c.distribuidora_nome ?? "", c.empresa_nome ?? "",
      c.numero_uc ?? "", c.consumo_kwh ?? "", c.valor_conta ?? "", c.classe_consumo ?? "",
      c.codigo_embaixador ?? "",
      c.valor_cashback != null ? `R$ ${c.valor_cashback.toFixed(2)}` : "",
      STATUS_LABELS[c.status] ?? c.status,
      c.data_pagamento ? new Date(c.data_pagamento).toLocaleDateString("pt-BR") : "",
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `adesoes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { pendente: 0, em_analise: 0, cadastrado_parceiro: 0, contrato_enviado: 0, ativo: 0, pago: 0, cancelado: 0 };
    for (const item of cadastros) if (item.status in c) c[item.status]++;
    return c;
  }, [cadastros]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestão de Adesões</h1>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-1" /> Exportar CSV
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {[
          { label: "Pendentes",          key: "pendente",            color: "text-yellow-700",  bg: "bg-yellow-50"  },
          { label: "Em análise",         key: "em_analise",          color: "text-blue-700",    bg: "bg-blue-50"    },
          { label: "No parceiro",        key: "cadastrado_parceiro", color: "text-purple-700",  bg: "bg-purple-50"  },
          { label: "Contrato enviado",   key: "contrato_enviado",    color: "text-indigo-700",  bg: "bg-indigo-50"  },
          { label: "Ativos",             key: "ativo",               color: "text-green-700",   bg: "bg-green-50"   },
          { label: "Pagos",              key: "pago",                color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Cancelados",         key: "cancelado",           color: "text-red-600",     bg: "bg-red-50"     },
        ].map((s) => (
          <Card
            key={s.key}
            className={`${s.bg} cursor-pointer transition hover:ring-2 hover:ring-offset-1 ${filterStatus === s.key ? "ring-2 ring-offset-1" : ""}`}
            onClick={() => setFilterStatus(filterStatus === s.key ? "all" : s.key)}
          >
            <CardContent className="pt-3 pb-2 px-3">
              <div className={`text-2xl font-extrabold ${s.color}`}>{counts[s.key] ?? 0}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 font-medium leading-tight">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email, CPF, empresa ou distribuidora..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>CPF/CNPJ</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Distribuidora</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Fatura</TableHead>
                <TableHead>Docs</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              )}
              {!loading && filtrados.map((c) => (
                <TableRow key={c.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setSel(c)}>
                  <TableCell className="text-xs whitespace-nowrap">
                    {new Date(c.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm max-w-[140px] truncate">{c.nome}</div>
                    {c.codigo_embaixador && (
                      <div className="text-[10px] text-muted-foreground">Emb: {c.codigo_embaixador}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-mono">{c.cpf_cnpj}</TableCell>
                  <TableCell>
                    <div className="text-xs">{c.telefone ?? c.whatsapp}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[130px]">{c.email}</div>
                  </TableCell>
                  <TableCell className="text-xs max-w-[110px] truncate">{c.distribuidora_nome ?? "—"}</TableCell>
                  <TableCell className="text-xs max-w-[120px]">
                    <div className="truncate">{c.empresa_nome ?? "—"}</div>
                    {c.cashback_percentual != null && c.cashback_percentual > 0 && (
                      <div className="text-[10px] text-brand-blue font-semibold">⚡ {c.cashback_percentual}%</div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    {c.consumo_kwh != null ? (
                      <div>
                        <div className="font-medium">{c.consumo_kwh} kWh</div>
                        {c.valor_conta != null && <div className="text-muted-foreground">R$ {c.valor_conta.toFixed(0)}</div>}
                      </div>
                    ) : <span className="text-gray-300">—</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {c.doc_frente_url && <span className="h-2 w-2 rounded-full bg-green-500" title="Doc frente" />}
                      {c.doc_verso_url  && <span className="h-2 w-2 rounded-full bg-green-500" title="Doc verso" />}
                      {c.fatura_url     && <span className="h-2 w-2 rounded-full bg-blue-500"  title="Fatura" />}
                      {!c.doc_frente_url && !c.doc_verso_url && !c.fatura_url && (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-700"} text-[11px]`}>
                      {STATUS_LABELS[c.status] ?? c.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filtrados.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nenhuma adesão encontrada.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground text-right">
        {filtrados.length} de {cadastros.length} adesões
      </div>

      {/* ═══ Painel de detalhe ═══════════════════════════════════════════════ */}
      <Sheet open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-blue" />
              Detalhe da Adesão
            </SheetTitle>
          </SheetHeader>

          {sel && (
            <div className="space-y-5 mt-5 text-sm">

              {/* ── Fluxo de status ── */}
              <div className="border rounded-xl p-4">
                <SectionTitle icon={<ChevronRight className="h-3.5 w-3.5" />} label="Status da adesão" />

                {/* Barra de progresso */}
                <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
                  {STATUS_FLOW.map((s, i) => {
                    const idx = STATUS_FLOW.indexOf(sel.status);
                    const done = i < idx;
                    const active = s === sel.status && sel.status !== "cancelado";
                    return (
                      <div key={s} className="flex items-center gap-1 shrink-0">
                        <div className={`h-2 w-2 rounded-full shrink-0 ${done || active ? "bg-brand-blue" : "bg-gray-200"}`} />
                        <span className={`text-[10px] whitespace-nowrap ${active ? "font-bold text-brand-blue" : done ? "text-gray-500" : "text-gray-300"}`}>
                          {STATUS_LABELS[s]}
                        </span>
                        {i < STATUS_FLOW.length - 1 && <div className={`h-px w-3 ${done ? "bg-brand-blue" : "bg-gray-200"}`} />}
                      </div>
                    );
                  })}
                  {sel.status === "cancelado" && (
                    <Badge className="bg-red-100 text-red-700 ml-2 text-[10px]">Cancelado</Badge>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Badge className={`${STATUS_COLORS[sel.status] ?? "bg-gray-100 text-gray-700"} text-xs shrink-0`}>
                    {STATUS_LABELS[sel.status] ?? sel.status}
                  </Badge>
                  <Select value={sel.status} onValueChange={(v) => updateStatus(sel.id, v)}>
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
              </div>

              {/* ── Checklist interno ── */}
              <div className="border rounded-xl p-4">
                <SectionTitle icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Checklist interno" />
                <div className="space-y-2">
                  {CHECKLIST_ITEMS.map(({ key, label }) => {
                    const checked = !!(sel.checklist?.[key]);
                    return (
                      <label
                        key={key}
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => toggleChecklist(key, !checked)}
                      >
                        <div className={`h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition ${
                          checked ? "bg-green-500 border-green-500" : "border-gray-300 group-hover:border-green-400"
                        }`}>
                          {checked && (
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-xs ${checked ? "line-through text-gray-400" : "text-gray-700"}`}>
                          {label}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                    <span>Progresso</span>
                    <span className="font-semibold">
                      {CHECKLIST_ITEMS.filter(({ key }) => sel.checklist?.[key]).length} / {CHECKLIST_ITEMS.length}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${(CHECKLIST_ITEMS.filter(({ key }) => sel.checklist?.[key]).length / CHECKLIST_ITEMS.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* ── Dados do cliente ── */}
              <div className="border rounded-xl p-4 space-y-3">
                <SectionTitle icon={<User className="h-3.5 w-3.5" />} label="Dados do solicitante" />
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="col-span-2"><InfoRow label="Nome" value={sel.nome} /></div>
                  <InfoRow label="CPF/CNPJ" value={<span className="font-mono">{sel.cpf_cnpj}</span>} />
                  <InfoRow label="Cadastro" value={new Date(sel.created_at).toLocaleDateString("pt-BR")} />
                  <InfoRow label="Telefone" value={sel.telefone ?? sel.whatsapp} />
                  <div className="col-span-2"><InfoRow label="E-mail" value={sel.email} /></div>
                  {sel.codigo_embaixador && (
                    <div className="col-span-2"><InfoRow label="Código do Embaixador" value={sel.codigo_embaixador} /></div>
                  )}
                </div>
              </div>

              {/* ── Dados da energia ── */}
              <div className="border rounded-xl p-4 space-y-3">
                <SectionTitle icon={<Zap className="h-3.5 w-3.5" />} label="Dados da energia" />
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <InfoRow label="Distribuidora" value={sel.distribuidora_nome} />
                  <InfoRow label="Comercializadora" value={
                    sel.empresa_nome
                      ? <span>{sel.empresa_nome}{sel.cashback_percentual != null && sel.cashback_percentual > 0 && <span className="ml-1.5 text-brand-blue font-bold">⚡ {sel.cashback_percentual}%</span>}</span>
                      : null
                  } />
                  {sel.numero_uc && <InfoRow label="Número UC" value={<span className="font-mono">{sel.numero_uc}</span>} />}
                  {sel.classe_consumo && <InfoRow label="Classe" value={sel.classe_consumo} />}
                  {sel.consumo_kwh != null && <InfoRow label="Consumo médio" value={`${sel.consumo_kwh} kWh`} />}
                  {sel.valor_conta != null && <InfoRow label="Valor da conta" value={`R$ ${sel.valor_conta.toFixed(2)}`} />}
                  {sel.nome_titular && <div className="col-span-2"><InfoRow label="Titular na fatura" value={sel.nome_titular} /></div>}
                  {sel.endereco_instalacao && <div className="col-span-2"><InfoRow label="Endereço da instalação" value={sel.endereco_instalacao} /></div>}
                  {sel.chave_pix && (
                    <div className="col-span-2">
                      <InfoRow label="Chave Pix" value={
                        <span className="font-mono bg-green-50 text-green-800 px-2 py-0.5 rounded text-xs">{sel.chave_pix}</span>
                      } />
                    </div>
                  )}
                </div>
              </div>

              {/* ── Documentos ── */}
              <div className="border rounded-xl p-4 space-y-3">
                <SectionTitle icon={<FileText className="h-3.5 w-3.5" />} label="Documentos anexados" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">RG/CNH — Frente</span>
                    <DocLink path={sel.doc_frente_url} label="Abrir" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">RG/CNH — Verso</span>
                    <DocLink path={sel.doc_verso_url} label="Abrir" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Fatura de Luz</span>
                    <DocLink path={sel.fatura_url} label="Abrir" />
                  </div>
                </div>
              </div>

              {/* ── Confirmações ── */}
              <div className="border rounded-xl p-4 space-y-2">
                <SectionTitle icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Confirmações do cliente" />
                {[
                  { label: "Aceite dos Termos",       val: sel.aceite_termos },
                  { label: "Ciente da parcela única", val: sel.ciente_parcela_unica },
                  { label: "Autoriza validação",      val: sel.autoriza_validacao },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    {item.val
                      ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      : <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
                    <span className="text-xs">{item.label}</span>
                  </div>
                ))}
                {sel.data_pagamento && (
                  <div className="flex items-center gap-2 pt-2 border-t mt-2">
                    <Calendar className="h-4 w-4 text-green-600 shrink-0" />
                    <span className="text-xs">Pago em: <strong>{new Date(sel.data_pagamento).toLocaleDateString("pt-BR")}</strong></span>
                  </div>
                )}
              </div>

              {/* ── Gestão interna (valor + observações) ── */}
              <div className="border rounded-xl p-4 space-y-3">
                <SectionTitle icon={<DollarSign className="h-3.5 w-3.5" />} label="Gestão interna" />
                <div>
                  <label className="text-xs font-semibold block mb-1">Valor do Cashback (R$)</label>
                  <input
                    type="number" min="0" step="0.01" placeholder="0,00"
                    value={valorLocal}
                    onChange={(e) => setValorLocal(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
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
                    rows={3}
                    className="text-sm resize-none"
                  />
                </div>
                <Button onClick={saveObs} disabled={savingObs} size="sm" className="w-full">
                  {savingObs ? "Salvando..." : "Salvar"}
                </Button>
              </div>

              {/* ── Histórico de status ── */}
              {sel.historico && sel.historico.length > 0 && (
                <div className="border rounded-xl p-4">
                  <SectionTitle icon={<Clock className="h-3.5 w-3.5" />} label="Histórico" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="h-2 w-2 rounded-full bg-gray-300 shrink-0" />
                      <span>Adesão criada — {new Date(sel.created_at).toLocaleString("pt-BR")}</span>
                    </div>
                    {sel.historico.map((ev, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                        <div className={`h-2 w-2 rounded-full shrink-0 ${STATUS_COLORS[ev.status]?.includes("green") ? "bg-green-500" : "bg-brand-blue"}`} />
                        <span>
                          <span className="font-semibold">{STATUS_LABELS[ev.status] ?? ev.status}</span>
                          {" — "}
                          {new Date(ev.data).toLocaleString("pt-BR")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Ações de contato ── */}
              <div className="flex flex-col gap-2 pb-2">
                <a
                  href={`https://wa.me/55${(sel.telefone ?? sel.whatsapp).replace(/\D/g, "")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20b958] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition w-full"
                >
                  <Phone className="h-4 w-4" />
                  Contatar via WhatsApp
                </a>
                <a
                  href={`mailto:${sel.email}`}
                  className="inline-flex items-center justify-center gap-2 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue text-sm font-semibold px-4 py-2.5 rounded-xl transition w-full"
                >
                  <Mail className="h-4 w-4" />
                  Enviar e-mail
                </a>
              </div>

            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
