import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export default function AdminAuth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [celular, setCelular] = useState("");
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        const { data: role } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.session.user.id)
          .eq("role", "admin")
          .maybeSingle();
        if (role) navigate("/admin", { replace: true });
      }
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!role) {
        await supabase.auth.signOut();
        throw new Error("Acesso não autorizado. Aguarde a aprovação do administrador.");
      }
      navigate("/admin", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) { toast.error("Informe seu nome completo"); return; }
    if (!celular.trim()) { toast.error("Informe seu celular"); return; }
    setLoading(true);
    try {
      // 1. Cria conta no Supabase Auth
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error("Erro ao criar conta");

      // 2. Registra solicitação de acesso (fica pendente até aprovação)
      const { error: reqErr } = await supabase.from("admin_requests").insert({
        user_id: data.user.id,
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        celular: celular.trim(),
        status: "pendente",
      });
      if (reqErr) throw reqErr;

      // 3. Faz logout imediato — não deixa entrar sem aprovação
      await supabase.auth.signOut();
      setRequested(true);
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar solicitação");
    } finally {
      setLoading(false);
    }
  };

  // Tela de sucesso após solicitar acesso
  if (requested) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-10 pb-8 space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-brand-blue">Solicitação enviada!</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sua solicitação de acesso foi recebida. O administrador irá
              analisar e liberar o acesso em breve.
            </p>
            <p className="text-xs text-muted-foreground">
              Assim que aprovado, você poderá fazer login com o e-mail{" "}
              <strong>{email}</strong>.
            </p>
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => { setRequested(false); setMode("login"); }}
            >
              Voltar ao login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{mode === "login" ? "Acesso Admin" : "Solicitar Acesso"}</CardTitle>
          {mode === "signup" && (
            <p className="text-sm text-muted-foreground mt-1">
              Preencha seus dados. O acesso será liberado pelo administrador.
            </p>
          )}
        </CardHeader>
        <CardContent>
          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <Button type="submit" className="w-full bg-brand-yellow hover:bg-brand-yellow/90 text-brand-blue font-bold" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
              <button type="button" onClick={() => setMode("signup")}
                className="text-sm text-muted-foreground hover:text-foreground w-full text-center">
                Não tem acesso? Solicitar
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo *</Label>
                <Input id="nome" type="text" value={nome}
                  onChange={(e) => setNome(e.target.value)} required placeholder="Seu nome completo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-sig">E-mail *</Label>
                <Input id="email-sig" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="celular">Celular *</Label>
                <Input id="celular" type="tel" value={celular}
                  onChange={(e) => setCelular(e.target.value)} required placeholder="(00) 00000-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-sig">Senha *</Label>
                <Input id="password-sig" type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)} required minLength={6}
                  placeholder="Mínimo 6 caracteres" />
              </div>
              <Button type="submit" className="w-full bg-brand-yellow hover:bg-brand-yellow/90 text-brand-blue font-bold" disabled={loading}>
                {loading ? "Enviando..." : "Solicitar acesso"}
              </Button>
              <button type="button" onClick={() => setMode("login")}
                className="text-sm text-muted-foreground hover:text-foreground w-full text-center">
                Já tem acesso? Entrar
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
