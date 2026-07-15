import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Users } from "lucide-react";

type Row = {
  empresa_nome: string;
  empresa_id: string | null;
  site_url: string | null;
  count: number;
  ultima: string;
};

export default function SolicitacoesParceria() {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Busca todos os registros + site_url via join com empresas
      const { data } = await supabase
        .from("solicitacoes_parceria")
        .select("empresa_nome, empresa_id, created_at, empresas(site_url)")
        .order("created_at", { ascending: false });

      if (!data) { setLoading(false); return; }

      setTotal(data.length);

      // Agrupa por empresa_nome
      const map = new Map<string, Row>();
      for (const r of data) {
        const key = r.empresa_nome;
        if (!map.has(key)) {
          map.set(key, {
            empresa_nome: r.empresa_nome,
            empresa_id: r.empresa_id,
            site_url: (r as any).empresas?.site_url ?? null,
            count: 0,
            ultima: r.created_at,
          });
        }
        const entry = map.get(key)!;
        entry.count += 1;
        if (r.created_at > entry.ultima) entry.ultima = r.created_at;
      }

      setRows(
        Array.from(map.values()).sort((a, b) => b.count - a.count)
      );
      setLoading(false);
    })();
  }, []);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  if (loading) return <div className="text-muted-foreground p-6">Carregando...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Solicitações de Parceria</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Consumidores que querem contratar via Poupe Energia — use isso para abordar empresas não-parceiras.
        </p>
      </div>

      {/* KPI */}
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

      {/* Tabela */}
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
              Nenhuma solicitação ainda. Quando consumidores clicarem em "Solicitar parceria",
              os registros aparecerão aqui.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left px-6 py-2.5 text-xs text-muted-foreground font-medium">#</th>
                  <th className="text-left px-3 py-2.5 text-xs text-muted-foreground font-medium">Empresa</th>
                  <th className="text-center px-3 py-2.5 text-xs text-muted-foreground font-medium">Interesses</th>
                  <th className="text-center px-3 py-2.5 text-xs text-muted-foreground font-medium">Último pedido</th>
                  <th className="text-right px-6 py-2.5 text-xs text-muted-foreground font-medium">Site</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.empresa_nome} className="border-t hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-3 text-muted-foreground font-medium text-xs">{i + 1}</td>
                    <td className="px-3 py-3 font-semibold">{r.empresa_nome}</td>
                    <td className="px-3 py-3 text-center">
                      <Badge className="bg-brand-blue text-white font-bold">
                        {r.count} {r.count === 1 ? "interesse" : "interesses"}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-center text-muted-foreground text-xs">
                      {fmtDate(r.ultima)}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {r.site_url ? (
                        <a
                          href={r.site_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-brand-blue hover:underline"
                        >
                          Visitar <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
