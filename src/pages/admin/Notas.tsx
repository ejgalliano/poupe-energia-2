import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const SJ_FIELDS = [
  ["conformidade_lei_14300", "Conformidade Lei 14.300/22"],
  ["creditos_scee_rescisao", "Créditos SCEE na rescisão"],
  ["equilibrio_contratual_cdc", "Equilíbrio contratual (CDC)"],
  ["boa_fe_objetiva", "Boa-fé objetiva (Código Civil)"],
  ["limites_multa", "Limites de multa"],
  ["aviso_previo_90_dias", "Aviso prévio ≤ 90 dias"],
  ["protecao_dados_lgpd", "Proteção de dados (LGPD)"],
  ["transparencia_tarifaria", "Transparência tarifária"],
  ["responsabilidade_injecao", "Responsabilidade por injeção"],
  ["foro_consumidor", "Foro no domicílio do consumidor"],
] as const;

export default function Notas() {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [distribuidoras, setDistribuidoras] = useState<any[]>([]);
  const [empresaId, setEmpresaId] = useState("");
  const [distId, setDistId] = useState("");
  const [nota, setNota] = useState<any>(null);
  const [score, setScore] = useState<any>({});
  const [maiorDesconto, setMaiorDesconto] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("empresas").select("id,nome").order("nome").then(({ data }) => setEmpresas(data ?? []));
    supabase.from("distribuidoras").select("id,nome").order("nome").then(({ data }) => setDistribuidoras(data ?? []));
  }, []);

  useEffect(() => {
    if (!empresaId || !distId) { setNota(null); return; }
    (async () => {
      const { data } = await supabase
        .from("notas_empresas")
        .select("*")
        .eq("empresa_id", empresaId).eq("distribuidora_id", distId).maybeSingle();
      const base = data ?? {
        empresa_id: empresaId, distribuidora_id: distId,
        desconto_percentual: 0, seguranca_juridica: 0, reputacao_reclame_aqui: 0,
        valor_minimo_fatura: 100, nivel_risco: "Baixo",
      };
      setNota(base);
      if (data) {
        const { data: sc } = await supabase.from("scorecard_sj").select("*").eq("nota_empresa_id", data.id).maybeSingle();
        setScore(sc ?? {});
      } else setScore({});
      const { data: all } = await supabase.from("notas_empresas").select("desconto_percentual").eq("distribuidora_id", distId);
      setMaiorDesconto(Math.max(0, ...(all ?? []).map((x) => Number(x.desconto_percentual) || 0)));
    })();
  }, [empresaId, distId]);

  const sjCount = useMemo(() => SJ_FIELDS.reduce((acc, [k]) => acc + (score[k] ? 1 : 0), 0), [score]);

  const notaFinal = useMemo(() => {
    if (!nota) return 0;
    const desc = Number(nota.desconto_percentual) || 0;
    const ra = Number(nota.reputacao_reclame_aqui) || 0;
    const vm = Number(nota.valor_minimo_fatura) || 0;
    const maxD = Math.max(maiorDesconto, desc);
    const ds = maxD > 0 ? (desc / maxD) * 10 : 0;
    const sj = sjCount;
    const nvm = Math.max(0, Math.min(10, ((1000 - vm) / 900) * 10));
    return ds * 0.4 + sj * 0.3 + ra * 0.2 + nvm * 0.1;
  }, [nota, sjCount, maiorDesconto]);

  const save = async () => {
    if (!nota) return;
    setSaving(true);
    const payload = { ...nota, seguranca_juridica: sjCount, nota_final: Number(notaFinal.toFixed(2)) };
    let notaId = nota.id;
    if (notaId) {
      const { error } = await supabase.from("notas_empresas").update(payload).eq("id", notaId);
      if (error) { toast.error(error.message); setSaving(false); return; }
    } else {
      const { data, error } = await supabase.from("notas_empresas").insert(payload).select().single();
      if (error) { toast.error(error.message); setSaving(false); return; }
      notaId = data.id;
    }
    const scPayload = { nota_empresa_id: notaId, ...Object.fromEntries(SJ_FIELDS.map(([k]) => [k, !!score[k]])) };
    if (score.id) await supabase.from("scorecard_sj").update(scPayload).eq("id", score.id);
    else await supabase.from("scorecard_sj").insert(scPayload);

    await supabase.functions.invoke("recalc-ranking", { body: { distribuidora_id: distId } });
    toast.success("Notas salvas e ranking recalculado");
    setSaving(false);
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <h1 className="text-2xl font-bold">Notas por Distribuidora</h1>
      <Card>
        <CardContent className="grid md:grid-cols-2 gap-4 pt-6">
          <div>
            <Label>Empresa</Label>
            <Select value={empresaId} onValueChange={setEmpresaId}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{empresas.map((e) => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Distribuidora</Label>
            <Select value={distId} onValueChange={setDistId}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{distribuidoras.map((d) => <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {nota && (
        <>
          <Card>
            <CardHeader><CardTitle>Métricas</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div><Label>Desconto Inicial %</Label><Input type="number" value={nota.desconto_percentual} onChange={(e) => setNota({ ...nota, desconto_percentual: +e.target.value })} /></div>
              <div><Label>Reputação Reclame Aqui</Label><Input type="number" step="0.1" value={nota.reputacao_reclame_aqui} onChange={(e) => setNota({ ...nota, reputacao_reclame_aqui: +e.target.value })} /></div>
              <div><Label>Valor mínimo R$</Label><Input type="number" value={nota.valor_minimo_fatura} onChange={(e) => setNota({ ...nota, valor_minimo_fatura: +e.target.value })} /></div>
              <div>
                <Label>Nível de risco jurídico</Label>
                <Select value={nota.nivel_risco ?? "Baixo"} onValueChange={(v) => setNota({ ...nota, nivel_risco: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Baixo", "Médio", "Médio-Alto", "Alto"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Segurança Jurídica — Scorecard ({sjCount}/10)</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-2">
              {SJ_FIELDS.map(([k, label]) => (
                <label key={k} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={!!score[k]} onCheckedChange={(v) => setScore({ ...score, [k]: !!v })} />{label}
                </label>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <div className="text-sm text-muted-foreground">Nota Final calculada</div>
                <div className="text-4xl font-bold text-[hsl(214,50%,24%)]">{notaFinal.toFixed(2)}</div>
              </div>
              <Button onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar notas"}</Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
