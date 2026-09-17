import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Cartao, TituloPagina } from "@/components/prof";
import { SeloPontos } from "@/components/Marca";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Banco Escolar NFC" },
      { name: "description", content: "Ajustes do sistema, como permitir saldo negativo em P$." },
      { property: "og:title", content: "Configurações — Banco Escolar NFC" },
      { property: "og:description", content: "Configurações do banco escolar de pontos." },
    ],
  }),
  component: Configuracoes,
});

function Configuracoes() {
  const qc = useQueryClient();

  const { data: config } = useQuery({
    queryKey: ["configuracoes"],
    queryFn: async () =>
      (await supabase.from("configuracoes").select("*").eq("id", 1).maybeSingle()).data,
  });

  const atualizar = useMutation({
    mutationFn: async (valores: { permitir_saldo_negativo?: boolean; nome_professor?: string }) => {
      const { error } = await supabase.from("configuracoes").update(valores).eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Configuração salva.");
      qc.invalidateQueries({ queryKey: ["configuracoes"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao salvar."),
  });

  return (
    <div>
      <TituloPagina titulo="Configurações" descricao="Regras gerais do banco de pontos." />

      <Cartao className="mb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Permitir saldo negativo</p>
            <p className="text-xs text-muted-foreground">
              Quando desligado, nenhuma operação deixa o aluno abaixo de P$ 0.
            </p>
          </div>
          <button
            role="switch"
            aria-checked={!!config?.permitir_saldo_negativo}
            onClick={() => atualizar.mutate({ permitir_saldo_negativo: !config?.permitir_saldo_negativo })}
            className={`h-8 w-14 shrink-0 rounded-full p-1 transition-colors ${
              config?.permitir_saldo_negativo ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`block size-6 rounded-full bg-card transition-transform ${
                config?.permitir_saldo_negativo ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>
      </Cartao>

      <Cartao className="mb-4">
        <p className="font-semibold">Identidade</p>
        <p className="mt-1 text-sm text-muted-foreground">
          BANCO ESCOLAR NFC — {config?.nome_professor ?? "PROF. JOBER"}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          O cartão NFC guarda apenas o identificador do aluno. Saldo, histórico, atividades e notas ficam
          sempre no sistema.
        </p>
      </Cartao>

      <div className="flex justify-center">
        <SeloPontos />
      </div>
    </div>
  );
}
