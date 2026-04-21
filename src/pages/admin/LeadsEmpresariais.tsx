import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, Save, FileText, Eye } from "lucide-react";

type Lead = {
  id: string;
  razao_social: string;
  cnpj: string;
  estado_sigla: string | null;
  distribuidora_nome: string | null;
  distribuidora_id: string | null;
  valor_conta: number | null;
  responsavel_nome: string;
  email: string;
  telefone: string;
  arquivos_paths: string[] | null;
  status: string;
  observacoes_admin: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  novo: { label: "Novo", color: "text-blue-700", bg: "bg-blue-100" },
  em_contato: { label: "Em contato", color: "text-yellow-700", bg: "bg-yellow-100" },
  proposta_enviada: { label: "Proposta enviada", color: "text-orange-700", bg: "bg-orange-100" },
  convertido: { label: "Convertido", color: "text-green-700", bg: "bg-green-100" },
  perdido: { label: "Perdido", color: "text-red-700", bg: "bg-red-100" },
};

const STATUS_DOTS: Record<string, string> = {
  novo: "🔵",
  em_contato: "🟡",
  proposta_enviada: "🟠",
  convertido: "🟢",
  perdido: "🔴",
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

const formatBRL = (n: number | null) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

export default function LeadsEmpresariais() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [estados, setEstados] = useState<{ sigla: string }[]>([]);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [editStatus, setEditStatus] = useState<string>("novo");
  const [editObs, setEditObs] = useState("");
  const [savingDetail, setSavingDetail] = useState(false);
  const [fileUrls, setFileUrls] = useState<{ path: string; url: string }[]>([]);

  // Filtros
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const [dataIni, setDataIni] = useState(monthAgo);
  const [dataFim, setDataFim] = useState(today);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterEstado, setFilterEstado] = useState("all");

  const load = async () => {
    const [l, e] = await Promise.all([
      supabase
        .from("leads_empresariais")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(2000),
      supabase.from("estados").select("sigla").order("sigla"),
    ]);
    setLeads((l.data ?? []) as Lead[]);
    setEstados((e.data ?? []) as { sigla: string }[]);
  };

  useEffect(() => {
    load();
  }, []);

  const filtrados = useMemo(() => {
    const ini = new Date(dataIni + "T00:00:00").getTime();
    const fim = new Date(dataFim + "T23:59:59").getTime();
    return leads.filter((l) => {
      const t = new Date(l.created_at).getTime();
      if (t < ini || t > fim) return false;
      if (filterStatus !== "all" && l.status !== filterStatus) return false;
      if (filterEstado !== "all" && l.estado_sigla !== filterEstado) return false;
      return true;
    });
  }, [leads, dataIni, dataFim, filterStatus, filterEstado]);

  const totalNovos = useMemo(
    () => leads.filter((l) => l.status === "novo").length,
    [leads]
  );

  const openDetail = async (lead: Lead) => {
    setSelected(lead);
    setEditStatus(lead.status);
    setEditObs(lead.observacoes_admin ?? "");
    // Gerar URLs assinadas
    const paths = lead.arquivos_paths ?? [];
    if (paths.length === 0) {
      setFileUrls([]);
      return;
    }
    const urls = await Promise.all(
      paths.map(async (p) => {
        const { data } = await supabase.storage
          .from("contas-empresariais")
          .createSignedUrl(p, 3600);
        return { path: p, url: data?.signedUrl ?? "" };
      })
    );
    setFileUrls(urls);
  };

  const saveDetail = async () => {
    if (!selected) return;
    setSavingDetail(true);
    const { error } = await supabase
      .from("leads_empresariais")
      .update({ status: editStatus, observacoes_admin: editObs })
      .eq("id", selected.id);
    setSavingDetail(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Atualizado");
    setSelected(null);
    load();
  };

  const exportCSV = () => {
    const header = [
      "Data",
      "Empresa",
      "CNPJ",
      "Contato",
      "Email",
      "Telefone",
      "Estado",
      "Distribuidora",
      "Valor Conta",
      "Status",
      "Arquivos",
    ];
    const rows = filtrados.map((l) => [
      formatDateTime(l.created_at),
      l.razao_social,
      l.cnpj,
      l.responsavel_nome,
      l.email,
      l.telefone,
      l.estado_sigla ?? "",
      l.distribuidora_nome ?? "",
      l.valor_conta ?? "",
      STATUS_META[l.status]?.label ?? l.status,
      (l.arquivos_paths ?? []).length,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-empresariais-${dataIni}-a-${dataFim}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Leads Empresariais</h1>

      {/* Totalizador */}
      <Card className="border-brand-blue/30">
        <CardContent className="pt-4">
          <div className="text-xs text-muted-foreground font-semibold uppercase">
            Aguardando contato
          </div>
          <div className="text-3xl font-extrabold text-brand-blue mt-1">
            {totalNovos}{" "}
            <span className="text-base font-normal text-muted-foreground">
              {totalNovos === 1 ? "lead novo" : "leads novos"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-bold">Data inicial</label>
              <Input type="date" value={dataIni} onChange={(e) => setDataIni(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold">Data final</label>
              <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(STATUS_META).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {STATUS_DOTS[k]} {v.label}
                    </SelectItem>
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
                    <SelectItem key={s.sigla} value={s.sigla}>{s.sigla}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {filtrados.length} {filtrados.length === 1 ? "lead" : "leads"} no período
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm">
          <Download className="h-3 w-3 mr-1" /> Exportar CSV
        </Button>
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="pt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Distribuidora</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Arq.</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((l) => {
                const meta = STATUS_META[l.status];
                return (
                  <TableRow
                    key={l.id}
                    className="cursor-pointer hover:bg-muted/30"
                    onClick={() => openDetail(l)}
                  >
                    <TableCell className="text-xs whitespace-nowrap">
                      {formatDateTime(l.created_at)}
                    </TableCell>
                    <TableCell className="font-semibold">{l.razao_social}</TableCell>
                    <TableCell className="text-xs">{l.cnpj}</TableCell>
                    <TableCell className="text-xs">
                      <div>{l.responsavel_nome}</div>
                      <div className="text-muted-foreground">{l.email}</div>
                    </TableCell>
                    <TableCell>{l.estado_sigla ?? "—"}</TableCell>
                    <TableCell className="text-xs">{l.distribuidora_nome ?? "—"}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{formatBRL(l.valor_conta)}</TableCell>
                    <TableCell>
                      <Badge className={`${meta.bg} ${meta.color} hover:${meta.bg} border-0`}>
                        {STATUS_DOTS[l.status]} {meta.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {(l.arquivos_paths ?? []).length}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-6">
                    Nenhum lead no período.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Side panel */}
      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="text-brand-blue">
                  {selected.razao_social}
                </SheetTitle>
                <SheetDescription>{selected.cnpj}</SheetDescription>
              </SheetHeader>

              <div className="space-y-4 py-5 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Recebido em" value={formatDateTime(selected.created_at)} />
                  <Field label="Estado" value={selected.estado_sigla ?? "—"} />
                  <Field label="Distribuidora" value={selected.distribuidora_nome ?? "—"} />
                  <Field label="Valor da conta" value={formatBRL(selected.valor_conta)} />
                  <Field label="Responsável" value={selected.responsavel_nome} />
                  <Field label="Telefone" value={selected.telefone} />
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground">Email</div>
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-brand-blue underline break-all"
                    >
                      {selected.email}
                    </a>
                  </div>
                </div>

                {/* Arquivos */}
                <div>
                  <div className="text-xs font-bold text-brand-blue mb-2">
                    Arquivos enviados ({fileUrls.length})
                  </div>
                  {fileUrls.length === 0 && (
                    <div className="text-xs text-muted-foreground">Nenhum arquivo.</div>
                  )}
                  <ul className="space-y-1">
                    {fileUrls.map((f) => {
                      const name = f.path.split("/").pop();
                      return (
                        <li key={f.path}>
                          <a
                            href={f.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-xs bg-muted/40 rounded-md px-2 py-1.5 hover:bg-muted/60"
                          >
                            <FileText className="h-3 w-3" />
                            <span className="truncate">{name}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-bold text-brand-blue mb-1 block">
                    Status
                  </label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_META).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {STATUS_DOTS[k]} {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Obs */}
                <div>
                  <label className="text-xs font-bold text-brand-blue mb-1 block">
                    Observações do admin
                  </label>
                  <Textarea
                    rows={4}
                    value={editObs}
                    onChange={(e) => setEditObs(e.target.value)}
                  />
                </div>

                <Button
                  onClick={saveDetail}
                  disabled={savingDetail}
                  className="w-full bg-brand-blue text-white hover:bg-brand-blue/90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {savingDetail ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="font-semibold">{value}</div>
  </div>
);
