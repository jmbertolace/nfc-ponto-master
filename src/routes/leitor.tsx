import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useState } from "react";
import { ArrowLeft, Nfc, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { identificarCartao } from "@/lib/consulta.functions";
import { useNfc } from "@/lib/useNfc";
import { Marca } from "@/components/Marca";

export const Route = createFileRoute("/leitor")({
  head: () => ({
    meta: [
      { title: "Leitor NFC — Banco Escolar NFC" },
      {
        name: "description",
        content: "Aproxime o cartão NFC do celular para identificar o aluno e consultar o saldo em P$.",
      },
      { property: "og:title", content: "Leitor NFC — Banco Escolar NFC" },
      { property: "og:description", content: "Identificação de alunos por cartão NFC." },
    ],
  }),
  component: LeitorNfc,
});

function LeitorNfc() {
  const navigate = useNavigate();
  const identificar = useServerFn(identificarCartao);
  const [codigo, setCodigo] = useState("");
  const [carregando, setCarregando] = useState(false);

  const buscar = useCallback(
    async (valor: string) => {
      if (!valor.trim()) return;
      setCarregando(true);
      try {
        const r = await identificar({ data: { codigo: valor.trim() } });
        if ("erro" in r) {
          toast.error(r.erro);
          return;
        }
        navigate({ to: "/consulta/$alunoId", params: { alunoId: r.alunoId } });
      } catch {
        toast.error("Não foi possível consultar agora. Tente novamente.");
      } finally {
        setCarregando(false);
      }
    },
    [identificar, navigate],
  );

  const { status, erro, iniciar, suportado } = useNfc(buscar);

  return (
    <main className="grid-math min-h-screen px-5 py-6">
      <header className="mx-auto flex w-full max-w-md items-center justify-between">
        <Link to="/" className="rounded-xl border border-border bg-card p-2.5">
          <ArrowLeft className="size-5" />
        </Link>
        <Marca compacto />
      </header>

      <section className="mx-auto mt-8 w-full max-w-md">
        <h1 className="text-center font-display text-xl font-bold">LEITOR NFC</h1>

        <div className="surface-card mt-5 px-6 py-10 text-center">
          <div className="relative mx-auto flex size-44 items-center justify-center">
            <span className="nfc-wave absolute size-32 rounded-full border-2 border-accent" />
            <span className="nfc-wave nfc-wave-2 absolute size-32 rounded-full border-2 border-accent" />
            <span className="nfc-wave nfc-wave-3 absolute size-32 rounded-full border-2 border-accent" />
            <div className="relative flex size-28 items-center justify-center rounded-full border-2 border-accent/60 bg-accent/10">
              {carregando ? (
                <Loader2 className="size-12 animate-spin text-accent" />
              ) : (
                <Nfc className="size-12 text-accent" />
              )}
            </div>
          </div>
          <p className="mt-6 font-display text-lg font-semibold">
            Aproxime o cartão NFC do celular
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {status === "lendo"
              ? "Leitura ativa. Encoste o cartão na parte de trás do aparelho."
              : "O cartão funciona apenas como identificador do aluno."}
          </p>

          {suportado && status !== "lendo" && (
            <button
              onClick={iniciar}
              className="brand-gradient mt-6 h-14 w-full rounded-2xl font-display text-base font-bold text-primary-foreground active:scale-[0.98]"
            >
              ATIVAR LEITURA NFC
            </button>
          )}
          {erro && <p className="mt-4 text-sm text-warning">{erro}</p>}
          {!suportado && (
            <p className="mt-4 text-sm text-muted-foreground">
              Este navegador não libera o NFC. Use a busca manual abaixo — o mesmo identificador será
              usado quando o aplicativo Android nativo for instalado.
            </p>
          )}
        </div>

        <div className="surface-card mt-4 p-5">
          <label htmlFor="codigo" className="text-sm font-semibold">
            Busca manual
          </label>
          <p className="mt-1 text-xs text-muted-foreground">
            Digite o NFC ID do cartão ou o identificador do aluno.
          </p>
          <div className="mt-3 flex gap-2">
            <input
              id="codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && buscar(codigo)}
              placeholder="Ex.: 04A2B3C4"
              className="h-13 w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus:border-accent"
            />
            <button
              onClick={() => buscar(codigo)}
              disabled={carregando}
              className="flex h-13 items-center justify-center rounded-xl bg-accent px-4 py-3 text-accent-foreground disabled:opacity-60"
            >
              <Search className="size-5" />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
