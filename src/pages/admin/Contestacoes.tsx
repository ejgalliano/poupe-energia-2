import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { MessageSquare, ChevronDown, ChevronUp, FileText } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente",
  em_analise: "Em análise",
  respondida: "Respondida",
  encerrada: "Encerrada",
};

const STATUS_COLOR: Record<string, string> = {
  pendente: "bg-orange-100 text-orange-700",
  em_analise: "bg-blue-100 text-blue-700",
  respondida: "bg-green-100 text-green-700",
  encerrada: "bg-gray-100 text-gray-500",
};

export default function Contestacoes() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [novaObs, setNovaObs] = useState("");
  const [novoStatus, setNovoStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    let q = supabase.from("contestacoes").select("*").order("created_at", { ascending: false });
    if (filtroStatus !== "todos") q = q.eq("status", filtroStatus);
    const { data } = await q;
    setList(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filtroStatus]);

  const openEdit = (c: any) => {
    setEditing(c);
    setNovoStatus(c.status);
    setNovaObs(c.observacoes_admin ?? "");
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase
      .from("contestacoes")
      .update({ status: novoStatus, observacoes_admin: novaObs })
      .eq("id", editing.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Atualizado com sucesso");
    setEditing(null);
    load();
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const filtered = list;
  const pendentes = list.filter((c) => c.status === "pendente").length;

  return (
    <div className="space-y-4">
      {/* Dialog de edição */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Gerenciar contestação</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 text-sm">
              <div className="bg-muted/40 rounded-lg p-3 space-y-1">
                <p><span className="font-semibold">Empresa:</span> {editing.nome_empresa}</p>
                <p><span className="font-semibold">CNPJ:</span> {editing.cnpj}</p>
                <p><span className="font-semibold">Responsável:</span> {editing.nome_responsavel}</p>
                <p><span className="font-semibold">E-mail:</span> {editing.email_corporativo}</p>
                <p><span className="font-semibold">Telefone:</span> {editing.telefone}</p>
                <p><span className="font-semibold">Motivo:</span> {editing.motivo}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Descrição:</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{editing.descricao}</p>
              </div>
              {editing.documento_url && (
                <div>
                  <a
                    href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/documentos-contestacao/${editing.documento_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-brand-blue hover:underline text-xs"
                  >
                    <FileText className="h-3.5 w-3.5" /> Ver documento anexado
                  </a>
                </div>
              )}
              <div>
                <label className="block font-semibold mb-1">Status</label>
                <Select value={novoStatus} onValueChange={setNovoStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABEL).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Observações internas</label>
                <textarea
                  rows={3}
                  value={novaObs}
                  onChange={(e) => setNovaObs(e.target.value)}
                  placeholder="Notas da análise técnica (não visível ao solicitante)..."
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 resize-none"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={saveEdit} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contestações</h1>
          {pendentes > 0 && (
            <p className="text-sm text-orange-600 font-medium mt-0.5">
              {pendentes} pendente{pendentes > 1 ? "s" : ""} aguardando análise
            </p>
          )}
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            {Object.entries(STATUS_LABEL).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground text-sm">Nenhuma contestação encontrada.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <Card key={c.id} className={c.status === "pendente" ? "border-orange-200 bg-orange-50/30" : ""}>
              <CardContent className="p-0">
                <div className="flex items-start gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm">{c.nome_empresa}</span>
                      <span className="text-xs text-muted-foreground">CNPJ {c.cnpj}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[c.status] ?? "bg-gray-100"}`}>
                        {STATUS_LABEL[c.status] ?? c.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {c.motivo} · {fmt(c.created_at)} · {c.nome_responsavel} · {c.email_corporativo}
                    </p>
                    {c.observacoes_admin && (
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> {c.observacoes_admin}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => openEdit(c)}>Analisar</Button>
                    <button
                      onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                      className="p-1 rounded hover:bg-muted transition"
                    >
                      {expanded === c.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {expanded === c.id && (
                  <div className="border-t px-4 py-3 bg-muted/20 text-sm">
                    <p className="font-semibold mb-1 text-xs uppercase text-muted-foreground tracking-wide">Descrição completa</p>
                    <p className="whitespace-pre-wrap text-gray-700">{c.descricao}</p>
                    {c.documento_url && (
                      <a
                        href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/documentos-contestacao/${c.documento_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-brand-blue hover:underline text-xs mt-2"
                      >
                        <FileText className="h-3.5 w-3.5" /> Ver documento anexado
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
