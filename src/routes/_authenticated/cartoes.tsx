import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Nfc, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNfc } from "@/lib/useNfc";
import { BotaoPrincipal, Campo, Cartao, Selecao, TituloPagina, Vazio } from "@/components/prof";

export const Route = createFileRoute("/_authenticated/cartoes")({
  head: () => ({
    meta: [
      { title: "Cartões NFC — Banco Escolar NFC" },
      { name: "description", content: "Vincule, troque e bloqueie os cartões NFC dos alunos." },
      { property: "og:title", content: "Cartões NFC — Banco Escolar NFC" },
      { property: "og:description", content: "Vinculação de cartões NFC aos alunos." },
    ],
  }),
  component: Cartoes,
});

function Cartoes() {
  const qc = useQueryClient();
  const [alunoId, setAlunoId] = useState("");
  const [uid, setUid] = useState("");

  const { status, erro, iniciar, suportado } = useNfc((lido) => {
    setUid(lido);
    toast.success(`Cartão lido: ${lido}`);
  });

  const { data: alunos } = useQuery({
    queryKey: ["alunos-cartoes"],
    queryFn: async () =>
      (await supabase.from("alunos").select("id, nome").order("nome")).data ?? [],
  });

  const { data: cartoes } = useQuery({
    queryKey: ["cartoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cartoes_nfc")
        .select("id, nfc_uid, status, data_vinculacao, aluno_id, alunos(nome)")
        .order("data_vinculacao", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const vincular = useMutation({
    mutationFn: async () => {
      if (!alunoId) throw new Error("Selecione o aluno");
      if (!uid.trim()) throw new Error("Leia ou digite o NFC ID");
      const codigo = uid.trim().toUpperCase();
      // Um aluno tem apenas um cartão ativo: o saldo e o histórico ficam no aluno.
      await supabase.from("cartoes_nfc").delete().eq("aluno_id", alunoId);
      const { error } = await supabase.from("cartoes_nfc").insert({ aluno_id: alunoId, nfc_uid: codigo });
      if (error) throw error;
      await supabase.from("auditoria").insert({
        aluno_id: alunoId,
        operacao: "Vinculação de cartão NFC",
        valor_novo: codigo,
        motivo: "Cadastro/troca de cartão",
      });
    },
    onSuccess: () => {
      toast.success("Cartão vinculado.");
      setUid("");
      qc.invalidateQueries({ queryKey: ["cartoes"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao vincular."),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cartoes_nfc").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Cartão removido. O saldo continua com o aluno.");
      qc.invalidateQueries({ queryKey: ["cartoes"] });
    },
  });

  return (
    <div>
      <TituloPagina
        titulo="Cartões NFC"
        descricao="O cartão é apenas identificador. Saldo e histórico ficam sempre com o aluno."
      />

      <Cartao className="mb-4">
        <div className="space-y-3">
          <Selecao label="Aluno" value={alunoId} onChange={(e) => setAlunoId(e.target.value)}>
            <option value="">Selecione o aluno</option>
            {(alunos ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </Selecao>

          <div className="rounded-2xl border border-accent/40 bg-accent/10 p-4 text-center">
            <Nfc className="mx-auto size-8 text-accent" />
            <p className="mt-2 text-sm font-semibold">Aproxime o cartão NFC</p>
            {suportado ? (
              <button
                onClick={iniciar}
                className="mt-3 h-11 w-full rounded-xl border border-accent/60 font-semibold text-accent"
              >
                {status === "lendo" ? "Leitura ativa..." : "Ativar leitura"}
              </button>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                NFC indisponível neste navegador. Digite o NFC ID manualmente.
              </p>
            )}
            {erro && <p className="mt-2 text-xs text-warning">{erro}</p>}
          </div>

          <Campo label="NFC ID" value={uid} onChange={(e) => setUid(e.target.value)} placeholder="Ex.: 04A2B3C4" />
          <BotaoPrincipal disabled={vincular.isPending} onClick={() => vincular.mutate()}>
            VINCULAR CARTÃO
          </BotaoPrincipal>
        </div>
      </Cartao>

      <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
        Cartões vinculados
      </h2>
      <div className="space-y-3">
        {(cartoes ?? []).length === 0 && <Vazio texto="Nenhum cartão vinculado ainda." />}
        {(cartoes ?? []).map((c) => (
          <div key={c.id} className="surface-card flex items-center justify-between p-4">
            <div>
              <p className="font-semibold">{c.alunos?.nome ?? "Aluno"}</p>
              <p className="text-xs text-muted-foreground">NFC ID: {c.nfc_uid}</p>
              <p className="mt-1 text-xs font-semibold text-primary">🟢 Vinculado</p>
            </div>
            <button
              onClick={() => remover.mutate(c.id)}
              className="rounded-xl border border-border p-2.5 text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
