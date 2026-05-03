import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Captura ?emb=CODIGO em qualquer rota e persiste em sessionStorage. */
const EmbCapture = () => {
  const loc = useLocation();
  useEffect(() => {
    try {
      const sp = new URLSearchParams(loc.search);
      const code = sp.get("emb");
      if (code && code.trim()) {
        sessionStorage.setItem("emb_codigo", code.trim());
      }
    } catch {}
  }, [loc.search]);
  return null;
};

export default EmbCapture;
