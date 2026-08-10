import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Copy, Download, Pencil, Plus, Save, X, CheckCircle2, XCircle, Eye } from "lucide-react";

type Embaixador = {
  id?: string;
  codigo: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  tipo: "pessoa_fisica" | "pessoa_juridica";
  cpf_cnpj: string | null;
  comissao_percentual: number;
  chave_pix: string | null;
  ativo: boolean;
};

type Candidato = {
  id: string;
  created_at: string;
  nome: string;
  cpf: string | null;
  email: string;
  telefone: string;
  cidade: string;
  uf: string;
  razao_social: string | null;
  cnpj: string | null;
  is_mei: boolean;
  tem_equipe: boolean;
  status: "pendente" | "aprovado" | "rejeitado";
  observacoes: string | null;
  aprovado_em: string | null;
  embaixador_id: string | null;
};

type CommissionPolicy = {
  id: string;
  service_type: "GD_A" | "GD_B";
  fcp_percent: number | null;
  representative_percent: number;
  recurring: boolean;
  trigger_event: "FIRST_PAYMENT" | "MONTHLY_RECEIPT";
  vigente_desde: string;
  ativo: boolean;
};

type LeadEmb = {
  id: string;
  lead_id: string;
  embaixador_id: string;
  empresa_id: string;
  status_comissao: "pendente" | "validado" | "pago" | "cancelado";
  valor_comissao: number;
  data_adesao: string | null;
  data_pagamento: string | null;
  observacoes: string | null;
  created_at: string;
  leads?: { nome: string | null; email: string | null; telefone: string | null; created_at: string } | null;
  empresas?: { nome: string } | null;
  embaixadores?: { codigo: string; nome: string; comissao_percentual: number; chave_pix: string | null } | null;
};

const PUBLIC_BASE = "https://www.poupeenergia.com.br";

const STATUS_COLORS: Record<string, string> = {
  pendente: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  validado: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  pago: "bg-green-100 text-green-700 hover:bg-green-100",
  cancelado: "bg-red-100 text-red-700 hover:bg-red-100",
};

const fmtBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Rotulos usados no formulario publico (/programa-de-parceiros) para decodificar
// os valores salvos em embaixadores_candidatos.observacoes (JSON).
const PERFIL_LABELS: Record<string, string> = {
  contabilidade: "Escritório Contábil",
  imobiliaria: "Imobiliária",
  condominio: "Administradora de Condomínio",
  solar: "Empresa de Energia Solar",
  seguros: "Corretor de Seguros",
  consultor: "Consultor Empresarial",
  bancario: "Correspondente Bancário",
  associacao: "Associação Comercial",
  outro: "Outro",
};

const QTD_CLIENTES_LABELS: Record<string, string> = {
  ate100: "Até 100",
  "101a500": "101 a 500",
  "501a2000": "501 a 2.000",
  acima2000: "Acima de 2.000",
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
  GD_B: "GD Grupo B (baixa tensão)",
  GD_A: "GD Livre Grupo A (alta tensão)",
};

const TRIGGER_LABELS: Record<string, string> = {
  FIRST_PAYMENT: "Comissão única, no primeiro pagamento",
  MONTHLY_RECEIPT: "Comissão recorrente, a cada recebimento mensal",
};

const nextCodigo = (existing: string[]) => {
  const nums = existing
    .map((c) => /^PPO(\d+)$/i.exec(c)?.[1])
    .filter(Boolean)
    .map((n) => parseInt(n as string, 10));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `PPO${String(next).padStart(3, "0")}`;
};

