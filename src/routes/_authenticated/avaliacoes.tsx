import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatNota } from "@/lib/pontos";
import {
  AreaTexto,
  BotaoPrincipal,
  Campo,
  Cartao,
  Selecao,
  TituloPagina,
  Vazio,
} from "@/components/prof";

export const Route = createFileRoute("/_authenticated/avaliacoes")({
  head: () => ({
    meta: [
      { title: "Avaliações — Banco Escolar NFC" },
      { name: "description", content: "Cadastre avaliações por turma e lance as notas dos alunos." },
      { property: "og:title", content: "Avaliações — Banco Escolar NFC" },
      { property: "og:description", content: "Módulo de avaliações e notas." },
    ],
  }),
  component: Avaliacoes,
});

function Avaliacoes() {
  const qc = useQueryClient();
  const [novo, setNovo] = useState(false);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [form, setForm] = useState({
    turma_id: "",
    nome: "",
    disciplina: "",
    data: "",
    valor_maximo: "10",
    descricao: "",
  });

  const { data: turmas } = useQuery({
    queryKey: ["turmas-simples"],
    queryFn: async () => (await supabase.from("turmas").select("id, nome").order("nome")).data ?? [],
  });

  const { data: avaliacoes } = useQuery({
    queryKey: ["avaliacoes"],
    queryFn: async () =>
      (
        await supabase
          .from("avaliacoes")
          .select("id, nome, disciplina, data, valor_maximo, turma_id, turmas(nome)")
          .order("created_at", { ascending: false })
      ).data ?? [],
  });

  const avaliacao = avaliacoes?.find((a) => a.id === selecionada);

  const { data: linhas } = useQuery({
    queryKey: ["notas", selecionada, avaliacao?.turma_id],
    enabled: !!selecionada,
    queryFn: async () => {
      const alunos =
        (
          await supabase
            .from("alunos")
            .select("id, nome")
            .eq("turma_id", avaliacao?.turma_id ?? "")
            .order("nome")
        ).data ?? [];
      const notas =
        (await supabase.from("notas_avaliacoes").select("id, aluno_id, nota").eq("avaliacao_id", selecionada!))
          .data ?? [];
      return alunos.map((a) => ({ aluno: a, nota: notas.find((n) => n.aluno_id === a.id)?.nota ?? null }));
    },
  });

  const criar = useMutation({
    mutationFn: async () => {
      if (!form.nome.trim()) throw new Error("Informe o nome da avaliação");
      const { error } = await supabase.from("avaliacoes").insert({
        turma_id: form.turma_id || null,
        nome: form.nome,
        disciplina: form.disciplina || null,
        data: form.data || null,
        valor_maximo: Number(form.valor_maximo || 10),
        descricao: form.descricao || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Avaliação cadastrada.");
      setNovo(false);
      qc.invalidateQueries({ queryKey: ["avaliacoes"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao salvar."),
  });

  const salvarNota = useMutation({
    mutationFn: async (v: { alunoId: string; nota: string }) => {
      const { error } = await supabase.from("notas_avaliacoes").upsert(
        {
          avaliacao_id: selecionada!,
          aluno_id: v.alunoId,
          nota: v.nota === "" ? null : Number(v.nota),
        },
        { onConflict: "avaliacao_id,aluno_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Nota salva.");
      qc.invalidateQueries({ queryKey: ["notas"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao salvar nota."),
  });

  return (
    <div>
      <TituloPagina titulo="Avaliações" descricao="Provas e trabalhos avaliativos com nota por aluno." />

      {novo ? (
        <Cartao className="mb-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold">Nova avaliação</p>
            <button onClick={() => setNovo(false)}>
              <X className="size-5 text-muted-foreground" />
            </button>
          </div>
          <div className="space-y-3">
            <Campo label="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            <Campo
              label="Disciplina"
              value={form.disciplina}
              onChange={(e) => setForm({ ...form, disciplina: e.target.value })}
            />
            <Selecao label="Turma" value={form.turma_id} onChange={(e) => setForm({ ...form, turma_id: e.target.value })}>
              <option value="">Selecione</option>
              {(turmas ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </Selecao>
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Data" type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
              <Campo
                label="Valor máximo"
                inputMode="decimal"
                value={form.valor_maximo}
                onChange={(e) => setForm({ ...form, valor_maximo: e.target.value })}
              />
            </div>
            <AreaTexto
              label="Descrição"
              rows={2}
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
            <BotaoPrincipal disabled={criar.isPending} onClick={() => criar.mutate()}>
              SALVAR AVALIAÇÃO
            </BotaoPrincipal>
          </div>
        </Cartao>
      ) : (
        <button
          onClick={() => setNovo(true)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-4 font-semibold text-accent"
        >
          <Plus className="size-5" /> Nova avaliação
        </button>
      )}

      <div className="space-y-3">
        {(avaliacoes ?? []).length === 0 && <Vazio texto="Nenhuma avaliação cadastrada." />}
        {(avaliacoes ?? []).map((a) => (
          <div key={a.id} className="surface-card p-4">
            <button className="w-full text-left" onClick={() => setSelecionada(selecionada === a.id ? null : a.id)}>
              <p className="font-semibold">{a.nome}</p>
              <p className="text-xs text-muted-foreground">
                {a.turmas?.nome ?? "Sem turma"} • {a.disciplina ?? "—"} • {a.data ?? "—"} • valor{" "}
                {formatNota(Number(a.valor_maximo))}
              </p>
            </button>

            {selecionada === a.id && (
              <div className="mt-4 space-y-3 border-t border-border pt-4">
                {(linhas ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum aluno nesta turma.</p>
                )}
                {(linhas ?? []).map(({ aluno, nota }) => (
                  <LinhaNota
                    key={aluno.id}
                    nome={aluno.nome}
                    nota={nota === null ? "" : String(nota)}
                    onSalvar={(valor) => salvarNota.mutate({ alunoId: aluno.id, nota: valor })}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function LinhaNota({
  nome,
  nota,
  onSalvar,
}: {
  nome: string;
  nota: string;
  onSalvar: (nota: string) => void;
}) {
  const [n, setN] = useState(nota);
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border p-3">
      <p className="flex-1 truncate text-sm font-semibold">{nome}</p>
      <input
        value={n}
        onChange={(e) => setN(e.target.value)}
        inputMode="decimal"
        placeholder="Nota"
        className="h-10 w-20 rounded-lg border border-input bg-background px-2 text-sm"
      />
      <button
        onClick={() => onSalvar(n)}
        className="h-10 rounded-lg bg-accent px-3 text-sm font-semibold text-accent-foreground"
      >
        Salvar
      </button>
    </div>
  );
}
