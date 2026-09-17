import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatNota, formatPontos } from "@/lib/pontos";
import { Cartao, TituloPagina, Vazio } from "@/components/prof";

export const Route = createFileRoute("/_authenticated/desempenho")({
  head: () => ({
    meta: [
      { title: "Desempenho — Banco Escolar NFC" },
      { name: "description", content: "Médias das avaliações, entregas de atividades e pontos por turma." },
      { property: "og:title", content: "Desempenho — Banco Escolar NFC" },
      { property: "og:description", content: "Panorama de desempenho das turmas e alunos." },
    ],
  }),
  component: Desempenho,
});

function Desempenho() {
  const { data } = useQuery({
    queryKey: ["desempenho"],
    queryFn: async () => {
      const [turmas, alunos, notas, entregas] = await Promise.all([
        supabase.from("turmas").select("id, nome").order("nome"),
        supabase.from("alunos").select("id, nome, turma_id, saldo_pontos"),
        supabase.from("notas_avaliacoes").select("aluno_id, nota"),
        supabase.from("entregas_atividades").select("aluno_id, status"),
      ]);
      return {
        turmas: turmas.data ?? [],
        alunos: alunos.data ?? [],
        notas: notas.data ?? [],
        entregas: entregas.data ?? [],
      };
    },
  });

  if (!data) return null;
  if (data.turmas.length === 0) return <Vazio texto="Cadastre turmas para ver o desempenho." />;

  return (
    <div>
      <TituloPagina titulo="Desempenho" descricao="Pontos, médias e entregas por turma." />
      <div className="space-y-3">
        {data.turmas.map((t) => {
          const alunos = data.alunos.filter((a) => a.turma_id === t.id);
          const ids = new Set(alunos.map((a) => a.id));
          const notas = data.notas.filter((n) => ids.has(n.aluno_id) && n.nota !== null);
          const media =
            notas.length > 0 ? notas.reduce((s, n) => s + Number(n.nota), 0) / notas.length : null;
          const entregas = data.entregas.filter((e) => ids.has(e.aluno_id));
          const entregues = entregas.filter((e) => e.status.startsWith("entregue")).length;
          const total = alunos.reduce((s, a) => s + a.saldo_pontos, 0);

          return (
            <Cartao key={t.id}>
              <p className="font-display text-base font-bold">{t.nome}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <Linha titulo="Alunos" valor={String(alunos.length)} />
                <Linha titulo="Total em P$" valor={formatPontos(total)} />
                <Linha titulo="Média das avaliações" valor={formatNota(media)} />
                <Linha titulo="Atividades entregues" valor={`${entregues}/${entregas.length}`} />
              </div>
            </Cartao>
          );
        })}
      </div>
    </div>
  );
}

function Linha({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-xs text-muted-foreground">{titulo}</p>
      <p className="mt-1 font-display text-lg font-bold">{valor}</p>
    </div>
  );
}
