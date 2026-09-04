import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ExternalLink, Upload, X } from "lucide-react";
import { slugify } from "@/lib/slug";

const FONTES = ["Solar", "Eólica", "Biomassa", "Hídrica"];
const CANAIS = ["WhatsApp", "0800", "Aplicativo", "E-mail", "Presencial"];

// ── Logo upload widget ───────────────────────────────────────────────────────
function LogoField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage
      .from("logos")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      toast.error("Erro ao enviar imagem: " + error.message);
    } else {
      const { data: pub } = supabase.storage.from("logos").getPublicUrl(data.path);
      onChange(pub.publicUrl);
      toast.success("Logo enviada!");
    }
    setUploading(false);
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs">Logo</Label>
      <div className="flex items-start gap-3">
        {/* Preview */}
        <div className="h-16 w-16 shrink-0 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden">
          {value
            ? <img src={value} alt="logo" className="h-full w-full object-contain" />
            : <span className="text-xs text-muted-foreground text-center px-1">Sem logo</span>
          }
        </div>
        {/* Controls */}
        <div className="flex-1 space-y-1.5">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="text-xs"
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              {uploading ? "Enviando..." : "Fazer upload"}
            </Button>
            {value && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-xs text-destructive hover:text-destructive"
                onClick={() => onChange("")}
              >
                <X className="h-3.5 w-3.5 mr-1" /> Remover
              </Button>
            )}
          </div>
          <Input
            placeholder="ou cole a URL da imagem aqui"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="text-xs h-8"
          />
          <p className="text-[10px] text-muted-foreground">
            PNG, JPG ou WEBP · máx 5 MB
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export default function EmpresaForm({ empresa, onClose }: { empresa: any | null; onClose: () => void }) {
  const [f, setF] = useState<any>(
    empresa ?? {
      nome: "", tipo: "GD", ativa: true, parceira: false, exibe_cashback: false, cashback_percentual: 10,
      fontes_geracao: [], canais_atendimento: [], aviso_previo_dias: 90,
      tipo_fornecedor: "intermediador",
      atende_residencial: true, atende_empresarial: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  // Armazena o id após o primeiro insert para que saves subsequentes façam UPDATE
  const [savedId, setSavedId] = useState<string | null>(empresa?.id ?? null);

  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));
  const isBronze = f.tipo_fornecedor === "intermediador";
  const toggleArr = (k: string, v: string) => {
    const arr = f[k] ?? [];
    set(k, arr.includes(v) ? arr.filter((x: string) => x !== v) : [...arr, v]);
  };

  const fichaUrl = f.nome ? `/empresa/${slugify(f.nome)}` : null;

  const save = async () => {
    if (!f.nome?.trim()) {
      toast.error("Nome da empresa é obrigatório");
      return;
    }
    if (!f.tipo_fornecedor) {
      toast.error("Selecione o Tipo de Fornecedor");
      return;
    }
    setSaving(true);
    const payload = { ...f, parceira: !!f.parceira, exibe_cashback: !!f.exibe_cashback, ativa: !!f.ativa };
    delete payload.created_at;
    let res;
    if (savedId) {
      res = await supabase.from("empresas").update(payload).eq("id", savedId);
    } else {
      delete payload.id;
      res = await supabase.from("empresas").insert(payload).select("id").single();
      if (!res.error && res.data?.id) setSavedId(res.data.id);
    }
    setSaving(false);
    if (res.error) toast.error(res.error.message);
    else setSavedOk(true);
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <Dialog open={savedOk} onOpenChange={setSavedOk}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Salvo com sucesso!</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">As informações da empresa foram atualizadas.</p>
          <DialogFooter>
            <Button onClick={() => setSavedOk(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Cabeçalho */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">{empresa ? "Editar" : "Nova"} fornecedora</h1>
          {fichaUrl && (
            <a
              href={fichaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-brand-blue hover:underline mt-0.5"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver Ficha Técnica no site
            </a>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>Sair</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
        </div>
      </div>

      {/* Dados Gerais */}
      <Card>
        <CardHeader><CardTitle>Dados Gerais</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <Field label="Nome *"><Input value={f.nome ?? ""} onChange={(e) => set("nome", e.target.value)} /></Field>
          <Field label="Razão Social"><Input value={f.razao_social ?? ""} onChange={(e) => set("razao_social", e.target.value)} /></Field>
          <Field label="CNPJ"><Input value={f.cnpj ?? ""} onChange={(e) => set("cnpj", e.target.value)} /></Field>
          <Field label="Fundação (ano)"><Input type="number" value={f.fundacao ?? ""} onChange={(e) => set("fundacao", +e.target.value || null)} /></Field>
          <Field label="Sede (cidade/UF)"><Input value={f.sede ?? ""} onChange={(e) => set("sede", e.target.value)} /></Field>
          <Field label="Grupo Econômico"><Input value={f.grupo_economico ?? ""} onChange={(e) => set("grupo_economico", e.target.value)} /></Field>
          <Field label="Tipo">
            <Select value={f.tipo} onValueChange={(v) => set("tipo", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="GD">GD</SelectItem>
                <SelectItem value="Mercado Livre">Mercado Livre</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Tipo de Fornecedor *">
            <Select value={f.tipo_fornecedor ?? ""} onValueChange={(v) => set("tipo_fornecedor", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fornecedor_direto">Fornecedor Direto (Ouro) ⭐⭐⭐⭐⭐</SelectItem>
                <SelectItem value="operador">Operador (Prata) ⭐⭐⭐⭐☆</SelectItem>
                <SelectItem value="intermediador">Intermediador (Bronze) ⭐⭐⭐☆☆</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Site URL"><Input value={f.site_url ?? ""} onChange={(e) => set("site_url", e.target.value)} placeholder="https://..." /></Field>
          <Field label="Cashback %"><Input type="number" value={f.cashback_percentual ?? 10} onChange={(e) => set("cashback_percentual", +e.target.value)} /></Field>
          <Field label="Estados de atuação"><Input value={f.estados_atuacao ?? ""} onChange={(e) => set("estados_atuacao", e.target.value)} placeholder="ex: SP, RJ, MG" /></Field>
          <Field label="Arquétipo"><Input value={f.arquetipo ?? ""} onChange={(e) => set("arquetipo", e.target.value)} /></Field>
          <CheckField label="Fornecedora Parceira (comercial)" checked={!!f.parceira} onChange={(v) => set("parceira", v)} />
          <CheckField label="Exibir cashback pro consumidor" checked={!!f.exibe_cashback} onChange={(v) => set("exibe_cashback", v)} />
          <CheckField label="Ativa (aparece no ranking)" checked={!!f.ativa} onChange={(v) => set("ativa", v)} />
          <CheckField label="Atende Residencial (Grupo B — Baixa Tensão)" checked={f.atende_residencial !== false} onChange={(v) => set("atende_residencial", v)} />
          <CheckField label="Atende Empresarial (Grupo A e B — Média e Alta Tensão)" checked={f.atende_empresarial !== false} onChange={(v) => set("atende_empresarial", v)} />
          {/* Logo — ocupa coluna completa */}
          <div className="md:col-span-2">
            <LogoField value={f.logo_url ?? ""} onChange={(url) => set("logo_url", url)} />
          </div>
        </CardContent>
      </Card>

      {/* Atributos Operacionais */}
      <Card className={isBronze ? "opacity-50 pointer-events-none" : ""}>
        <CardHeader>
          <CardTitle>Atributos Operacionais</CardTitle>
          {isBronze && (
            <p className="text-sm text-amber-600 font-medium mt-1">
              ⚠️ Empresa Bronze (Intermediador) — atributos operacionais não se aplicam. Altere o Tipo de Fornecedor para habilitar.
            </p>
          )}
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <Field label="Fontes de geração">
            <div className="flex flex-wrap gap-3">
              {FONTES.map((x) => (
                <label key={x} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={(f.fontes_geracao ?? []).includes(x)} onCheckedChange={() => toggleArr("fontes_geracao", x)} />{x}
                </label>
              ))}
            </div>
          </Field>
          <CheckField label="Possui usina própria" checked={!!f.possui_usina_propria} onChange={(v) => set("possui_usina_propria", v)} />
          <Field label="Modelo de infraestrutura">
            <Select value={f.modelo_infraestrutura ?? ""} onValueChange={(v) => set("modelo_infraestrutura", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Usina Própria">Usina Própria</SelectItem>
                <SelectItem value="Consórcio">Consórcio</SelectItem>
                <SelectItem value="Cooperativa">Cooperativa</SelectItem>
                <SelectItem value="Misto">Misto</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Meses de fidelidade"><Input type="number" value={f.meses_fidelidade ?? ""} onChange={(e) => set("meses_fidelidade", e.target.value === "" ? null : +e.target.value)} /></Field>
          <Field label="Multa de cancelamento %"><Input type="number" value={f.multa_cancelamento ?? ""} onChange={(e) => set("multa_cancelamento", e.target.value === "" ? null : +e.target.value)} /></Field>
          <Field label="Aviso prévio (dias)"><Input type="number" value={f.aviso_previo_dias ?? 90} onChange={(e) => set("aviso_previo_dias", +e.target.value)} /></Field>
          <Field label="Taxa de adesão R$"><Input type="number" value={f.taxa_adesao ?? ""} onChange={(e) => set("taxa_adesao", e.target.value === "" ? null : +e.target.value)} /></Field>
          <Field label="Índice de reajuste"><Input value={f.indice_reajuste ?? ""} onChange={(e) => set("indice_reajuste", e.target.value)} placeholder="ex: Reajuste Tarifário Anual ANEEL" /></Field>
          <Field label="Desconto divulgado"><Input value={f.desconto_divulgado ?? ""} onChange={(e) => set("desconto_divulgado", e.target.value)} placeholder="ex: até 20%" /></Field>
          {/* Descontos por faixa */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-2">Descontos por Faixa de Consumo (%)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "< 1 MWh",   key: "desconto_ate_1mwh" },
                { label: "1 a 3 MWh", key: "desconto_1a3mwh" },
                { label: "3 a 5 MWh", key: "desconto_3a5mwh" },
                { label: "> 5 MWh",   key: "desconto_acima_5mwh" },
              ].map(({ label, key }) => (
                <div key={key} className="text-center">
                  <div className="text-[10px] text-muted-foreground font-semibold mb-1">{label}</div>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="—"
                      value={f[key] ?? ""}
                      onChange={(e) => set(key, e.target.value === "" ? null : +e.target.value)}
                      className="text-center pr-6"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">%</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Deixe em branco a faixa que a empresa não atende.</p>
          </div>
          <Field label="Tipo de desconto">
            <Select value={f.tipo_desconto ?? ""} onValueChange={(v) => set("tipo_desconto", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Fixo">Fixo</SelectItem>
                <SelectItem value="Variável">Variável</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Incide sobre">
            <Select value={f.incide_sobre ?? ""} onValueChange={(v) => set("incide_sobre", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TE">TE</SelectItem>
                <SelectItem value="TUSD">TUSD</SelectItem>
                <SelectItem value="TE + TUSD">TE + TUSD</SelectItem>
                <SelectItem value="Total da fatura">Total da fatura</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <CheckField label="Economia mínima garantida" checked={!!f.economia_minima_garantida} onChange={(v) => set("economia_minima_garantida", v)} />
          <Field label="Consumo mínimo R$"><Input type="number" value={f.consumo_minimo ?? ""} onChange={(e) => set("consumo_minimo", +e.target.value || null)} /></Field>
          <Field label="Prazo de ativação"><Input value={f.prazo_ativacao ?? ""} onChange={(e) => set("prazo_ativacao", e.target.value)} placeholder="ex: 60 a 90 dias" /></Field>
          <Field label="Modelo de billing">
            <Select value={f.modelo_billing ?? ""} onValueChange={(v) => set("modelo_billing", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Boleto Único">Boleto Único</SelectItem>
                <SelectItem value="Dois Boletos">Dois Boletos</SelectItem>
                <SelectItem value="Plataforma Digital">Plataforma Digital</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Canais de atendimento">
            <div className="flex flex-wrap gap-3">
              {CANAIS.map((x) => (
                <label key={x} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={(f.canais_atendimento ?? []).includes(x)} onCheckedChange={() => toggleArr("canais_atendimento", x)} />{x}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Reputação Reclame Aqui (0-10)"><Input type="number" step="0.1" value={f.reputacao_reclame_aqui ?? ""} onChange={(e) => set("reputacao_reclame_aqui", +e.target.value || null)} /></Field>
          <Field label="Nº reclamações Reclame Aqui (12 meses)"><Input type="number" value={f.numero_reclamacoes_ra ?? ""} onChange={(e) => set("numero_reclamacoes_ra", +e.target.value || null)} /></Field>
          <Field label="Avaliação Google"><Input type="number" step="0.1" value={f.avaliacao_google ?? ""} onChange={(e) => set("avaliacao_google", +e.target.value || null)} /></Field>
          <CheckField label="Processos judiciais relevantes" checked={!!f.processos_judiciais} onChange={(v) => set("processos_judiciais", v)} />
        </CardContent>
      </Card>

      {/* Análise Técnica */}
      <Card className={isBronze ? "opacity-50 pointer-events-none" : ""}>
        <CardHeader><CardTitle>Análise Técnica</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Vantagens / Prós (uma por linha)"><Textarea rows={3} value={f.vantagens ?? ""} onChange={(e) => set("vantagens", e.target.value)} placeholder="Ex: Usina própria&#10;Sem taxa de adesão" /></Field>
          <Field label="Pontos de atenção / Contras (uma por linha)"><Textarea rows={3} value={f.pontos_atencao ?? ""} onChange={(e) => set("pontos_atencao", e.target.value)} /></Field>
          <Field label="Parecer técnico"><Textarea rows={3} value={f.parecer_tecnico ?? ""} onChange={(e) => set("parecer_tecnico", e.target.value)} /></Field>
        </CardContent>
      </Card>

      {/* Guia de Cancelamento */}
      <Card className={isBronze ? "opacity-50 pointer-events-none" : ""}>
        <CardHeader><CardTitle>Guia de Cancelamento</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <Field label="E-mail principal"><Input value={f.cancel_email ?? ""} onChange={(e) => set("cancel_email", e.target.value)} /></Field>
          <Field label="E-mail Ouvidoria"><Input value={f.cancel_ouvidoria ?? ""} onChange={(e) => set("cancel_ouvidoria", e.target.value)} /></Field>
          <Field label="Telefone / WhatsApp"><Input value={f.cancel_telefone ?? ""} onChange={(e) => set("cancel_telefone", e.target.value)} /></Field>
          <Field label="Site"><Input value={f.cancel_site ?? ""} onChange={(e) => set("cancel_site", e.target.value)} /></Field>
          <Field label="Aviso prévio (dias)"><Input type="number" value={f.cancel_aviso_previo ?? ""} onChange={(e) => set("cancel_aviso_previo", +e.target.value || null)} /></Field>
          <div className="md:col-span-2"><Field label="Processo de cancelamento"><Textarea rows={3} value={f.cancel_processo ?? ""} onChange={(e) => set("cancel_processo", e.target.value)} /></Field></div>
          <div className="md:col-span-2"><Field label="Dicas ao consumidor"><Textarea rows={3} value={f.cancel_dicas ?? ""} onChange={(e) => set("cancel_dicas", e.target.value)} /></Field></div>
          <div className="md:col-span-2"><Field label="Onde recorrer"><Textarea rows={3} value={f.cancel_recorrer ?? ""} onChange={(e) => set("cancel_recorrer", e.target.value)} /></Field></div>
        </CardContent>
      </Card>

      {/* Nota sobre SJ */}
      {!isBronze && (
        <div className="rounded-xl border border-brand-blue/20 bg-brand-blue/5 p-4 text-sm text-brand-blue">
          <strong>Segurança Jurídica (Scorecard SJ)</strong> e <strong>Nota Final</strong> são definidas
          na tela <strong>Notas</strong> (menu lateral), pois variam por distribuidora.
        </div>
      )}

      <div className="flex justify-end gap-2 pb-4">
        <Button variant="outline" onClick={onClose}>Sair</Button>
        <Button onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm pt-6 cursor-pointer">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} />{label}
    </label>
  );
}
