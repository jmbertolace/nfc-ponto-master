import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  School,
  CreditCard,
  Coins,
  BookOpen,
  ClipboardList,
  LineChart,
  ScrollText,
  Settings,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPontos } from "@/lib/pontos";
import { Cartao, TituloPagina, Vazio } from "@/components/prof";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Painel do Professor — Banco Escolar NFC" },
      { name: "description", content: "Visão geral de alunos, turmas, pontos P$ e transações." },
      { property: "og:title", content: "Painel do Professor — Banco Escolar NFC" },
      { property: "og:description", content: "Dashboard do banco de pontos pedagógicos." },
    ],
  }),
  component: Painel,
});

const CARDS = [
  { to: "/alunos", label: "Alunos", icone: Users },
  { to: "/turmas", label: "Turmas", icone: School },
  { to: "/cartoes", label: "Cartões NFC", icone: CreditCard },
  { to: "/pontos", label: "Pontos P$", icone: Coins },
  { to: "/atividades", label: "Atividades", icone: BookOpen },
  { to: "/avaliacoes", label: "Avaliações", icone: ClipboardList },
  { to: "/desempenho", label: "Desempenho", icone: LineChart },
  { to: "/historico", label: "Histórico", icone: ScrollText },
  { to: "/configuracoes", label: "Configurações", icone: Settings },
] as const;

function Painel() {
  const { data } = useQuery({
    queryKey: ["painel"],
    queryFn: async () => {
      const [alunos, turmas, transacoes, atividades, avaliacoes] = await Promise.all([
        supabase.from("alunos").select("id, nome, saldo_pontos, turma_id"),
        supabase.from("turmas").select("id, nome"),
        supabase.from("transacoes").select("id, valor, data_hora").order("data_hora", { ascending: false }),
        supabase.from("atividades").select("id"),
        supabase.from("avaliacoes").select("id"),
      ]);
      const distribuidos = (transacoes.data ?? [])
        .filter((t) => t.valor > 0)
        .reduce((s, t) => s + t.valor, 0);
      return {
        alunos: alunos.data ?? [],
        turmas: turmas.data ?? [],
        transacoes: transacoes.data ?? [],
        distribuidos,
        atividades: atividades.data?.length ?? 0,
        avaliacoes: avaliacoes.data?.length ?? 0,
      };
    },
  });

  const topAlunos = [...(data?.alunos ?? [])]
    .sort((a, b) => b.saldo_pontos - a.saldo_pontos)
    .slice(0, 5);
  const maxSaldo = Math.max(...topAlunos.map((a) => a.saldo_pontos), 1);

  return (
    <div>
      <TituloPagina titulo="Painel do Professor" descricao="Banco de pontos pedagógicos em P$." />

      <div className="grid grid-cols-2 gap-3">
        <Indicador titulo="Alunos" valor={String(data?.alunos.length ?? 0)} />
        <Indicador titulo="Turmas" valor={String(data?.turmas.length ?? 0)} />
        <Indicador titulo="P$ distribuídos" valor={formatPontos(data?.distribuidos ?? 0)} />
        <Indicador titulo="Transações" valor={String(data?.transacoes.length ?? 0)} />
        <Indicador titulo="Atividades" valor={String(data?.atividades ?? 0)} />
        <Indicador titulo="Avaliações" valor={String(data?.avaliacoes ?? 0)} />
      </div>

      <h2 className="mb-3 mt-6 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
        Distribuição de pontos
      </h2>
      {topAlunos.length === 0 ? (
        <Vazio texto="Cadastre alunos e faça lançamentos para ver os gráficos." />
      ) : (
        <Cartao>
          <div className="space-y-3">
            {topAlunos.map((a) => (
              <div key={a.id}>
                <div className="flex justify-between text-sm">
                  <span className="truncate">{a.nome}</span>
                  <span className="font-semibold text-primary">{formatPontos(a.saldo_pontos)}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-muted">
                  <div
                    className="brand-gradient h-2 rounded-full"
                    style={{ width: `${Math.max(4, (a.saldo_pontos / maxSaldo) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Cartao>
      )}

      <h2 className="mb-3 mt-6 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
        Módulos
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {CARDS.map(({ to, label, icone: Icone }) => (
          <Link
            key={to}
            to={to}
            className="surface-card flex flex-col items-center gap-2 p-4 text-center text-xs font-semibold"
          >
            <Icone className="size-6 text-accent" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Indicador({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="surface-card p-4">
      <p className="text-xs font-semibold text-muted-foreground">{titulo}</p>
      <p className="mt-1 font-display text-lg font-bold">{valor}</p>
    </div>
  );
}
