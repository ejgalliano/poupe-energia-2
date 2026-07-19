# SEO — Preparação para indexação orgânica — 19/07/2026

Status: **implementado**, commit `bf9c500`.

## Achado crítico (não esperado)

Durante a auditoria, foi descoberto que **`react-helmet-async` nunca funcionou neste app**.
Título, descrição e canonical por página nunca eram commitados no `document.head` em
produção — toda página do site sempre mostrava o título genérico da home
("Poupe Energia - Comparador e Ranking...") pro Google e pra qualquer preview de link
compartilhado, apesar do código já usar `<SEO title=... />` em mais de 12 páginas.

Bug reproduzido de forma isolada: mesmo um `<Helmet><title>TESTE</title></Helmet>` renderizado
direto (sem nenhum código da aplicação envolvido) nunca chegava a alterar `document.title`.
A causa raiz exata na lib não foi identificada com certeza (a cadeia interna
`Context.Consumer` → `HelmetDispatcher.emitChange()` nunca era executada, sem lançar erro
visível). Em vez de continuar investigando uma dependência de terceiros como caixa-preta,
`src/components/SEO.tsx` foi reescrito para manipular `document.head` diretamente via
`useEffect` — sem depender de nenhuma lib. `react-helmet-async` foi removido do
`package.json`.

**Verificado ao vivo:** título, `<meta description>` e `<link canonical>` agora atualizam
corretamente tanto em reload completo quanto em navegação client-side (SPA), em várias
páginas testadas (Dúvidas Frequentes, Sobre, Fit Energia).

## O que foi implementado

1. **`sitemap.xml`** — `scripts/generate-sitemap.mjs`, roda via hook `postbuild` (dispara
   sozinho a cada deploy na Vercel). Consulta a tabela `empresas` (`ativa = true`) via
   Supabase com a mesma chave pública (anon) que o site já usa no navegador, gera um slug
   por empresa replicando a função `slugify()` de `src/lib/slug.ts`, e monta uma URL por
   rota estática pública + uma por empresa. Hoje: 119 URLs (22 estáticas + 97 empresas).
2. **`robots.txt`** — agora referencia `Sitemap: https://poupeenergia.com.br/sitemap.xml` e
   bloqueia `/admin/` (evita gastar orçamento de rastreamento em páginas administrativas).
3. **Favicon** — apontava pra uma URL do Supabase Storage (uma foto jpeg); corrigido pros
   arquivos `favicon.svg`/`favicon.ico` que já existiam em `public/` sem uso.
4. **Imagem de Open Graph/Twitter** — trocada da URL antiga de preview da plataforma
   Lovable (onde o site foi originalmente criado) pra `https://poupeenergia.com.br/logo-dark.png`,
   imagem do domínio próprio.
5. **Canonical automático** — `SEO.tsx` agora usa `window.location.origin + pathname`
   (sem query string) como canonical padrão quando nenhum é passado explicitamente. Resolve
   o risco de conteúdo duplicado nas páginas de empresa (`/empresa/slug?estado=X&distribuidora=Y`),
   que antes não tinham canonical nenhum.
6. **Dados estruturados (JSON-LD)** — `Organization` sitewide (estático no `index.html`,
   nome legal + CNPJ) e `FAQPage` na página de Dúvidas Frequentes (16 perguntas, geradas a
   partir do array `faqs` que já existia no código — sem duplicar conteúdo).

## O que ficou de fora (decisão consciente)

- **SSR/pré-renderização.** O site é 100% renderizado no client (SPA Vite). O Google
  consegue indexar mesmo assim (executa JavaScript), mas com atraso; crawlers que não
  executam JS (alguns bots, certos previews de link) veem só o HTML genérico do
  `index.html`. Não implementado agora por ser uma mudança arquitetural maior — migrar pra
  um framework com SSR (Next.js) ou adicionar prerendering (Puppeteer/vite-plugin-ssg) —
  que merece uma decisão própria do sócio, não algo pra resolver sozinho dentro de um
  "fazer tudo" genérico.

## Passo a passo manual — só o usuário consegue fazer

### 1. Google Search Console
1. Acesse [search.google.com/search-console](https://search.google.com/search-console).
2. Adicione a propriedade `poupeenergia.com.br` (recomendado: verificação por registro DNS
   TXT, cobre `www` e sem-`www` de uma vez — o provedor de domínio explica como adicionar).
3. Depois de verificado, vá em **Sitemaps** (menu lateral) e envie:
   `https://poupeenergia.com.br/sitemap.xml`
4. Acompanhe em **Páginas** quantas URLs foram indexadas nos próximos dias/semanas.

### 2. Google Analytics (GA4)
1. Acesse [analytics.google.com](https://analytics.google.com) e crie uma propriedade GA4
   para `poupeenergia.com.br`.
2. Copie o **Measurement ID** (formato `G-XXXXXXXXXX`).
3. Me passe esse ID — eu insiro o código de tracking no site (não fiz isso ainda porque
   ainda não existe conta/ID criado).

### 3. Bing Webmaster Tools (opcional)
1. Acesse [bing.com/webmasters](https://www.bing.com/webmasters).
2. Pode importar a propriedade direto do Google Search Console (depois do passo 1), é o
   caminho mais rápido.

Depois desses 3 passos, a base técnica + o cadastro nas ferramentas de busca estará
completa. A partir daí é esperar o Google rastrear e indexar (pode levar de alguns dias a
poucas semanas).
