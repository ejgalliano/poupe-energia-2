import { useEffect } from "react";

interface Props {
  title: string;
  description?: string;
  canonical?: string;
  /** Dado estruturado schema.org (ex: FAQPage, Product) - vira um <script type="application/ld+json"> */
  jsonLd?: Record<string, unknown>;
}

const JSONLD_ID = "seo-jsonld";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Define title/description/canonical/OG por pagina direto no document.head.
 * Nao usa react-helmet-async: em testes essa lib nao estava commitando
 * nenhuma mudanca no head neste app (bug reproduzido isolado, sem causa
 * raiz identificada) - toda pagina sempre mostrava so o titulo generico
 * do index.html. Manipulacao direta via useEffect e simples e verificavel.
 */
const SEO = ({ title, description, canonical, jsonLd }: Props) => {
  useEffect(() => {
    document.title = title;

    const resolvedCanonical = canonical ?? window.location.origin + window.location.pathname;
    upsertLink("canonical", resolvedCanonical);
    upsertMeta("property", "og:url", resolvedCanonical);

    upsertMeta("property", "og:title", title);
    if (description) {
      upsertMeta("name", "description", description);
      upsertMeta("property", "og:description", description);
    }

    const existingScript = document.getElementById(JSONLD_ID) as HTMLScriptElement | null;
    if (jsonLd) {
      const script = existingScript ?? document.createElement("script");
      script.id = JSONLD_ID;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLd);
      if (!existingScript) document.head.appendChild(script);
    } else if (existingScript) {
      existingScript.remove();
    }
  }, [title, description, canonical, jsonLd]);

  return null;
};

export default SEO;
