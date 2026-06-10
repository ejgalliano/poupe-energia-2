import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

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
  // sjNota: valor numérico de Segurança Jurídica (0–10, decimal ok)
  // É preenchido com o valor do banco ao carregar, e atualizado pelo scorecard
  const [sjNota, setSjNota] = useState<number>(0);
  const [maiorDesconto, setMaiorDesconto] = useState<number>(0);
  const [formulaCfg, setFormulaCfg] = useState({ peso_desconto: 0.4, peso_sj: 0.3, peso_ra: 0.2, peso_vm: 0.1, vm_melhor: 100, vm_pior: 1000 });
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  useEffect(() => {
    supabase.from("empresas").select("id,nome,tipo_fornecedor").neq("tipo_fornecedor", "intermediador").order("nome").then(({ data }) => setEmpresas(data ?? []));
    supabase.from("distribuidoras").select("id,nome").order("nome").then(({ data }) => setDistribuidoras(data ?? []));
    // Buscar maior desconto global e configuração da fórmula
    supabase.from("notas_empresas").select("desconto_percentual").then(({ data }) => {
      const max = Math.max(0, ...(data ?? []).map((x: any) => Number(x.desconto_percentual) || 0));
      setMaiorDesconto(max);
    });
    supabase.from("formula_config").select("*").limit(1).maybeSingle().then(({ data }) => {
      if (data) setFormulaCfg(data);
    });
  }, []);

  useEffect(() => {
    if (!empresaId || !distId) { setNota(null); setSjNota(0); return; }
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
      // Carrega SJ do banco (pode ser decimal como 9.5 vindo da planilha)
      setSjNota(Number(base.seguranca_juridica) || 0);
      if (data) {
        const { data: sc } = await supabase.from("scorecard_sj").select("*").eq("nota_empresa_id", data.id).maybeSingle();
        const sc2 = sc ?? {};
        setScore(sc2);
        // Sincroniza sjNota com o count do scorecard se scorecard já preenchido
        const count = SJ_FIELDS.reduce((acc, [k]) => acc + (sc2[k] ? 1 : 0), 0);
        if (count > 0) setSjNota(count);
      } else setScore({});
    })();
  }, [empresaId, distId]);

  // Quando checkboxes mudam → atualiza sjNota para reflect o count
  const handleScoreChange = (key: string, value: boolean) => {
    const newScore = { ...score, [key]: !!value };
    setScore(newScore);
    const count = SJ_FIELDS.reduce((acc, [k]) => acc + (newScore[k] ? 1 : 0), 0);
    setSjNota(count);
  };

  const sjCount = useMemo(() => SJ_FIELDS.reduce((acc, [k]) => acc + (score[k] ? 1 : 0), 0), [score]);

  const notaFinal = useMemo(() => {
    if (!nota) return 0;
    const desc = Number(nota.desconto_percentual) || 0;
    const ra = Number(nota.reputacao_reclame_aqui) || 0;
    const vm = Number(nota.valor_minimo_fatura) || 0;
    // Nota DS = (desconto_empresa / maior_desconto_global) × 10  — igual à planilha original
    const ds = maiorDesconto > 0 ? Math.min(10, (desc / maiorDesconto) * 10) : 0;
    // SJ: usa sjNota que pode ser decimal (ex: 9.5) ou inteiro (do scorecard)
    const sj = Math.min(10, Math.max(0, sjNota));
    // Nota VM usando parâmetros da config
    const range = formulaCfg.vm_pior - formulaCfg.vm_melhor;
    const nvm = range > 0 ? Math.max(0, Math.min(10, ((formulaCfg.vm_pior - vm) / range) * 10)) : 0;
    const raw = ds * formulaCfg.peso_desconto + sj * formulaCfg.peso_sj + ra * formulaCfg.peso_ra + nvm * formulaCfg.peso_vm;
    return Math.min(10, Math.max(0, raw));
  }, [nota, sjNota, maiorDesconto, formulaCfg]);

  const save = async () => {
    if (!nota) return;
    setSaving(true);
    const sjFinal = Math.min(10, Math.max(0, sjNota));
    const notaFinalRounded = Number(notaFinal.toFixed(2));
    const payload = { ...nota, seguranca_juridica: sjFinal, nota_final: notaFinalRounded };
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
    setSaving(false);
    setSavedOk(true);
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <Dialog open={savedOk} onOpenChange={setSavedOk}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Notas salvas com sucesso!</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">As notas foram atualizadas e o ranking foi recalculado.</p>
          <DialogFooter><Button onClick={() => setSavedOk(false)}>OK</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <h1 className="text-2xl font-bold">Notas por Distribuidora</h1>

      {/* Aviso sobre escala */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
        <strong>Atenção às escalas:</strong> Desconto em % (ex: 15 = 15%), Reputação Reclame Aqui de <strong>0 a 10</strong> (ex: 7.4), Segurança Jurídica de <strong>0 a 10</strong>. Valores fora desta escala vão distorcer a nota final.
      </div>

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
              <div>
                <Label>Desconto Inicial % <span className="text-muted-foreground font-normal">(0–100)</span></Label>
                <Input
                  type="number" min="0" max="100" step="0.1"
                  value={nota.desconto_percentual}
                  onChange={(e) => setNota({ ...nota, desconto_percentual: +e.target.value })}
                />
              </div>
              <div>
                <Label>Reputação Reclame Aqui <span className="text-muted-foreground font-normal">(0–10)</span></Label>
                <Input
                  type="number" min="0" max="10" step="0.1"
                  value={nota.reputacao_reclame_aqui}
                  onChange={(e) => setNota({ ...nota, reputacao_reclame_aqui: +e.target.value })}
                />
              </div>
              <div>
                <Label>Valor mínimo R$</Label>
                <Input
                  type="number" min="0"
                  value={nota.valor_minimo_fatura}
                  onChange={(e) => setNota({ ...nota, valor_minimo_fatura: +e.target.value })}
                />
              </div>
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
            <CardHeader>
              <CardTitle>Segurança Jurídica — Scorecard ({sjCount}/10)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-2">
                {SJ_FIELDS.map(([k, label]) => (
                  <label key={k} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={!!score[k]}
                      onCheckedChange={(v) => handleScoreChange(k, !!v)}
                    />{label}
                  </label>
                ))}
              </div>

              {/* Campo manual para SJ decimal (ex: 9.5 vindo da planilha) */}
              <div className="border-t pt-3 mt-2">
                <Label>
                  Nota SJ <span className="text-muted-foreground font-normal">(0–10, decimal ok — atualiza automaticamente com o scorecard)</span>
                </Label>
                <Input
                  type="number" min="0" max="10" step="0.1"
                  value={sjNota}
                  onChange={(e) => setSjNota(Math.min(10, Math.max(0, +e.target.value)))}
                  className="max-w-[160px] mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between pt-6">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Nota Final calculada</div>
                <div className="text-4xl font-bold text-[hsl(214,50%,24%)]">
                  {notaFinal.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Maior desconto do ranking: <span className="font-semibold text-foreground">{maiorDesconto}%</span>
                  {nota && Number(nota.desconto_percentual) === maiorDesconto && (
                    <span className="ml-1 text-brand-success font-semibold">(esta empresa tem o maior desconto)</span>
                  )}
                </div>
              </div>
              <Button onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar notas"}</Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
