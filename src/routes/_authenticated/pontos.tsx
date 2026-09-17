import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatPontos, TIPOS_DESCONTO, TIPOS_LANCAMENTO } from "@/lib/pontos";
import {
  AreaTexto,
  BotaoPrincipal,
  BotaoSecundario,
  Campo,
  Cartao,
  Selecao,
  TituloPagina,
} from "@/components/prof";

export const Route = createFileRoute("/_authenticated/pontos")({
  head: () => ({
    meta: [
      { title: "Pontos P$ — Banco Escolar NFC" },
      { name: "description", content: "Lance, desconte e transfira pontos pedagógicos P$ entre alunos." },
      { property: "og:title", content: "Pontos P$ — Banco Escolar NFC" },
      { property: "og:description", content: "Operações de pontos pedagógicos do professor." },
    ],
  }),
  component: Pontos,
});

type Operacao = "lancar" | "descontar" | "transferir";

function Pontos() {
  const qc = useQueryClient();
  const [op, setOp] = useState<Operacao>("lancar");
  const [aluno, setAluno] = useState("");
  const [destino, setDestino] = useState("");
  const [tipo, setTipo] = useState<string>(TIPOS_LANCAMENTO[0]);
  const [valor, setValor] = useState("");
  const [motivo, setMotivo] = useState("");
  const [confirmando, setConfirmando] = useState(false);

  const { data: alunos } = useQuery({
    queryKey: ["alunos-pontos"],
    queryFn: async () =>
      (await supabase.from("alunos").select("id, nome, saldo_pontos, status").order("nome")).data ?? [],
  });

  const nomeDe = (id: string) => alunos?.find((a) => a.id === id)?.nome ?? "—";
  const saldoDe = (id: string) => alunos?.find((a) => a.id === id)?.saldo_pontos ?? 0;
  const numero = Math.trunc(Number(valor || 0));

  const executar = useMutation({
    mutationFn: async () => {
      if (!aluno) throw new Error("Selecione o aluno");
      if (numero <= 0) throw new Error("Informe um valor maior que zero");
      if (op === "transferir") {
        if (!destino) throw new Error("Selecione o aluno de destino");
        const { error } = await supabase.rpc("transferir_pontos", {
          _origem: aluno,
          _destino: destino,
          _valor: numero,
          _motivo: motivo || "",
        });
        if (error) throw error;
        return;
      }
      const { error } = await supabase.rpc("registrar_transacao", {
        _aluno_id: aluno,
        _tipo: tipo,
        _valor: op === "lancar" ? numero : -numero,
        _motivo: motivo || "",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Operação registrada.");
      setValor("");
      setMotivo("");
      setConfirmando(false);
      qc.invalidateQueries();
    },
    onError: (e) => {
      setConfirmando(false);
      toast.error(e instanceof Error ? e.message : "Não foi possível concluir.");
    },
  });

  const tipos = op === "descontar" ? TIPOS_DESCONTO : TIPOS_LANCAMENTO;

  return (
    <div>
      <TituloPagina titulo="Pontos P$" descricao="P$ = Pontos pedagógicos. Nenhum valor é dinheiro real." />

      <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl bg-muted p-1">
        {(["lancar", "descontar", "transferir"] as const).map((o) => (
          <button
            key={o}
            onClick={() => {
              setOp(o);
              setTipo(o === "descontar" ? TIPOS_DESCONTO[0] : TIPOS_LANCAMENTO[0]);
              setConfirmando(false);
            }}
            className={`rounded-lg py-2 text-sm font-semibold capitalize ${
              op === o ? "bg-card text-foreground" : "text-muted-foreground"
            }`}
          >
            {o === "lancar" ? "Lançar" : o === "descontar" ? "Descontar" : "Transferir"}
          </button>
        ))}
      </div>

      <Cartao>
        <div className="space-y-3">
          <Selecao
            label={op === "transferir" ? "Aluno de origem" : "Aluno"}
            value={aluno}
            onChange={(e) => setAluno(e.target.value)}
          >
            <option value="">Selecione</option>
            {(alunos ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome} — {formatPontos(a.saldo_pontos)}
              </option>
            ))}
          </Selecao>

          {op === "transferir" && (
            <Selecao label="Aluno de destino" value={destino} onChange={(e) => setDestino(e.target.value)}>
              <option value="">Selecione</option>
              {(alunos ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome} — {formatPontos(a.saldo_pontos)}
                </option>
              ))}
            </Selecao>
          )}

          {op !== "transferir" && (
            <Selecao label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              {tipos.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Selecao>
          )}

          <Campo
            label="Valor em P$"
            inputMode="numeric"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="Ex.: 100"
          />
          <AreaTexto
            label="Descrição / motivo"
            rows={2}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ex.: Atividade concluída"
          />

          {!confirmando ? (
            <BotaoPrincipal onClick={() => setConfirmando(true)}>CONFIRMAR LANÇAMENTO</BotaoPrincipal>
          ) : (
            <div className="rounded-2xl border border-accent/40 bg-accent/10 p-4">
              <p className="text-sm">
                <span className="text-muted-foreground">Aluno:</span> {nomeDe(aluno)}
              </p>
              {op === "transferir" && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Destino:</span> {nomeDe(destino)}
                </p>
              )}
              <p className="mt-2 font-display text-2xl font-bold text-primary">
                {op === "descontar" ? "−" : "+"} {formatPontos(numero)}
              </p>
              {op === "transferir" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {nomeDe(aluno)}: {formatPontos(saldoDe(aluno))} → {formatPontos(saldoDe(aluno) - numero)} •{" "}
                  {nomeDe(destino)}: {formatPontos(saldoDe(destino))} → {formatPontos(saldoDe(destino) + numero)}
                </p>
              )}
              <p className="mt-2 text-sm text-muted-foreground">Motivo: {motivo || "—"}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <BotaoSecundario onClick={() => setConfirmando(false)}>CANCELAR</BotaoSecundario>
                <BotaoPrincipal disabled={executar.isPending} onClick={() => executar.mutate()}>
                  CONFIRMAR
                </BotaoPrincipal>
              </div>
            </div>
          )}
        </div>
      </Cartao>
    </div>
  );
}
