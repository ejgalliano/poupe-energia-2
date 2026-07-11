import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";

export default function AlterarSenha() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAtual, setShowAtual] = useState(false);
  const [showNova, setShowNova] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const senhasCoincide = novaSenha && confirmar && novaSenha === confirmar;
  const senhaForte = novaSenha.length >= 8;
  const podeEnviar = senhaAtual && senhasCoincide && senhaForte;

  const handleSubmit = async () => {
    if (!podeEnviar) return;
    setLoading(true);

    try {
      // Verifica senha atual re-autenticando
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.email) throw new Error("Usuário não encontrado");

      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: senhaAtual,
      });
      if (signInErr) {
        toast.error("Senha atual incorreta. Verifique e tente novamente.");
        setLoading(false);
        return;
      }

      // Atualiza para a nova senha
      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) throw error;

      setSucesso(true);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmar("");
      toast.success("Senha alterada com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao alterar senha: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h1 className="text-2xl font-bold">Alterar Senha</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Confirme sua senha atual antes de definir uma nova.
        </p>
      </div>

      {sucesso && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-800 text-sm">
          <ShieldCheck className="h-5 w-5 shrink-0" />
          <div>
            <strong>Senha alterada!</strong> Use a nova senha no próximo login.
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4" />
            Redefinir senha
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Senha atual */}
          <div className="space-y-1">
            <Label htmlFor="atual">Senha atual</Label>
            <div className="relative">
              <Input
                id="atual"
                type={showAtual ? "text" : "password"}
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                placeholder="••••••••"
                className="pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowAtual(!showAtual)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showAtual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            {/* Nova senha */}
            <div className="space-y-1">
              <Label htmlFor="nova">Nova senha</Label>
              <div className="relative">
                <Input
                  id="nova"
                  type={showNova ? "text" : "password"}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNova(!showNova)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNova ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {novaSenha && !senhaForte && (
                <p className="text-xs text-red-500">Mínimo de 8 caracteres</p>
              )}
              {novaSenha && senhaForte && (
                <p className="text-xs text-green-600">Comprimento OK</p>
              )}
            </div>

            {/* Confirmar nova senha */}
            <div className="space-y-1">
              <Label htmlFor="confirmar">Confirmar nova senha</Label>
              <div className="relative">
                <Input
                  id="confirmar"
                  type={showConfirmar ? "text" : "password"}
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  placeholder="••••••••"
                  className={`pr-10 ${confirmar && !senhasCoincide ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmar(!showConfirmar)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmar && !senhasCoincide && (
                <p className="text-xs text-red-500">As senhas não coincidem</p>
              )}
              {senhasCoincide && (
                <p className="text-xs text-green-600">Senhas coincidem</p>
              )}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading || !podeEnviar}
            className="w-full bg-brand-blue hover:bg-brand-blue/90 font-semibold"
          >
            {loading ? "Alterando..." : "Alterar senha"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
