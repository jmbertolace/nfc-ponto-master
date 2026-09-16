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

export const Route = createFileRoute("/_authenticated/atividades")({
  head: () => ({
    meta: [
      { title: "Atividades — Banco Escolar NFC" },
      { name: "description", content: "Cadastre atividades por turma e acompanhe entregas e notas." },
      { property: "og:title", content: "Atividades — Banco Escolar NFC" },
      { property: "og:description", content: "Módulo de atividades do banco escolar de pontos." },
    ],
  }),
  component: Atividades,
});

const STATUS = ["pendente", "entregue", "não entregue", "entregue atrasado"];

function Atividades() {
  const qc = useQueryClient();
  const [novo, setNovo] = useState(false);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [form, setForm] = useState({
    turma_id: "",
    nome: "",
    disciplina: "",
    data: "",
    prazo: "",
    valor: "0",
    descricao: "",
  });

  const { data: turmas } = useQuery({
    queryKey: ["turmas-simples"],
    queryFn: async () => (await supabase.from("turmas").select("id, nome").order("nome")).data ?? [],
  });

  const { data: atividades } = useQuery({
    queryKey: ["atividades"],
    queryFn: async () =>
      (
        await supabase
          .from("atividades")
          .select("id, nome, disciplina, data, prazo, valor, status, turma_id, turmas(nome)")
          .order("created_at", { ascending: false })
      ).data ?? [],
  });

  const atividade = atividades?.find((a) => a.id === selecionada);

  const { data: entregas } = useQuery({
    queryKey: ["entregas", selecionada, atividade?.turma_id],
    enabled: !!selecionada,
    queryFn: async () => {
      const alunos =
        (
          await supabase
            .from("alunos")
            .select("id, nome")
            .eq("turma_id", atividade?.turma_id ?? "")
            .order("nome")
        ).data ?? [];
      const registros =
        (
          await supabase
            .from("entregas_atividades")
            .select("id, aluno_id, status, nota")
            .eq("atividade_id", selecionada!)
        ).data ?? [];
      return alunos.map((a) => ({
        aluno: a,
        registro: registros.find((r) => r.aluno_id === a.id) ?? null,
      }));
    },
  });

  const criar = useMutation({
    mutationFn: async () => {
      if (!form.nome.trim()) throw new Error("Informe o nome da atividade");
      const { error } = await supabase.from("atividades").insert({
        turma_id: form.turma_id || null,
        nome: form.nome,
        disciplina: form.disciplina || null,
        data: form.data || null,
        prazo: form.prazo || null,
        valor: Number(form.valor || 0),
        descricao: form.descricao || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Atividade cadastrada.");
      setNovo(false);
      setForm({ turma_id: "", nome: "", disciplina: "", data: "", prazo: "", valor: "0", descricao: "" });
      qc.invalidateQueries({ queryKey: ["atividades"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao salvar."),
  });

  const salvarEntrega = useMutation({
    mutationFn: async (v: { alunoId: string; status: string; nota: string }) => {
      const { error } = await supabase.from("entregas_atividades").upsert(
        {
          atividade_id: selecionada!,
          aluno_id: v.alunoId,
          status: v.status,
          nota: v.nota === "" ? null : Number(v.nota),
          data_entrega: v.status.startsWith("entregue") ? new Date().toISOString() : null,
        },
        { onConflict: "atividade_id,aluno_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["entregas"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao salvar entrega."),
  });

  return (
    <div>
      <TituloPagina titulo="Atividades" descricao="Atividades por turma, entregas e notas." />

      {novo ? (
        <Cartao className="mb-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold">Nova atividade</p>
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
              <Campo label="Prazo" type="date" value={form.prazo} onChange={(e) => setForm({ ...form, prazo: e.target.value })} />
            </div>
            <Campo
              label="Valor em P$"
              inputMode="numeric"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
            />
            <AreaTexto
              label="Descrição"
              rows={2}
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
            <BotaoPrincipal disabled={criar.isPending} onClick={() => criar.mutate()}>
              SALVAR ATIVIDADE
            </BotaoPrincipal>
          </div>
        </Cartao>
      ) : (
        <button
          onClick={() => setNovo(true)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-4 font-semibold text-accent"
        >
          <Plus className="size-5" /> Nova atividade
        </button>
      )}

      <div className="space-y-3">
        {(atividades ?? []).length === 0 && <Vazio texto="Nenhuma atividade cadastrada." />}
        {(atividades ?? []).map((a) => (
          <div key={a.id} className="surface-card p-4">
            <button
              className="w-full text-left"
              onClick={() => setSelecionada(selecionada === a.id ? null : a.id)}
            >
              <p className="font-semibold">{a.nome}</p>
              <p className="text-xs text-muted-foreground">
                {a.turmas?.nome ?? "Sem turma"} • {a.disciplina ?? "—"} • prazo {a.prazo ?? "—"} • P$ {a.valor}
              </p>
            </button>

            {selecionada === a.id && (
              <div className="mt-4 space-y-3 border-t border-border pt-4">
                {(entregas ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum aluno nesta turma.</p>
                )}
                {(entregas ?? []).map(({ aluno, registro }) => (
                  <LinhaEntrega
                    key={aluno.id}
                    nome={aluno.nome}
                    status={registro?.status ?? "pendente"}
                    nota={registro?.nota === null || registro?.nota === undefined ? "" : String(registro.nota)}
                    onSalvar={(status, nota) => salvarEntrega.mutate({ alunoId: aluno.id, status, nota })}
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

function LinhaEntrega({
  nome,
  status,
  nota,
  onSalvar,
}: {
  nome: string;
  status: string;
  nota: string;
  onSalvar: (status: string, nota: string) => void;
}) {
  const [s, setS] = useState(status);
  const [n, setN] = useState(nota);
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{nome}</p>
        <span className="text-xs text-muted-foreground">Nota: {formatNota(nota ? Number(nota) : null)}</span>
      </div>
      <div className="mt-2 flex gap-2">
        <select
          value={s}
          onChange={(e) => setS(e.target.value)}
          className="h-10 flex-1 rounded-lg border border-input bg-background px-2 text-sm"
        >
          {STATUS.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
        <input
          value={n}
          onChange={(e) => setN(e.target.value)}
          inputMode="decimal"
          placeholder="Nota"
          className="h-10 w-20 rounded-lg border border-input bg-background px-2 text-sm"
        />
        <button
          onClick={() => onSalvar(s, n)}
          className="h-10 rounded-lg bg-accent px-3 text-sm font-semibold text-accent-foreground"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
