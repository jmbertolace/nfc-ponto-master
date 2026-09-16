import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ClipboardList,
  Coins,
  CreditCard,
  LineChart,
  School,
  ScrollText,
  Settings,
  Users,
  BookOpen,
} from "lucide-react";
import { TituloPagina } from "@/components/prof";
import { SeloPontos } from "@/components/Marca";

export const Route = createFileRoute("/_authenticated/mais")({
  head: () => ({
    meta: [
      { title: "Mais opções — Banco Escolar NFC" },
      { name: "description", content: "Acesse todos os módulos do banco escolar de pontos P$." },
      { property: "og:title", content: "Mais opções — Banco Escolar NFC" },
      { property: "og:description", content: "Menu completo do painel do professor." },
    ],
  }),
  component: Mais,
});

const ITENS = [
  { to: "/alunos", label: "Alunos", icone: Users },
  { to: "/turmas", label: "Turmas", icone: School },
  { to: "/cartoes", label: "Cartões NFC", icone: CreditCard },
  { to: "/pontos", label: "Pontos P$", icone: Coins },
  { to: "/atividades", label: "Atividades", icone: BookOpen },
  { to: "/avaliacoes", label: "Avaliações", icone: ClipboardList },
  { to: "/desempenho", label: "Desempenho", icone: LineChart },
  { to: "/historico", label: "Histórico", icone: ScrollText },
  { to: "/configuracoes", label: "Configurações", icone: Settings },
] as const;

function Mais() {
  return (
    <div>
      <TituloPagina titulo="Mais" descricao="Todos os módulos do sistema." />
      <div className="grid grid-cols-2 gap-3">
        {ITENS.map(({ to, label, icone: Icone }) => (
          <Link key={to} to={to} className="surface-card flex items-center gap-3 p-4 font-semibold">
            <Icone className="size-5 text-accent" />
            {label}
          </Link>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <SeloPontos />
      </div>
    </div>
  );
}
