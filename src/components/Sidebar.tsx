import { clsx } from "clsx";

const menuItems = [
  { key: "dashboard", label: "Dashboard", icon: "grid" },
  { key: "companies", label: "Empresas", icon: "building" },
  { key: "loans", label: "Empréstimos", icon: "credit" },
  { key: "consortiums", label: "Consórcios", icon: "layers" },
  { key: "installments", label: "Parcelas", icon: "calendar" },
  { key: "settlements", label: "Quitações", icon: "shield" },
  { key: "simulation", label: "Simulação", icon: "spark" },
  { key: "users", label: "Usuários", icon: "users" }
] as const;

const menuIcons = {
  grid: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75h5.25V4.5H4.5zm9.75 0h5.25V4.5h-5.25zm0 5.25h5.25V9.75h-5.25zm0 5.25h5.25V15h-5.25zM4.5 17.25h5.25V15H4.5zM4.5 12h5.25V9.75H4.5z" />
    </svg>
  ),
  building: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 21h10.5M6.75 3.75h10.5v17.25H6.75zM9 7.5h1.5M9 10.5h1.5M9 13.5h1.5M13.5 7.5H15m-1.5 3H15m-1.5 3H15" />
    </svg>
  ),
  credit: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
      <rect x="3.75" y="5.25" width="16.5" height="13.5" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5M7.5 13.5h3" />
    </svg>
  ),
  layers: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 4.5 7.5 3.75L12 12 4.5 8.25 12 4.5Zm0 7.5 7.5 3.75L12 19.5l-7.5-3.75L12 12Z" />
    </svg>
  ),
  calendar: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 4.5V6m9-1.5V6M4.5 9.75h15" />
      <rect x="4.5" y="6" width="15" height="13.5" rx="2" />
    </svg>
  ),
  shield: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12.75 2.25 2.25L15 11.25m3-5.823a36.75 36.75 0 0 1-6.303-1.65.75.75 0 0 0-.394 0 36.75 36.75 0 0 1-6.303 1.65.75.75 0 0 0-.624.735v6.017a7.5 7.5 0 0 0 4.665 6.923l1.35.54a1.5 1.5 0 0 0 1.122 0l1.35-.54a7.5 7.5 0 0 0 4.665-6.923V6.162a.75.75 0 0 0-.624-.735Z" />
    </svg>
  ),
  users: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM4.5 19.5a5.25 5.25 0 0 1 10.5 0M16.5 8.25a2.25 2.25 0 1 1 0 4.5M19.5 19.5a4.125 4.125 0 0 0-3-3.957" />
    </svg>
  ),
  spark: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4.5m0 9V21M5.636 5.636l3.182 3.182m6.364 6.364 3.182 3.182M3 12h4.5m9 0H21m-2.818-6.364-3.182 3.182m-6.364 6.364-3.182 3.182" />
    </svg>
  )
};

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
          "fixed inset-y-0 left-0 z-30 flex w-72 flex-col bg-gradient-to-b from-logica-purple via-logica-deep-purple to-logica-purple p-6 text-white shadow-2xl shadow-logica-deep-purple/30 transition-transform duration-200",
          "md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 shadow-inner shadow-black/10">
            <img src="/logo.png" alt="Lógica" className="h-10 w-10 object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-white">Lógica Dashboard</p>
            <p className="text-xs text-white/80">Controle consolidado</p>
          </div>
        </div>
        <nav className="mt-8 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                onChangeView(item.key);
                onClose();
              }}
              className={clsx(
                "group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition",
                activeView === item.key
                  ? "bg-white/10 text-white shadow-lg shadow-black/20 ring-1 ring-white/20"
                  : "text-white/80 hover:bg-white/5 hover:text-white"
              )}
            >
              <span
                className={clsx(
                  "absolute left-0 top-1/2 h-7 w-1.5 -translate-y-1/2 rounded-full bg-gradient-to-b from-rose-200/80 to-logica-rose/80 transition",
                  activeView === item.key ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                )}
              />
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/80 shadow-inner shadow-black/10">
                {menuIcons[item.icon]}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto space-y-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/30 px-3 py-2 text-sm font-semibold text-white transition hover:border-white md:hidden"
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
