import { useMemo, useState } from "react";

export type TotaisMensaisProps = {
  categories: string[];
  data: number[];
  height?: number;
};

const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const createColor = (opacity: number) => `rgba(126, 87, 194, ${opacity})`;

const buildColors = (length: number, activeIndex: number | null) =>
  Array.from({ length }, (_, idx) => {
    if (activeIndex === null) return createColor(0.9);
    return idx === activeIndex ? createColor(1) : createColor(0.35);
  });

const GRID_LINES = 4;

export function TotaisMensais({ categories, data, height = 360 }: TotaisMensaisProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chartData = useMemo(
    () =>
      categories.map((label, idx) => ({
        label,
        value: Number.isFinite(data[idx]) ? data[idx] : 0
      })),
    [categories, data]
  );

  const maxValue = useMemo(() => {
    const highest = chartData.reduce((currentMax, entry) => Math.max(currentMax, entry.value), 0);
    return highest === 0 ? 1 : highest;
  }, [chartData]);

  const gridValues = useMemo(
    () => Array.from({ length: GRID_LINES + 1 }, (_, idx) => (maxValue / GRID_LINES) * idx),
    [maxValue]
  );

  const totalSum = useMemo(() => chartData.reduce((total, entry) => total + entry.value, 0), [chartData]);
  const periodLabel = useMemo(() => {
    if (!categories.length) return "Sem dados";
    if (categories.length === 1) return categories[0];
    const first = categories[0];
    const last = categories[categories.length - 1];
    return `${first} — ${last}`;
  }, [categories]);

  const colors = useMemo(() => buildColors(chartData.length, activeIndex), [chartData.length, activeIndex]);

  return (
    <div className="rounded-3xl border border-white/60 bg-white/90 p-4 shadow-[0_18px_40px_rgba(106,27,154,0.08)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-logica-purple/70">Período</p>
          <p className="text-lg font-bold text-logica-deep-purple">{periodLabel}</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-logica-lilac px-3 py-1 text-xs font-semibold text-logica-deep-purple">
          <span className="inline-block h-2 w-2 rounded-full bg-logica-purple" aria-hidden />
          Total {formatBRL(totalSum)}
        </div>
      </div>

      <div
        className="relative rounded-2xl bg-gradient-to-b from-[#f6f0ff] via-white to-white/60"
        style={{ height }}
        onMouseLeave={() => setActiveIndex(null)}
      >
        <div className="absolute inset-x-6 inset-y-8">
          {gridValues.map((value, idx) => {
            const ratio = value / maxValue;
            return (
              <div
                key={`${idx}-${value}`}
                className="pointer-events-none absolute inset-x-0 border-t border-dashed border-logica-lilac/50"
                style={{ top: `${100 - ratio * 100}%` }}
              >
                <span className="absolute -top-2 left-0 translate-y-[-100%] text-[10px] font-semibold text-logica-purple/70">
                  {formatBRL(value)}
                </span>
              </div>
            );
          })}

          <div
            className="grid h-full items-end gap-4"
            style={{ gridTemplateColumns: `repeat(${chartData.length || 1}, minmax(0, 1fr))` }}
          >
            {chartData.map((entry, idx) => {
              const isActive = idx === activeIndex;
              const barHeight = Math.max((entry.value / maxValue) * 100, 0);
              const labelId = `bar-label-${idx}`;

              return (
                <div
                  key={entry.label}
                  className="group relative flex flex-col items-center"
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseMove={() => setActiveIndex(idx)}
                  aria-labelledby={labelId}
                >
                  <div className="relative flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-xl shadow-[0_10px_30px_rgba(126,87,194,0.25)] transition-[opacity,transform] duration-200"
                      style={{
                        height: `${barHeight}%`,
                        background: `linear-gradient(180deg, ${colors[idx]} 0%, ${createColor(0.65)} 100%)`,
                        opacity: isActive ? 1 : 0.7,
                        transform: isActive ? "translateY(-4px)" : "translateY(0)"
                      }}
                    />
                    <div
                      className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-lg bg-white px-2 py-1 text-[11px] font-semibold text-logica-deep-purple shadow-md transition duration-150"
                      style={{
                        opacity: isActive ? 1 : 0.7,
                        transform: isActive ? "translate(-50%, -4px)" : "translate(-50%, 0)"
                      }}
                    >
                      {formatBRL(entry.value)}
                    </div>
                  </div>
                  <div
                    id={labelId}
                    className="mt-3 w-full text-center text-xs font-semibold text-logica-deep-purple/80"
                  >
                    {entry.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TotaisMensais;
