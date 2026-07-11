import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AlertTriangle, RefreshCw, FlaskConical, Info } from "lucide-react";

interface Config {
  id?: string;
  peso_desconto: number;
  peso_sj: number;
  peso_ra: number;
  peso_vm: number;
  vm_melhor: number;
  vm_pior: number;
  coeficiente_simulacao: number;
  updated_at?: string;
  updated_by?: string;
}

const DEFAULT: Config = {
  peso_desconto: 0.4,
  peso_sj: 0.3,
  peso_ra: 0.2,
  peso_vm: 0.1,
  vm_melhor: 100,
  vm_pior: 1000,
  coeficiente_simulacao: 0.83,
};

export default function FormulaConfig() {
  const [cfg, setCfg] = useState<Config>(DEFAULT);
  const [original, setOriginal] = useState<Config>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [maiorDesconto, setMaiorDesconto] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("formula_config")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (data) { setCfg(data); setOriginal(data); }

      const { data: d } = await supabase
        .from("notas_empresas")
        .select("desconto_percentual");
      const max = Math.max(0, ...(d ?? []).map((x: any) => Number(x.desconto_percentual) || 0));
      setMaiorDesconto(max);

      setLoading(false);
    })();
  }, []);

  const soma = useMemo(
    () => +(cfg.peso_desconto + cfg.peso_sj + cfg.peso_ra + cfg.peso_vm).toFixed(4),
    [cfg]
  );
  const somaOk = Math.abs(soma - 1) < 0.0001;

  // Preview com valores hipotéticos
  const preview = useMemo(() => {
    const exemplos = [
      { nome: "Empresa A (maior desconto)", desc: maiorDesconto || 30, sj: 9, ra: 8.5, vm: 200 },
      { nome: "Empresa B (desconto médio)",  desc: (maiorDesconto || 30) * 0.7, sj: 7, ra: 7, vm: 300 },
      { nome: "Empresa C (desconto menor)",  desc: (maiorDesconto || 30) * 0.5, sj: 8, ra: 6, vm: 500 },
    ];
    return exemplos.map((e) => {
      const notaDS = maiorDesconto > 0 ? Math.min(10, (e.desc / maiorDesconto) * 10) : 0;
      const range  = cfg.vm_pior - cfg.vm_melhor;
      const notaVM = range > 0 ? Math.max(0, Math.min(10, ((cfg.vm_pior - e.vm) / range) * 10)) : 0;
      const raw    = notaDS * cfg.peso_desconto + e.sj * cfg.peso_sj + e.ra * cfg.peso_ra + notaVM * cfg.peso_vm;
      const nota   = Math.min(10, Math.max(0, raw));
      return { ...e, notaDS, notaVM, nota };
    });
  }, [cfg, maiorDesconto]);

  const handleSave = async () => {
    if (!somaOk) {
      toast.error("Os pesos devem somar exatamente 1,00 antes de salvar.");
      return;
    }
    if (cfg.vm_melhor >= cfg.vm_pior) {
      toast.error("'VM Melhor' deve ser menor que 'VM Pior'.");
      return;
    }

    setSaving(true);
    try {
      // Salvar configuração
      const payload = {
        peso_desconto: cfg.peso_desconto,
        peso_sj: cfg.peso_sj,
        peso_ra: cfg.peso_ra,
        peso_vm: cfg.peso_vm,
        vm_melhor: cfg.vm_melhor,
        vm_pior: cfg.vm_pior,
        coeficiente_simulacao: cfg.coeficiente_simulacao,
        updated_at: new Date().toISOString(),
      };

      if (cfg.id) {
        const { error } = await supabase
          .from("formula_config")
          .update(payload)
          .eq("id", cfg.id);
        if (error) throw error;
      } else {
        const { data: inserted, error } = await supabase
          .from("formula_config")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        if (inserted?.id) setCfg((c) => ({ ...c, id: inserted.id }));
      }

      toast.loading("Fórmula salva. Recalculando todos os rankings...", { id: "recalc" });

      // Recalcular TODOS os rankings
      const { error: recalcError } = await supabase.functions.invoke("recalc-ranking", {
        body: { distribuidora_id: "ALL" },
      });

      if (recalcError) throw recalcError;

      setOriginal({ ...cfg });
      toast.success("Fórmula salva e todos os rankings recalculados!", { id: "recalc" });
    } catch (e: any) {
      toast.error("Erro: " + (e?.message ?? String(e)), { id: "recalc" });
    }
    setSaving(false);
  };

  const changed = JSON.stringify(cfg) !== JSON.stringify(original);

  if (loading) return <div className="text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Configuração da Fórmula de Ranking</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Define como a Nota Final de cada empresa é calculada. Ao salvar, <strong>todos os rankings são recalculados automaticamente</strong>.
        </p>
      </div>

      {/* Info box */}
      <div className="flex gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <Info className="h-5 w-5 shrink-0 mt-0.5" />
        <div>
          <strong>Como funciona:</strong>
          <br />
          Nota Final = (Nota DS × Peso DS) + (SJ × Peso SJ) + (RA × Peso RA) + (Nota VM × Peso VM)
          <br />
          <span className="mt-1 block text-blue-700">
            • <strong>Nota DS</strong> = (desconto da empresa ÷ maior desconto do ranking) × 10 — a empresa com maior desconto sempre recebe 10
            <br />
            • <strong>SJ</strong> e <strong>RA</strong> já estão na escala 0–10
            <br />
            • <strong>Nota VM</strong> = escala invertida entre VM Melhor e VM Pior
          </span>
        </div>
      </div>

      {/* Pesos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Pesos dos Critérios
            <span className={`ml-auto text-sm font-normal px-2 py-0.5 rounded-full ${somaOk ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              Soma: {(soma * 100).toFixed(1)}% {somaOk ? "✓" : "← deve ser 100%"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-5">
          {[
            { key: "peso_desconto", label: "Desconto (Nota DS)", hint: "Peso do critério de desconto" },
            { key: "peso_sj",       label: "Segurança Jurídica", hint: "Peso do critério SJ" },
            { key: "peso_ra",       label: "Reputação Reclame Aqui", hint: "Peso do critério RA" },
            { key: "peso_vm",       label: "Valor Mínimo de Adesão", hint: "Peso do critério VM" },
          ].map(({ key, label, hint }) => (
            <div key={key}>
              <Label>{label}</Label>
              <p className="text-xs text-muted-foreground mb-1">{hint}</p>
              <div className="flex items-center gap-2">
                <Input
                  type="number" min="0" max="1" step="0.01"
                  value={(cfg as any)[key]}
                  onChange={(e) => setCfg({ ...cfg, [key]: +e.target.value })}
                  className="max-w-[120px]"
                />
                <span className="text-sm text-muted-foreground">
                  = {((cfg as any)[key] * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Coeficiente do Simulador */}
      <Card>
        <CardHeader>
          <CardTitle>Coeficiente do Simulador de Economia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
            <Info className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              Representa a <strong>fatia da conta de luz que recebe desconto</strong> — ou seja, a parte de energia pura, excluindo impostos, taxas e encargos (ICMS, PIS, COFINS, bandeiras etc.).
              O valor padrão <strong>0,83</strong> significa que ~83% da conta é energia e ~17% são tributos.
            </div>
          </div>
          <div>
            <Label>Coeficiente de energia da fatura</Label>
            <p className="text-xs text-muted-foreground mb-1">
              Fórmula: Economia = Fatura × <strong>coeficiente</strong> × (desconto ÷ 100)
            </p>
            <div className="flex items-center gap-3">
              <Input
                type="number" min="0.5" max="1" step="0.01"
                value={cfg.coeficiente_simulacao}
                onChange={(e) => setCfg({ ...cfg, coeficiente_simulacao: +e.target.value })}
                className="max-w-[120px]"
              />
              <span className="text-sm text-muted-foreground">
                = {(cfg.coeficiente_simulacao * 100).toFixed(0)}% da conta é energia
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Exemplo com fatura de R$ 1.000 e desconto de 20%:
              base = 1.000 × {cfg.coeficiente_simulacao} = R$ {(1000 * cfg.coeficiente_simulacao).toFixed(0)} →
              economia = R$ {(1000 * cfg.coeficiente_simulacao * 0.2).toFixed(0)} →
              nova fatura = R$ {(1000 - 1000 * cfg.coeficiente_simulacao * 0.2).toFixed(0)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Parâmetros VM */}
      <Card>
        <CardHeader>
          <CardTitle>Parâmetros — Valor Mínimo de Adesão (R$)</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-5">
          <div>
            <Label>VM Melhor (nota 10)</Label>
            <p className="text-xs text-muted-foreground mb-1">
              Empresa com valor mínimo ≤ este valor recebe nota 10
            </p>
            <Input
              type="number" min="0"
              value={cfg.vm_melhor}
              onChange={(e) => setCfg({ ...cfg, vm_melhor: +e.target.value })}
            />
          </div>
          <div>
            <Label>VM Pior (nota 0)</Label>
            <p className="text-xs text-muted-foreground mb-1">
              Empresa com valor mínimo ≥ este valor recebe nota 0
            </p>
            <Input
              type="number" min="0"
              value={cfg.vm_pior}
              onChange={(e) => setCfg({ ...cfg, vm_pior: +e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Preview — como ficaria com a fórmula atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Maior desconto atual no ranking: <strong>{maiorDesconto}%</strong>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="text-left py-2 pr-4">Empresa (ex.)</th>
                  <th className="text-center py-2 px-2">Desc.</th>
                  <th className="text-center py-2 px-2">Nota DS</th>
                  <th className="text-center py-2 px-2">SJ</th>
                  <th className="text-center py-2 px-2">RA</th>
                  <th className="text-center py-2 px-2">Nota VM</th>
                  <th className="text-center py-2 pl-2 font-bold text-brand-blue">Nota Final</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((p, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{p.nome}</td>
                    <td className="text-center px-2">{p.desc.toFixed(0)}%</td>
                    <td className="text-center px-2">{p.notaDS.toFixed(2)}</td>
                    <td className="text-center px-2">{p.sj}</td>
                    <td className="text-center px-2">{p.ra}</td>
                    <td className="text-center px-2">{p.notaVM.toFixed(2)}</td>
                    <td className="text-center pl-2 font-bold text-brand-blue">{p.nota.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Aviso de alteração */}
      {changed && (
        <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <strong>Você tem alterações não salvas.</strong> Ao salvar, <strong>todos os rankings</strong> serão recalculados automaticamente com a nova fórmula.
            Esse processo pode levar alguns segundos.
          </div>
        </div>
      )}

      {/* Botão */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={saving || !somaOk}
          className="bg-brand-blue hover:bg-brand-blue/90 text-white font-bold px-6"
        >
          {saving
            ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Salvando e recalculando...</>
            : <><RefreshCw className="h-4 w-4 mr-2" />Salvar e Recalcular Todos os Rankings</>
          }
        </Button>
        {changed && (
          <Button
            variant="outline"
            onClick={() => setCfg(original)}
            disabled={saving}
          >
            Descartar alterações
          </Button>
        )}
      </div>

      {original.updated_at && (
        <p className="text-xs text-muted-foreground">
          Última atualização: {new Date(original.updated_at).toLocaleString("pt-BR")}
        </p>
      )}
    </div>
  );
}
