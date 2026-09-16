import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDataHora, formatPontos, formatPontosAssinado } from "@/lib/pontos";
import { TituloPagina, Vazio } from "@/components/prof";

export const Route = createFileRoute("/_authenticated/historico")({
  head: () => ({
    meta: [
      { title: "Histórico e Auditoria — Banco Escolar NFC" },
      { name: "description", content: "Todas as movimentações de P$ e o registro de auditoria das operações." },
      { property: "og:title", content: "Histórico e Auditoria — Banco Escolar NFC" },
      { property: "og:description", content: "Registro completo de movimentações e auditoria." },
    ],
  }),
  component: Historico,
});

function Historico() {
  const [aba, setAba] = useState<"movimentacoes" | "auditoria">("movimentacoes");

  const { data: transacoes } = useQuery({
    queryKey: ["historico"],
    queryFn: async () =>
      (
        await supabase
          .from("transacoes")
          .select("*, alunos(nome)")
          .order("data_hora", { ascending: false })
          .limit(200)
      ).data ?? [],
  });

  const { data: auditoria } = useQuery({
    queryKey: ["auditoria"],
    queryFn: async () =>
      (
        await supabase
          .from("auditoria")
          .select("*, alunos:aluno_id(nome)")
          .order("data_hora", { ascending: false })
          .limit(200)
      ).data ?? [],
  });

  return (
    <div>
      <TituloPagina titulo="Histórico" descricao="Toda alteração de P$ fica registrada e não pode ser apagada." />

      <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
        {(["movimentacoes", "auditoria"] as const).map((a) => (
          <button
            key={a}
            onClick={() => setAba(a)}
            className={`rounded-lg py-2 text-sm font-semibold capitalize ${
              aba === a ? "bg-card text-foreground" : "text-muted-foreground"
            }`}
          >
            {a === "movimentacoes" ? "Movimentações" : "Auditoria"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {aba === "movimentacoes" &&
          ((transacoes ?? []).length === 0 ? (
            <Vazio texto="Nenhuma movimentação registrada." />
          ) : (
            (transacoes ?? []).map((t) => (
              <div key={t.id} className="surface-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{t.alunos?.nome ?? "Aluno"}</p>
                    <p className="text-xs text-muted-foreground">{formatDataHora(t.data_hora)}</p>
                  </div>
                  <p
                    className={`font-display text-lg font-bold ${
                      t.valor >= 0 ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {formatPontosAssinado(t.valor)}
                  </p>
                </div>
                <p className="mt-1 text-sm">{t.tipo}</p>
                {t.motivo && <p className="text-sm text-muted-foreground">{t.motivo}</p>}
                <p className="mt-2 text-xs text-muted-foreground">
                  Saldo anterior: {formatPontos(t.saldo_anterior)} • Saldo atual:{" "}
                  {formatPontos(t.saldo_posterior)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Responsável: {t.usuario_nome ?? "Professor"} • Transação: {t.id.slice(0, 8)}
                </p>
              </div>
            ))
          ))}

        {aba === "auditoria" &&
          ((auditoria ?? []).length === 0 ? (
            <Vazio texto="Nenhum registro de auditoria." />
          ) : (
            (auditoria ?? []).map((a) => (
              <div key={a.id} className="surface-card p-4">
                <p className="font-semibold">{a.operacao}</p>
                <p className="text-xs text-muted-foreground">{formatDataHora(a.data_hora)}</p>
                <p className="mt-1 text-sm">
                  Aluno: {a.alunos?.nome ?? "—"} • De {a.valor_anterior ?? "—"} para {a.valor_novo ?? "—"}
                </p>
                {a.motivo && <p className="text-sm text-muted-foreground">{a.motivo}</p>}
                <p className="text-xs text-muted-foreground">
                  Responsável: {a.usuario_nome ?? "Professor"}
                </p>
              </div>
            ))
          ))}
      </div>
    </div>
  );
}
