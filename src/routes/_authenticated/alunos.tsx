import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Lock, LockOpen, Pencil, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPontos } from "@/lib/pontos";
import { BotaoPrincipal, Campo, Cartao, Selecao, TituloPagina, Vazio } from "@/components/prof";

export const Route = createFileRoute("/_authenticated/alunos")({
  head: () => ({
    meta: [
      { title: "Alunos — Banco Escolar NFC" },
      { name: "description", content: "Cadastro de alunos com turma, número, identificador e saldo em P$." },
      { property: "og:title", content: "Alunos — Banco Escolar NFC" },
      { property: "og:description", content: "Gestão dos alunos do banco de pontos pedagógicos." },
    ],
  }),
  component: Alunos,
});

type FormAluno = {
  id?: string;
  nome: string;
  nome_exibicao: string;
  turma_id: string;
  numero: string;
  identificador: string;
  saldo_inicial: string;
};

const VAZIO: FormAluno = {
  nome: "",
  nome_exibicao: "",
  turma_id: "",
  numero: "",
  identificador: "",
  saldo_inicial: "0",
};

function Alunos() {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormAluno | null>(null);
  const [busca, setBusca] = useState("");

  const { data: turmas } = useQuery({
    queryKey: ["turmas-simples"],
    queryFn: async () => (await supabase.from("turmas").select("id, nome").order("nome")).data ?? [],
  });

  const { data: alunos } = useQuery({
    queryKey: ["alunos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alunos")
        .select("id, nome, nome_exibicao, numero, identificador, saldo_pontos, status, turma_id, turmas(nome)")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const salvar = useMutation({
    mutationFn: async (v: FormAluno) => {
      if (!v.nome.trim()) throw new Error("Informe o nome completo");
      const base = {
        nome: v.nome.trim(),
        nome_exibicao: v.nome_exibicao.trim() || null,
        turma_id: v.turma_id || null,
        numero: v.numero ? Number(v.numero) : null,
        identificador: v.identificador.trim() || null,
      };
      if (v.id) {
        const { error } = await supabase.from("alunos").update(base).eq("id", v.id);
        if (error) throw error;
        return;
      }
      const saldo = Number(v.saldo_inicial || 0);
      const { data, error } = await supabase
        .from("alunos")
        .insert({ ...base, saldo_pontos: 0 })
        .select("id")
        .single();
      if (error) throw error;
      if (saldo > 0) {
        const { error: err2 } = await supabase.rpc("registrar_transacao", {
          _aluno_id: data.id,
          _tipo: "Saldo inicial",
          _valor: saldo,
          _motivo: "Cadastro do saldo inicial",
        });
        if (err2) throw err2;
      }
    },
    onSuccess: () => {
      toast.success("Aluno salvo.");
      setForm(null);
      qc.invalidateQueries({ queryKey: ["alunos"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao salvar."),
  });

  const alternarStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("alunos")
        .update({ status: status === "ativo" ? "bloqueado" : "ativo" })
        .eq("id", id);
      if (error) throw error;
      await supabase.from("auditoria").insert({
        aluno_id: id,
        operacao: status === "ativo" ? "Bloqueio de aluno" : "Desbloqueio de aluno",
        valor_anterior: status,
        valor_novo: status === "ativo" ? "bloqueado" : "ativo",
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alunos"] }),
  });

  const lista = (alunos ?? []).filter((a) =>
    a.nome.toLowerCase().includes(busca.trim().toLowerCase()),
  );

  return (
    <div>
      <TituloPagina titulo="Alunos" descricao="Nome, turma, saldo em P$ e situação." />

      {form ? (
        <Cartao className="mb-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold">{form.id ? "Editar aluno" : "Novo aluno"}</p>
            <button onClick={() => setForm(null)}>
              <X className="size-5 text-muted-foreground" />
            </button>
          </div>
          <div className="space-y-3">
            <Campo
              label="Nome completo"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
            <Campo
              label="Nome de exibição"
              value={form.nome_exibicao}
              onChange={(e) => setForm({ ...form, nome_exibicao: e.target.value })}
            />
            <Selecao
              label="Turma"
              value={form.turma_id}
              onChange={(e) => setForm({ ...form, turma_id: e.target.value })}
            >
              <option value="">Sem turma</option>
              {(turmas ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </Selecao>
            <div className="grid grid-cols-2 gap-3">
              <Campo
                label="Número/chamada"
                inputMode="numeric"
                value={form.numero}
                onChange={(e) => setForm({ ...form, numero: e.target.value })}
              />
              <Campo
                label="Identificador"
                value={form.identificador}
                onChange={(e) => setForm({ ...form, identificador: e.target.value })}
              />
            </div>
            {!form.id && (
              <Campo
                label="Saldo inicial (P$)"
                inputMode="numeric"
                value={form.saldo_inicial}
                onChange={(e) => setForm({ ...form, saldo_inicial: e.target.value })}
              />
            )}
            <BotaoPrincipal disabled={salvar.isPending} onClick={() => salvar.mutate(form)}>
              SALVAR ALUNO
            </BotaoPrincipal>
          </div>
        </Cartao>
      ) : (
        <button
          onClick={() => setForm({ ...VAZIO })}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-4 font-semibold text-accent"
        >
          <Plus className="size-5" /> Novo aluno
        </button>
      )}

      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar aluno"
        className="mb-4 h-12 w-full rounded-xl border border-input bg-background px-4 outline-none focus:border-accent"
      />

      <div className="space-y-3">
        {lista.length === 0 && <Vazio texto="Nenhum aluno cadastrado." />}
        {lista.map((a) => (
          <div key={a.id} className="surface-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{a.nome}</p>
                <p className="text-xs text-muted-foreground">
                  {a.turmas?.nome ?? "Sem turma"} {a.numero ? `• Nº ${a.numero}` : ""}
                </p>
                <p className="mt-1 font-display text-lg font-bold text-primary">
                  {formatPontos(a.saldo_pontos)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    a.status === "ativo" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
                  }`}
                >
                  {a.status}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setForm({
                        id: a.id,
                        nome: a.nome,
                        nome_exibicao: a.nome_exibicao ?? "",
                        turma_id: a.turma_id ?? "",
                        numero: a.numero ? String(a.numero) : "",
                        identificador: a.identificador ?? "",
                        saldo_inicial: "0",
                      })
                    }
                    className="rounded-xl border border-border p-2.5"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => alternarStatus.mutate({ id: a.id, status: a.status })}
                    className="rounded-xl border border-border p-2.5 text-muted-foreground"
                  >
                    {a.status === "ativo" ? <Lock className="size-4" /> : <LockOpen className="size-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
