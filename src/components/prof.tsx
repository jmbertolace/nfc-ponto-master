import type { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function TituloPagina({ titulo, descricao }: { titulo: string; descricao?: string }) {
  return (
    <div className="mb-4">
      <h1 className="font-display text-xl font-bold uppercase">{titulo}</h1>
      {descricao && <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>}
    </div>
  );
}

export function Cartao({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`surface-card p-5 ${className}`}>{children}</div>;
}

export function Campo({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        {...props}
        className="mt-1 h-12 w-full rounded-xl border border-input bg-background px-4 outline-none focus:border-accent"
      />
    </label>
  );
}

export function AreaTexto({ label, ...props }: { label: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <textarea
        {...props}
        className="mt-1 w-full rounded-xl border border-input bg-background p-3 outline-none focus:border-accent"
      />
    </label>
  );
}

export function Selecao({
  label,
  children,
  ...props
}: { label: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <select
        {...props}
        className="mt-1 h-12 w-full rounded-xl border border-input bg-background px-3 outline-none focus:border-accent"
      >
        {children}
      </select>
    </label>
  );
}

export function BotaoPrincipal({
  children,
  ...props
}: { children: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="brand-gradient h-14 w-full rounded-2xl font-display text-base font-bold text-primary-foreground disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function BotaoSecundario({
  children,
  ...props
}: { children: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="h-12 w-full rounded-xl border border-border bg-card font-semibold disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function Vazio({ texto }: { texto: string }) {
  return <div className="surface-card p-6 text-center text-sm text-muted-foreground">{texto}</div>;
}
