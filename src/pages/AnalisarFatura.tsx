import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Image, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Step = "upload" | "processando" | "confirmar" | "erro";

interface DadosExtraidos {
  distribuidora_nome: string | null;
  estado_sigla: string | null;
  cidade: string | null;
  nome_titular: string | null;
  cpf_cnpj: string | null;
  numero_instalacao: string | null;
  classe_consumo: string | null;
  consumo_kwh: number | null;
  valor_conta: number | null;
}

const TIPOS_ACEITOS = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const EXTENSAO: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
};

export default function AnalisarFatura() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [dragging, setDragging] = useState(false);
  const [analiseId, setAnaliseId] = useState<string | null>(null);
  const [distribuidoraId, setDistribuidoraId] = useState<string | null>(null);
  const [erroMsg, setErroMsg] = useState("");
  const [dados, setDados] = useState<DadosExtraidos>({
    distribuidora_nome: null,
    estado_sigla: null,
    cidade: null,
    nome_titular: null,
    cpf_cnpj: null,
    numero_instalacao: null,
    classe_consumo: null,
    consumo_kwh: null,
    valor_conta: null,
  });

  async function processarArquivo(file: File) {
    if (!TIPOS_ACEITOS.includes(file.type)) {
      toast.error("Formato não suportado. Envie um PDF, JPG ou PNG.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo: 20 MB.");
      return;
    }

    setStep("processando");
    const tipo = EXTENSAO[file.type] ?? "pdf";
    const nomeArquivo = `${Date.now()}_${Math.random().toString(36).slice(2)}.${tipo}`;

    try {
      // 1. Upload para o Storage
      const { error: uploadError } = await supabase.storage
        .from("faturas")
        .upload(nomeArquivo, file, { contentType: file.type });

      if (uploadError) throw new Error(`Erro no upload: ${uploadError.message}`);

      const { data: urlData } = supabase.storage
        .from("faturas")
        .getPublicUrl(nomeArquivo);

      const arquivo_url = urlData.publicUrl;

      // 2. Cria o registro no banco
      const { data: analise, error: insertError } = await supabase
        .from("analises_fatura")
        .insert({ arquivo_url, arquivo_tipo: tipo, status: "processando" })
        .select("id")
        .single();

      if (insertError) throw new Error(`Erro ao criar registro: ${insertError.message}`);

      setAnaliseId(analise.id);

      // 3. Chama a Edge Function
      const { data: fnData, error: fnError } = await supabase.functions.invoke(
        "analisar-fatura",
        { body: { analise_id: analise.id, arquivo_url, arquivo_tipo: tipo } }
      );

      if (fnError) throw new Error(fnError.message);
      if (fnData?.error) throw new Error(fnData.error);

      setDados(fnData.data ?? {});
      setDistribuidoraId(fnData.distribuidora_id ?? null);
      setStep("confirmar");
    } catch (err: any) {
      setErroMsg(err.message ?? "Erro desconhecido");
      setStep("erro");
    }
  }

  async function confirmar() {
    if (!analiseId) return;

    await supabase
      .from("analises_fatura")
      .update({ status: "confirmado", dados_confirmados: dados })
      .eq("id", analiseId);

    if (distribuidoraId) {
      navigate(`/ranking?distribuidora=${distribuidoraId}`);
    } else {
      navigate("/ranking");
    }
  }

  const campo = (label: string, key: keyof DadosExtraidos) => (
    <div className="space-y-1">
      <Label className="text-sm text-gray-600">{label}</Label>
      <Input
        value={dados[key] ?? ""}
        onChange={(e) => setDados((d) => ({ ...d, [key]: e.target.value }))}
        placeholder="—"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Analisar Conta de Energia</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Envie sua fatura e descubra as melhores opções para você
          </p>
          <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
            Protótipo em teste
          </span>
        </div>

        {step === "upload" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Envie sua fatura</CardTitle>
              <CardDescription>PDF, JPG ou PNG · até 20 MB</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
                  dragging ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-gray-400"
                }`}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file) processarArquivo(file);
                }}
              >
                <div className="flex justify-center gap-3 mb-3 text-gray-400">
                  <FileText size={28} />
                  <Image size={28} />
                </div>
                <p className="text-gray-600 text-sm font-medium">
                  Arraste o arquivo aqui ou clique para selecionar
                </p>
                <p className="text-gray-400 text-xs mt-1">PDF · JPG · PNG</p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) processarArquivo(file);
                }}
              />
            </CardContent>
          </Card>
        )}

        {step === "processando" && (
          <Card>
            <CardContent className="py-16 flex flex-col items-center gap-4">
              <Loader2 size={40} className="text-green-600 animate-spin" />
              <p className="text-gray-700 font-medium">Analisando sua fatura...</p>
              <p className="text-gray-400 text-sm text-center">
                A IA está lendo os dados. Isso leva alguns segundos.
              </p>
            </CardContent>
          </Card>
        )}

        {step === "confirmar" && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-green-600" />
                <CardTitle className="text-base">Dados extraídos — confirme ou corrija</CardTitle>
              </div>
              <CardDescription>
                Verifique se os dados estão corretos antes de ver o ranking.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {campo("Distribuidora", "distribuidora_nome")}
              <div className="grid grid-cols-2 gap-4">
                {campo("Estado", "estado_sigla")}
                {campo("Cidade", "cidade")}
              </div>
              {campo("Nome do Titular", "nome_titular")}
              <div className="grid grid-cols-2 gap-4">
                {campo("CPF / CNPJ", "cpf_cnpj")}
                {campo("Nº Instalação / UC", "numero_instalacao")}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {campo("Classe", "classe_consumo")}
                {campo("Consumo (kWh)", "consumo_kwh")}
                {campo("Valor (R$)", "valor_conta")}
              </div>

              {!distribuidoraId && dados.distribuidora_nome && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded p-2">
                  Distribuidora "{dados.distribuidora_nome}" não encontrada na nossa base. O ranking será exibido sem filtro de distribuidora.
                </p>
              )}

              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={confirmar}>
                Confirmar e ver ranking
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "erro" && (
          <Card>
            <CardContent className="py-12 flex flex-col items-center gap-4">
              <AlertCircle size={40} className="text-red-500" />
              <p className="text-gray-700 font-medium text-center">
                Não foi possível analisar a fatura automaticamente
              </p>
              <p className="text-gray-400 text-sm text-center">{erroMsg}</p>
              <div className="flex gap-3 mt-2">
                <Button variant="outline" onClick={() => setStep("upload")}>
                  Tentar novamente
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => navigate("/ranking")}
                >
                  Ir para o ranking
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
