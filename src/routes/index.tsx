import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, ShieldCheck, Nfc, Sparkles } from "lucide-react";
import { Marca, SeloPontos } from "@/components/Marca";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Banco Escolar NFC — Prof. Jober | Terminal de pontos P$" },
      {
        name: "description",
        content:
          "Aproxime o cartão NFC e consulte seu saldo em P$, histórico, atividades e avaliações. Ferramenta pedagógica, sem dinheiro real.",
      },
      { property: "og:title", content: "Banco Escolar NFC — Prof. Jober" },
      {
        property: "og:description",
        content: "Terminal de consulta por cartão NFC com pontos pedagógicos em P$.",
      },
    ],
  }),
  component: Inicio,
});

function Inicio() {
  return (
    <main className="grid-math flex min-h-screen flex-col items-center justify-between px-5 py-8">
      <header className="flex w-full max-w-md items-center justify-between">
        <Marca />
      </header>

      <section className="w-full max-w-md">
        <div className="surface-card nfc-glow relative overflow-hidden px-6 py-10 text-center">
          <div className="relative mx-auto flex size-40 items-center justify-center">
            <span className="nfc-wave absolute size-32 rounded-full border-2 border-accent" />
            <span className="nfc-wave nfc-wave-2 absolute size-32 rounded-full border-2 border-accent" />
            <span className="nfc-wave nfc-wave-3 absolute size-32 rounded-full border-2 border-accent" />
            <div className="brand-gradient relative flex size-24 items-center justify-center rounded-3xl">
              <Nfc className="size-12 text-primary-foreground" />
            </div>
          </div>

          <h1 className="mt-8 font-display text-2xl font-bold">💳 APROXIME SEU CARTÃO</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Identificação por cartão NFC. O saldo fica sempre no sistema, nunca no cartão.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            <span className="size-2 animate-pulse rounded-full bg-primary" />
            NFC ATIVO
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Link
            to="/leitor"
            className="brand-gradient flex h-16 w-full items-center justify-center gap-3 rounded-2xl font-display text-lg font-bold text-primary-foreground transition-transform active:scale-[0.98]"
          >
            <CreditCard className="size-6" />
            CONSULTAR CARTÃO
          </Link>
          <Link
            to="/auth"
            className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card font-display text-lg font-bold text-foreground transition-transform active:scale-[0.98]"
          >
            <ShieldCheck className="size-6 text-accent" />
            ACESSO DO PROFESSOR
          </Link>
        </div>
      </section>

      <footer className="flex w-full max-w-md flex-col items-center gap-3 pt-8 text-center">
        <SeloPontos />
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="size-3.5" /> Gamificação pedagógica em sala de aula
        </p>
      </footer>
    </main>
  );
}
