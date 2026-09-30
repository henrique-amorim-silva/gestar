import { useState } from "react";

export interface MonthlyReport {
  month: string;
  milkProduction: number;
  additionalCcs: number;
  additionalCbt: number;
  observation?: string;
  source?: string;
}

interface MonthlyReportsProps {
  farmName: string;
  reports: MonthlyReport[];
  onChange: (reports: MonthlyReport[]) => void;
}

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function formatMonth(month: string) {
  const parts = monthFormatter.formatToParts(
    new Date(`${month}-01T00:00:00Z`),
  );
  return parts
    .filter((part) => part.type === "month" || part.type === "year")
    .map((part) => part.value)
    .join(" ");
}

function getNiceTickStep(range: number, tickCount: number) {
  const roughStep = range / tickCount;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalizedStep = roughStep / magnitude;
  const niceStep = normalizedStep <= 1 ? 1 : normalizedStep <= 2 ? 2 : normalizedStep <= 5 ? 5 : 10;
  return niceStep * magnitude;
}

function MonthlyLineChart({
  title,
  reports,
  series,
  colors,
  formatValue,
  showVariation = false,
}: {
  title: string;
  reports: MonthlyReport[];
  series: { key: "milkProduction" | "additionalCcs" | "additionalCbt"; label: string }[];
  colors: string[];
  formatValue: (value: number) => string;
  showVariation?: boolean;
}) {
  const width = 760;
  const height = 300;
  const left = 64;
  const right = 22;
  const top = 24;
  const bottom = 62;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const values = reports.flatMap((report) => series.map(({ key }) => report[key]));
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const maxValue = Math.max(...values, 0);
  const tickCount = 4;
  const hasVariation = showVariation && reports.length > 1 && maxValue > minValue;
  const padding = hasVariation ? (maxValue - minValue) * 0.2 : 0;
  const rawAxisMin = hasVariation ? Math.max(0, minValue - padding) : 0;
  const rawAxisMax = maxValue + padding;
  const tickStep = getNiceTickStep(Math.max(rawAxisMax - rawAxisMin, 1), tickCount);
  const axisMin = hasVariation ? Math.floor(rawAxisMin / tickStep) * tickStep : 0;
  const axisMax = Math.max(Math.ceil(rawAxisMax / tickStep) * tickStep, tickStep);
  const tickValues = Array.from(
    { length: Math.round((axisMax - axisMin) / tickStep) + 1 },
    (_, index) => axisMin + index * tickStep,
  );
  const xFor = (index: number) =>
    reports.length < 2
      ? left + chartWidth / 2
      : left + (index / (reports.length - 1)) * chartWidth;
  const yFor = (value: number) =>
    top + chartHeight - ((value - axisMin) / (axisMax - axisMin)) * chartHeight;

  return (
    <section className="min-w-0 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-700">
        {title}
      </h3>
      {reports.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">
          Cadastre dados mensais para visualizar o gráfico.
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={title}
            className="h-64 min-w-[620px] w-full"
          >
            {tickValues.map((value, tickIndex) => {
              const y = yFor(value);
              return (
                <g key={tickIndex}>
                  <line
                    x1={left}
                    x2={width - right}
                    y1={y}
                    y2={y}
                    stroke="#d1d5db"
                    strokeDasharray="4 4"
                  />
                  <text x={left - 8} y={y + 4} textAnchor="end" fill="#6b7280" fontSize="11">
                    {formatValue(value)}
                  </text>
                </g>
              );
            })}
            {reports.map((report, index) => (
              <g key={report.month}>
                <line
                  x1={xFor(index)}
                  x2={xFor(index)}
                  y1={top}
                  y2={top + chartHeight}
                  stroke="#e5e7eb"
                  strokeDasharray="3 5"
                />
                <text
                  x={xFor(index)}
                  y={height - bottom + 18}
                  textAnchor="end"
                  transform={`rotate(-35 ${xFor(index)} ${height - bottom + 18})`}
                  fill="#4b5563"
                  fontSize="11"
                >
                  {formatMonth(report.month)}
                </text>
              </g>
            ))}
            {series.map(({ key, label }, seriesIndex) => {
              const points = reports
                .map((report, index) => `${xFor(index)},${yFor(report[key])}`)
                .join(" ");
              return (
                <g key={key}>
                  <polyline
                    points={points}
                    fill="none"
                    stroke={colors[seriesIndex]}
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {reports.map((report, index) => (
                    <circle
                      key={report.month}
                      cx={xFor(index)}
                      cy={yFor(report[key])}
                      r="4"
                      fill={colors[seriesIndex]}
                    >
                      <title>{`${label}: ${formatValue(report[key])} em ${formatMonth(report.month)}`}</title>
                    </circle>
                  ))}
                </g>
              );
            })}
          </svg>
        </div>
      )}
      {hasVariation && (
        <p className="mt-2 text-[10px] text-gray-500">
          Escala vertical ajustada para destacar variações; consulte os valores no eixo.
        </p>
      )}
      {series.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-600">
          {series.map(({ key, label }, index) => (
            <span key={key} className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index] }} />
              {label}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

export function MonthlyReports({ farmName, reports, onChange }: MonthlyReportsProps) {
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const filteredReports = [...reports]
    .filter(
      (report) =>
        (!periodStart || report.month >= periodStart) &&
        (!periodEnd || report.month <= periodEnd),
    )
    .sort((a, b) => a.month.localeCompare(b.month));
  const printScale = Math.min(1, 20 / Math.max(filteredReports.length, 20));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const report: MonthlyReport = {
      month: String(formData.get("month")),
      milkProduction: Number(formData.get("milkProduction")),
      additionalCcs: Number(formData.get("additionalCcs")),
      additionalCbt: Number(formData.get("additionalCbt")),
      observation: String(formData.get("observation") || "").trim(),
    };
    onChange([...reports.filter((item) => item.month !== report.month), report]);
    event.currentTarget.reset();
  };

  const numberInputClass =
    "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500";

  return (
    <main
      className="monthly-reports space-y-5"
      style={{ "--report-print-scale": printScale } as React.CSSProperties}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Relatórios mensais</h1>
          <p className="mt-1 text-sm text-gray-500">Produção e indicadores de qualidade · {farmName}</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="monthly-report-no-print inline-flex items-center gap-2 rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
        >
          Imprimir / salvar PDF
        </button>
      </div>

      <form onSubmit={handleSubmit} className="monthly-report-no-print rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-700">Lançamento mensal</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-xs font-semibold text-gray-600">
            Mês
            <input name="month" type="month" required className={numberInputClass} />
          </label>
          <label className="text-xs font-semibold text-gray-600">
            Total de leite (L)
            <input name="milkProduction" type="number" min="0" step="0.01" required className={numberInputClass} />
          </label>
          <label className="text-xs font-semibold text-gray-600">
            Adicional CCS
            <input name="additionalCcs" type="number" min="0" step="1" required className={numberInputClass} />
          </label>
          <label className="text-xs font-semibold text-gray-600">
            Adicional CBT
            <input name="additionalCbt" type="number" min="0" step="1" required className={numberInputClass} />
          </label>
          <label className="text-xs font-semibold text-gray-600">
            Observação
            <input name="observation" type="text" maxLength={120} placeholder="Ex.: coleta realizada no dia 5" className={numberInputClass} />
          </label>
        </div>
        <button type="submit" className="mt-4 rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800">
          Salvar mês
        </button>
      </form>

      <div className="monthly-report-no-print flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <label className="text-xs font-semibold text-gray-600">
          Período inicial
          <input
            type="month"
            value={periodStart}
            onChange={(event) => setPeriodStart(event.target.value)}
            className={numberInputClass}
          />
        </label>
        <label className="text-xs font-semibold text-gray-600">
          Período final
          <input
            type="month"
            value={periodEnd}
            onChange={(event) => setPeriodEnd(event.target.value)}
            className={numberInputClass}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            setPeriodStart("");
            setPeriodEnd("");
          }}
          disabled={!periodStart && !periodEnd}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Limpar filtros
        </button>
        <span className="pb-2 text-xs text-gray-500">
          {filteredReports.length} de {reports.length} meses
        </span>
      </div>

      <div className="monthly-report-charts grid grid-cols-1 gap-4 xl:grid-cols-2">
        <MonthlyLineChart
          title={`Produção de leite · ${farmName}`}
          reports={filteredReports}
          series={[{ key: "milkProduction", label: "Total de leite (L)" }]}
          colors={["#245184"]}
          formatValue={(value) => Math.round(value).toLocaleString("pt-BR")}
          showVariation
        />
        <MonthlyLineChart
          title={`Adicionais CCS e CBT · ${farmName}`}
          reports={filteredReports}
          series={[
            { key: "additionalCcs", label: "Adicional CCS" },
            { key: "additionalCbt", label: "Adicional CBT" },
          ]}
          colors={["#c91f1f", "#f28c28"]}
          formatValue={(value) => Math.round(value).toLocaleString("pt-BR")}
        />
      </div>

      <section className="monthly-report-table overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-4 py-3">Período</th>
                <th className="px-4 py-3">Total leite (L)</th>
                <th className="px-4 py-3">Adicional CCS</th>
                <th className="px-4 py-3">Adicional CBT</th>
                <th className="px-4 py-3">Observação</th>
                <th className="monthly-report-no-print px-4 py-3">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReports.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Nenhum mês encontrado no período.</td></tr>
              ) : filteredReports.map((report) => (
                <tr key={report.month} className="text-gray-700">
                  <td className="whitespace-nowrap px-4 py-3 capitalize">{formatMonth(report.month)}</td>
                  <td className="px-4 py-3">{report.milkProduction.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3">{report.additionalCcs.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3">{report.additionalCbt.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3">{report.observation || report.source || "-"}</td>
                  <td className="monthly-report-no-print px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onChange(reports.filter((item) => item.month !== report.month))}
                      className="font-semibold text-red-700 hover:text-red-900"
                      aria-label={`Excluir lançamento de ${formatMonth(report.month)}`}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}