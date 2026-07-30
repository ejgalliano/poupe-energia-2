import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Mail, ChevronDown, ChevronUp, Save, ToggleLeft, ToggleRight } from "lucide-react";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Template = {
  id: string;
  status: string;
  label: string;
  assunto: string;
  mensagem: string;
  ativo: boolean;
  updated_at: string;
};

// ─── Constantes ──────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pendente:            "bg-yellow-100 text-yellow-800",
  em_analise:          "bg-blue-100 text-blue-700",
  cadastrado_parceiro: "bg-purple-100 text-purple-700",
  contrato_enviado:    "bg-indigo-100 text-indigo-700",
  ativo:               "bg-green-100 text-green-700",
  pago:                "bg-emerald-100 text-emerald-800",
  cancelado:           "bg-red-100 text-red-700",
};

const VARIAVEIS = [
  { key: "{{nome}}",          desc: "Primeiro nome do cliente" },
  { key: "{{nome_completo}}", desc: "Nome completo" },
  { key: "{{empresa}}",       desc: "Nome da fornecedora" },
  { key: "{{distribuidora}}", desc: "Nome da distribuidora" },
  { key: "{{percentual}}",    desc: "% de cashback (ex: 5%)" },
  { key: "{{valor_cashback}}",desc: "Valor pago (ex: R$ 120,00)" },
  { key: "{{chave_pix}}",     desc: "Chave Pix do cliente" },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export default function EmailTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [aberto, setAberto] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Partial<Template>>({});
  const [salvando, setSalvando] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("email_templates" as any)
      .select("*")
      .order("updated_at");
    if (error) toast.error(error.message);
    else setTemplates((data ?? []) as Template[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const abrir = (t: Template) => {
    if (aberto === t.id) { setAberto(null); return; }
    setAberto(t.id);
    setRascunho({ assunto: t.assunto, mensagem: t.mensagem });
  };

  const salvar = async (t: Template) => {
    setSalvando(true);
    const { error } = await supabase
      .from("email_templates" as any)
      .update({
        assunto: rascunho.assunto,
        mensagem: rascunho.mensagem,
        updated_at: new Date().toISOString(),
      })
      .eq("id", t.id);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      toast.success("Template salvo!");
      setAberto(null);
      load();
    }
    setSalvando(false);
  };

  const toggleAtivo = async (t: Template) => {
    const { error } = await supabase
      .from("email_templates" as any)
      .update({ ativo: !t.ativo })
      .eq("id", t.id);
    if (error) toast.error(error.message);
    else {
      toast.success(t.ativo ? "Email desativado" : "Email ativado");
      load();
    }
  };

  const inserirVariavel = (key: string) => {
    setRascunho((r) => ({ ...r, mensagem: (r.mensagem ?? "") + key }));
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-muted-foreground">Carregando...</div>
  );

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Templates de Email</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure as mensagens enviadas automaticamente para o cliente em cada etapa da adesão.
        </p>
      </div>

      {/* Variáveis disponíveis */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4 pb-3">
          <p className="text-xs font-bold text-blue-800 mb-2">Variáveis disponíveis — clique para copiar</p>
          <div className="flex flex-wrap gap-2">
            {VARIAVEIS.map((v) => (
              <button
                key={v.key}
                onClick={() => { navigator.clipboard.writeText(v.key); toast.success(`${v.key} copiado!`); }}
                title={v.desc}
                className="font-mono text-xs bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 transition"
              >
                {v.key}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-blue-600 mt-2">Passe o mouse sobre cada variável para ver o que ela representa. Clique para copiar.</p>
        </CardContent>
      </Card>

      {/* Lista de templates */}
      <div className="space-y-3">
        {templates.map((t) => (
          <Card key={t.id} className={!t.ativo ? "opacity-60" : ""}>
            <CardContent className="p-0">

              {/* Cabeçalho do card */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition rounded-lg"
                onClick={() => abrir(t)}
              >
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${STATUS_COLORS[t.status] ?? "bg-gray-100"} text-[11px]`}>
                      {t.label}
                    </Badge>
                    {!t.ativo && (
                      <span className="text-[10px] text-muted-foreground">(desativado)</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">{t.assunto}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleAtivo(t); }}
                    className="text-muted-foreground hover:text-foreground transition"
                    title={t.ativo ? "Desativar email" : "Ativar email"}
                  >
                    {t.ativo
                      ? <ToggleRight className="h-5 w-5 text-green-600" />
                      : <ToggleLeft className="h-5 w-5" />}
                  </button>
                  {aberto === t.id
                    ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>

              {/* Editor inline */}
              {aberto === t.id && (
                <div className="border-t px-4 py-4 space-y-4">

                  {/* Variáveis rápidas para inserir na mensagem */}
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">Inserir variável na mensagem:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {VARIAVEIS.map((v) => (
                        <button
                          key={v.key}
                          onClick={() => inserirVariavel(v.key)}
                          title={v.desc}
                          className="font-mono text-[11px] bg-muted border border-border text-foreground px-1.5 py-0.5 rounded hover:bg-muted/80 transition"
                        >
                          {v.key}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Assunto */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Assunto do email</label>
                    <Input
                      value={rascunho.assunto ?? ""}
                      onChange={(e) => setRascunho((r) => ({ ...r, assunto: e.target.value }))}
                      placeholder="Assunto do email..."
                    />
                  </div>

                  {/* Mensagem */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Mensagem <span className="font-normal">(use linhas em branco para separar parágrafos)</span>
                    </label>
                    <textarea
                      value={rascunho.mensagem ?? ""}
                      onChange={(e) => setRascunho((r) => ({ ...r, mensagem: e.target.value }))}
                      rows={10}
                      className="w-full border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 resize-y"
                      placeholder="Texto da mensagem..."
                    />
                  </div>

                  {/* Ações */}
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground">
                      Atualizado em {new Date(t.updated_at).toLocaleDateString("pt-BR")}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setAberto(null)}>
                        Cancelar
                      </Button>
                      <Button size="sm" onClick={() => salvar(t)} disabled={salvando}>
                        <Save className="h-3.5 w-3.5 mr-1" />
                        {salvando ? "Salvando..." : "Salvar"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}
