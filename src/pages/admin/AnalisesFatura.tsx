import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type Analise = {
  id: string;
  created_at: string;
  arquivo_url: string;
  arquivo_tipo: string;
  status: string;
  erro_mensagem: string | null;
  distribuidora_nome_extraido: string | null;
  distribuidora_id: string | null;
  estado_sigla: string | null;
  cidade: string | null;
  nome_titular: string | null;
  cpf_cnpj: string | null;
  numero_instalacao: string | null;
  classe_consumo: string | null;
  consumo_kwh: number | null;
  valor_conta: number | null;
  dados_brutos_ia: Record<string, unknown> | null;
  dados_confirmados: Record<string, unknown> | null;
};

const STATUS_META: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  processando: { label: "Processando", variant: "secondary" },
  extraido:    { label: "Extraído",    variant: "default" },
  confirmado:  { label: "Confirmado",  variant: "default" },
  erro:        { label: "Erro",        variant: "destructive" },
};

const fmtDate = (s: string) =>
  new Date(s).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

const fmtBRL = (n: number | null) =>
  n != null ? n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";

export default function AnalisesFatura() {
  const [analises, setAnalises] = useState<Analise[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Analise | null>(null);

  async function carregar() {
    setLoading(true);
    const { data, error } = await supabase
      .from("analises_fatura")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) toast.error("Erro ao carregar: " + error.message);
    else setAnalises((data ?? []) as Analise[]);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  const totais = {
    total: analises.length,
    confirmados: analises.filter((a) => a.status === "confirmado").length,
    erros: analises.filter((a) => a.status === "erro").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Análises de Fatura</h1>
          <p className="text-gray-500 text-sm">Faturas enviadas pelo protótipo de IA</p>
        </div>
        <Button variant="outline" size="sm" onClick={carregar} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span className="ml-2">Atualizar</span>
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{totais.total}</p>
            <p className="text-sm text-gray-500">Total enviadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-green-600">{totais.confirmados}</p>
            <p className="text-sm text-gray-500">Confirmadas pelo usuário</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-red-500">{totais.erros}</p>
            <p className="text-sm text-gray-500">Com erro na extração</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registros</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Distribuidora</TableHead>
                <TableHead>Titular</TableHead>
                <TableHead>Consumo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                    Carregando...
                  </TableCell>
                </TableRow>
              )}
              {!loading && analises.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                    Nenhuma análise enviada ainda.
                  </TableCell>
                </TableRow>
              )}
              {analises.map((a) => {
                const meta = STATUS_META[a.status] ?? { label: a.status, variant: "outline" };
                return (
                  <TableRow key={a.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelected(a)}>
                    <TableCell className="text-xs text-gray-500">{fmtDate(a.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </TableCell>
                    <TableCell className="uppercase text-xs">{a.arquivo_tipo}</TableCell>
                    <TableCell>{a.distribuidora_nome_extraido ?? "—"}</TableCell>
                    <TableCell>{a.nome_titular ?? "—"}</TableCell>
                    <TableCell>{a.consumo_kwh != null ? `${a.consumo_kwh} kWh` : "—"}</TableCell>
                    <TableCell>{fmtBRL(a.valor_conta)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelected(a); }}>
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader className="mb-4">
                <SheetTitle>Detalhes da Análise</SheetTitle>
              </SheetHeader>

              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant={STATUS_META[selected.status]?.variant ?? "outline"}>
                    {STATUS_META[selected.status]?.label ?? selected.status}
                  </Badge>
                  <span className="text-gray-400 text-xs">{fmtDate(selected.created_at)}</span>
                </div>

                <a
                  href={selected.arquivo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline text-xs"
                >
                  <ExternalLink size={12} />
                  Ver arquivo original ({selected.arquivo_tipo.toUpperCase()})
                </a>

                {selected.erro_mensagem && (
                  <div className="bg-red-50 text-red-700 rounded p-3 text-xs">
                    <strong>Erro:</strong> {selected.erro_mensagem}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Distribuidora", selected.distribuidora_nome_extraido],
                    ["Estado", selected.estado_sigla],
                    ["Cidade", selected.cidade],
                    ["Titular", selected.nome_titular],
                    ["CPF/CNPJ", selected.cpf_cnpj],
                    ["Nº Instalação", selected.numero_instalacao],
                    ["Classe", selected.classe_consumo],
                    ["Consumo", selected.consumo_kwh != null ? `${selected.consumo_kwh} kWh` : null],
                    ["Valor da Conta", fmtBRL(selected.valor_conta)],
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="font-medium">{(value as string) ?? "—"}</p>
                    </div>
                  ))}
                </div>

                {selected.dados_brutos_ia && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Dados brutos da IA</p>
                    <pre className="bg-gray-50 rounded p-3 text-xs overflow-auto max-h-48">
                      {JSON.stringify(selected.dados_brutos_ia, null, 2)}
                    </pre>
                  </div>
                )}

                {selected.dados_confirmados && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Dados confirmados pelo usuário</p>
                    <pre className="bg-green-50 rounded p-3 text-xs overflow-auto max-h-48">
                      {JSON.stringify(selected.dados_confirmados, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
