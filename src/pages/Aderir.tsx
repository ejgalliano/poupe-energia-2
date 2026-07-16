import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Zap, Upload, CheckCircle2, AlertCircle, Loader2, X,
  FileText, User, Phone, Mail, CreditCard, Bolt,
  ChevronRight, ChevronLeft, Building2,
} from "lucide-react";

// Configura o worker do pdfjs para rodar no browser
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).href;

// ─── Compressão de imagem (canvas) ───────────────────────────────────────────
async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (file.size < 600 * 1024) return file; // já está ok, não comprime
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX_W = 1400;
      const scale = img.width > MAX_W ? MAX_W / img.width : 1;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.82
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

// ─── Extração de texto do PDF ─────────────────────────────────────────────────
// Agrupa os itens de texto por posição Y (mesma linha visual no PDF).
// Isso evita que valores de colunas diferentes (ex: tabela de itens) se misturem,
// e garante que "TOTAL A PAGAR R$ 230,50" fique numa só linha para o regex capturar.
async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let i = 1; i <= Math.min(pdf.numPages, 3); i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // Agrupa por Y (arredonda em grupos de 3px para juntar itens da mesma linha)
    const rowMap = new Map<number, Array<{ x: number; str: string }>>();
    for (const item of content.items as any[]) {
      const str = item.str as string;
      if (!str) continue;
      const yKey = Math.round((item.transform[5] as number) / 3) * 3;
      if (!rowMap.has(yKey)) rowMap.set(yKey, []);
      rowMap.get(yKey)!.push({ x: item.transform[4] as number, str });
    }

    // Ordena de cima para baixo (PDF: Y maior = mais alto na página)
    const sortedYs = [...rowMap.keys()].sort((a, b) => b - a);
    for (const y of sortedYs) {
      const line = rowMap.get(y)!
        .sort((a, b) => a.x - b.x)
        .map(i => i.str)
        .join(" ")
        .trim();
      if (line) fullText += line + "\n";
    }
  }
  return fullText;
}

// ─── Parsing dos campos da fatura ─────────────────────────────────────────────
type Extracted = {
  numero_uc: string;
  consumo_kwh: number | null;
  valor_conta: number | null;
  classe_consumo: string;
  nome_titular: string;
  endereco_instalacao: string;
};

function tryMatch(text: string, patterns: RegExp[]): string {
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]?.trim()) return m[1].trim();
  }
  return "";
}

function parseValor(s: string): number | null {
  if (!s) return null;
  const clean = s.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(clean);
  return isNaN(n) ? null : n;
}

// ─── Padrões específicos por distribuidora ────────────────────────────────────
type DistConfig = { uc?: RegExp[]; kwh?: RegExp[]; valor?: RegExp[] };

