import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const FONTES = ["Solar", "Eólica", "Biomassa", "Hídrica"];
const CANAIS = ["WhatsApp", "0800", "Aplicativo", "E-mail", "Presencial"];

export default function EmpresaForm({ empresa, onClose }: { empresa: any | null; onClose: () => void }) {
  const [f, setF] = useState<any>(
    empresa ?? {
      nome: "", tipo: "GD", ativa: true, parceira: false, cashback_percentual: 10,
      fontes_geracao: [], canais_atendimento: [], aviso_previo_dias: 90,
    }
  );
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));
  const toggleArr = (k: string, v: string) => {
    const arr = f[k] ?? [];
    set(k, arr.includes(v) ? arr.filter((x: string) => x !== v) : [...arr, v]);
  };

  const save = async () => {
    setSaving(true);
    const payload = { ...f, parceira: !!f.parceira, ativa: !!f.ativa };
    delete payload.created_at;
    let res;
    if (empresa) res = await supabase.from("empresas").update(payload).eq("id", empresa.id);
    else { delete payload.id; res = await supabase.from("empresas").insert(payload); }
    setSaving(false);
    if (res.error) toast.error(res.error.message);
    else { toast.success("Salvo"); onClose(); }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{empresa ? "Editar" : "Nova"} empresa</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Dados Gerais</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <Field label="Nome"><Input value={f.nome ?? ""} onChange={(e) => set("nome", e.target.value)} /></Field>
          <Field label="Razão Social"><Input value={f.razao_social ?? ""} onChange={(e) => set("razao_social", e.target.value)} /></Field>
          <Field label="CNPJ"><Input value={f.cnpj ?? ""} onChange={(e) => set("cnpj", e.target.value)} /></Field>
          <Field label="Fundação"><Input type="number" value={f.fundacao ?? ""} onChange={(e) => set("fundacao", +e.target.value || null)} /></Field>
          <Field label="Sede (cidade/UF)"><Input value={f.sede ?? ""} onChange={(e) => set("sede", e.target.value)} /></Field>
          <Field label="Grupo Econômico"><Input value={f.grupo_economico ?? ""} onChange={(e) => set("grupo_economico", e.target.value)} /></Field>
          <Field label="Tipo">
            <Select value={f.tipo} onValueChange={(v) => set("tipo", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="GD">GD</SelectItem><SelectItem value="Mercado Livre">Mercado Livre</SelectItem></SelectContent>
            </Select>
          </Field>
          <Field label="Site URL"><Input value={f.site_url ?? ""} onChange={(e) => set("site_url", e.target.value)} /></Field>
          <Field label="Logo URL"><Input value={f.logo_url ?? ""} onChange={(e) => set("logo_url", e.target.value)} /></Field>
          <Field label="Cashback %"><Input type="number" value={f.cashback_percentual ?? 10} onChange={(e) => set("cashback_percentual", +e.target.value)} /></Field>
          <Field label="Estados de atuação"><Input value={f.estados_atuacao ?? ""} onChange={(e) => set("estados_atuacao", e.target.value)} /></Field>
          <Field label="Arquétipo"><Input value={f.arquetipo ?? ""} onChange={(e) => set("arquetipo", e.target.value)} /></Field>
          <CheckField label="Parceira" checked={!!f.parceira} onChange={(v) => set("parceira", v)} />
          <CheckField label="Ativa" checked={!!f.ativa} onChange={(v) => set("ativa", v)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Atributos Operacionais</CardTitle></CardHeader>
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
          <Field label="Meses de fidelidade"><Input type="number" value={f.meses_fidelidade ?? 0} onChange={(e) => set("meses_fidelidade", +e.target.value)} /></Field>
          <Field label="Multa de cancelamento %"><Input type="number" value={f.multa_cancelamento ?? 0} onChange={(e) => set("multa_cancelamento", +e.target.value)} /></Field>
          <Field label="Aviso prévio (dias)"><Input type="number" value={f.aviso_previo_dias ?? 90} onChange={(e) => set("aviso_previo_dias", +e.target.value)} /></Field>
          <Field label="Taxa de adesão R$"><Input type="number" value={f.taxa_adesao ?? 0} onChange={(e) => set("taxa_adesao", +e.target.value)} /></Field>
          <Field label="Índice de reajuste"><Input value={f.indice_reajuste ?? ""} onChange={(e) => set("indice_reajuste", e.target.value)} placeholder="ex: Reajuste Tarifário Anual ANEEL" /></Field>
          <Field label="Desconto divulgado"><Input value={f.desconto_divulgado ?? ""} onChange={(e) => set("desconto_divulgado", e.target.value)} /></Field>
          <Field label="Tipo de desconto">
            <Select value={f.tipo_desconto ?? ""} onValueChange={(v) => set("tipo_desconto", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent><SelectItem value="Fixo">Fixo</SelectItem><SelectItem value="Variável">Variável</SelectItem></SelectContent>
            </Select>
          </Field>
          <Field label="Incide sobre">
            <Select value={f.incide_sobre ?? ""} onValueChange={(v) => set("incide_sobre", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TE">TE</SelectItem><SelectItem value="TUSD">TUSD</SelectItem><SelectItem value="Total da fatura">Total da fatura</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <CheckField label="Economia mínima garantida" checked={!!f.economia_minima_garantida} onChange={(v) => set("economia_minima_garantida", v)} />
          <Field label="Consumo mínimo R$"><Input type="number" value={f.consumo_minimo ?? ""} onChange={(e) => set("consumo_minimo", +e.target.value || null)} /></Field>
          <Field label="Prazo de ativação"><Input value={f.prazo_ativacao ?? ""} onChange={(e) => set("prazo_ativacao", e.target.value)} /></Field>
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

      <Card>
        <CardHeader><CardTitle>Análise Técnica</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Vantagens / Prós"><Textarea rows={3} value={f.vantagens ?? ""} onChange={(e) => set("vantagens", e.target.value)} /></Field>
          <Field label="Pontos de atenção / Contras"><Textarea rows={3} value={f.pontos_atencao ?? ""} onChange={(e) => set("pontos_atencao", e.target.value)} /></Field>
          <Field label="Parecer técnico"><Textarea rows={3} value={f.parecer_tecnico ?? ""} onChange={(e) => set("parecer_tecnico", e.target.value)} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Guia de Cancelamento</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <Field label="E-mail principal"><Input value={f.cancel_email ?? ""} onChange={(e) => set("cancel_email", e.target.value)} /></Field>
          <Field label="E-mail Ouvidoria"><Input value={f.cancel_ouvidoria ?? ""} onChange={(e) => set("cancel_ouvidoria", e.target.value)} /></Field>
          <Field label="Telefone/WhatsApp"><Input value={f.cancel_telefone ?? ""} onChange={(e) => set("cancel_telefone", e.target.value)} /></Field>
          <Field label="Site"><Input value={f.cancel_site ?? ""} onChange={(e) => set("cancel_site", e.target.value)} /></Field>
          <Field label="Aviso prévio (dias)"><Input type="number" value={f.cancel_aviso_previo ?? ""} onChange={(e) => set("cancel_aviso_previo", +e.target.value || null)} /></Field>
          <div className="md:col-span-2"><Field label="Processo"><Textarea rows={3} value={f.cancel_processo ?? ""} onChange={(e) => set("cancel_processo", e.target.value)} /></Field></div>
          <div className="md:col-span-2"><Field label="Dicas ao consumidor"><Textarea rows={3} value={f.cancel_dicas ?? ""} onChange={(e) => set("cancel_dicas", e.target.value)} /></Field></div>
          <div className="md:col-span-2"><Field label="Onde recorrer"><Textarea rows={3} value={f.cancel_recorrer ?? ""} onChange={(e) => set("cancel_recorrer", e.target.value)} /></Field></div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
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
    <label className="flex items-center gap-2 text-sm pt-6">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} />{label}
    </label>
  );
}
