import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { useAdminNivel } from "@/hooks/useAdminNivel";
import { Download, Pencil, Save, X, Lock, Trash2 } from "lucide-react";

type Parceiro = {
  id?: string;
  empresa_id: string;
  url_afiliado: string | null;
  comissao_percentual: number | null;
  modelo_comissao: string | null;
  observacoes: string | null;
  ativo: boolean;
  contato_nome?: string | null;
  contato_email?: string | null;
};

type Empresa = { id: string; nome: string; parceira: boolean };
type Estado = { id: number; sigla: string; nome: string };
type Distribuidora = { id: string; nome: string; estado_id: number };

type ComissaoMensal = {
  id?: string;
  empresa_id: string;
  mes_referencia: string;
  valor_recebido: number;
  tributos: number;
  valor_liquido: number;
  observacoes: string | null;
};

// Item do detalhamento por cliente/UC de um lançamento de comissão mensal (Grupo A) — a
// fornecedora manda o valor total (ComissaoMensal) e um relatório por UC; a equipe lança
// aqui pra gerar a comissão de cada parceiro automaticamente.
type ComissaoMensalItemForm = {
  numeroUc: string;
  comissaoGerada: string;
  status: "idle" | "loading" | "found" | "not_found" | "sem_vinculo";
  cashbackCadastroId?: string;
  clienteNome?: string;
  embaixadorId?: string;
  embaixadorCodigo?: string;
  embaixadorNome?: string;
  embaixadorOverride?: number | null;
};

const ITEM_VAZIO: ComissaoMensalItemForm = {
  numeroUc: "",
  comissaoGerada: "",
  status: "idle",
};

type CommissionPolicyA = { id: string; representative_percent: number };