export default function Embaixadores() {
  const [embaixadores, setEmbaixadores] = useState<Embaixador[]>([]);
  const [leads, setLeads] = useState<LeadEmb[]>([]);
  const [empresas, setEmpresas] = useState<{ id: string; nome: string }[]>([]);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [policies, setPolicies] = useState<CommissionPolicy[]>([]);

  const [editing, setEditing] = useState<Embaixador | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  const [editingPolicy, setEditingPolicy] = useState<CommissionPolicy | null>(null);
  const [openPolicyForm, setOpenPolicyForm] = useState(false);

  // filtros leads
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const [dataIni, setDataIni] = useState(monthAgo);
  const [dataFim, setDataFim] = useState(today);
  const [filterEmb, setFilterEmb] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterEmpresa, setFilterEmpresa] = useState("all");

  const [selLead, setSelLead] = useState<LeadEmb | null>(null);
  const [selCandidato, setSelCandidato] = useState<Candidato | null>(null);

  const load = async () => {
    const [e, l, emp, cand, pol] = await Promise.all([
      supabase.from("embaixadores").select("*").order("codigo"),
      supabase
        .from("leads_embaixadores")
        .select("*, leads(nome,email,telefone,created_at), empresas(nome), embaixadores(codigo,nome,comissao_percentual,chave_pix)")
        .order("created_at", { ascending: false })
        .limit(2000),
      supabase.from("empresas").select("id, nome").order("nome"),
      supabase.from("embaixadores_candidatos").select("*").order("created_at", { ascending: false }),
      supabase.from("commission_policy").select("*").eq("ativo", true).order("service_type"),
    ]);
    setEmbaixadores((e.data ?? []) as Embaixador[]);
    setLeads((l.data ?? []) as any);
    setEmpresas((emp.data ?? []) as any);
    setCandidatos((cand.data ?? []) as Candidato[]);
    setPolicies((pol.data ?? []) as CommissionPolicy[]);
  };

  useEffect(() => { load(); }, []);

  const startNew = () => {
    setEditing({
      codigo: nextCodigo(embaixadores.map((x) => x.codigo)),
      nome: "",
      email: "",
      telefone: "",
      tipo: "pessoa_fisica",
      cpf_cnpj: "",
      comissao_percentual: 5,
      chave_pix: "",
      ativo: true,
    });
    setOpenForm(true);
  };

  const startEdit = (emb: Embaixador) => {
    setEditing({ ...emb });
    setOpenForm(true);
  };

  const saveEmb = async () => {
    if (!editing) return;
    if (!editing.codigo.trim() || !editing.nome.trim()) {
      toast.error("Código e nome são obrigatórios");
      return;
    }
    const payload = { ...editing, codigo: editing.codigo.trim().toUpperCase() };
    const { error } = await supabase
      .from("embaixadores")
      .upsert(payload as any, { onConflict: "id" });
    if (error) { toast.error(error.message); return; }
    setSavedOk(true);
    load();
  };

  const toggleAtivo = async (emb: Embaixador) => {
    const { error } = await supabase
      .from("embaixadores")
      .update({ ativo: !emb.ativo } as any)
      .eq("id", emb.id!);
    if (error) { toast.error(error.message); return; }
    load();
  };

  const startEditPolicy = (p: CommissionPolicy) => {
    setEditingPolicy({ ...p });
    setOpenPolicyForm(true);
  };

  const savePolicy = async () => {
    if (!editingPolicy) return;
    const { id, ...rest } = editingPolicy;
    const { error: deactivateErr } = await supabase
      .from("commission_policy")
      .update({ ativo: false })
      .eq("id", id);
    if (deactivateErr) { toast.error(deactivateErr.message); return; }
    const { error: insertErr } = await supabase
      .from("commission_policy")
      .insert({ ...rest, ativo: true, vigente_desde: new Date().toISOString() });
    if (insertErr) {
      toast.error(insertErr.message);
      await supabase.from("commission_policy").update({ ativo: true }).eq("id", id);
      return;
    }
    toast.success("Política atualizada! A nova versão vale a partir de agora.");
    setOpenPolicyForm(false);
    setEditingPolicy(null);
    load();
  };

  const copyLink = (codigo: string) => {
    const url = `${PUBLIC_BASE}/?emb=${codigo}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  const leadsFiltrados = useMemo(() => {
    const ini = new Date(dataIni + "T00:00:00").getTime();
    const fim = new Date(dataFim + "T23:59:59").getTime();
    return leads.filter((l) => {
      const t = new Date(l.created_at).getTime();
      if (t < ini || t > fim) return false;
      if (filterEmb !== "all" && l.embaixador_id !== filterEmb) return false;
      if (filterStatus !== "all" && l.status_comissao !== filterStatus) return false;
      if (filterEmpresa !== "all" && l.empresa_id !== filterEmpresa) return false;
      return true;
    });
  }, [leads, dataIni, dataFim, filterEmb, filterStatus, filterEmpresa]);

  const exportCSV = () => {
    const header = ["Data", "Consumidor", "Email", "Telefone", "Fornecedora", "Parceiro Comercial", "Comissão %", "Valor", "Status", "Data adesão", "Data pagamento"];
    const rows = leadsFiltrados.map((l) => [
      new Date(l.created_at).toLocaleString("pt-BR"),
      l.leads?.nome ?? "",
      l.leads?.email ?? "",
      l.leads?.telefone ?? "",
      l.empresas?.nome ?? "",
      `${l.embaixadores?.codigo ?? ""} - ${l.embaixadores?.nome ?? ""}`,
      String(l.embaixadores?.comissao_percentual ?? 0),
      String(l.valor_comissao ?? 0),
      l.status_comissao,
      l.data_adesao ?? "",
      l.data_pagamento ?? "",
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-parceiros-${dataIni}-a-${dataFim}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveSelLead = async (patch: Partial<LeadEmb>) => {
    if (!selLead) return;
    const { error } = await supabase
      .from("leads_embaixadores")
      .update(patch as any)
      .eq("id", selLead.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Atualizado!");
    setSelLead({ ...selLead, ...patch } as LeadEmb);
    load();
  };

  const aprovarCandidato = async (cand: Candidato) => {
    const codigo = nextCodigo(embaixadores.map((x) => x.codigo));
    const { data: embData, error: embErr } = await supabase
      .from("embaixadores")
      .insert({
        codigo,
        nome: cand.razao_social || cand.nome,
        email: cand.email,
        telefone: cand.telefone,
        tipo: cand.cnpj ? "pessoa_juridica" : "pessoa_fisica",
        cpf_cnpj: cand.cnpj || cand.cpf || null,
        comissao_percentual: 5,
        chave_pix: null,
        ativo: true,
      } as any)
      .select()
      .single();
    if (embErr) { toast.error(embErr.message); return; }
    await supabase
      .from("embaixadores_candidatos")
      .update({ status: "aprovado", aprovado_em: new Date().toISOString(), embaixador_id: (embData as any).id })
      .eq("id", cand.id);
    toast.success(`Parceiro ${codigo} criado com sucesso!`);
    load();
  };

  const rejeitarCandidato = async (id: string) => {
    await supabase
      .from("embaixadores_candidatos")
      .update({ status: "rejeitado" })
      .eq("id", id);
    toast.success("Candidato rejeitado.");
    load();
  };

  // Resumo financeiro
  const resumoPorEmb = useMemo(() => {
    const map = new Map<string, {
      emb: Embaixador;
      total: number;
      pendente: number;
      validado: number;
      pago: number;
      valorPagar: number;
    }>();
    for (const emb of embaixadores) {
      map.set(emb.id!, { emb, total: 0, pendente: 0, validado: 0, pago: 0, valorPagar: 0 });
    }
    for (const l of leads) {
      const r = map.get(l.embaixador_id);
      if (!r) continue;
      r.total += 1;
      if (l.status_comissao === "pendente") r.pendente += 1;
      if (l.status_comissao === "validado") {
        r.validado += 1;
        r.valorPagar += Number(l.valor_comissao) || 0;
      }
      if (l.status_comissao === "pago") r.pago += 1;
    }
    return Array.from(map.values()).sort((a, b) => b.valorPagar - a.valorPagar);
  }, [embaixadores, leads]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Parceiros Comerciais</h1>

      <Tabs defaultValue="candidatos">
        <TabsList>
          <TabsTrigger value="candidatos" className="relative">
            Candidatos
            {candidatos.filter((c) => c.status === "pendente").length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                {candidatos.filter((c) => c.status === "pendente").length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="cadastro">Parceiros Comerciais</TabsTrigger>
          <TabsTrigger value="leads">Leads por Parceiro Comercial</TabsTrigger>
          <TabsTrigger value="financeiro">Resumo Financeiro</TabsTrigger>
          <TabsTrigger value="politica">Política de Comissão</TabsTrigger>
        </TabsList>

        {/* CANDIDATOS */}
        <TabsContent value="candidatos" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Cidade/UF</TableHead>
                    <TableHead>MEI</TableHead>
                    <TableHead>Equipe</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidatos.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="font-medium text-sm">{c.nome}</TableCell>
                      <TableCell>
                        <div className="text-xs">{c.telefone}</div>
                        <div className="text-xs text-muted-foreground">{c.email}</div>
                      </TableCell>
                      <TableCell className="text-xs">{c.cidade}/{c.uf}</TableCell>
                      <TableCell className="text-xs">{c.is_mei ? "Sim" : "Não"}</TableCell>
                      <TableCell className="text-xs">{c.tem_equipe ? "Sim" : "Não"}</TableCell>
                      <TableCell>
                        <Badge className={
                          c.status === "pendente"   ? "bg-yellow-100 text-yellow-800" :
                          c.status === "aprovado"   ? "bg-green-100 text-green-700"  :
                                                      "bg-red-100 text-red-700"
                        }>
                          {c.status === "pendente" ? "Pendente" : c.status === "aprovado" ? "Aprovado" : "Rejeitado"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button size="sm" variant="outline" onClick={() => setSelCandidato(c)}>
                          <Eye className="h-3 w-3 mr-1" /> Ver ficha
                        </Button>
                        {c.status === "pendente" && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => aprovarCandidato(c)}>
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Aprovar
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => rejeitarCandidato(c.id)}>
                              <XCircle className="h-3 w-3 mr-1" /> Rejeitar
                            </Button>
                          </>
                        )}
                        {c.status === "aprovado" && (
                          <span className="text-xs text-muted-foreground">
                            Aprovado em {c.aprovado_em ? new Date(c.aprovado_em).toLocaleDateString("pt-BR") : "—"}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {candidatos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        Nenhum candidato ainda.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CADASTRO */}
        <TabsContent value="cadastro" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={startNew}><Plus className="h-4 w-4 mr-1" /> Novo Parceiro Comercial</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Comissão %</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {embaixadores.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-mono">{e.codigo}</TableCell>
                      <TableCell>{e.nome}</TableCell>
                      <TableCell className="text-xs">{e.tipo === "pessoa_fisica" ? "PF" : "PJ"}</TableCell>
                      <TableCell>{Number(e.comissao_percentual).toFixed(2)}%</TableCell>
                      <TableCell>
                        {e.ativo
                          ? <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Ativo</Badge>
                          : <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200">Inativo</Badge>}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => copyLink(e.codigo)}>
                          <Copy className="h-3 w-3 mr-1" /> Copiar
                        </Button>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button size="sm" variant="outline" onClick={() => startEdit(e)}>
                          <Pencil className="h-3 w-3 mr-1" /> Editar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => toggleAtivo(e)}>
                          {e.ativo ? "Desativar" : "Ativar"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {embaixadores.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">Nenhum parceiro cadastrado.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LEADS */}
        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Filtros</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-5 gap-3">
              <div>
                <label className="text-xs font-bold">Data inicial</label>
                <Input type="date" value={dataIni} onChange={(e) => setDataIni(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold">Data final</label>
                <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold">Parceiro Comercial</label>
                <Select value={filterEmb} onValueChange={setFilterEmb}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {embaixadores.map((e) => (
                      <SelectItem key={e.id} value={e.id!}>{e.codigo} — {e.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-bold">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="validado">Validado</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-bold">Fornecedora</label>
                <Select value={filterEmpresa} onValueChange={setFilterEmpresa}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {empresas.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button variant="outline" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-1" /> Exportar CSV
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Consumidor</TableHead>
                    <TableHead>Fornecedora</TableHead>
                    <TableHead>Parceiro Comercial</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Adesão</TableHead>
                    <TableHead>Pagamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leadsFiltrados.map((l) => (
                    <TableRow key={l.id} className="cursor-pointer" onClick={() => setSelLead(l)}>
                      <TableCell className="text-xs">{new Date(l.created_at).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <div className="text-sm">{l.leads?.nome ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{l.leads?.email ?? ""}</div>
                      </TableCell>
                      <TableCell className="text-sm">{l.empresas?.nome ?? "—"}</TableCell>
                      <TableCell className="text-xs">
                        <div className="font-mono">{l.embaixadores?.codigo}</div>
                        <div>{l.embaixadores?.nome}</div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {l.embaixadores?.comissao_percentual ?? 0}% · {fmtBRL(Number(l.valor_comissao) || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[l.status_comissao]}>
                          {l.status_comissao}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{l.data_adesao ?? "—"}</TableCell>
                      <TableCell className="text-xs">{l.data_pagamento ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                  {leadsFiltrados.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">Nenhum lead.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FINANCEIRO */}
        <TabsContent value="financeiro" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumoPorEmb.map((r) => (
              <Card key={r.emb.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    <span className="font-mono text-xs text-muted-foreground mr-2">{r.emb.codigo}</span>
                    {r.emb.nome}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Total de leads</span><span className="font-bold">{r.total}</span></div>
                  <div className="flex justify-between text-blue-700"><span>Pendentes</span><span>{r.pendente}</span></div>
                  <div className="flex justify-between text-yellow-700"><span>Validados</span><span>{r.validado}</span></div>
                  <div className="flex justify-between text-green-700"><span>Pagos</span><span>{r.pago}</span></div>
                  <div className="border-t pt-2 mt-2 flex justify-between">
                    <span className="font-bold">A pagar</span>
                    <span className="font-bold text-green-700">{fmtBRL(r.valorPagar)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground pt-1">
                    PIX: <span className="font-mono">{r.emb.chave_pix || "—"}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {resumoPorEmb.length === 0 && (
              <p className="text-muted-foreground text-sm">Nenhum parceiro comercial.</p>
            )}
          </div>
        </TabsContent>

        {/* POLITICA DE COMISSAO */}
        <TabsContent value="politica" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Regras usadas para calcular a comissão dos Parceiros Comerciais. Editar não
            sobrescreve a regra atual — cria uma nova versão a partir de agora, então
            comissões já calculadas com a regra antiga não mudam.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {policies.map((p) => (
              <Card key={p.id}>
                <CardHeader>
                  <CardTitle className="text-base">{SERVICE_TYPE_LABELS[p.service_type] ?? p.service_type}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {p.fcp_percent != null && (
                    <div className="flex justify-between">
                      <span>FCP (Fator Compensável Poupe)</span>
                      <span className="font-bold">{(Number(p.fcp_percent) * 100).toFixed(2)}%</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>% do Parceiro Comercial</span>
                    <span className="font-bold">{(Number(p.representative_percent) * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recorrente</span>
                    <span>{p.recurring ? "Sim, mensal" : "Não, paga uma vez"}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {TRIGGER_LABELS[p.trigger_event] ?? p.trigger_event}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Vigente desde {new Date(p.vigente_desde).toLocaleDateString("pt-BR")}
                  </div>
                  <div className="pt-2">
                    <Button size="sm" variant="outline" onClick={() => startEditPolicy(p)}>
                      <Pencil className="h-3 w-3 mr-1" /> Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {policies.length === 0 && (
              <p className="text-muted-foreground text-sm">
                Nenhuma política cadastrada. Rode a migration do módulo de comissões no Supabase.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Form Sheet */}
      <Sheet open={openForm} onOpenChange={setOpenForm}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader><SheetTitle>{editing?.id ? "Editar" : "Novo"} Parceiro Comercial</SheetTitle></SheetHeader>
          {editing && (
            <div className="space-y-3 mt-4">
              <div>
                <label className="text-xs font-bold">Código *</label>
                <Input value={editing.codigo} onChange={(e) => setEditing({ ...editing, codigo: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold">Nome *</label>
                <Input value={editing.nome} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold">Email</label>
                  <Input type="email" value={editing.email ?? ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold">Telefone</label>
                  <Input value={editing.telefone ?? ""} onChange={(e) => setEditing({ ...editing, telefone: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold">Tipo</label>
                  <Select value={editing.tipo} onValueChange={(v: any) => setEditing({ ...editing, tipo: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pessoa_fisica">Pessoa Física</SelectItem>
                      <SelectItem value="pessoa_juridica">Pessoa Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-bold">CPF/CNPJ</label>
                  <Input value={editing.cpf_cnpj ?? ""} onChange={(e) => setEditing({ ...editing, cpf_cnpj: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold">Comissão %</label>
                <Input type="number" step="0.01" value={editing.comissao_percentual} onChange={(e) => setEditing({ ...editing, comissao_percentual: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs font-bold">Chave PIX</label>
                <Input value={editing.chave_pix ?? ""} onChange={(e) => setEditing({ ...editing, chave_pix: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editing.ativo} onCheckedChange={(v) => setEditing({ ...editing, ativo: v })} />
                <span className="text-sm">{editing.ativo ? "Ativo" : "Inativo"}</span>
              </div>
              {editing.id && (
                <div className="text-xs text-muted-foreground border rounded-md p-2 bg-muted/30">
                  Link: <span className="font-mono break-all">{PUBLIC_BASE}/?emb={editing.codigo}</span>
                </div>
              )}
              <Dialog open={savedOk} onOpenChange={setSavedOk}>
                <DialogContent className="max-w-sm">
                  <DialogHeader><DialogTitle>Salvo com sucesso!</DialogTitle></DialogHeader>
                  <p className="text-sm text-muted-foreground">As informações do parceiro foram atualizadas.</p>
                  <DialogFooter><Button onClick={() => setSavedOk(false)}>OK</Button></DialogFooter>
                </DialogContent>
              </Dialog>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => { setOpenForm(false); setEditing(null); }}>
                  <X className="h-4 w-4 mr-1" /> Sair
                </Button>
                <Button onClick={saveEmb}><Save className="h-4 w-4 mr-1" /> Salvar</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Policy Edit Sheet */}
      <Sheet open={openPolicyForm} onOpenChange={setOpenPolicyForm}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              Editar política — {editingPolicy ? (SERVICE_TYPE_LABELS[editingPolicy.service_type] ?? editingPolicy.service_type) : ""}
            </SheetTitle>
          </SheetHeader>
          {editingPolicy && (
            <div className="space-y-3 mt-4">
              {editingPolicy.fcp_percent != null && (
                <div>
                  <label className="text-xs font-bold">FCP (Fator Compensável Poupe) — %</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={Number(editingPolicy.fcp_percent) * 100}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, fcp_percent: Number(e.target.value) / 100 })}
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-bold">% do Parceiro Comercial</label>
                <Input
                  type="number"
                  step="0.01"
                  value={Number(editingPolicy.representative_percent) * 100}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, representative_percent: Number(e.target.value) / 100 })}
                />
              </div>
              <div className="text-xs text-muted-foreground border rounded-md p-2 bg-muted/30">
                {TRIGGER_LABELS[editingPolicy.trigger_event] ?? editingPolicy.trigger_event}
                {" — "}
                {editingPolicy.recurring ? "recorrente mensal" : "paga uma única vez"}.
                Isso não muda ao editar os percentuais.
              </div>
              <div className="text-xs text-muted-foreground">
                Salvar cria uma nova versão desta política, vigente a partir de agora. As
                comissões já calculadas com a versão anterior continuam com os valores antigos.
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => { setOpenPolicyForm(false); setEditingPolicy(null); }}>
                  <X className="h-4 w-4 mr-1" /> Cancelar
                </Button>
                <Button onClick={savePolicy}><Save className="h-4 w-4 mr-1" /> Salvar nova versão</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Candidato Detail Sheet */}
      <Sheet open={!!selCandidato} onOpenChange={(o) => !o && setSelCandidato(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader><SheetTitle>Ficha do candidato</SheetTitle></SheetHeader>
          {selCandidato && (() => {
            let obs: { perfil?: string; carteira_ativa?: boolean; qtd_clientes?: string } = {};
            try { obs = selCandidato.observacoes ? JSON.parse(selCandidato.observacoes) : {}; } catch { /* observacoes invalido, ignora */ }
            return (
              <div className="space-y-4 mt-4 text-sm">
                <div className="space-y-1">
                  <div><span className="text-muted-foreground">Nome: </span>{selCandidato.nome}</div>
                  <div><span className="text-muted-foreground">CPF: </span>{selCandidato.cpf || "—"}</div>
                  <div><span className="text-muted-foreground">Email: </span>{selCandidato.email}</div>
                  <div><span className="text-muted-foreground">Telefone: </span>{selCandidato.telefone}</div>
                  <div><span className="text-muted-foreground">Cidade/UF: </span>{selCandidato.cidade}/{selCandidato.uf}</div>
                  <div><span className="text-muted-foreground">Data de cadastro: </span>{new Date(selCandidato.created_at).toLocaleString("pt-BR")}</div>
                </div>
                <div className="border-t pt-3 space-y-1">
                  <div><span className="text-muted-foreground">Razão Social: </span>{selCandidato.razao_social || "—"}</div>
                  <div><span className="text-muted-foreground">CNPJ: </span>{selCandidato.cnpj || "—"}</div>
                </div>
                <div className="border-t pt-3 space-y-1">
                  <div><span className="text-muted-foreground">Perfil: </span>{obs.perfil ? (PERFIL_LABELS[obs.perfil] ?? obs.perfil) : "—"}</div>
                  <div><span className="text-muted-foreground">Carteira ativa de clientes: </span>{obs.carteira_ativa == null ? "—" : obs.carteira_ativa ? "Sim" : "Não"}</div>
                  <div><span className="text-muted-foreground">Quantidade de clientes: </span>{obs.qtd_clientes ? (QTD_CLIENTES_LABELS[obs.qtd_clientes] ?? obs.qtd_clientes) : "—"}</div>
                  <div><span className="text-muted-foreground">Possui equipe comercial: </span>{selCandidato.tem_equipe ? "Sim" : "Não"}</div>
                  <div><span className="text-muted-foreground">É MEI: </span>{selCandidato.is_mei ? "Sim" : "Não"}</div>
                </div>
                <div className="border-t pt-3">
                  <Badge className={
                    selCandidato.status === "pendente"   ? "bg-yellow-100 text-yellow-800" :
                    selCandidato.status === "aprovado"   ? "bg-green-100 text-green-700"  :
                                                            "bg-red-100 text-red-700"
                  }>
                    {selCandidato.status === "pendente" ? "Pendente" : selCandidato.status === "aprovado" ? "Aprovado" : "Rejeitado"}
                  </Badge>
                  {selCandidato.aprovado_em && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      em {new Date(selCandidato.aprovado_em).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
                {selCandidato.status === "pendente" && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white flex-1"
                      onClick={() => { aprovarCandidato(selCandidato); setSelCandidato(null); }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Aprovar
                    </Button>
                    <Button
                      variant="outline" className="text-red-600 border-red-200 flex-1"
                      onClick={() => { rejeitarCandidato(selCandidato.id); setSelCandidato(null); }}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Rejeitar
                    </Button>
                  </div>
                )}
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* Lead Detail Sheet */}
      <Sheet open={!!selLead} onOpenChange={(o) => !o && setSelLead(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader><SheetTitle>Detalhes do lead</SheetTitle></SheetHeader>
          {selLead && (
            <div className="space-y-4 mt-4 text-sm">
              <div className="space-y-1">
                <div><span className="text-muted-foreground">Consumidor: </span>{selLead.leads?.nome ?? "—"}</div>
                <div><span className="text-muted-foreground">Email: </span>{selLead.leads?.email ?? "—"}</div>
                <div><span className="text-muted-foreground">Telefone: </span>{selLead.leads?.telefone ?? "—"}</div>
                <div><span className="text-muted-foreground">Fornecedora: </span>{selLead.empresas?.nome}</div>
                <div><span className="text-muted-foreground">Parceiro Comercial: </span>{selLead.embaixadores?.codigo} — {selLead.embaixadores?.nome}</div>
              </div>

              <div>
                <label className="text-xs font-bold">Status da comissão</label>
                <Select
                  value={selLead.status_comissao}
                  onValueChange={(v: any) => saveSelLead({ status_comissao: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="validado">Validado</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold">Data adesão</label>
                  <Input
                    type="date"
                    value={selLead.data_adesao ?? ""}
                    onChange={(e) => setSelLead({ ...selLead, data_adesao: e.target.value })}
                    onBlur={(e) => saveSelLead({ data_adesao: e.target.value || null })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold">Data pagamento</label>
                  <Input
                    type="date"
                    value={selLead.data_pagamento ?? ""}
                    onChange={(e) => setSelLead({ ...selLead, data_pagamento: e.target.value })}
                    onBlur={(e) => saveSelLead({ data_pagamento: e.target.value || null })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold">Valor da comissão (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={selLead.valor_comissao ?? 0}
                  onChange={(e) => setSelLead({ ...selLead, valor_comissao: Number(e.target.value) })}
                  onBlur={(e) => saveSelLead({ valor_comissao: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="text-xs font-bold">Observações</label>
                <Textarea
                  rows={3}
                  value={selLead.observacoes ?? ""}
                  onChange={(e) => setSelLead({ ...selLead, observacoes: e.target.value })}
                  onBlur={(e) => saveSelLead({ observacoes: e.target.value || null })}
                />
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
