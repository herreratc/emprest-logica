import { clsx } from "clsx";

const menuItems = [
  { key: "dashboard", label: "Dashboard" },
  { key: "companies", label: "Empresas" },
  { key: "loans", label: "Empréstimos" },
  { key: "consortiums", label: "Consórcios" },
  { key: "installments", label: "Parcelas" },
  { key: "settlements", label: "Quitações" },
  { key: "users", label: "Usuários" },
  { key: "simulation", label: "Simulação" }
] as const;

type SidebarView = (typeof menuItems)[number]["key"];

type SidebarProps = {
  activeView: SidebarView;
  onChangeView: (view: SidebarView) => void;
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ activeView, onChangeView, isOpen, onClose }: SidebarProps) {
  return (
    <>
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-logica-lilac bg-white/90 p-6 shadow-xl backdrop-blur transition-transform duration-200",
          "md:static md:translate-x-0 md:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
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
              onClick={() => {
                onChangeView(item.key);
                onClose();
              }}
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
        <div className="mt-auto space-y-3">
          <div className="rounded-lg bg-logica-light-lilac p-4 text-xs text-logica-purple">
            Faça login como usuário master para gerenciar contas e simulações em tempo real.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-logica-lilac px-3 py-2 text-sm font-semibold text-logica-purple transition hover:border-logica-purple hover:text-logica-deep-purple md:hidden"
          >
            <span aria-hidden className="h-4 w-4 rounded-sm border border-current" />
            Fechar menu
          </button>
        </div>
      </aside>
      {isOpen && <div className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm md:hidden" onClick={onClose} />}
    </>
  );
}
