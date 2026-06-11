import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Distribuidoras() {
  const [list, setList] = useState<any[]>([]);
  const [estados, setEstados] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ nome: "", estado_id: "" });
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("distribuidoras").select("*, estados(sigla,nome)").order("nome");
    setList(data ?? []);
  };

  useEffect(() => {
    load();
    supabase.from("estados").select("*").order("nome").then(({ data }) => setEstados(data ?? []));
  }, []);

  const save = async () => {
    if (!form.nome || !form.estado_id) return toast.error("Preencha tudo");
    const payload = { nome: form.nome, estado_id: +form.estado_id };
    const res = editing
      ? await supabase.from("distribuidoras").update(payload).eq("id", editing.id)
      : await supabase.from("distribuidoras").insert(payload);
    if (res.error) toast.error(res.error.message);
    else { setEditing(null); setForm({ nome: "", estado_id: "" }); load(); setSavedOk(true); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    await supabase.from("scorecard_sj").delete().eq("distribuidora_id", confirmDelete.id);
    await supabase.from("notas_empresas").delete().eq("distribuidora_id", confirmDelete.id);
    const { error } = await supabase.from("distribuidoras").delete().eq("id", confirmDelete.id);
    setDeleting(false);
    if (error) toast.error(error.message);
    else { toast.success("Distribuidora excluída"); setConfirmDelete(null); load(); }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">Distribuidoras</h1>

      <Card>
        <CardContent className="grid md:grid-cols-3 gap-3 pt-6">
          <div><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
          <div>
            <Label>Estado</Label>
            <Select value={form.estado_id} onValueChange={(v) => setForm({ ...form, estado_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{estados.map((e) => <SelectItem key={e.id} value={String(e.id)}>{e.sigla} — {e.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={save}>{editing ? "Atualizar" : "Adicionar"}</Button>
            {editing && <Button variant="outline" onClick={() => { setEditing(null); setForm({ nome: "", estado_id: "" }); }}>Cancelar</Button>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3">Nome</th>
                <th className="text-left p-3">Estado</th>
                <th className="text-right p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="p-3">{d.nome}</td>
                  <td className="p-3">{(d.estados as any)?.sigla}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditing(d); setForm({ nome: d.nome, estado_id: String(d.estado_id) }); }}>
                        Editar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setConfirmDelete(d)}>
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={savedOk} onOpenChange={setSavedOk}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Salvo com sucesso!</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">As informações da distribuidora foram atualizadas.</p>
          <DialogFooter>
            <Button onClick={() => setSavedOk(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Excluir distribuidora?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir <strong>{confirmDelete?.nome}</strong>? Esta ação é <strong>irreversível</strong> — todas as notas vinculadas a esta distribuidora serão apagadas permanentemente.
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
