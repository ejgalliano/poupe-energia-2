import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Download, Search } from "lucide-react";

type Cadastro = {
  id: string;
  created_at: string;
  nome: string;
  cpf_cnpj: string;
  whatsapp: string;
  email: string;
  numero_uc: string;
  distribuidora_id: string | null;
  distribuidora_nome: string | null;
  chave_pix: string;
  aceite_termos: boolean;
  ciente_parcela_unica: boolean;
  autoriza_validacao: boolean;
  status: string;
};

const STATUS_COLORS: Record<string, string> = {
  pendente:  "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  validado:  "bg-blue-100 text-blue-700 hover:bg-blue-100",
  pago:      "bg-green-100 text-green-700 hover:bg-green-100",
  cancelado: "bg-red-100 text-red-700 hover:bg-red-100",
};

const STATUS_OPTIONS = ["pendente", "validado", "pago", "cancelado"];

export default function CashbackCadastros() {
  const [cadastros, setCadastros] = useState<Cadastro[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sel, setSel] = useState<Cadastro | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cashback_cadastros" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) { toast.error(error.message); }
    else { setCadastros((data ?? []) as Cadastro[]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtrados = useMemo(() => {
    const q = search.toLowerCase();
    return cadastros.filter((c) => {
      if (filterStatus !== "all" && c.status !== filterStatus) return false;
      if (q && !c.nome.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q) && !c.cpf_cnpj.includes(q) && !(c.distribuidora_nome ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [cadastros, search, filterStatus]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("cashback_cadastros" as any)
      .update({ status } as any)
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Status atualizado!");
    setCadastros((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
    if (sel?.id === id) setSel((s) => s ? { ...s, status } : s);
  };

  const exportCSV = () => {
    const header = ["Data", "Nome", "CPF/CNPJ", "WhatsApp", "Email", "UC", "Distribuidora", "Chave Pix", "Status"];
    const rows = filtrados.map((c) => [
      new Date(c.created_at).toLocaleString("pt-BR"),
      c.nome, c.cpf_cnpj, c.whatsapp, c.email,
      c.numero_uc, c.distribuidora_nome ?? "", c.chave_pix, c.status,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cashback-cadastros-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Contadores por status
  const counts = useMemo(() => {
    const c = { pendente: 0, validado: 0, pago: 0, cancelado: 0 };
    for (const item of cadastros) {
      if (item.status in c) c[item.status as keyof typeof c]++;
    }
    return c;
  }, [cadastros]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cadastros de Cashback</h1>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-1" /> Exportar CSV
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pendentes",  value: counts.pendente,  color: "text-yellow-700" },
          { label: "Validados",  value: counts.validado,  color: "text-blue-700"   },
          { label: "Pagos",      value: counts.pago,      color: "text-green-700"  },
          { label: "Cancelados", value: counts.cancelado, color: "text-red-600"    },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-3">
              <div className={`text-3xl font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email, CPF ou distribuidora..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>CPF/CNPJ</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>UC</TableHead>
                <TableHead>Distribuidora</TableHead>
                <TableHead>Chave Pix</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              )}
              {!loading && filtrados.map((c) => (
                <TableRow key={c.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setSel(c)}>
                  <TableCell className="text-xs whitespace-nowrap">
                    {new Date(c.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{c.nome}</div>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{c.cpf_cnpj}</TableCell>
                  <TableCell>
                    <div className="text-xs">{c.whatsapp}</div>
                    <div className="text-xs text-muted-foreground">{c.email}</div>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{c.numero_uc}</TableCell>
                  <TableCell className="text-xs">{c.distribuidora_nome ?? "—"}</TableCell>
                  <TableCell className="text-xs font-mono max-w-[140px] truncate">{c.chave_pix}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-700"}>
                      {c.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filtrados.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum cadastro encontrado.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground text-right">
        {filtrados.length} de {cadastros.length} registros
      </div>

      {/* Detalhe / Edição de status */}
      <Sheet open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detalhe do Cadastro</SheetTitle>
          </SheetHeader>
          {sel && (
            <div className="space-y-4 mt-5 text-sm">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 border rounded-lg p-4 bg-muted/30">
                <div className="col-span-2">
                  <span className="text-xs text-muted-foreground">Nome</span>
                  <div className="font-semibold">{sel.nome}</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">CPF/CNPJ</span>
                  <div className="font-mono">{sel.cpf_cnpj}</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">WhatsApp</span>
                  <div>{sel.whatsapp}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-muted-foreground">E-mail</span>
                  <div>{sel.email}</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Nº UC</span>
                  <div className="font-mono">{sel.numero_uc}</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Distribuidora</span>
                  <div>{sel.distribuidora_nome ?? "—"}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-muted-foreground">Chave Pix</span>
                  <div className="font-mono break-all">{sel.chave_pix}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-muted-foreground">Data do cadastro</span>
                  <div>{new Date(sel.created_at).toLocaleString("pt-BR")}</div>
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-1.5 bg-muted/20">
                <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Confirmações</h4>
                {[
                  { label: "Aceite dos Termos e Condições", val: sel.aceite_termos },
                  { label: "Ciente da parcela única", val: sel.ciente_parcela_unica },
                  { label: "Autoriza validação dos dados", val: sel.autoriza_validacao },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`h-4 w-4 rounded-full flex items-center justify-center ${item.val ? "bg-green-500" : "bg-red-400"}`}>
                      <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {item.val
                          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />}
                      </svg>
                    </div>
                    <span className="text-xs">{item.label}</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold block mb-1.5">Alterar Status</label>
                <Select value={sel.status} onValueChange={(v) => updateStatus(sel.id, v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2">
                <a
                  href={`https://wa.me/55${sel.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition w-full justify-center"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Contatar via WhatsApp
                </a>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
