import { Nfc } from "lucide-react";

export function Marca({ compacto = false }: { compacto?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="brand-gradient flex size-11 items-center justify-center rounded-2xl">
        <Nfc className="size-6 text-primary-foreground" />
      </div>
      <div className="leading-tight">
        <p className={`font-display font-bold ${compacto ? "text-base" : "text-lg"}`}>
          BANCO ESCOLAR NFC
        </p>
        <p className="text-xs font-semibold tracking-[0.18em] text-accent">PROF. JOBER</p>
      </div>
    </div>
  );
}

export function SeloPontos() {
  return (
    <span className="rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground">
      P$ = Pontos pedagógicos (sem dinheiro real)
    </span>
  );
}
