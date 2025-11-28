import { Company } from "../data/mockData";

interface CompanySelectProps {
  value: string | "all";
  onChange: (value: string | "all") => void;
  companies: Company[];
  label?: string;
  className?: string;
  ariaLabel?: string;
}

export function CompanySelect({
  value,
  onChange,
  companies,
  label,
  className = "",
  ariaLabel
}: CompanySelectProps) {
  const selectId = label ? `company-select-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined;
  const descriptionId = selectId ? `${selectId}-description` : undefined;

  const wrapperClasses = `relative flex items-center justify-center gap-3 rounded-2xl border border-logica-purple/15 bg-white/95 px-4 py-3 shadow-md shadow-logica-purple/5 transition hover:shadow-lg focus-within:ring-2 focus-within:ring-logica-lilac/70 ${className}`;

  return (
    <div className={wrapperClasses}>
      {label && (
        <span className="text-center text-[11px] uppercase tracking-wide text-logica-lilac" id={`${selectId}-label`}>
          {label}
        </span>
      )}
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-logica-purple/70">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h3A2.5 2.5 0 0 1 12 5.5V21H4z" />
            <path d="M13 11h3a2 2 0 0 1 2 2v8h-5z" />
            <path d="M18 9h2a1 1 0 0 1 1 1v11h-3z" />
          </svg>
        </div>
        <select
          id={selectId}
          aria-labelledby={label ? `${selectId}-label` : undefined}
          aria-label={label ? undefined : ariaLabel ?? "Selecionar empresa"}
          aria-describedby={descriptionId}
          value={value}
          onChange={(event) => onChange(event.target.value as typeof value)}
          className="peer w-full appearance-none rounded-xl border border-logica-purple/10 bg-white/50 px-10 py-3 pr-12 text-left text-sm font-semibold text-logica-purple shadow-inner focus:border-logica-lilac focus:outline-none"
        >
          <option value="all">Todas as empresas</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-logica-purple/70">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 transition-transform duration-200 peer-focus:-rotate-180"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      <p
        id={descriptionId}
        className="hidden text-[11px] font-semibold uppercase tracking-wide text-logica-purple/80 sm:block"
      >
        Clique para trocar a empresa
      </p>
    </div>
  );
}

export default CompanySelect;
