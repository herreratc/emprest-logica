import { clsx } from "clsx";

const menuItems = [
  { key: "dashboard", label: "Dashboard" },
  { key: "companies", label: "Empresas" },
  { key: "loans", label: "Empréstimos" },
  { key: "consortiums", label: "Consórcios" },
  { key: "installments", label: "Parcelas" },
  { key: "users", label: "Usuários" },
  { key: "simulation", label: "Simulação" }
] as const;

type SidebarView = (typeof menuItems)[number]["key"];

type SidebarProps = {
  activeView: SidebarView;
  onChangeView: (view: SidebarView) => void;
};

export function Sidebar({ activeView, onChangeView }: SidebarProps) {
  return (
    <aside className="flex w-64 flex-col border-r border-logica-lilac bg-white/80 p-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-logica-light-lilac p-2 shadow-inner">
          <img src="/logo.svg" alt="Lógica" className="h-12 w-12" />
        </div>
        <div>
          <p className="text-sm font-semibold text-logica-purple">Controle de Empréstimos</p>
          <p className="text-xs text-logica-lilac">Lógica App</p>
        </div>
      </div>
      <nav className="mt-8 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onChangeView(item.key)}
            className={clsx(
              "w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition",
              activeView === item.key
                ? "bg-logica-purple text-white shadow-lg shadow-logica-purple/30"
                : "text-logica-purple hover:bg-logica-light-lilac"
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="mt-auto rounded-lg bg-logica-light-lilac p-4 text-xs text-logica-purple">
        Faça login como usuário master para gerenciar contas e simulações em tempo real.
      </div>
    </aside>
  );
}
