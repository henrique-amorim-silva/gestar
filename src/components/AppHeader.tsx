import type { Farm } from "../types/cow";

export type AppTab = "dashboard" | "herd" | "reports";

interface AppHeaderProps {
  farms: Farm[];
  currentFarmId: string;
  activeTab: AppTab;
  onFarmChange: (farmId: string) => void;
  onCreateFarm: () => void;
  onTabChange: (tab: AppTab) => void;
}

const tabs: { id: AppTab; label: string }[] = [
  { id: "dashboard", label: "Painel" },
  { id: "herd", label: "Rebanho" },
  { id: "reports", label: "Relatórios" },
];

export function AppHeader({
  farms,
  currentFarmId,
  activeTab,
  onFarmChange,
  onCreateFarm,
  onTabChange,
}: AppHeaderProps) {
  return (
    <header className="overflow-hidden rounded-lg border-l-4 border-emerald-600 bg-white shadow">
      <div className="flex flex-col items-center justify-between gap-4 p-5 sm:flex-row">
        <img
          src={`${import.meta.env.BASE_URL}images/logo-gestar.png`}
          alt="Logo Gestar"
          className="h-12 w-auto object-contain"
        />
        <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
            Fazenda:
            <select
              value={currentFarmId}
              onChange={(event) => onFarmChange(event.target.value)}
              className="rounded-lg border border-emerald-600 px-3 py-1.5 font-medium text-black focus:outline-none focus:ring-1 focus:ring-emerald-400"
            >
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={onCreateFarm}
            className="whitespace-nowrap rounded-lg border border-emerald-600 bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600"
          >
            + Nova Fazenda
          </button>
        </div>
      </div>
      <nav
        aria-label="Navegação principal"
        className="flex gap-1 overflow-x-auto border-t border-gray-100 px-4"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-current={activeTab === tab.id ? "page" : undefined}
            onClick={() => onTabChange(tab.id)}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? "border-emerald-600 text-emerald-800"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
}