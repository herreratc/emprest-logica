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
  const wrapperClasses = `relative flex items-center gap-2 rounded-full border border-logica-light-lilac/80 bg-white/90 px-3 py-2 shadow-sm ${className}`;
  const selectId = label ? `company-select-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined;

  return (
    <div className={wrapperClasses}>
      {label && (
        <span className="text-[11px] uppercase tracking-wide text-logica-lilac" id={`${selectId}-label`}>
          {label}
        </span>
      )}
      <div className="relative">
        <select
          id={selectId}
          aria-labelledby={label ? `${selectId}-label` : undefined}
          aria-label={label ? undefined : ariaLabel ?? "Selecionar empresa"}
          value={value}
          onChange={(event) => onChange(event.target.value as typeof value)}
          className="peer w-full appearance-none rounded-full bg-transparent px-3 py-2 pr-10 text-sm font-semibold text-logica-purple focus:outline-none focus:ring-2 focus:ring-logica-lilac focus:ring-offset-1"
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
    </div>
  );
}

export default CompanySelect;
