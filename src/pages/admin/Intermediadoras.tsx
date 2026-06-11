import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const EMPTY = { nome: "", site_url: "", ativa: true };

export default function Intermediadoras() {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState<any>(EMPTY);
  const [editing, setEditing] = useState<any | null>(null);
  const [savedOk, setSavedOk] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("empresas")
      .select("id, nome, site_url, ativa")
      .eq("tipo_fornecedor", "intermediador")
      .order("nome");
    setList(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.nome.trim()) return toast.error("Informe o nome");
    const payload = {
      nome: form.nome.trim(),
      site_url: form.site_url.trim() || null,
      ativa: form.ativa,
      tipo_fornecedor: "intermediador",
    };
    const res = editing
      ? await supabase.from("empresas").update(payload).eq("id", editing.id)
      : await supabase.from("empresas").insert(payload);
    if (res.error) toast.error(res.error.message);
    else { setEditing(null); setForm(EMPTY); load(); setSavedOk(true); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    const { error } = await supabase.from("empresas").delete().eq("id", confirmDelete.id);
    setDeleting(false);
    if (error) toast.error(error.message);
    else { toast.success(`${confirmDelete.nome} excluída`); setConfirmDelete(null); load(); }
  };

  const startEdit = (item: any) => {
    setEditing(item);
    setForm({ nome: item.nome, site_url: item.site_url ?? "", ativa: item.ativa });
  };

  const cancel = () => { setEditing(null); setForm(EMPTY); };

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">Intermediadoras</h1>

      {/* Formulário */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome da empresa" />
            </div>
            <div>
              <Label>Site (URL)</Label>
              <Input value={form.site_url} onChange={(e) => setForm({ ...form, site_url: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ativa"
              checked={form.ativa}
              onChange={(e) => setForm({ ...form, ativa: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="ativa" className="cursor-pointer">Ativa (aparece no ranking)</Label>
          </div>
          <div className="flex gap-2 pt-1">
            <Button onClick={save}>{editing ? "Atualizar" : "Adicionar"}</Button>
            {editing && <Button variant="outline" onClick={cancel}>Cancelar</Button>}
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3">Nome</th>
                <th className="text-left p-3">Site</th>
                <th className="text-left p-3">Status</th>
                <th className="text-right p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <tr key={item.id} className="border-t hover:bg-muted/20 transition-colors">
                  <td className="p-3 font-medium">{item.nome}</td>
                  <td className="p-3 text-xs text-muted-foreground truncate max-w-[160px]">
                    {item.site_url ? (
                      <a href={item.site_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                        {item.site_url}
                      </a>
                    ) : "—"}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${item.ativa ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {item.ativa ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(item)}>Editar</Button>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setConfirmDelete(item)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Nenhuma intermediadora cadastrada</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Dialog: salvo */}
      <Dialog open={savedOk} onOpenChange={setSavedOk}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Salvo com sucesso!</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">As informações da intermediadora foram atualizadas.</p>
          <DialogFooter>
            <Button onClick={() => setSavedOk(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: confirmar exclusão */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Excluir intermediadora?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir <strong>{confirmDelete?.nome}</strong>? Esta ação é <strong>irreversível</strong>.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Excluindo..." : "Excluir definitivamente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
