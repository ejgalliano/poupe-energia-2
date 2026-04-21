import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const [stats, setStats] = useState({
    empresas: 0,
    distribuidoras: 0,
    estados: 0,
    leadsHoje: 0,
    leadsMes: 0,
  });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [e, d, s, r, lh, lm] = await Promise.all([
        supabase.from("empresas").select("id", { count: "exact", head: true }),
        supabase.from("distribuidoras").select("id", { count: "exact", head: true }),
        supabase.from("estados").select("id", { count: "exact", head: true }),
        supabase
          .from("notas_empresas")
          .select("nota_final, updated_at, empresas(nome), distribuidoras(nome)")
          .order("updated_at", { ascending: false })
          .limit(10),
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .gte("created_at", startOfDay.toISOString()),
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .gte("created_at", startOfMonth.toISOString()),
      ]);
      setStats({
        empresas: e.count ?? 0,
        distribuidoras: d.count ?? 0,
        estados: s.count ?? 0,
        leadsHoje: lh.count ?? 0,
        leadsMes: lm.count ?? 0,
      });
      setRecent(r.data ?? []);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: "Empresas", value: stats.empresas },
          { label: "Distribuidoras", value: stats.distribuidoras },
          { label: "Estados cobertos", value: stats.estados },
          { label: "Leads hoje", value: stats.leadsHoje },
          { label: "Leads este mês", value: stats.leadsMes },
        ].map((c) => (
          <Card key={c.label}>
            <CardHeader><CardTitle className="text-sm text-muted-foreground">{c.label}</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-[hsl(214,50%,24%)]">{c.value}</div></CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Últimas notas atualizadas</CardTitle></CardHeader>
        <CardContent>
          <ul className="divide-y">
            {recent.map((r, i) => (
              <li key={i} className="py-2 flex justify-between text-sm">
                <span>{(r.empresas as any)?.nome} — {(r.distribuidoras as any)?.nome}</span>
                <span className="font-semibold">{Number(r.nota_final).toFixed(1)}</span>
              </li>
            ))}
            {recent.length === 0 && <li className="text-muted-foreground text-sm">Nenhum registro.</li>}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
