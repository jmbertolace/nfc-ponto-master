import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Archive, Pencil, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BotaoPrincipal, Campo, Cartao, TituloPagina, Vazio } from "@/components/prof";

export const Route = createFileRoute("/_authenticated/turmas")({
  head: () => ({
    meta: [
      { title: "Turmas — Banco Escolar NFC" },
      { name: "description", content: "Cadastre, edite e arquive as turmas da escola." },
      { property: "og:title", content: "Turmas — Banco Escolar NFC" },
      { property: "og:description", content: "Gestão de turmas do banco de pontos pedagógicos." },
    ],
  }),
  component: Turmas,
});

function Turmas() {
  const qc = useQueryClient();
  const [form, setForm] = useState<{ id?: string; nome: string; ano: string } | null>(null);

  const { data: turmas } = useQuery({
    queryKey: ["turmas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("turmas")
        .select("id, nome, ano, status, alunos(count)")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const salvar = useMutation({
    mutationFn: async (valores: { id?: string; nome: string; ano: string }) => {
      if (!valores.nome.trim()) throw new Error("Informe o nome da turma");
      if (valores.id) {
        const { error } = await supabase
          .from("turmas")
          .update({ nome: valores.nome, ano: valores.ano })
          .eq("id", valores.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("turmas").insert({ nome: valores.nome, ano: valores.ano });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Turma salva.");
      setForm(null);
      qc.invalidateQueries({ queryKey: ["turmas"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao salvar."),
  });

  const arquivar = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("turmas")
        .update({ status: status === "ativa" ? "arquivada" : "ativa" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["turmas"] }),
  });

  return (
    <div>
      <TituloPagina titulo="Turmas" descricao="Crie e organize as turmas do colégio." />

      {form ? (
        <Cartao className="mb-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold">{form.id ? "Editar turma" : "Nova turma"}</p>
            <button onClick={() => setForm(null)}>
              <X className="size-5 text-muted-foreground" />
            </button>
          </div>
          <div className="space-y-3">
            <Campo
              label="Nome da turma"
              value={form.nome}
              placeholder="Ex.: 2º Ano Ensino Médio"
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
            <Campo
              label="Ano / etapa"
              value={form.ano}
              placeholder="Ex.: Médio"
              onChange={(e) => setForm({ ...form, ano: e.target.value })}
            />
            <BotaoPrincipal disabled={salvar.isPending} onClick={() => salvar.mutate(form)}>
              SALVAR TURMA
            </BotaoPrincipal>
          </div>
        </Cartao>
      ) : (
        <button
          onClick={() => setForm({ nome: "", ano: "" })}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-4 font-semibold text-accent"
        >
          <Plus className="size-5" /> Nova turma
        </button>
      )}

      <div className="space-y-3">
        {(turmas ?? []).length === 0 && <Vazio texto="Nenhuma turma cadastrada." />}
        {(turmas ?? []).map((t) => (
          <div key={t.id} className="surface-card flex items-center justify-between p-4">
            <div>
              <p className="font-semibold">{t.nome}</p>
              <p className="text-xs text-muted-foreground">
                {t.ano ?? "—"} • {t.alunos?.[0]?.count ?? 0} aluno(s)
                {t.status !== "ativa" && " • arquivada"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setForm({ id: t.id, nome: t.nome, ano: t.ano ?? "" })}
                className="rounded-xl border border-border p-2.5"
              >
                <Pencil className="size-4" />
              </button>
              <button
                onClick={() => arquivar.mutate({ id: t.id, status: t.status })}
                className="rounded-xl border border-border p-2.5 text-muted-foreground"
              >
                <Archive className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
