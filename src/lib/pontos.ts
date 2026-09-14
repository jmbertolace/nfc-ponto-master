/**
 * P$ = Pontos pedagógicos. Este sistema NÃO usa dinheiro real.
 * Nunca formatar valores como R$ ou qualquer moeda financeira.
 */
export const MOEDA = "P$";

export function formatPontos(valor: number | null | undefined): string {
  const n = Number(valor ?? 0);
  return `${MOEDA} ${Math.trunc(n).toLocaleString("pt-BR")}`;
}

export function formatPontosAssinado(valor: number): string {
  const sinal = valor >= 0 ? "+" : "−";
  return `${sinal} ${MOEDA} ${Math.abs(Math.trunc(valor)).toLocaleString("pt-BR")}`;
}

export function formatDataHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatNota(nota: number | null | undefined): string {
  if (nota === null || nota === undefined) return "—";
  return Number(nota).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
}

export const TIPOS_LANCAMENTO = [
  "Bônus",
  "Atividade",
  "Participação",
  "Desafio",
  "Trabalho",
  "Outros",
] as const;

export const TIPOS_DESCONTO = ["Penalidade", "Correção", "Desconto", "Outros"] as const;
