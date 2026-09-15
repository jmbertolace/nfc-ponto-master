import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  CreditCard,
  LineChart,
  ScrollText,
  Loader2,
} from "lucide-react";
import { consultarAluno, type DadosAluno } from "@/lib/consulta.functions";
import { formatDataHora, formatNota, formatPontos, formatPontosAssinado } from "@/lib/pontos";
import { Marca, SeloPontos } from "@/components/Marca";

export const Route = createFileRoute("/consulta/$alunoId")({
  head: () => ({
    meta: [
      { title: "Consulta do aluno — Banco Escolar NFC" },
      {
        name: "description",
        content: "Consulta somente leitura: saldo em P$, histórico, atividades, avaliações e desempenho.",
      },
      { property: "og:title", content: "Consulta do aluno — Banco Escolar NFC" },
      { property: "og:description", content: "Saldo em P$ e desempenho do aluno identificado pelo cartão." },
    ],
  }),
  component: ConsultaAluno,
});

type Aba = "saldo" | "historico" | "atividades" | "avaliacoes" | "desempenho";

const ABAS: { id: Aba; label: string; icone: typeof CreditCard }[] = [
  { id: "saldo", label: "Meu saldo", icone: CreditCard },
  { id: "historico", label: "Meu histórico", icone: ScrollText },
  { id: "atividades", label: "Minhas atividades", icone: BookOpen },
  { id: "avaliacoes", label: "Minhas avaliações", icone: ClipboardList },
  { id: "desempenho", label: "Meu desempenho", icone: LineChart },
];