function getDistConfig(nome: string): DistConfig {
  const n = nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  // Padrão genérico de valor que funciona bem quando label e valor estão na mesma linha
  // (graças ao agrupamento por Y na extração)
  const valorGenerico: RegExp[] = [
    /TOTAL\s+A\s+PAGAR\D{0,25}([\d.]{1,7}[.,]\d{2})/i,
    /VALOR\s+A\s+PAGAR\D{0,25}([\d.]{1,7}[.,]\d{2})/i,
    /VALOR\s+TOTAL\D{0,25}([\d.]{1,7}[.,]\d{2})/i,
    /VALOR\s+DA\s+FATURA\D{0,25}([\d.]{1,7}[.,]\d{2})/i,
    /TOTAL\s+COM\s+TRIBUTOS?\D{0,25}([\d.]{1,7}[.,]\d{2})/i,
    /Total\s+Fatura\D{0,20}([\d.]{1,7}[.,]\d{2})/i,
  ];

  if (n.includes("light"))
    return {
      uc: [/INSTALA[CÇ][AÃ]O\D{0,15}(\d{10})/i, /Unidade\s+Consumidora\D{0,10}(\d{9,12})/i],
      kwh: [
        // Tabela histórico de consumo: "CONSUMO / kWh ... 264 30" (264 kWh, 30 dias)
        /CONSUMO\s*\/\s*kWh[\s\S]{0,500}?\b(\d{3,5})\s+\d{2}\b/i,
      ],
      valor: valorGenerico,
    };

  if (n.includes("cemig"))
    return {
      uc: [/INST[ALAÇAO\s]*[:\-]\s*(\d{10})/i, /[Ii]nstala[cç][aã]o\D{0,10}(\d{10})/],
      kwh: [
        /CONSUMO\s+FATURADO\D{0,25}([\d.]+(?:,\d+)?)/i,
        /Consumo\s*\(kWh\)\D{0,15}(\d{3,6})/i,
        /Consumo\s+de\s+Energia\D{0,20}([\d.]+(?:,\d+)?)\s*kWh/i,
        /Energia\s+Consumida\D{0,20}([\d.]+(?:,\d+)?)\s*kWh/i,
      ],
      valor: [
        /TOTAL\s+COM\s+DESCONTO\D{0,25}([\d.]{1,7}[.,]\d{2})/i,
        ...valorGenerico,
      ],
    };

  if (n.includes("copel"))
    return {
      uc: [/C[oó]digo\s+da\s+[Uu]nidade\D{0,10}(\d{5,12})/, /Unidade\s+Consumidora\D{0,10}(\d{5,12})/],
      kwh: [
        /Consumo\s+do\s+[Mm][eê]s\D{0,20}([\d.]+(?:,\d+)?)/i,
        /Energia\s+Ativa\s+Fornecida\D{0,20}([\d.]+(?:,\d+)?)\s*kWh/i,
        /ENERGIA\s+EL[EÉ]TRICA\s+kWh\D{0,15}(\d{3,6})/i,
      ],
      valor: [/Total\s+Atual\D{0,20}([\d.]{1,7}[.,]\d{2})/i, ...valorGenerico],
    };

  if (n.includes("cpfl") || n.includes("rge") || n.includes("piratininga"))
    return {
      kwh: [
        /CONSUMO\s+FATURADO\D{0,25}([\d.]+(?:,\d+)?)/i,
        /Energia\s+El[eé]trica\s+kWh\D{0,20}(\d{3,6})/i,
        /Consumo\s+Ativo\D{0,20}([\d.]+(?:,\d+)?)\s*kWh/i,
      ],
      valor: valorGenerico,
    };

  if (n.includes("enel"))
    return {
      uc: [/N[uú]mero\s+(?:do\s+)?[Cc]ontrato\D{0,10}(\d{5,12})/, /[Ii]nstala[cç][aã]o\D{0,10}(\d{5,12})/],
      kwh: [
        /Consumo\s+do\s+[Mm][eê]s\D{0,20}([\d.]+(?:,\d+)?)/i,
        /ENERGIA\s+ATIVA\s*kWh\D{0,15}(\d{3,6})/i,
        /Consumo\s+Total\D{0,20}(\d{3,6})\s*kWh/i,
      ],
      valor: valorGenerico,
    };

  if (n.includes("elektro") || (n.includes("neoenergia") && !n.includes("coelba") && !n.includes("cosern") && !n.includes("coelce")))
    return {
      kwh: [
        /CONSUMO\s+FATURADO\D{0,25}([\d.]+(?:,\d+)?)/i,
        /Energia\s+Ativa\D{0,20}([\d.]+(?:,\d+)?)\s*kWh/i,
      ],
      valor: valorGenerico,
    };

  if (n.includes("energisa"))
    return {
      kwh: [
        /Consumo\s+do\s+[Mm][eê]s\D{0,20}([\d.]+(?:,\d+)?)/i,
        /CONSUMO\s+ATIVO\D{0,20}([\d.]+(?:,\d+)?)\s*kWh/i,
        /Energia\s+Ativa\D{0,20}([\d.]+(?:,\d+)?)\s*kWh/i,
      ],
      valor: [/Total\s+R\$\D{0,15}([\d.]{1,7}[.,]\d{2})/i, ...valorGenerico],
    };

  if (n.includes("equatorial") || n.includes("cemar") || n.includes("ceal") || n.includes("boa energia"))
    return {
      kwh: [
        /Energia\s+Consumida\D{0,20}([\d.]+(?:,\d+)?)/i,
        /ENERGIA\s+CONSUMIDA\D{0,20}([\d.]+(?:,\d+)?)/i,
        /Consumo\s+(?:de\s+)?Energia\D{0,20}([\d.]+(?:,\d+)?)\s*kWh/i,
      ],
      valor: valorGenerico,
    };

  if (n.includes("celesc"))
    return {
      kwh: [
        /Consumo\s+(?:de\s+)?[Ee]nergia\D{0,20}([\d.]+(?:,\d+)?)\s*kWh/i,
        /ENERGIA\s+ATIVA\D{0,20}([\d.]+(?:,\d+)?)\s*kWh/i,
      ],
      valor: valorGenerico,
    };

  if (n.includes("ceee"))
    return {
      kwh: [/Consumo\s+Ativo\D{0,20}([\d.]+(?:,\d+)?)\s*kWh/i],
      valor: valorGenerico,
    };

  if (n.includes("edp"))
    return {
      kwh: [
        /CONSUMO\s+FATURADO\D{0,25}([\d.]+(?:,\d+)?)/i,
        /Energia\s+El[eé]trica\D{0,20}([\d.]+(?:,\d+)?)\s*kWh/i,
      ],
      valor: valorGenerico,
    };

  if (n.includes("coelba") || n.includes("cosern") || n.includes("coelce") || n.includes("celpe"))
    return {
      kwh: [
        /CONSUMO\s+FATURADO\D{0,25}([\d.]+(?:,\d+)?)/i,
        /Energia\s+Ativa\D{0,20}([\d.]+(?:,\d+)?)\s*kWh/i,
      ],
      valor: valorGenerico,
    };

  return {}; // distribuidora não mapeada: usa só padrões genéricos
}

