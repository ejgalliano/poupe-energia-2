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
  Download, Search, FileText, ExternalLink, Phone, Mail,
  Building2, User, Calendar, CreditCard, CheckCircle2, XCircle,
  DollarSign, MessageSquare, Eye,
} from "lucide-react";

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
};

const STATUS_COLORS: Record<string, string> = {
  pendente:   "bg-yellow-100 text-yellow-800",
  em_analise: "bg-blue-100 text-blue-700",
  aprovado:   "bg-indigo-100 text-indigo-700",
  pago:       "bg-green-100 text-green-700",
  cancelado:  "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  pendente:   "Pendente",
  em_analise: "Em análise",
  aprovado:   "Aprovado",
  pago:       "Pago",
  cancelado:  "Cancelado",
};

const STATUS_OPTIONS = Object.keys(STATUS_LABELS);

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

  // Sync local state when sel changes
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

  const updateStatus = async (id: string, status: string) => {
    const extra: any = {};
    if (status === "pago") extra.data_pagamento = new Date().toISOString();
    const { error } = await supabase.from("cashback_cadastros" as any).update({ status, ...extra } as any).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Status atualizado!");
    setCadastros((prev) => prev.map((c) => c.id === id ? { ...c, status, ...extra } : c));
    if (sel?.id === id) setSel((s) => s ? { ...s, status, ...extra } : s);
  };

  const saveObs = async () => {
    if (!sel) return;
    setSavingObs(true);
    const valor = valorLocal ? parseFloat(valorLocal.replace(",", ".")) : null;
    const { error } = await supabase.from("cashback_cadastros" as any)
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

  const exportCSV = () => {
    const header = ["Data", "Nome", "CPF/CNPJ", "Telefone", "Email", "Distribuidora", "Empresa", "Cód Embaixador", "Valor Cashback", "Status", "Data Pagamento"];
    const rows = filtrados.map((c) => [
      new Date(c.created_at).toLocaleString("pt-BR"),
      c.nome, c.cpf_cnpj, c.telefone ?? c.whatsapp, c.email,
      c.distribuidora_nome ?? "", c.empresa_nome ?? "",
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
    const c = { pendente: 0, em_analise: 0, aprovado: 0, pago: 0, cancelado: 0 };
    for (const item of cadastros) if (item.status in c) c[item.status as keyof typeof c]++;
    return c;
  }, [cadastros]);

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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Pendentes",   value: counts.pendente,   color: "text-yellow-700", bg: "bg-yellow-50"  },
          { label: "Em análise",  value: counts.em_analise, color: "text-blue-700",   bg: "bg-blue-50"    },
          { label: "Aprovados",   value: counts.aprovado,   color: "text-indigo-700", bg: "bg-indigo-50"  },
          { label: "Pagos",       value: counts.pago,       color: "text-green-700",  bg: "bg-green-50"   },
          { label: "Cancelados",  value: counts.cancelado,  color: "text-red-600",    bg: "bg-red-50"     },
        ].map((s) => (
          <Card key={s.label} className={s.bg}>
            <CardContent className="pt-4 pb-3">
              <div className={`text-3xl font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5 font-medium">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, email, CPF, empresa ou distribuidora..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
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
                <TableHead>Docs</TableHead>
                <TableHead>Valor CB</TableHead>
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
                      <div className="text-[10px] text-brand-blue font-semibold">⚡ {c.cashback_percentual}% cashback</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {c.doc_frente_url && <span className="h-2 w-2 rounded-full bg-green-500" title="Doc frente" />}
                      {c.doc_verso_url  && <span className="h-2 w-2 rounded-full bg-green-500" title="Doc verso" />}
                      {c.fatura_url     && <span className="h-2 w-2 rounded-full bg-blue-500" title="Fatura" />}
                      {!c.doc_frente_url && !c.doc_verso_url && !c.fatura_url && (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    {c.valor_cashback != null
                      ? <span className="font-semibold text-green-700">R$ {c.valor_cashback.toFixed(2)}</span>
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-700"} text-[11px]`}>
                      {STATUS_LABELS[c.status] ?? c.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filtrados.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nenhum cadastro encontrado.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground text-right">
        {filtrados.length} de {cadastros.length} registros
      </div>

      {/* Painel de detalhe */}
      <Sheet open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-blue" />
              Detalhe do Cadastro
            </SheetTitle>
          </SheetHeader>

          {sel && (
            <div className="space-y-5 mt-5 text-sm">

              {/* Status */}
              <div className="flex items-center justify-between gap-3 bg-muted/30 rounded-xl px-4 py-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status atual</p>
                  <Badge className={`${STATUS_COLORS[sel.status] ?? "bg-gray-100 text-gray-700"} text-xs`}>
                    {STATUS_LABELS[sel.status] ?? sel.status}
                  </Badge>
                </div>
                <Select value={sel.status} onValueChange={(v) => updateStatus(sel.id, v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dados pessoais */}
              <div className="border rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Dados do Solicitante
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="col-span-2"><InfoRow label="Nome" value={sel.nome} /></div>
                  <InfoRow label="CPF/CNPJ" value={<span className="font-mono">{sel.cpf_cnpj}</span>} />
                  <InfoRow label="Data de cadastro" value={new Date(sel.created_at).toLocaleString("pt-BR")} />
                  <InfoRow label="Telefone" value={sel.telefone ?? sel.whatsapp} />
                  <div className="col-span-2"><InfoRow label="E-mail" value={sel.email} /></div>
                  {sel.codigo_embaixador && (
                    <div className="col-span-2"><InfoRow label="Código do Embaixador" value={sel.codigo_embaixador} /></div>
                  )}
                </div>
              </div>

              {/* Dados da energia */}
              <div className="border rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> Dados da Energia
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <InfoRow label="Distribuidora" value={sel.distribuidora_nome} />
                  <InfoRow label="Comercializadora" value={
                    sel.empresa_nome
                      ? <span>{sel.empresa_nome}{sel.cashback_percentual != null && sel.cashback_percentual > 0 && <span className="ml-1.5 text-brand-blue font-bold">⚡ {sel.cashback_percentual}%</span>}</span>
                      : "—"
                  } />
                  {sel.numero_uc && <InfoRow label="Número UC" value={<span className="font-mono">{sel.numero_uc}</span>} />}
                  {sel.chave_pix && (
                    <div className="col-span-2">
                      <InfoRow label="Chave Pix (para pagamento)" value={
                        <span className="font-mono bg-green-50 text-green-800 px-2 py-0.5 rounded text-xs">{sel.chave_pix}</span>
                      } />
                    </div>
                  )}
                </div>
              </div>

              {/* Documentos */}
              <div className="border rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Documentos Anexados
                </p>
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

              {/* Confirmações */}
              <div className="border rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Confirmações</p>
                {[
                  { label: "Aceite dos Termos",        val: sel.aceite_termos },
                  { label: "Ciente da parcela única",  val: sel.ciente_parcela_unica },
                  { label: "Autoriza validação",       val: sel.autoriza_validacao },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    {item.val
                      ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      : <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
                    <span className="text-xs">{item.label}</span>
                  </div>
                ))}
                {sel.data_pagamento && (
                  <div className="flex items-center gap-2 pt-1 border-t mt-2">
                    <Calendar className="h-4 w-4 text-green-600 shrink-0" />
                    <span className="text-xs">Pago em: <strong>{new Date(sel.data_pagamento).toLocaleDateString("pt-BR")}</strong></span>
                  </div>
                )}
              </div>

              {/* Valor Cashback + Observações */}
              <div className="border rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" /> Gestão Interna
                </p>
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
                    placeholder="Anotações da equipe sobre este cadastro..."
                    value={obsLocal}
                    onChange={(e) => setObsLocal(e.target.value)}
                    rows={3}
                    className="text-sm resize-none"
                  />
                </div>
                <Button onClick={saveObs} disabled={savingObs} size="sm" className="w-full">
                  {savingObs ? "Salvando..." : "Salvar observações"}
                </Button>
              </div>

              {/* Ações */}
              <div className="flex flex-col gap-2">
                <a
                  href={`https://wa.me/55${(sel.telefone ?? sel.whatsapp).replace(/\D/g, "")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20b958] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition w-full"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
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
