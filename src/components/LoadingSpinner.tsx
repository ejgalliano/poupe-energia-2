import { Loader2 } from "lucide-react";

interface Props {
  label?: string;
}

const LoadingSpinner = ({ label = "Carregando..." }: Props) => (
  <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
    <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
    <span className="text-sm font-semibold">{label}</span>
  </div>
);

export default LoadingSpinner;