type Lead = {
  id: string;
  empresa_id: string;
  distribuidora_id: string | null;
  estado_sigla: string | null;
  evento: string;
  created_at: string;
  nome?: string | null;
  email?: string | null;
  telefone?: string | null;
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

const fmtBRL = (n: number) =>
  (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtMes = (mesRef: string) =>
  new Date(mesRef + "T00:00:00").toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

export default function Parceiros() {
  const { nivel, loading: nivelLoading } = useAdminNivel();
  const podeGerenciarComissoes = nivel === "gestor" || nivel === "super_admin";
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [parceiros, setParceiros] = useState<Record<string, Parceiro>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Parceiro | null>(null);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [distribuidoras, setDistribuidoras] = useState<Distribuidora[]>([]);

  // Filtros leads
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const [dataIni, setDataIni] = useState(monthAgo);
  const [dataFim, setDataFim] = useState(today);
  const [filterEmpresa, setFilterEmpresa] = useState<string>("all");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [filterDistrib, setFilterDistrib] = useState<string>("all");
  const [onlyWithContact, setOnlyWithContact] = useState(false);

  // Comissão recebida da fornecedora (mensal)
  const [comissoesMensais, setComissoesMensais] = useState<ComissaoMensal[]>([]);
  const mesAtual = new Date().toISOString().slice(0, 7);
  const [comissaoForm, setComissaoForm] = useState<ComissaoMensal>({
    empresa_id: "",
    mes_referencia: mesAtual,
    valor_recebido: 0,
    tributos: 0,
    valor_liquido: 0,
    observacoes: "",
  });
  const [itens, setItens] = useState<ComissaoMensalItemForm[]>([]);
  const [itemAtual, setItemAtual] = useState<ComissaoMensalItemForm>(ITEM_VAZIO);
  const [policyA, setPolicyA] = useState<CommissionPolicyA | null>(null);
  const [savingComissao, setSavingComissao] = useState(false);

  const loadAll = async () => {
    const [e, p, l, es, d] = await Promise.all([
      supabase.from("empresas").select("id, nome, parceira").order("nome"),
      supabase.from("parceiros_config").select("*"),
      supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(2000),
      supabase.from("estados").select("*").order("sigla"),
      supabase.from("distribuidoras").select("*").order("nome"),
    ]);
    setEmpresas((e.data ?? []) as Empresa[]);
    const map: Record<string, Parceiro> = {};
    (p.data ?? []).forEach((row: any) => (map[row.empresa_id] = row));
    setParceiros(map);
    setLeads((l.data ?? []) as Lead[]);
    setEstados((es.data ?? []) as Estado[]);
    setDistribuidoras((d.data ?? []) as Distribuidora[]);
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Comissão recebida é restrita a nível Gestor+ (mesma regra da RLS no banco).
  const loadComissoes = async () => {
    const [cm, pol] = await Promise.all([
      supabase.from("fornecedora_comissao_mensal").select("*").order("mes_referencia", { ascending: false }),
      supabase.from("commission_policy").select("id, representative_percent").eq("service_type", "GD_A").eq("ativo", true).maybeSingle(),
    ]);
    setComissoesMensais((cm.data ?? []) as ComissaoMensal[]);
    setPolicyA((pol.data ?? null) as CommissionPolicyA | null);
  };

  useEffect(() => {
    if (nivelLoading || !podeGerenciarComissoes) return;
    loadComissoes();
  }, [nivelLoading, podeGerenciarComissoes]);

  const empresasParceiras = useMemo(
    () => empresas.filter((e) => e.parceira),
    [empresas]
  );

  const startEdit = (empresaId: string) => {
    const existing = parceiros[empresaId];
    setEditing(empresaId);
    setForm(
      existing ?? {
        empresa_id: empresaId,
        url_afiliado: "",
        comissao_percentual: 0,
        modelo_comissao: "por_clique",
        observacoes: "",
        ativo: true,
        contato_nome: "",
        contato_email: "",
      }
    );
  };

  const saveEdit = async () => {
    if (!form) return;
    const { error } = await supabase
      .from("parceiros_config")
      .upsert(form, { onConflict: "empresa_id" });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Configuração do parceiro atualizada com sucesso!");
    setEditing(null);
    setForm(null);
    loadAll();
  };

  // Pausa/retoma a parceria sem tirar a fornecedora da lista nem apagar a configuração
  // (comissão, link de afiliado, contato) já cadastrada.
  const toggleAtivoParceiro = async (empresaId: string) => {
    const existing = parceiros[empresaId];
    const novoAtivo = existing ? !existing.ativo : false;
    const { error } = await supabase
      .from("parceiros_config")
      .upsert({ ...(existing ?? { empresa_id: empresaId }), ativo: novoAtivo }, { onConflict: "empresa_id" });
    if (error) { toast.error(error.message); return; }
    toast.success(novoAtivo ? "Parceria reativada." : "Parceria desativada.");
    loadAll();
  };

  // Remove a fornecedora da lista de parceiras comerciais (desmarca empresas.parceira).
  // Não apaga a fornecedora nem a configuração — é reversível editando a ficha dela em
  // /admin/empresas ou marcando "Fornecedora Parceira" de novo.
  const removerParceiro = async (empresaId: string, nome: string) => {
    if (!confirm(`Remover "${nome}" da lista de Fornecedoras Parceiras? A fornecedora continua cadastrada normalmente — isso só tira ela dessa lista comercial. Dá pra marcar como parceira de novo depois.`)) return;
    const { error } = await supabase
      .from("empresas")
      .update({ parceira: false })
      .eq("id", empresaId);
    if (error) { toast.error(error.message); return; }
    toast.success("Removida da lista de parceiras.");
    loadAll();
  };

  // Busca a adesão pela UC (dentro da fornecedora selecionada) e o parceiro já vinculado
  // a ela (criado na Fase 3, quando a adesão foi cadastrada com um código válido).
  const buscarUc = async () => {
    const uc = itemAtual.numeroUc.trim();
    if (!uc) { toast.error("Informe o número da UC."); return; }
    if (!comissaoForm.empresa_id) { toast.error("Selecione a fornecedora primeiro."); return; }
    setItemAtual((it) => ({ ...it, status: "loading" }));
    const { data: cadastro } = await supabase
      .from("cashback_cadastros")
      .select("id, nome")
      .eq("empresa_id", comissaoForm.empresa_id)
      .eq("numero_uc", uc)
      .maybeSingle();
    if (!cadastro) {
      setItemAtual((it) => ({ ...it, status: "not_found" }));
      return;
    }
    const { data: vinc } = await supabase
      .from("leads_embaixadores")
      .select("embaixador_id, embaixadores(codigo,nome,comissao_percentual)")
      .eq("cashback_cadastro_id", cadastro.id)
      .limit(1)
      .maybeSingle();
    if (!vinc) {
      setItemAtual((it) => ({
        ...it, status: "sem_vinculo",
        cashbackCadastroId: cadastro.id, clienteNome: cadastro.nome,
      }));
      return;
    }
    const emb = vinc.embaixadores;
    setItemAtual((it) => ({
      ...it,
      status: "found",
      cashbackCadastroId: cadastro.id,
      clienteNome: cadastro.nome,
      embaixadorId: vinc.embaixador_id,
      embaixadorCodigo: emb?.codigo,
      embaixadorNome: emb?.nome,
      embaixadorOverride: emb?.comissao_percentual ?? null,
    }));
  };

  const adicionarItem = () => {
    if (itemAtual.status !== "found" || !itemAtual.cashbackCadastroId || !itemAtual.embaixadorId) {
      toast.error("Busque uma UC válida, com parceiro vinculado, antes de adicionar.");
      return;
    }
    const valor = parseFloat(itemAtual.comissaoGerada.replace(",", "."));
    if (!valor || valor <= 0) { toast.error("Informe o valor da comissão gerada pra esse cliente."); return; }
    if (itens.some((it) => it.cashbackCadastroId === itemAtual.cashbackCadastroId)) {
      toast.error("Essa UC já foi adicionada nesse lançamento.");
      return;
    }
    setItens((arr) => [...arr, { ...itemAtual }]);
    setItemAtual(ITEM_VAZIO);
  };

  const removerItem = (idx: number) => setItens((arr) => arr.filter((_, i) => i !== idx));

  const totalItens = itens.reduce((acc, it) => acc + (parseFloat(it.comissaoGerada.replace(",", ".")) || 0), 0);

  const saveComissaoMensal = async () => {
    if (!podeGerenciarComissoes) { toast.error("Restrito a usuários Gestor ou Super Admin."); return; }
    if (!comissaoForm.empresa_id) { toast.error("Selecione a fornecedora."); return; }
    setSavingComissao(true);
    const mesRef = comissaoForm.mes_referencia.length === 7 ? `${comissaoForm.mes_referencia}-01` : comissaoForm.mes_referencia;
    const valorLiquido = Number(comissaoForm.valor_recebido) - Number(comissaoForm.tributos);
    const payload = { ...comissaoForm, mes_referencia: mesRef, valor_liquido: valorLiquido };
    const { data: header, error } = await supabase
      .from("fornecedora_comissao_mensal")
      .upsert(payload, { onConflict: "empresa_id,mes_referencia" })
      .select()
      .single();
    if (error) { toast.error(error.message); setSavingComissao(false); return; }

    for (const it of itens) {
      const valor = parseFloat(it.comissaoGerada.replace(",", "."));
      await supabase.from("fornecedora_comissao_mensal_itens").insert({
        fornecedora_comissao_mensal_id: header.id,
        cashback_cadastro_id: it.cashbackCadastroId,
        numero_uc: it.numeroUc.trim(),
        comissao_gerada: valor,
      });

      // FCP do Grupo A = valor gerado (já líquido, confirmado com o sócio em 10/08/2026).
      const efetivoPercent = it.embaixadorOverride != null ? Number(it.embaixadorOverride) / 100 : (policyA ? Number(policyA.representative_percent) : null);
      const comissaoParceiro = efetivoPercent != null ? valor * efetivoPercent : null;

      const { data: existente } = await supabase
        .from("leads_embaixadores")
        .select("id, status_comissao")
        .eq("cashback_cadastro_id", it.cashbackCadastroId!)
        .eq("mes_referencia", mesRef)
        .maybeSingle();

      if (existente) {
        const jaConfirmado = existente.status_comissao === "validado" || existente.status_comissao === "pago";
        if (!jaConfirmado) {
          await supabase.from("leads_embaixadores").update({
            valor_comissao: comissaoParceiro ?? 0,
            commission_policy_id: policyA?.id ?? null,
            grupo_tarifario: "A",
          }).eq("id", existente.id);
        } else {
          toast.info(`UC ${it.numeroUc}: comissão do mês já está "${existente.status_comissao}" — não foi recalculada.`);
        }
      } else {
        await supabase.from("leads_embaixadores").insert({
          cashback_cadastro_id: it.cashbackCadastroId,
          embaixador_id: it.embaixadorId,
          empresa_id: comissaoForm.empresa_id,
          mes_referencia: mesRef,
          grupo_tarifario: "A",
          commission_policy_id: policyA?.id ?? null,
          status_comissao: "pendente",
          valor_comissao: comissaoParceiro ?? 0,
        });
      }
    }

    toast.success(`Comissão recebida lançada! ${itens.length} parcela(s) de parceiro gerada(s).`);
    setComissaoForm({
      empresa_id: "",
      mes_referencia: mesAtual,
      valor_recebido: 0,
      tributos: 0,
      valor_liquido: 0,
      observacoes: "",
    });
    setItens([]);
    setItemAtual(ITEM_VAZIO);
    setSavingComissao(false);
    loadComissoes();
  };

  // ============ Leads filtrados ============
  const leadsFiltrados = useMemo(() => {
    const ini = new Date(dataIni + "T00:00:00").getTime();
    const fim = new Date(dataFim + "T23:59:59").getTime();
    return leads.filter((l) => {
      const t = new Date(l.created_at).getTime();
      if (t < ini || t > fim) return false;
      if (filterEmpresa !== "all" && l.empresa_id !== filterEmpresa) return false;
      if (filterEstado !== "all" && l.estado_sigla !== filterEstado) return false;
      if (filterDistrib !== "all" && l.distribuidora_id !== filterDistrib) return false;
      if (onlyWithContact && !(l.nome || l.email || l.telefone)) return false;
      return true;
    });
  }, [leads, dataIni, dataFim, filterEmpresa, filterEstado, filterDistrib, onlyWithContact]);

  const empresaName = (id: string) => empresas.find((e) => e.id === id)?.nome ?? "—";
  const distribName = (id: string | null) =>
    id ? distribuidoras.find((d) => d.id === id)?.nome ?? "—" : "—";

  const exportCSV = () => {
    const header = [
      "Data/hora",
      "Fornecedora",
      "Estado",
      "Distribuidora",
      "Evento",
      "Nome",
      "Email",
      "Telefone",
    ];
    const rows = leadsFiltrados.map((l) => [
      formatDateTime(l.created_at),
      empresaName(l.empresa_id),
      l.estado_sigla ?? "",
      distribName(l.distribuidora_id),
      l.evento,
      l.nome ?? "",
      l.email ?? "",
      l.telefone ?? "",
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${dataIni}-a-${dataFim}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Agrupamento por empresa parceira
  const porEmpresa = useMemo(() => {
    const m = new Map<string, number>();
    leadsFiltrados.forEach((l) => {
      m.set(l.empresa_id, (m.get(l.empresa_id) ?? 0) + 1);
    });
    return m;
  }, [leadsFiltrados]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Fornecedoras Parceiras & Leads</h1>

      <Tabs defaultValue="config">
        <TabsList>
          <TabsTrigger value="config">Configuração de Fornecedoras Parceiras</TabsTrigger>
          <TabsTrigger value="leads">Relatório de Leads</TabsTrigger>
          <TabsTrigger value="comissao">Comissão Recebida</TabsTrigger>
        </TabsList>

        {/* ============== CONFIG ============== */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fornecedoras parceiras</CardTitle>
            </CardHeader>
            <CardContent>
              {empresasParceiras.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma fornecedora marcada como parceira ainda.
                </p>
              )}
              <div className="space-y-3">
                {empresasParceiras.map((emp) => {
                  const cfg = parceiros[emp.id];
                  const isEditing = editing === emp.id;
                  return (
                    <div
                      key={emp.id}
                      className="border border-border rounded-lg p-4 bg-white"
                    >
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                          <div className="font-bold text-brand-blue">{emp.nome}</div>
                          {!isEditing && (
                            <div className="text-xs text-muted-foreground mt-1 space-x-3">
                              <span>
                                URL:{" "}
                                {cfg?.url_afiliado ? (
                                  <span className="text-foreground">{cfg.url_afiliado}</span>
                                ) : (
                                  <span className="italic">não cadastrada</span>
                                )}
                              </span>
                              <span>Comissão: {cfg?.comissao_percentual ?? 0}%</span>
                              <span>Modelo: {cfg?.modelo_comissao ?? "—"}</span>
                              <span>{cfg?.ativo === false ? "Inativo" : "Ativo"}</span>
                            </div>
                          )}
                        </div>
                        {!isEditing && (
                          <div className="flex gap-1.5">
                            <Button size="sm" variant="outline" onClick={() => startEdit(emp.id)}>
                              <Pencil className="h-3 w-3 mr-1" /> Editar
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => toggleAtivoParceiro(emp.id)}>
                              {cfg?.ativo === false ? "Reativar" : "Desativar"}
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => removerParceiro(emp.id, emp.nome)}>
                              <Trash2 className="h-3 w-3 mr-1" /> Remover
                            </Button>
                          </div>
                        )}
                      </div>

                      {isEditing && form && (
                        <div className="mt-4 grid md:grid-cols-2 gap-3">
                          <div className="md:col-span-2">
                            <label className="text-xs font-bold">
                              URL de Redirecionamento para Venda
                            </label>
                            <Input
                              placeholder="https://fornecedora.com.br/indicacao?ref=poupe"
                              value={form.url_afiliado ?? ""}
                              onChange={(e) =>
                                setForm({ ...form, url_afiliado: e.target.value })
                              }
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Este é o link para onde o consumidor será direcionado ao clicar em
                              "Ver plano e Aderir". Use o link de afiliado fornecido pela fornecedora.
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-bold">
                              Nome do contato na fornecedora
                            </label>
                            <Input
                              placeholder="Ex: João Silva"
                              value={form.contato_nome ?? ""}
                              onChange={(e) =>
                                setForm({ ...form, contato_nome: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold">
                              Email do contato na fornecedora
                            </label>
                            <Input
                              type="email"
                              placeholder="contato@fornecedora.com.br"
                              value={form.contato_email ?? ""}
                              onChange={(e) =>
                                setForm({ ...form, contato_email: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold">Comissão (%)</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={form.comissao_percentual ?? 0}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  comissao_percentual: Number(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold">Modelo de comissão</label>
                            <Select
                              value={form.modelo_comissao ?? ""}
                              onValueChange={(v) => setForm({ ...form, modelo_comissao: v })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="por_clique">Por clique</SelectItem>
                                <SelectItem value="por_adesao">Por adesão</SelectItem>
                                <SelectItem value="por_fatura">Por fatura</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-3 pt-5">
                            <Switch
                              checked={form.ativo}
                              onCheckedChange={(v) => setForm({ ...form, ativo: v })}
                            />
                            <span className="text-sm">{form.ativo ? "Ativo" : "Inativo"}</span>
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-xs font-bold">Observações</label>
                            <Textarea
                              rows={2}
                              value={form.observacoes ?? ""}
                              onChange={(e) =>
                                setForm({ ...form, observacoes: e.target.value })
                              }
                            />
                          </div>
                          <div className="md:col-span-2 flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditing(null);
                                setForm(null);
                              }}
                            >
                              <X className="h-3 w-3 mr-1" /> Cancelar
                            </Button>
                            <Button size="sm" onClick={saveEdit}>
                              <Save className="h-3 w-3 mr-1" /> Salvar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============== LEADS ============== */}
        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-5 gap-3">
                <div>
                  <label className="text-xs font-bold">Data inicial</label>
                  <Input type="date" value={dataIni} onChange={(e) => setDataIni(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold">Data final</label>
                  <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
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
                <div>
                  <label className="text-xs font-bold">Estado</label>
                  <Select value={filterEstado} onValueChange={setFilterEstado}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {estados.map((s) => (
                        <SelectItem key={s.id} value={s.sigla}>{s.sigla}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-bold">Distribuidora</label>
                  <Select value={filterDistrib} onValueChange={setFilterDistrib}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {distribuidoras.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <Checkbox
                  checked={onlyWithContact}
                  onCheckedChange={(v) => setOnlyWithContact(v === true)}
                />
                <span className="text-sm">
                  Mostrar apenas leads com dados de contato preenchidos
                </span>
              </label>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-3 gap-3">
            <Card>
              <CardContent className="pt-4">
                <div className="text-xs text-muted-foreground font-semibold uppercase">
                  Total no período
                </div>
                <div className="text-3xl font-extrabold text-brand-blue mt-1">
                  {leadsFiltrados.length}
                </div>
              </CardContent>
            </Card>
            <Card className="border-brand-success/30">
              <CardContent className="pt-4">
                <div className="text-xs text-brand-success font-semibold uppercase">
                  Cliques "Aderir" — intenção de contratar
                </div>
                <div className="text-3xl font-extrabold text-brand-success mt-1">
                  {leadsFiltrados.filter((l) => l.evento === "clique_aderir").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-xs text-muted-foreground font-semibold uppercase">
                  Cliques "Saiba mais" — interesse inicial
                </div>
                <div className="text-3xl font-extrabold text-brand-blue/70 mt-1">
                  {leadsFiltrados.filter((l) => l.evento === "clique_saiba_mais").length}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={exportCSV} variant="outline" size="sm">
              <Download className="h-3 w-3 mr-1" /> Exportar CSV
            </Button>
          </div>

          {/* Cards por empresa parceira */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {empresasParceiras.map((emp) => {
              const cfg = parceiros[emp.id];
              const total = porEmpresa.get(emp.id) ?? 0;
              return (
                <Card key={emp.id}>
                  <CardContent className="pt-4">
                    <div className="font-bold text-brand-blue">{emp.nome}</div>
                    <div className="text-3xl font-extrabold mt-1">{total}</div>
                    <div className="text-xs text-muted-foreground">cliques no período</div>
                    <div className="text-xs mt-2">
                      Comissão acordada:{" "}
                      <span className="font-semibold">{cfg?.comissao_percentual ?? 0}%</span>
                    </div>
                    {cfg?.observacoes && (
                      <div className="text-xs text-muted-foreground mt-1 italic line-clamp-2">
                        {cfg.observacoes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Tabela detalhada */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/hora</TableHead>
                    <TableHead>Fornecedora</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Distribuidora</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leadsFiltrados.slice(0, 200).map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>{formatDateTime(l.created_at)}</TableCell>
                      <TableCell>{empresaName(l.empresa_id)}</TableCell>
                      <TableCell>{l.estado_sigla ?? "—"}</TableCell>
                      <TableCell>{distribName(l.distribuidora_id)}</TableCell>
                      <TableCell>
                        <span className="text-xs px-2 py-0.5 rounded bg-muted">
                          {l.evento}
                        </span>
                      </TableCell>
                      <TableCell>{l.nome ?? "—"}</TableCell>
                      <TableCell>{l.email ?? "—"}</TableCell>
                      <TableCell>{l.telefone ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                  {leadsFiltrados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        Nenhum lead no período.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {leadsFiltrados.length > 200 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Mostrando 200 mais recentes. Use o CSV para todos.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============== COMISSAO RECEBIDA ============== */}
        <TabsContent value="comissao" className="space-y-4">
          {!nivelLoading && !podeGerenciarComissoes ? (
            <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/40 rounded-md p-4">
              <Lock className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Restrito a usuários <strong>Gestor</strong> ou <strong>Super Admin</strong>.
                Peça pra alguém com esse nível lançar a comissão recebida da fornecedora.
              </span>
            </div>
          ) : (
          <>
          <Card>
            <CardHeader>
              <CardTitle>Lançar comissão recebida no mês</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Olhe no portal da fornecedora quanto ela pagou de comissão pra Poupe naquele
                mês e lance aqui. Usado pro cálculo recorrente do Grupo A (GD Livre).
              </p>
              <div className="grid md:grid-cols-5 gap-3">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold">Fornecedora</label>
                  <Select
                    value={comissaoForm.empresa_id}
                    onValueChange={(v) => setComissaoForm({ ...comissaoForm, empresa_id: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {empresasParceiras.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-bold">Mês de referência</label>
                  <Input
                    type="month"
                    value={comissaoForm.mes_referencia}
                    onChange={(e) => setComissaoForm({ ...comissaoForm, mes_referencia: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold">Valor recebido (R$)</label>
                  <Input
                    type="number" min="0" step="0.01"
                    value={comissaoForm.valor_recebido || ""}
                    onChange={(e) => setComissaoForm({ ...comissaoForm, valor_recebido: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold">Tributos (R$)</label>
                  <Input
                    type="number" min="0" step="0.01"
                    value={comissaoForm.tributos || ""}
                    onChange={(e) => setComissaoForm({ ...comissaoForm, tributos: Number(e.target.value) })}
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="text-xs font-bold">Observações</label>
                  <Input
                    value={comissaoForm.observacoes ?? ""}
                    onChange={(e) => setComissaoForm({ ...comissaoForm, observacoes: e.target.value })}
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <div className="text-xs text-muted-foreground mb-1">
                    Líquido: <span className="font-semibold text-foreground">
                      {fmtBRL(Number(comissaoForm.valor_recebido) - Number(comissaoForm.tributos))}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalhamento por cliente/UC</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                A fornecedora manda, junto com o pagamento, um relatório com o valor gerado
                por cliente/UC (já líquido — não precisa descontar mais nada). Lance cada
                linha aqui buscando pela UC: o sistema encontra automaticamente o parceiro
                vinculado a essa adesão e calcula a comissão dele.
              </p>
              <div className="grid md:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="text-xs font-bold">Número da UC</label>
                  <Input
                    value={itemAtual.numeroUc}
                    onChange={(e) => setItemAtual({ ...ITEM_VAZIO, numeroUc: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && buscarUc()}
                    placeholder="Número da unidade consumidora"
                  />
                </div>
                <div>
                  <Button variant="outline" onClick={buscarUc} disabled={itemAtual.status === "loading"}>
                    {itemAtual.status === "loading" ? "Buscando..." : "Buscar UC"}
                  </Button>
                </div>
                <div className="md:col-span-2">
                  {itemAtual.status === "found" && (
                    <p className="text-xs text-green-700">
                      ✓ {itemAtual.clienteNome} — parceiro <span className="font-mono">{itemAtual.embaixadorCodigo}</span> ({itemAtual.embaixadorNome})
                    </p>
                  )}
                  {itemAtual.status === "sem_vinculo" && (
                    <p className="text-xs text-amber-600">
                      Cliente "{itemAtual.clienteNome}" encontrado, mas sem parceiro comercial vinculado a essa adesão — não há comissão a gerar.
                    </p>
                  )}
                  {itemAtual.status === "not_found" && (
                    <p className="text-xs text-red-600">UC não encontrada pra essa fornecedora.</p>
                  )}
                </div>
              </div>
              {itemAtual.status === "found" && (
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-xs font-bold">Comissão gerada pra esse cliente (R$)</label>
                    <Input
                      type="number" min="0" step="0.01"
                      value={itemAtual.comissaoGerada}
                      onChange={(e) => setItemAtual({ ...itemAtual, comissaoGerada: e.target.value })}
                    />
                  </div>
                  <Button onClick={adicionarItem}>Adicionar</Button>
                </div>
              )}

              {itens.length > 0 && (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>UC</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Parceiro</TableHead>
                        <TableHead>Comissão gerada</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itens.map((it, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono text-xs">{it.numeroUc}</TableCell>
                          <TableCell className="text-sm">{it.clienteNome}</TableCell>
                          <TableCell className="text-xs">{it.embaixadorCodigo} — {it.embaixadorNome}</TableCell>
                          <TableCell className="text-sm">{fmtBRL(parseFloat(it.comissaoGerada.replace(",", ".")) || 0)}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" onClick={() => removerItem(i)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="p-2 text-xs text-right border-t">
                    Total dos itens: <span className="font-semibold">{fmtBRL(totalItens)}</span>
                    {comissaoForm.valor_recebido > 0 && Math.abs(totalItens - Number(comissaoForm.valor_recebido)) > 0.01 && (
                      <span className="text-amber-600 ml-2">
                        (difere do valor recebido em {fmtBRL(Math.abs(totalItens - Number(comissaoForm.valor_recebido)))})
                      </span>
                    )}
                  </div>
                </div>
              )}

              <Button onClick={saveComissaoMensal} disabled={savingComissao} className="w-full">
                <Save className="h-3 w-3 mr-1" /> {savingComissao ? "Salvando..." : "Salvar lançamento e gerar comissões"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de lançamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mês</TableHead>
                    <TableHead>Fornecedora</TableHead>
                    <TableHead>Recebido</TableHead>
                    <TableHead>Tributos</TableHead>
                    <TableHead>Líquido</TableHead>
                    <TableHead>Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comissoesMensais.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="capitalize">{fmtMes(c.mes_referencia)}</TableCell>
                      <TableCell>{empresaName(c.empresa_id)}</TableCell>
                      <TableCell>{fmtBRL(c.valor_recebido)}</TableCell>
                      <TableCell>{fmtBRL(c.tributos)}</TableCell>
                      <TableCell className="font-semibold">{fmtBRL(c.valor_liquido)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{c.observacoes ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                  {comissoesMensais.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Nenhum lançamento ainda.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
