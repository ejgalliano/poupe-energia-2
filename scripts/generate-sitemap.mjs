// Gera public/sitemap.xml a partir das rotas estaticas + uma entrada por empresa ativa.
// Roda com: node scripts/generate-sitemap.mjs
// Precisa do .env local (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY) - mesma
// chave publica (anon) que o site ja usa no navegador, sem risco de expor nada sensivel.

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SITE_URL = "https://poupeenergia.com.br";

function loadEnv() {
  // Na Vercel as variaveis ja vem prontas em process.env (nao ha .env no build).
  // Localmente, le o .env do projeto.
  if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    return process.env;
  }
  const raw = readFileSync(path.join(ROOT, ".env"), "utf-8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^"(.*)"$/, "$1");
  }
  return env;
}

const slugify = (s) =>
  s
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const STATIC_ROUTES = [
  ["/", "1.0"],
  ["/ranking", "0.9"],
  ["/como-funciona", "0.7"],
  ["/programa-de-parceiros", "0.6"],
  ["/como-calculamos", "0.6"],
  ["/sobre", "0.5"],
  ["/ativar-cashback", "0.7"],
  ["/analisar-fatura", "0.6"],
  ["/duvidas-frequentes", "0.5"],
  ["/contestacao", "0.4"],
  ["/diretrizes-metodologicas", "0.3"],
  ["/gd-livre-empresas", "0.6"],
  ["/energia-por-assinatura", "0.6"],
  ["/mercado-livre-de-energia", "0.6"],
  ["/usinas-de-investimento", "0.6"],
  ["/cogeracao", "0.6"],
  ["/bess", "0.6"],
  ["/eletropostos", "0.6"],
  ["/placas-solares", "0.6"],
  ["/politica-de-privacidade", "0.2"],
  ["/termos-de-uso", "0.2"],
  ["/termos-cashback", "0.2"],
];

async function main() {
  const env = loadEnv();
  const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);

  const { data: empresas, error } = await supabase
    .from("empresas")
    .select("nome")
    .eq("ativa", true);

  if (error) {
    console.error("Erro ao buscar empresas:", error.message);
    process.exit(1);
  }

  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    ...STATIC_ROUTES.map(([route, priority]) => ({ loc: `${SITE_URL}${route}`, priority })),
    ...(empresas ?? [])
      .map((e) => slugify(e.nome))
      .filter(Boolean)
      .sort()
      .map((slug) => ({ loc: `${SITE_URL}/empresa/${slug}`, priority: "0.5" })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

  writeFileSync(path.join(ROOT, "public", "sitemap.xml"), xml);
  // No build da Vercel (postbuild), a pasta dist/ ja existe com o copia de public/
  // feita no INICIO do build - precisa sobrescrever ali tambem pra ir pro deploy.
  const distDir = path.join(ROOT, "dist");
  if (existsSync(distDir)) {
    writeFileSync(path.join(distDir, "sitemap.xml"), xml);
  }
  console.log(`sitemap.xml gerado com ${urls.length} URLs (${empresas?.length ?? 0} empresas ativas).`);
}

main();
