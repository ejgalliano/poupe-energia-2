import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, Search } from "lucide-react";

// ─── Tipos ───────────────────────────────────────────────────────────────────

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
  checklist: Record<string, boolean> | null;
  historico: { status: string; data: string }[] | null;
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

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CashbackCadastros() {
  const navigate = useNavigate();
  const [cadastros, setCadastros] = useState<Cadastro[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

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

  const filtrados = useMemo(() => {
    const q = search.toLowerCase();
    return cadastros.filter((c) => {
      if (filterStatus !== "all" && c.status !== filterStatus) return false;
      if (q && ![c.nome, c.email, c.cpf_cnpj, c.distribuidora_nome ?? "", c.empresa_nome ?? "", c.telefone ?? "", c.whatsapp].some((v) => v.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [cadastros, search, filterStatus]);

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
                <TableRow key={c.id} className="cursor-pointer hover:bg-muted/40" onClick={() => navigate(`/admin/cashback/${c.id}`)}>
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
    </div>
  );
}
