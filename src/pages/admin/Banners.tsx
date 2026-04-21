import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Info } from "lucide-react";

export default function Banners() {
  const [list, setList] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ imagem_url: "", link_url: "", empresa_id: "", ordem: 0, ativo: true });

  const load = async () => {
    const { data } = await supabase.from("banners").select("*, empresas(nome)").order("ordem");
    setList(data ?? []);
  };

  useEffect(() => {
    load();
    supabase.from("empresas").select("id,nome").order("nome").then(({ data }) => setEmpresas(data ?? []));
  }, []);

  const add = async () => {
    if (!form.imagem_url) return toast.error("Imagem obrigatória");
    const payload = { ...form, empresa_id: form.empresa_id || null, ordem: +form.ordem };
    const { error } = await supabase.from("banners").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success("Banner criado"); setForm({ imagem_url: "", link_url: "", empresa_id: "", ordem: 0, ativo: true }); load(); }
  };

  const toggle = async (b: any) => {
    await supabase.from("banners").update({ ativo: !b.ativo }).eq("id", b.id);
    load();
  };
  const move = async (b: any, delta: number) => {
    await supabase.from("banners").update({ ordem: b.ordem + delta }).eq("id", b.id);
    load();
  };
  const remove = async (b: any) => {
    if (!confirm("Excluir banner?")) return;
    await supabase.from("banners").delete().eq("id", b.id);
    load();
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <h1 className="text-2xl font-bold">Banners</h1>

      <div className="rounded-lg border border-blue-300 bg-blue-50 p-4 text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-100">
        <div className="flex gap-3">
          <Info className="h-5 w-5 shrink-0 mt-0.5 text-blue-600 dark:text-blue-300" aria-hidden />
          <div className="space-y-1.5 text-sm">
            <div className="font-semibold">Especificações técnicas para upload de banners</div>
            <ul className="space-y-1 leading-relaxed">
              <li>📐 Dimensões recomendadas: <strong>1200 × 280px</strong> (desktop) — proporção 4:1</li>
              <li>📱 Versão mobile: o banner será redimensionado automaticamente para <strong>160px de altura</strong></li>
              <li>📁 Formato: <strong>JPG ou PNG</strong></li>
              <li>⚖️ Tamanho máximo: <strong>200KB</strong> por banner (imagens maiores deixam o site lento)</li>
              <li>🎨 Dica: use ferramentas como <strong>Canva, Photoshop ou TinyPNG</strong> para comprimir a imagem antes de subir</li>
              <li>🔗 Link: cada banner pode ter um link de destino que abre em <strong>nova aba</strong> ao ser clicado</li>
            </ul>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="grid md:grid-cols-2 gap-3 pt-6">
          <div><Label>URL da imagem</Label><Input value={form.imagem_url} onChange={(e) => setForm({ ...form, imagem_url: e.target.value })} /></div>
          <div><Label>Link de destino</Label><Input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} /></div>
          <div>
            <Label>Empresa (opcional)</Label>
            <Select value={form.empresa_id} onValueChange={(v) => setForm({ ...form, empresa_id: v })}>
              <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
              <SelectContent>{empresas.map((e) => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Ordem</Label><Input type="number" value={form.ordem} onChange={(e) => setForm({ ...form, ordem: e.target.value })} /></div>
          <div className="md:col-span-2"><Button onClick={add}>Adicionar banner</Button></div>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {list.map((b) => (
          <Card key={b.id}>
            <CardContent className="flex items-center gap-4 pt-6">
              <img src={b.imagem_url} alt="" className="w-32 h-20 object-cover rounded border" />
              <div className="flex-1 text-sm">
                <div className="font-medium">{(b.empresas as any)?.nome ?? "—"}</div>
                <div className="text-muted-foreground truncate">{b.link_url}</div>
                <div className="text-xs">Ordem: {b.ordem} · {b.ativo ? "Ativo" : "Inativo"}</div>
              </div>
              <div className="space-x-1">
                <Button size="sm" variant="outline" onClick={() => move(b, -1)}>↑</Button>
                <Button size="sm" variant="outline" onClick={() => move(b, 1)}>↓</Button>
                <Button size="sm" variant="ghost" onClick={() => toggle(b)}>{b.ativo ? "Desativar" : "Ativar"}</Button>
                <Button size="sm" variant="destructive" onClick={() => remove(b)}>Excluir</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