function parseFaturaText(text: string, distribuidoraNome = ""): Extracted {
  const t = text.replace(/[ \t]{2,}/g, " ");
  const dist = getDistConfig(distribuidoraNome);

  // UC — específicos da distribuidora primeiro, depois genéricos
  const uc = tryMatch(t, [
    ...(dist.uc ?? []),
    /[Nn][uú]mero\s+de\s+[Ii]nstala[cç][aã]o\D{0,10}(\d{5,12})/,
    /[Nn]o\.?\s+de\s+[Ii]nstala[cç][aã]o\D{0,10}(\d{5,12})/,
    /[Cc][oó]digo\s+de\s+[Ii]nstala[cç][aã]o\D{0,10}(\d{5,12})/,
    /[Ii]nstala[cç][aã]o\s*[:\-#N°]*\s*(\d{5,12})/,
    /\bUC\s*[:\-]?\s*(\d{5,12})/,
    /N[°º\.]\s*INSTALA[CÇ][AÃ]O\D{0,10}(\d{5,12})/i,
    /COD[.\s_-]*INST\D{0,10}(\d{5,12})/i,
    /UNIDADE\s+CONSUMIDORA\D{0,10}(\d{5,12})/i,
    /N[°º\.]\s*UC\D{0,10}(\d{5,12})/i,
    /INST[:\s]+(\d{10})/i,
    /C[oó]digo\s+da\s+[Uu]nidade\D{0,10}(\d{5,12})/,
    /[Nn][uú]mero\s+do\s+[Cc]ontrato\D{0,10}(\d{5,12})/,
    /\b(\d{10})\b/,
  ]);

  // kWh — específicos da distribuidora + genéricos + fallback de soma de faixas
  const consumoRaw = (() => {
    const labeled = tryMatch(t, [
      ...(dist.kwh ?? []),
      /[Cc]onsumo\s+[Ff]aturado\D{0,20}([\d.]+(?:,\d+)?)\s*[kK][wW][hH]?/,
      /[Cc]onsumo\s+[Tt]otal\D{0,20}([\d.]+(?:,\d+)?)\s*[kK][wW][hH]?/,
      /[Cc]onsumo\s+(?:de\s+)?[Ee]nergia\D{0,20}([\d.]+(?:,\d+)?)\s*[kK][wW][hH]/,
      /[Cc]onsumo\s+(?:no\s+)?[Mm][eê]s\D{0,20}([\d.]+(?:,\d+)?)/i,
      /ENERGIA\s+ATIVA\s+[kK][wW][hH]\s+([\d.]+(?:,\d+)?)/i,
    ]);
    if (labeled) return labeled;

    // Tabela histórico de consumo (Light e outras SAP): valor de 3+ dígitos antes de "dias"
    const tabela = tryMatch(t, [/CONSUMO\s*[\/\\]\s*kWh[\s\S]{0,500}?\b(\d{3,5})\s+\d{2}\b/i]);
    if (tabela) return tabela;

    // Soma de faixas tarifárias: "80 kWh" + "184 kWh" = 264
    const faixas = [...t.matchAll(/\b(\d{2,5})\s*[kK][wW][hH]/g)]
      .map(m => parseInt(m[1]))
      .filter(v => v >= 10 && v <= 9999);
    if (faixas.length >= 2) {
      const soma = faixas.reduce((a, b) => a + b, 0);
      if (soma >= 50 && soma <= 99999) return String(soma);
    }
    if (faixas.length === 1 && faixas[0] >= 50) return String(faixas[0]);
    return "";
  })();

  // Valor total — específicos da distribuidora + fallback por maior valor >= R$50
  const valorRaw = (() => {
    const labeled = tryMatch(t, [
      ...(dist.valor ?? []),
      /TOTAL\s+A\s+PAGAR\D{0,25}([\d.]{1,7}[.,]\d{2})/i,
      /VALOR\s+A\s+PAGAR\D{0,25}([\d.]{1,7}[.,]\d{2})/i,
      /VALOR\s+TOTAL\D{0,25}([\d.]{1,7}[.,]\d{2})/i,
      /VALOR\s+DA\s+FATURA\D{0,25}([\d.]{1,7}[.,]\d{2})/i,
    ]);
    if (labeled) {
      const v = parseValor(labeled);
      if (v && v >= 10) return labeled;
    }
    // Fallback: maior valor monetário no doc (>= R$50 para evitar taxas avulsas)
    const all = [...t.matchAll(/R\$\s*([\d.]{1,7}[.,]\d{2})/g)];
    const parsed = all
      .map(m => ({ raw: m[1], val: parseValor(m[1]) }))
      .filter(x => x.val !== null && x.val >= 50 && x.val <= 99999);
    if (!parsed.length) return "";
    return parsed.reduce((a, b) => (b.val! > a.val! ? b : a)).raw;
  })();

  // Classe — inclui "Res Baixa Renda" e variações
  const classeRaw = tryMatch(t, [
    /[Cc]lasse\s+(?:de\s+[Cc]onsumo\s*)?[:\-]?\s*(Residencial|Comercial|Rural|Industrial|Ilumina[cç][aã]o)/i,
    /CLASSE\s*[:\-]?\s*(RESIDENCIAL|COMERCIAL|RURAL|INDUSTRIAL)/i,
    /SUBGRUPO\s*[:\-]?\s*(B1|B2|B3|B4|A[1-4])/i,
    /\b(Res(?:idencial)?\s+Baixa\s+Renda)\b/i,
    /\b(Residencial|Comercial|Rural|Industrial)\b/,
  ]);
  // Normaliza: "Res Baixa Renda" → "Residencial"
  const classeNorm = classeRaw.replace(/^Res\b.*/i, "Residencial");
  const classe = classeNorm
    ? classeNorm.charAt(0).toUpperCase() + classeNorm.slice(1).toLowerCase()
    : "";

  // Nome do titular: com label explícito ou em CAIXA ALTA após categoria de consumo / antes de endereço
  const NOME_CAPS = /([A-ZÁÀÂÃÉÊÍÓÔÕÚÇÑ]{2,}(?:\s+[A-ZÁÀÂÃÉÊÍÓÔÕÚÇÑ]{2,}){1,5})/;
  const titular = tryMatch(t, [
    // Com label
    /[Nn]ome\s+do\s+[Cc]onsumidor\s*[:\-]?\s*([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][A-ZÁÀÂÃÉÊÍÓÔÕÚÇa-záàâãéêíóôõúç\s]{4,55}?)(?=\s{2,}|\n|[0-9]|R\.|AV\.)/,
    /[Cc]onsumidor\s*[:\-]?\s*([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][A-ZÁÀÂÃÉÊÍÓÔÕÚÇa-záàâãéêíóôõúç\s]{4,55}?)(?=\s{2,}|\n|[0-9]|R\.|AV\.)/,
    /[Cc]liente\s*[:\-]?\s*([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][A-ZÁÀÂÃÉÊÍÓÔÕÚÇa-záàâãéêíóôõúç\s]{4,55}?)(?=\s{2,}|\n|[0-9]|R\.|AV\.)/,
    /NOME\s*[:\-]?\s*([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][A-ZÁÀÂÃÉÊÍÓÔÕÚÇa-záàâãéêíóôõúç\s]{4,55}?)(?=\s{2,}|\n|[0-9]|R\.|AV\.)/,
    /TITULAR\s*[:\-]?\s*([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][A-ZÁÀÂÃÉÊÍÓÔÕÚÇa-záàâãéêíóôõúç\s]{4,55}?)(?=\s{2,}|\n|[0-9]|R\.|AV\.)/,
    // Nome em CAPS após categoria de consumo (ex: "Res Baixa Renda CALEBE GANJÃO GUILHERME R.FUAS...")
    new RegExp(`(?:Res(?:idencial)?(?:\\s+\\S+)*|Comercial|Rural|Industrial)\\s+${NOME_CAPS.source}`, "i"),
    // Nome em CAPS antes de endereço (R., AV., RUA, ESTRADA)
    new RegExp(`${NOME_CAPS.source}\\s+(?:R\\.|AV\\.|RUA |ESTRADA |AL\\.|PRACA )`),
    // Nome em CAPS antes de CPF
    new RegExp(`${NOME_CAPS.source}\\s+CPF`),
  ]);

  // Endereço: bloco entre nome/início e CEP
  const endereco = tryMatch(t, [
    // Endereço seguido de CEP
    /([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][A-ZÁÀÂÃÉÊÍÓÔÕÚÇa-záàâãéêíóôõúç0-9\s.,\/\-]{8,120}?)\s*CEP[\s:]*\d{5}/i,
    // Rua/Av seguida de número e bairro/cidade
    /((?:R\.|RUA |AV\.|AVENIDA |AL\.|ALAMEDA |EST\.|ESTRADA )[A-ZÁÀÂÃÉÊÍÓÔÕÚÇa-záàâãéêíóôõúç0-9\s.,\/\-]{8,100}?)(?=\s{2,}|\n|CEP|CPF)/i,
  ]);

  return {
    numero_uc: uc,
    consumo_kwh: consumoRaw ? parseValor(consumoRaw) : null,
    valor_conta: valorRaw ? parseValor(valorRaw) : null,
    classe_consumo: classe,
    nome_titular: titular,
    endereco_instalacao: endereco,
  };
}

// ─── Componente de upload de arquivo ─────────────────────────────────────────
function UploadBox({
  label, sublabel, accept, file, onChange, loading, extracted,
}: {
  label: string; sublabel?: string; accept: string;
  file: File | null; onChange: (f: File | null) => void;
  loading?: boolean; extracted?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      disabled={loading}
      className={`w-full flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3 text-left transition ${
        file
          ? "border-brand-blue/50 bg-brand-blue/5"
          : "border-gray-200 bg-white hover:border-brand-blue/40 hover:bg-gray-50"
      }`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 text-brand-blue shrink-0 animate-spin" />
      ) : file ? (
        <CheckCircle2 className="h-4 w-4 text-brand-blue shrink-0" />
      ) : (
        <Upload className="h-4 w-4 text-gray-400 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${file ? "text-brand-blue" : "text-gray-600"}`}>
          {loading ? "Lendo arquivo..." : file ? file.name : label}
        </p>
        {file && !loading && (
          <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
        )}
        {!file && sublabel && (
          <p className="text-xs text-gray-400">{sublabel}</p>
        )}
        {file && extracted && (
          <p className="text-xs text-green-600 font-medium">✓ Dados extraídos automaticamente</p>
        )}
      </div>
      {file && !loading && (
        <span
          role="button"
          onClick={(e) => { e.stopPropagation(); onChange(null); }}
          className="text-gray-300 hover:text-red-400 transition"
        >
          <X className="h-4 w-4" />
        </span>
      )}
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </button>
  );
}

// ─── Campo de formulário ──────────────────────────────────────────────────────
const INPUT = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition bg-white";

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">
        {required && <span className="text-brand-blue mr-0.5">*</span>}
        {label}
        {hint && <span className="ml-1 text-gray-400 font-normal">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Form = {
  nome: string;
  cpf_cnpj: string;
  email: string;
  telefone: string;
  distribuidora_id: string;
  distribuidora_nome: string;
  empresa_id: string;
  empresa_nome: string;
  codigo_embaixador: string;
  numero_uc: string;
  consumo_kwh: string;
  valor_conta: string;
  classe_consumo: string;
  nome_titular: string;
  endereco_instalacao: string;
};

const EMPTY_FORM: Form = {
  nome: "", cpf_cnpj: "", email: "", telefone: "",
  distribuidora_id: "", distribuidora_nome: "",
  empresa_id: "", empresa_nome: "",
  codigo_embaixador: "",
  numero_uc: "", consumo_kwh: "", valor_conta: "",
  classe_consumo: "", nome_titular: "", endereco_instalacao: "",
};

const CLASSES = ["Residencial", "Comercial", "Rural", "Industrial"];
const ACCEPT_IMG = "image/jpeg,image/png,image/webp,application/pdf";
const ACCEPT_PDF = "image/jpeg,image/png,image/webp,application/pdf";

// ─── Upload para Supabase Storage ─────────────────────────────────────────────
async function uploadFile(file: File, path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("documentos-adesao")
    .upload(path, file, { upsert: true, contentType: file.type });
  return error ? null : data.path;
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Aderir() {
  const [params] = useSearchParams();
  const [distribuidoras, setDistribuidoras] = useState<{ id: string; nome: string }[]>([]);

  const empresaId   = params.get("empresa_id")      ?? "";
  const empresaNome = params.get("empresa_nome")     ?? "";
  const distId      = params.get("distribuidora_id") ?? "";
  const distNome    = params.get("distribuidora_nome") ?? "";
  const cashbackPct = params.get("cashback")         ?? "";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<Form>({
    ...EMPTY_FORM,
    empresa_id: empresaId,
    empresa_nome: empresaNome,
    distribuidora_id: distId,
    distribuidora_nome: distNome,
  });

  const [faturaFile,    setFaturaFile]    = useState<File | null>(null);
  const [docFrenteFile, setDocFrenteFile] = useState<File | null>(null);
  const [docVersoFile,  setDocVersoFile]  = useState<File | null>(null);
  const [extracting,    setExtracting]    = useState(false);
  const [extracted,     setExtracted]     = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [aceite,        setAceite]        = useState(true);

  useEffect(() => {
    supabase.from("distribuidoras").select("id,nome").order("nome")
      .then(({ data }) => setDistribuidoras(data ?? []));
  }, []);

  const set = (field: keyof Form) => (value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  // ── Quando a fatura é selecionada ──
  const handleFatura = async (file: File | null) => {
    setFaturaFile(file);
    setExtracted(false);
    // Limpa campos extraídos ao trocar/remover arquivo para não misturar dados de faturas diferentes
    if (!file) {
      setForm((f) => ({
        ...f,
        numero_uc: "", consumo_kwh: "", valor_conta: "",
        classe_consumo: "", nome_titular: "", endereco_instalacao: "",
      }));
      return;
    }
    if (!file.name.toLowerCase().endsWith(".pdf")) return;
    setExtracting(true);
    try {
      const text = await extractTextFromPdf(file);
      const parsed = parseFaturaText(text, form.distribuidora_nome);
      setForm((f) => ({
        ...f,
        numero_uc:           parsed.numero_uc           || f.numero_uc,
        consumo_kwh:         parsed.consumo_kwh         != null ? String(parsed.consumo_kwh) : f.consumo_kwh,
        valor_conta:         parsed.valor_conta         != null ? String(parsed.valor_conta) : f.valor_conta,
        classe_consumo:      parsed.classe_consumo      || f.classe_consumo,
        nome_titular:        parsed.nome_titular        || f.nome_titular,
        endereco_instalacao: parsed.endereco_instalacao || f.endereco_instalacao,
      }));
      const anyExtracted = !!(parsed.numero_uc || parsed.consumo_kwh || parsed.valor_conta);
      setExtracted(anyExtracted);
      if (anyExtracted) toast.success("Dados extraídos da fatura. Confira e ajuste se necessário.");
      else toast.info("Não conseguimos ler os dados automaticamente. Preencha manualmente.");
    } catch {
      toast.info("Não foi possível ler o PDF. Preencha os dados manualmente.");
    } finally {
      setExtracting(false);
    }
  };

  // ── Validação por etapa ──
  const step1Valid =
    !!faturaFile &&
    !!form.numero_uc &&
    !!form.consumo_kwh &&
    !!form.valor_conta &&
    !!form.classe_consumo;

  const step2Valid =
    !!form.nome && !!form.cpf_cnpj && !!form.email && !!form.telefone &&
    !!form.distribuidora_id && !!docFrenteFile && !!docVersoFile && aceite;

  // ── Submit ──
  const handleSubmit = async () => {
    if (!step2Valid) return;
    setSubmitting(true);
    try {
      const ts = Date.now();
      const cpfClean = form.cpf_cnpj.replace(/\D/g, "").slice(0, 11);
      const folder = `${ts}_${cpfClean}`;

      // Comprime fotos do documento antes de enviar
      const [frenteCompressed, versoCompressed] = await Promise.all([
        docFrenteFile ? compressImage(docFrenteFile) : null,
        docVersoFile  ? compressImage(docVersoFile)  : null,
      ]);

      const ext = (f: File) => f.name.split(".").pop() ?? "jpg";

      const [faturaPath, frentePath, versoPath] = await Promise.all([
        faturaFile      ? uploadFile(faturaFile,      `${folder}/fatura.${ext(faturaFile)}`)       : Promise.resolve(null),
        frenteCompressed ? uploadFile(frenteCompressed, `${folder}/doc_frente.${ext(frenteCompressed)}`) : Promise.resolve(null),
        versoCompressed  ? uploadFile(versoCompressed,  `${folder}/doc_verso.${ext(versoCompressed)}`)  : Promise.resolve(null),
      ]);

      if (!faturaPath || !frentePath || !versoPath) {
        toast.error("Erro ao enviar arquivos. Tente novamente.");
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.from("cashback_cadastros" as any).insert({
        nome:              form.nome,
        cpf_cnpj:          form.cpf_cnpj,
        email:             form.email,
        telefone:          form.telefone,
        whatsapp:          form.telefone,
        distribuidora_id:  form.distribuidora_id || null,
        distribuidora_nome: form.distribuidora_nome || null,
        empresa_id:        form.empresa_id || null,
        empresa_nome:      form.empresa_nome || null,
        cashback_percentual: cashbackPct ? parseFloat(cashbackPct) : null,
        codigo_embaixador: form.codigo_embaixador || null,
        // Dados da fatura
        nome_titular:        form.nome_titular        || null,
        numero_uc:           form.numero_uc           || null,
        consumo_kwh:         form.consumo_kwh         ? parseFloat(form.consumo_kwh.replace(",", "."))  : null,
        valor_conta:         form.valor_conta         ? parseFloat(form.valor_conta.replace(",", "."))  : null,
        classe_consumo:      form.classe_consumo      || null,
        endereco_instalacao: form.endereco_instalacao || null,
        // Documentos
        fatura_url:        faturaPath,
        doc_frente_url:    frentePath,
        doc_verso_url:     versoPath,
        aceite_termos:     aceite,
        ciente_parcela_unica: true,
        autoriza_validacao: true,
        status: "pendente",
      } as any);

      if (error) throw error;
      setStep(3);
    } catch {
      toast.error("Erro ao enviar cadastro. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-brand-blue rounded-full flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" fill="white" />
            </div>
            <span className="text-sm font-bold text-brand-blue hidden sm:block">Poupe Energia</span>
          </Link>
          <div className="flex-1 text-center">
            <p className="text-sm font-semibold text-gray-700">
              Solicitação de Adesão
              {form.empresa_nome && (
                <span className="text-brand-blue"> — {form.empresa_nome}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-6 space-y-6">

        {/* Indicador de etapas */}
        {step < 3 && (
          <div className="flex items-center gap-2">
            {[
              { n: 1, label: "Fatura" },
              { n: 2, label: "Seus dados" },
            ].map(({ n, label }, i) => (
              <div key={n} className="flex items-center gap-2 flex-1">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition ${
                  step === n ? "bg-brand-blue text-white" : step > n ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  {step > n ? <CheckCircle2 className="h-4 w-4" /> : n}
                </div>
                <span className={`text-xs font-semibold ${step === n ? "text-brand-blue" : "text-gray-400"}`}>{label}</span>
                {i === 0 && <div className="flex-1 h-px bg-gray-200 mx-1" />}
              </div>
            ))}
          </div>
        )}

        {/* ═══ ETAPA 1 — Fatura de energia ════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Upload da fatura */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-brand-blue" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Fatura de energia</h2>
                  <p className="text-xs text-gray-500">Envie o PDF ou foto da sua fatura mais recente</p>
                </div>
              </div>

              <UploadBox
                label="Anexar fatura de energia"
                sublabel="PDF (preferencial) ou foto — até 20 MB"
                accept={ACCEPT_PDF}
                file={faturaFile}
                onChange={handleFatura}
                loading={extracting}
                extracted={extracted}
              />

              {extracted && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-700 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  Dados lidos automaticamente. Confira abaixo e corrija se necessário.
                </div>
              )}

              {faturaFile && !extracting && !extracted && faturaFile.name.toLowerCase().endsWith(".pdf") && (
                <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 text-xs text-yellow-700 font-medium">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  Não foi possível ler os dados. Preencha os campos abaixo manualmente.
                </div>
              )}

              {faturaFile && !extracting && !faturaFile.name.toLowerCase().endsWith(".pdf") && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-blue-700 font-medium">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  Imagem recebida. Preencha os campos abaixo com os dados da fatura.
                </div>
              )}
            </div>

            {/* Dados da fatura */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-gray-900">Dados da conta de energia</h2>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Field label="Número da instalação (UC)" required hint="está na fatura">
                    <input
                      type="text"
                      placeholder="Ex: 0123456789"
                      value={form.numero_uc}
                      onChange={(e) => set("numero_uc")(e.target.value)}
                      className={INPUT}
                    />
                  </Field>
                </div>

                <Field label="Consumo médio (kWh)" required>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ex: 320"
                    value={form.consumo_kwh}
                    onChange={(e) => set("consumo_kwh")(e.target.value)}
                    className={INPUT}
                  />
                </Field>

                <Field label="Valor médio (R$)" required>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ex: 250,00"
                    value={form.valor_conta}
                    onChange={(e) => set("valor_conta")(e.target.value)}
                    className={INPUT}
                  />
                </Field>

                <div className="col-span-2">
                  <Field label="Classe de consumo" required>
                    <select
                      value={form.classe_consumo}
                      onChange={(e) => set("classe_consumo")(e.target.value)}
                      className={INPUT}
                    >
                      <option value="">Selecione</option>
                      {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>

                <div className="col-span-2">
                  <Field label="Nome do titular na fatura" hint="pode ser diferente do solicitante">
                    <input
                      type="text"
                      placeholder="Nome completo como está na conta"
                      value={form.nome_titular}
                      onChange={(e) => set("nome_titular")(e.target.value)}
                      className={INPUT}
                    />
                  </Field>
                </div>

                <div className="col-span-2">
                  <Field label="Endereço da instalação" hint="opcional">
                    <input
                      type="text"
                      placeholder="Rua, número, bairro, cidade/UF"
                      value={form.endereco_instalacao}
                      onChange={(e) => set("endereco_instalacao")(e.target.value)}
                      className={INPUT}
                    />
                  </Field>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!step1Valid}
              className={`w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition ${
                step1Valid ? "bg-brand-blue hover:bg-brand-blue/90 shadow-md" : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Continuar <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ═══ ETAPA 2 — Dados pessoais + documentos ══════════════════════════ */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Dados pessoais */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-brand-blue" />
                </div>
                <h2 className="text-sm font-bold text-gray-900">Seus dados</h2>
              </div>

              <div className="space-y-3">
                <Field label="Nome completo" required>
                  <input type="text" placeholder="Seu nome completo"
                    value={form.nome} onChange={(e) => set("nome")(e.target.value)}
                    className={INPUT} />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="CPF" required>
                    <input type="text" placeholder="000.000.000-00"
                      value={form.cpf_cnpj} onChange={(e) => set("cpf_cnpj")(e.target.value)}
                      className={INPUT} />
                  </Field>
                  <Field label="WhatsApp" required>
                    <input type="tel" placeholder="(00) 00000-0000"
                      value={form.telefone} onChange={(e) => set("telefone")(e.target.value)}
                      className={INPUT} />
                  </Field>
                </div>

                <Field label="E-mail" required>
                  <input type="email" placeholder="seu@email.com"
                    value={form.email} onChange={(e) => set("email")(e.target.value)}
                    className={INPUT} />
                </Field>

                {/* Distribuidora — pré-selecionada ou manual */}
                <Field label="Distribuidora" required>
                  <select
                    value={form.distribuidora_id}
                    onChange={(e) => {
                      const d = distribuidoras.find((x) => x.id === e.target.value);
                      setForm((f) => ({ ...f, distribuidora_id: e.target.value, distribuidora_nome: d?.nome ?? "" }));
                    }}
                    className={INPUT}
                    disabled={distribuidoras.length === 0}
                  >
                    <option value="">
                      {distribuidoras.length === 0 ? "Carregando distribuidoras..." : "Selecione sua distribuidora"}
                    </option>
                    {distribuidoras.map((d) => (
                      <option key={d.id} value={d.id}>{d.nome}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Código do parceiro" hint="opcional">
                  <input type="text" placeholder="Código do parceiro, se tiver"
                    value={form.codigo_embaixador} onChange={(e) => set("codigo_embaixador")(e.target.value)}
                    className={INPUT} />
                </Field>
              </div>
            </div>

            {/* Documentos de identidade */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-brand-blue" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Documento com foto</h2>
                  <p className="text-xs text-gray-500">RG ou CNH (frente e verso)</p>
                </div>
              </div>

              <div className="space-y-3">
                <UploadBox
                  label="Frente do documento"
                  sublabel="Foto ou PDF do RG/CNH"
                  accept={ACCEPT_IMG}
                  file={docFrenteFile}
                  onChange={setDocFrenteFile}
                />
                <UploadBox
                  label="Verso do documento"
                  sublabel="Foto ou PDF do verso"
                  accept={ACCEPT_IMG}
                  file={docVersoFile}
                  onChange={setDocVersoFile}
                />
              </div>

              <p className="text-xs text-gray-400">
                📸 As imagens são comprimidas automaticamente para economizar espaço, mantendo qualidade de leitura.
              </p>
            </div>

            {/* Aceite */}
            <label className="flex items-start gap-3 cursor-pointer bg-white border border-gray-200 rounded-2xl p-4">
              <div
                onClick={() => setAceite((v) => !v)}
                className={`mt-0.5 h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition cursor-pointer ${
                  aceite ? "bg-brand-blue border-brand-blue" : "border-gray-300 bg-white"
                }`}
              >
                {aceite && (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-xs text-gray-600 leading-relaxed">
                Li e aceito os{" "}
                <Link to="/termos-cashback" className="text-brand-blue font-semibold underline" target="_blank">
                  Termos e Condições
                </Link>{" "}
                e autorizo o uso dos meus dados para processamento da adesão junto à comercializadora parceira.
              </span>
            </label>

            {/* Navegação */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                <ChevronLeft className="h-4 w-4" /> Voltar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!step2Valid || submitting}
                className={`flex-1 py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition ${
                  step2Valid && !submitting ? "bg-brand-blue hover:bg-brand-blue/90 shadow-md" : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4" /> Enviar solicitação</>
                )}
              </button>
            </div>

            <p className="text-center text-[10px] text-gray-400">
              🔒 Seus dados são protegidos com criptografia · LGPD
            </p>
          </div>
        )}

        {/* ═══ ETAPA 3 — Sucesso ══════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="flex flex-col items-center text-center px-4 py-12 space-y-5">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-2">Solicitação enviada!</h2>
              <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
                Recebemos seus dados e documentos. Nossa equipe vai analisar e entrar em contato pelo WhatsApp informado.
              </p>
            </div>
            {form.empresa_nome && (
              <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-2xl px-5 py-4 text-sm text-brand-blue font-medium">
                Empresa escolhida: <strong>{form.empresa_nome}</strong>
              </div>
            )}
            <Link
              to="/ranking"
              className="text-sm text-gray-500 underline hover:text-gray-700 transition"
            >
              Voltar ao ranking de empresas
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
