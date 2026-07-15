import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Users, Mail, Phone } from "lucide-react";

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

type GroupedRow = {
  empresa_nome: string;
  site_url: string | null;
  count: number;
  ultima: string;
  leads: Lead[];
};

export default function SolicitacoesParceria() {
  const [rows, setRows] = useState<GroupedRow[]>([]);
  const [total, setTotal] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("solicitacoes_parceria")
        .select("id, empresa_nome, estado_sigla, nome_usuario, email, telefone, cidade, created_at, empresas(site_url)")
        .order("created_at", { ascending: false });

      if (!data) { setLoading(false); return; }

      setTotal(data.length);

      const map = new Map<string, GroupedRow>();
      for (const r of data) {
        const key = r.empresa_nome;
        if (!map.has(key)) {
          map.set(key, {
            empresa_nome: r.empresa_nome,
            site_url: (r as any).empresas?.site_url ?? null,
            count: 0,
            ultima: r.created_at,
            leads: [],
          });
        }
        const entry = map.get(key)!;
        entry.count += 1;
        if (r.created_at > entry.ultima) entry.ultima = r.created_at;
        entry.leads.push({
          id: r.id,
          empresa_nome: r.empresa_nome,
          estado_sigla: r.estado_sigla,
          nome_usuario: r.nome_usuario,
          email: r.email,
          telefone: r.telefone,
          cidade: r.cidade,
          created_at: r.created_at,
          site_url: (r as any).empresas?.site_url ?? null,
        });
      }

      setRows(Array.from(map.values()).sort((a, b) => b.count - a.count));
      setLoading(false);
    })();
  }, []);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  if (loading) return <div className="text-muted-foreground p-6">Carregando...</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Solicitações de Parceria</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Consumidores que querem contratar via Poupe Energia — use isso para abordar empresas não-parceiras.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total de interesses</p>
            <p className="text-3xl font-extrabold mt-1 text-brand-blue">{total}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Empresas únicas</p>
            <p className="text-3xl font-extrabold mt-1 text-brand-blue">{rows.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Mais solicitada</p>
            <p className="text-lg font-extrabold mt-1 text-brand-blue truncate">
              {rows[0]?.empresa_nome ?? "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela agrupada por empresa */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Empresas com pedidos de parceria
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground px-6 py-8 text-center">
              Nenhuma solicitação ainda.
            </p>
          ) : (
            <div>
              {rows.map((r, i) => (
                <div key={r.empresa_nome} className="border-t">
                  {/* Linha da empresa */}
                  <button
                    className="w-full text-left px-6 py-3 hover:bg-muted/30 transition-colors flex items-center gap-4"
                    onClick={() => setExpanded(expanded === r.empresa_nome ? null : r.empresa_nome)}
                  >
                    <span className="text-xs text-muted-foreground font-medium w-5 shrink-0">{i + 1}</span>
                    <span className="font-semibold flex-1">{r.empresa_nome}</span>
                    <Badge className="bg-brand-blue text-white font-bold shrink-0">
                      {r.count} {r.count === 1 ? "interesse" : "interesses"}
                    </Badge>
                    <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">{fmtDate(r.ultima)}</span>
                    {r.site_url && (
                      <a
                        href={r.site_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs text-brand-blue hover:underline shrink-0"
                      >
                        Site <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <span className="text-xs text-muted-foreground shrink-0">
                      {expanded === r.empresa_nome ? "▲" : "▼"}
                    </span>
                  </button>

                  {/* Leads expandidos */}
                  {expanded === r.empresa_nome && (
                    <div className="bg-muted/20 border-t px-6 py-3">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-muted-foreground">
                            <th className="text-left py-1.5 pr-4 font-medium">Nome</th>
                            <th className="text-left py-1.5 pr-4 font-medium">Email</th>
                            <th className="text-left py-1.5 pr-4 font-medium">Telefone</th>
                            <th className="text-left py-1.5 pr-4 font-medium">Cidade / UF</th>
                            <th className="text-left py-1.5 font-medium">Data</th>
                          </tr>
                        </thead>
                        <tbody>
                          {r.leads.map(lead => (
                            <tr key={lead.id} className="border-t border-muted/40">
                              <td className="py-2 pr-4 font-medium">{lead.nome_usuario || <span className="text-muted-foreground">—</span>}</td>
                              <td className="py-2 pr-4">
                                {lead.email
                                  ? <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-brand-blue hover:underline"><Mail className="h-3 w-3" />{lead.email}</a>
                                  : <span className="text-muted-foreground">—</span>}
                              </td>
                              <td className="py-2 pr-4">
                                {lead.telefone
                                  ? <a href={`https://wa.me/55${lead.telefone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand-blue hover:underline"><Phone className="h-3 w-3" />{lead.telefone}</a>
                                  : <span className="text-muted-foreground">—</span>}
                              </td>
                              <td className="py-2 pr-4 text-muted-foreground">
                                {[lead.cidade, lead.estado_sigla].filter(Boolean).join(" / ") || "—"}
                              </td>
                              <td className="py-2 text-muted-foreground">{fmtDate(lead.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
