import { createServerFn } from "@tanstack/react-start";

/**
 * Consulta pública (somente leitura) usada pelo terminal NFC.
 * Retorna apenas os dados do aluno identificado pelo cartão — nunca dados de outros alunos
 * e nunca informações administrativas.
 */

export type AlunoResumo = {
  id: string;
  nome: string;
  turma: string | null;
  numero: number | null;
  saldo: number;
  status: string;
};

export type Movimento = {
  id: string;
  tipo: string;
  valor: number;
  saldo_anterior: number;
  saldo_posterior: number;
  motivo: string | null;
  usuario_nome: string | null;
  data_hora: string;
};

export type AtividadeAluno = {
  id: string;
  nome: string;
  disciplina: string | null;
  prazo: string | null;
  status: string;
  nota: number | null;
};

export type AvaliacaoAluno = {
  id: string;
  nome: string;
  disciplina: string | null;
  data: string | null;
  valor_maximo: number;
  nota: number | null;
};

export type DadosAluno = {
  aluno: AlunoResumo;
  movimentos: Movimento[];
  atividades: AtividadeAluno[];
  avaliacoes: AvaliacaoAluno[];
  media: number | null;
};

export const identificarCartao = createServerFn({ method: "POST" })
  .inputValidator((input: { codigo: string }) => ({ codigo: String(input.codigo || "").trim() }))
  .handler(async ({ data }): Promise<{ alunoId: string } | { erro: string }> => {
    if (!data.codigo) return { erro: "Informe o identificador do cartão." };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: cartao } = await supabaseAdmin
      .from("cartoes_nfc")
      .select("aluno_id, status")
      .ilike("nfc_uid", data.codigo)
      .maybeSingle();

    if (cartao?.aluno_id) {
      if (cartao.status !== "ativo") return { erro: "Este cartão está bloqueado." };
      return { alunoId: cartao.aluno_id };
    }

    const { data: aluno } = await supabaseAdmin
      .from("alunos")
      .select("id")
      .ilike("identificador", data.codigo)
      .maybeSingle();

    if (aluno?.id) return { alunoId: aluno.id };
    return { erro: "Cartão não cadastrado. Procure o professor." };
  });

export const consultarAluno = createServerFn({ method: "POST" })
  .inputValidator((input: { alunoId: string }) => ({ alunoId: String(input.alunoId) }))
  .handler(async ({ data }): Promise<DadosAluno | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: aluno } = await supabaseAdmin
      .from("alunos")
      .select("id, nome, nome_exibicao, numero, saldo_pontos, status, turmas(nome)")
      .eq("id", data.alunoId)
      .maybeSingle();

    if (!aluno) return null;

    const [{ data: movs }, { data: entregas }, { data: notas }] = await Promise.all([
      supabaseAdmin
        .from("transacoes")
        .select("id, tipo, valor, saldo_anterior, saldo_posterior, motivo, usuario_nome, data_hora")
        .eq("aluno_id", data.alunoId)
        .order("data_hora", { ascending: false })
        .limit(60),
      supabaseAdmin
        .from("entregas_atividades")
        .select("id, status, nota, atividades(id, nome, disciplina, prazo)")
        .eq("aluno_id", data.alunoId),
      supabaseAdmin
        .from("notas_avaliacoes")
        .select("id, nota, avaliacoes(id, nome, disciplina, data, valor_maximo)")
        .eq("aluno_id", data.alunoId),
    ]);

    const atividades: AtividadeAluno[] = (entregas ?? []).map((e) => ({
      id: e.id,
      nome: e.atividades?.nome ?? "Atividade",
      disciplina: e.atividades?.disciplina ?? null,
      prazo: e.atividades?.prazo ?? null,
      status: e.status,
      nota: e.nota === null || e.nota === undefined ? null : Number(e.nota),
    }));

    const avaliacoes: AvaliacaoAluno[] = (notas ?? []).map((n) => ({
      id: n.id,
      nome: n.avaliacoes?.nome ?? "Avaliação",
      disciplina: n.avaliacoes?.disciplina ?? null,
      data: n.avaliacoes?.data ?? null,
      valor_maximo: Number(n.avaliacoes?.valor_maximo ?? 10),
      nota: n.nota === null || n.nota === undefined ? null : Number(n.nota),
    }));

    const comNota = avaliacoes.filter((a) => a.nota !== null);
    const media =
      comNota.length > 0
        ? comNota.reduce((soma, a) => soma + (a.nota ?? 0), 0) / comNota.length
        : null;

    return {
      aluno: {
        id: aluno.id,
        nome: aluno.nome_exibicao || aluno.nome,
        turma: aluno.turmas?.nome ?? null,
        numero: aluno.numero,
        saldo: aluno.saldo_pontos,
        status: aluno.status,
      },
      movimentos: (movs ?? []) as Movimento[],
      atividades,
      avaliacoes,
      media,
    };
  });
