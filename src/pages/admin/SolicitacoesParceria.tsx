import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ExternalLink, Users, Mail, Phone, Search, Building2, Download, Trash2 } from "lucide-react";

type Lead = {
  id: string;
  empresa_nome: string;
  estado_sigla: string | null;
  nome_usuario: string | null;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  created_at: string;
  site_url: string | null;
};

type View = "contatos" | "empresas";

type GroupedRow = {
  empresa_nome: string;
  site_url: string | null;
  count: number;
  ultima: string;
  leads: Lead[];
};

export default function SolicitacoesParceria() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("contatos");
  const [search, setSearch] = useState("");
  const [filterEmpresa, setFilterEmpresa] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("solicitacoes_parceria")
        .select("id, empresa_nome, estado_sigla, nome_usuario, email, telefone, cidade, created_at, empresas(site_url)")
        .order("created_at", { ascending: false });

      if (!data) { setLoading(false); return; }

      setLeads(data.map((r: any) => ({
        id: r.id,
        empresa_nome: r.empresa_nome,
        estado_sigla: r.estado_sigla,
        nome_usuario: r.nome_usuario,
        email: r.email,
        telefone: r.telefone,
        cidade: r.cidade,
        created_at: r.created_at,
        site_url: r.empresas?.site_url ?? null,
      })));
      setLoading(false);
    })();
  }, []);

  const empresasUnicas = useMemo(
    () => Array.from(new Set(leads.map(l => l.empresa_nome))).sort(),
    [leads]
  );

  const filteredLeads = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter(l => {
      const matchSearch = !q ||
        l.nome_usuario?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.cidade?.toLowerCase().includes(q) ||
        l.empresa_nome.toLowerCase().includes(q);
      const matchEmpresa = filterEmpresa === "all" || l.empresa_nome === filterEmpresa;
      return matchSearch && matchEmpresa;
    });
  }, [leads, search, filterEmpresa]);

  const grouped = useMemo<GroupedRow[]>(() => {
    const map = new Map<string, GroupedRow>();
    for (const l of leads) {
      if (!map.has(l.empresa_nome)) {
        map.set(l.empresa_nome, { empresa_nome: l.empresa_nome, site_url: l.site_url, count: 0, ultima: l.created_at, leads: [] });
      }
      const e = map.get(l.empresa_nome)!;
      e.count += 1;
      if (l.created_at > e.ultima) e.ultima = l.created_at;
      e.leads.push(l);
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [leads]);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const handleDelete = async (id: string) => {
    if (!window.confirm("Excluir este cadastro?")) return;
    setDeleting(id);
    const { error } = await supabase.from("solicitacoes_parceria").delete().eq("id", id);
    if (!error) setLeads(prev => prev.filter(l => l.id !== id));
    setDeleting(null);
  };

  const exportCsv = () => {
    const rows = [
      ["Nome", "Email", "Telefone", "Cidade", "Estado", "Empresa", "Data"],
      ...filteredLeads.map(l => [
        l.nome_usuario ?? "",
        l.email ?? "",
        l.telefone ?? "",
        l.cidade ?? "",
        l.estado_sigla ?? "",
        l.empresa_nome,
        fmtDate(l.created_at),
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "solicitacoes_parceria.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-muted-foreground p-6">Carregando...</div>;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Solicitações de Parceria</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Pessoas que querem contratar via Poupe Energia — use para abordar empresas não-parceiras.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} className="shrink-0">
          <Download className="h-4 w-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total de cadastros</p>
            <p className="text-3xl font-extrabold mt-1 text-brand-blue">{leads.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Com email</p>
            <p className="text-3xl font-extrabold mt-1 text-brand-blue">{leads.filter(l => l.email).length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Com telefone</p>
            <p className="text-3xl font-extrabold mt-1 text-brand-blue">{leads.filter(l => l.telefone).length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Empresas únicas</p>
            <p className="text-3xl font-extrabold mt-1 text-brand-blue">{empresasUnicas.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${view === "contatos" ? "border-brand-blue text-brand-blue" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          onClick={() => setView("contatos")}
        >
          <Users className="h-4 w-4 inline mr-1.5 -mt-0.5" />
          Todos os contatos
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${view === "empresas" ? "border-brand-blue text-brand-blue" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          onClick={() => setView("empresas")}
        >
          <Building2 className="h-4 w-4 inline mr-1.5 -mt-0.5" />
          Por empresa
        </button>
      </div>

      {/* View: Contatos */}
      {view === "contatos" && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email, cidade ou empresa…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Select value={filterEmpresa} onValueChange={setFilterEmpresa}>
                <SelectTrigger className="w-full sm:w-56 h-9">
                  <SelectValue placeholder="Filtrar por empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as empresas</SelectItem>
                  {empresasUnicas.map(e => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {filteredLeads.length !== leads.length && (
              <p className="text-xs text-muted-foreground mt-1">{filteredLeads.length} de {leads.length} cadastros</p>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {filteredLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground px-6 py-8 text-center">Nenhum cadastro encontrado.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Nome</th>
                      <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Contato</th>
                      <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Localização</th>
                      <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Empresa desejada</th>
                      <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Data</th>
                      <th className="px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map(l => (
                      <tr key={l.id} className="border-t hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-semibold whitespace-nowrap">
                          {l.nome_usuario || <span className="text-muted-foreground font-normal italic">Anônimo</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            {l.email && (
                              <a href={`mailto:${l.email}`} className="flex items-center gap-1 text-brand-blue hover:underline text-xs">
                                <Mail className="h-3 w-3 shrink-0" />
                                {l.email}
                              </a>
                            )}
                            {l.telefone && (
                              <a
                                href={`https://wa.me/55${l.telefone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-brand-blue hover:underline text-xs"
                              >
                                <Phone className="h-3 w-3 shrink-0" />
                                {l.telefone}
                              </a>
                            )}
                            {!l.email && !l.telefone && <span className="text-xs text-muted-foreground">—</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                          {[l.cidade, l.estado_sigla].filter(Boolean).join(" / ") || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{l.empresa_nome}</span>
                            {l.site_url && (
                              <a href={l.site_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-brand-blue">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmtDate(l.created_at)}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDelete(l.id)}
                            disabled={deleting === l.id}
                            className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-40"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* View: Por empresa */}
      {view === "empresas" && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Ranking de interesse por empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {grouped.length === 0 ? (
              <p className="text-sm text-muted-foreground px-6 py-8 text-center">Nenhuma solicitação ainda.</p>
            ) : (
              grouped.map((r, i) => (
                <div key={r.empresa_nome} className="border-t">
                  <button
                    className="w-full text-left px-6 py-3 hover:bg-muted/30 transition-colors flex items-center gap-4"
                    onClick={() => setExpanded(expanded === r.empresa_nome ? null : r.empresa_nome)}
                  >
                    <span className="text-xs text-muted-foreground font-medium w-5 shrink-0">{i + 1}</span>
                    <span className="font-semibold flex-1">{r.empresa_nome}</span>
                    <Badge className="bg-brand-blue text-white font-bold shrink-0">
                      {r.count} {r.count === 1 ? "cadastro" : "cadastros"}
                    </Badge>
                    <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">{fmtDate(r.ultima)}</span>
                    {r.site_url && (
                      <a href={r.site_url} target="_blank" rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs text-brand-blue hover:underline shrink-0">
                        Site <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <span className="text-xs text-muted-foreground shrink-0">
                      {expanded === r.empresa_nome ? "▲" : "▼"}
                    </span>
                  </button>

                  {expanded === r.empresa_nome && (
                    <div className="bg-muted/20 border-t overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-muted-foreground">
                            <th className="text-left px-6 py-2 font-medium">Nome</th>
                            <th className="text-left px-4 py-2 font-medium">Email</th>
                            <th className="text-left px-4 py-2 font-medium">Telefone</th>
                            <th className="text-left px-4 py-2 font-medium">Cidade / UF</th>
                            <th className="text-left px-4 py-2 font-medium">Data</th>
                            <th className="px-4 py-2" />
                          </tr>
                        </thead>
                        <tbody>
                          {r.leads.map(lead => (
                            <tr key={lead.id} className="border-t border-muted/40">
                              <td className="px-6 py-2 font-medium">{lead.nome_usuario || <span className="text-muted-foreground italic">Anônimo</span>}</td>
                              <td className="px-4 py-2">
                                {lead.email
                                  ? <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-brand-blue hover:underline"><Mail className="h-3 w-3" />{lead.email}</a>
                                  : <span className="text-muted-foreground">—</span>}
                              </td>
                              <td className="px-4 py-2">
                                {lead.telefone
                                  ? <a href={`https://wa.me/55${lead.telefone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand-blue hover:underline"><Phone className="h-3 w-3" />{lead.telefone}</a>
                                  : <span className="text-muted-foreground">—</span>}
                              </td>
                              <td className="px-4 py-2 text-muted-foreground">{[lead.cidade, lead.estado_sigla].filter(Boolean).join(" / ") || "—"}</td>
                              <td className="px-4 py-2 text-muted-foreground">{fmtDate(lead.created_at)}</td>
                              <td className="px-4 py-2">
                                <button
                                  onClick={() => handleDelete(lead.id)}
                                  disabled={deleting === lead.id}
                                  className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-40"
                                  title="Excluir"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
