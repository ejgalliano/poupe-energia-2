import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const BackToTop = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <Button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Voltar ao topo"
      className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-brand-blue text-white hover:bg-brand-blue/90 shadow-lg p-0"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
};

export default BackToTop;
