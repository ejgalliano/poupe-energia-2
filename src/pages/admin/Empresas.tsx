import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAll } from "@/lib/fetchAll";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import EmpresaForm from "./EmpresaForm";
import { slugify } from "@/lib/slug";

export default function Empresas() {
  const [list, setList] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    const data = await fetchAll((from, to) =>
      supabase.from("empresas").select("*").order("nome").range(from, to)
    );
    setList(data);
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (e: any) => {
    const { error } = await supabase.from("empresas").update({ ativa: !e.ativa }).eq("id", e.id);
    if (error) toast.error(error.message);
    else { toast.success("Atualizado"); load(); }
  };

  if (creating || editing) {
    return (
      <EmpresaForm
        empresa={editing}
        onClose={() => { setEditing(null); setCreating(false); load(); }}
      />
    );
  }

  const filtered = list.filter((e) => e.nome.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Empresas</h1>
        <Button onClick={() => setCreating(true)}>Nova empresa</Button>
      </div>
      <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3">Nome</th>
                <th className="text-left p-3">Tipo Fornecedor</th>
                <th className="text-left p-3">Parceira</th>
                <th className="text-left p-3">Status</th>
                <th className="text-right p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-t hover:bg-muted/20 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {e.logo_url && (
                        <img src={e.logo_url} alt="" className="h-6 w-6 object-contain rounded shrink-0" />
                      )}
                      <span className="font-medium">{e.nome}</span>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {e.tipo_fornecedor === "fornecedor_direto" ? "Ouro ⭐" :
                     e.tipo_fornecedor === "operador" ? "Prata" : "Bronze"}
                  </td>
                  <td className="p-3">{e.parceira ? "✅" : "—"}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${e.ativa ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {e.ativa ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={`/empresa/${slugify(e.nome)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ver Ficha Técnica"
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <Button size="sm" variant="outline" onClick={() => setEditing(e)}>Editar</Button>
                      <Button size="sm" variant="ghost" onClick={() => toggleActive(e)}>
                        {e.ativa ? "Desativar" : "Ativar"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