function ConsultaAluno() {
  const { alunoId } = Route.useParams();
  const buscar = useServerFn(consultarAluno);
  const [aba, setAba] = useState<Aba>("saldo");

  const { data, isLoading } = useQuery({
    queryKey: ["consulta", alunoId],
    queryFn: () => buscar({ data: { alunoId } }),
  });

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-accent" />
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-display text-lg font-bold">Aluno não encontrado</p>
        <Link to="/leitor" className="rounded-xl bg-accent px-5 py-3 text-accent-foreground">
          Voltar ao leitor
        </Link>
      </main>
    );
  }

  const d: DadosAluno = data;
  const entregues = d.atividades.filter((a) => a.status.startsWith("entregue")).length;
  const pendentes = d.atividades.filter((a) => a.status === "pendente").length;

  return (
    <main className="grid-math min-h-screen px-5 pb-24 pt-6">
      <header className="mx-auto flex w-full max-w-md items-center justify-between">
        <Link to="/leitor" className="rounded-xl border border-border bg-card p-2.5">
          <ArrowLeft className="size-5" />
        </Link>
        <Marca compacto />
      </header>

      <section className="mx-auto mt-6 w-full max-w-md">
        <div className="surface-card p-6">
          <p className="font-display text-2xl font-bold uppercase">{d.aluno.nome}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {d.aluno.turma ?? "Sem turma"}
            {d.aluno.numero ? ` • Nº ${d.aluno.numero}` : ""}
          </p>
          <div className="mt-5 rounded-2xl border border-primary/30 bg-primary/10 p-5 text-center">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary">SALDO ATUAL</p>
            <p className="mt-1 font-display text-4xl font-bold text-primary">
              {formatPontos(d.aluno.saldo)}
            </p>
          </div>
          {d.aluno.status !== "ativo" && (
            <p className="mt-3 text-center text-sm text-warning">Cadastro bloqueado pelo professor.</p>
          )}
        </div>

        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {ABAS.map(({ id, label, icone: Icone }) => (
            <button
              key={id}
              onClick={() => setAba(id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                aba === id
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              <Icone className="size-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-4 space-y-3">
          {aba === "saldo" && (
            <div className="surface-card p-5">
              <p className="text-sm text-muted-foreground">
                Seu saldo é calculado pelo sistema a partir de todos os lançamentos do professor. O
                cartão NFC guarda apenas o identificador.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Indicador titulo="Movimentações" valor={String(d.movimentos.length)} />
                <Indicador titulo="Saldo" valor={formatPontos(d.aluno.saldo)} />
              </div>
            </div>
          )}

          {aba === "historico" &&
            (d.movimentos.length === 0 ? (
              <Vazio texto="Nenhuma movimentação registrada." />
            ) : (
              d.movimentos.map((m) => (
                <div key={m.id} className="surface-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{m.tipo}</p>
                      <p className="text-xs text-muted-foreground">{formatDataHora(m.data_hora)}</p>
                    </div>
                    <p
                      className={`font-display text-lg font-bold ${
                        m.valor >= 0 ? "text-primary" : "text-destructive"
                      }`}
                    >
                      {formatPontosAssinado(m.valor)}
                    </p>
                  </div>
                  {m.motivo && <p className="mt-2 text-sm text-muted-foreground">{m.motivo}</p>}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Saldo anterior: {formatPontos(m.saldo_anterior)} • Saldo atual:{" "}
                    {formatPontos(m.saldo_posterior)}
                  </p>
                  {m.usuario_nome && (
                    <p className="text-xs text-muted-foreground">Responsável: {m.usuario_nome}</p>
                  )}
                </div>
              ))
            ))}

          {aba === "atividades" &&
            (d.atividades.length === 0 ? (
              <Vazio texto="Nenhuma atividade lançada para você ainda." />
            ) : (
              d.atividades.map((a) => (
                <div key={a.id} className="surface-card flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold">{a.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.disciplina ?? "—"} {a.prazo ? `• prazo ${a.prazo}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold capitalize text-accent">{a.status}</p>
                    <p className="text-xs text-muted-foreground">Nota: {formatNota(a.nota)}</p>
                  </div>
                </div>
              ))
            ))}

          {aba === "avaliacoes" &&
            (d.avaliacoes.length === 0 ? (
              <Vazio texto="Nenhuma avaliação lançada ainda." />
            ) : (
              d.avaliacoes.map((a) => (
                <div key={a.id} className="surface-card flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold">{a.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.disciplina ?? "—"} {a.data ? `• ${a.data}` : ""}
                    </p>
                  </div>
                  <p className="font-display text-xl font-bold text-primary">
                    {formatNota(a.nota)}
                    <span className="text-xs text-muted-foreground"> / {formatNota(a.valor_maximo)}</span>
                  </p>
                </div>
              ))
            ))}

          {aba === "desempenho" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Indicador titulo="P$ atuais" valor={formatPontos(d.aluno.saldo)} />
                <Indicador titulo="Média" valor={formatNota(d.media)} />
                <Indicador titulo="Entregues" valor={String(entregues)} />
                <Indicador titulo="Pendentes" valor={String(pendentes)} />
              </div>
              <EvolucaoSaldo movimentos={d.movimentos} />
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <SeloPontos />
        </div>
      </section>
    </main>
  );
}

function Indicador({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="surface-card p-4">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground">{titulo}</p>
      <p className="mt-1 font-display text-xl font-bold">{valor}</p>
    </div>
  );
}

function Vazio({ texto }: { texto: string }) {
  return (
    <div className="surface-card p-6 text-center text-sm text-muted-foreground">{texto}</div>
  );
}

function EvolucaoSaldo({ movimentos }: { movimentos: DadosAluno["movimentos"] }) {
  const pontos = [...movimentos].reverse().slice(-12);
  if (pontos.length < 2) {
    return <Vazio texto="O gráfico aparece após algumas movimentações." />;
  }
  const max = Math.max(...pontos.map((p) => p.saldo_posterior), 1);
  return (
    <div className="surface-card p-5">
      <p className="text-sm font-semibold">Evolução do saldo</p>
      <div className="mt-4 flex h-32 items-end gap-1.5">
        {pontos.map((p) => (
          <div
            key={p.id}
            title={formatPontos(p.saldo_posterior)}
            className="brand-gradient w-full rounded-t-md"
            style={{ height: `${Math.max(6, (p.saldo_posterior / max) * 100)}%` }}
          />
        ))}
      </div>
    </div>
  );
}
