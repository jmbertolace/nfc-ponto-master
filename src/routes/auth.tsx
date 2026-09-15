import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Marca } from "@/components/Marca";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso do Professor — Banco Escolar NFC" },
      {
        name: "description",
        content: "Área protegida do professor para cadastrar alunos, turmas, cartões NFC e lançar pontos P$.",
      },
      { property: "og:title", content: "Acesso do Professor — Banco Escolar NFC" },
      { property: "og:description", content: "Entrada segura do painel administrativo do professor." },
    ],
  }),
  component: AcessoProfessor,
});

function AcessoProfessor() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/painel", replace: true });
    });
  }, [navigate]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    try {
      if (modo === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        navigate({ to: "/painel", replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { emailRedirectTo: window.location.origin, data: { nome } },
        });
        if (error) throw error;
        if (data.session) {
          navigate({ to: "/painel", replace: true });
        } else {
          toast.success("Conta criada. Confirme o e-mail para entrar.");
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setCarregando(false);
    }
  }

  async function entrarComGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Não foi possível entrar com o Google.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/painel", replace: true });
  }

  return (
    <main className="grid-math flex min-h-screen flex-col px-5 py-6">
      <header className="mx-auto flex w-full max-w-md items-center justify-between">
        <Link to="/" className="rounded-xl border border-border bg-card p-2.5">
          <ArrowLeft className="size-5" />
        </Link>
        <Marca compacto />
      </header>

      <section className="mx-auto mt-10 w-full max-w-md">
        <div className="surface-card p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-6 text-accent" />
            <h1 className="font-display text-xl font-bold">ACESSO DO PROFESSOR</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Área administrativa. Alunos usam apenas a consulta pelo cartão.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
            {(["entrar", "criar"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setModo(m)}
                className={`rounded-lg py-2 text-sm font-semibold ${
                  modo === m ? "bg-card text-foreground" : "text-muted-foreground"
                }`}
              >
                {m === "entrar" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          <form onSubmit={enviar} className="mt-5 space-y-3">
            {modo === "criar" && (
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome (ex.: Prof. Jober)"
                className="h-13 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-accent"
              />
            )}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
              className="h-13 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-accent"
            />
            <input
              type="password"
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Senha"
              className="h-13 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={carregando}
              className="brand-gradient flex h-14 w-full items-center justify-center rounded-2xl font-display text-base font-bold text-primary-foreground disabled:opacity-60"
            >
              {carregando ? <Loader2 className="size-5 animate-spin" /> : modo === "entrar" ? "ENTRAR" : "CRIAR CONTA"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
          </div>

          <button
            onClick={entrarComGoogle}
            className="h-13 w-full rounded-xl border border-border bg-card py-3 font-semibold"
          >
            Continuar com Google
          </button>
        </div>
      </section>
    </main>
  );
}
