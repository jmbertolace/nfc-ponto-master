import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Home, Users, CreditCard, BookOpen, LayoutGrid, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Marca } from "@/components/Marca";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: LayoutProfessor,
});

const NAV = [
  { to: "/painel", label: "Início", icone: Home },
  { to: "/alunos", label: "Alunos", icone: Users },
  { to: "/cartoes", label: "NFC", icone: CreditCard },
  { to: "/atividades", label: "Atividades", icone: BookOpen },
  { to: "/mais", label: "Mais", icone: LayoutGrid },
] as const;

function LayoutProfessor() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 px-5 py-3 backdrop-blur">
        <Marca compacto />
        <button
          onClick={sair}
          className="rounded-xl border border-border bg-card p-2.5 text-muted-foreground"
          aria-label="Sair"
        >
          <LogOut className="size-5" />
        </button>
      </header>

      <main className="mx-auto w-full max-w-md px-5 py-5">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-stretch justify-between px-2 py-2">
          {NAV.map(({ to, label, icone: Icone }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold text-muted-foreground"
              activeProps={{ className: "text-primary" }}
            >
              <Icone className="size-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
