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
import { Download, Pencil, Save, X } from "lucide-react";

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

export default function Parceiros() {
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
      "Empresa",
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
      <h1 className="text-2xl font-bold">Parceiros & Leads</h1>

      <Tabs defaultValue="config">
        <TabsList>
          <TabsTrigger value="config">Configuração de Parceiros</TabsTrigger>
          <TabsTrigger value="leads">Relatório de Leads</TabsTrigger>
        </TabsList>

        {/* ============== CONFIG ============== */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Empresas parceiras</CardTitle>
            </CardHeader>
            <CardContent>
              {empresasParceiras.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma empresa marcada como parceira ainda.
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
                          <Button size="sm" variant="outline" onClick={() => startEdit(emp.id)}>
                            <Pencil className="h-3 w-3 mr-1" /> Editar
                          </Button>
                        )}
                      </div>

                      {isEditing && form && (
                        <div className="mt-4 grid md:grid-cols-2 gap-3">
                          <div className="md:col-span-2">
                            <label className="text-xs font-bold">
                              URL de Redirecionamento para Venda
                            </label>
                            <Input
                              placeholder="https://parceiro.com.br/indicacao?ref=poupe"
                              value={form.url_afiliado ?? ""}
                              onChange={(e) =>
                                setForm({ ...form, url_afiliado: e.target.value })
                              }
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Este é o link para onde o cliente será direcionado ao clicar em
                              "Ver plano e Aderir". Use o link de afiliado fornecido pelo parceiro.
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-bold">
                              Nome do contato no parceiro
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
                              Email do contato no parceiro
                            </label>
                            <Input
                              type="email"
                              placeholder="contato@parceiro.com.br"
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
                  <label className="text-xs font-bold">Empresa</label>
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
                    <TableHead>Empresa</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Distribuidora</TableHead>
                    <TableHead>Evento</TableHead>
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
                    </TableRow>
                  ))}
                  {leadsFiltrados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
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
      </Tabs>
    </div>
  );
}
