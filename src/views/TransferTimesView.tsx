import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Route, 
  RotateCcw, 
  Edit3, 
  Search, 
  Check, 
  AlertTriangle, 
  ArrowRight, 
  Clock, 
  Footprints,
  CalendarRange
} from 'lucide-react';

export const TransferTimesView: React.FC = () => {
  const { 
    routes, 
    halls, 
    updateRouteManualTime, 
    resetRouteToAuto, 
    recalculateAllRoutes, 
    generateSchedule,
    setActiveTab,
    settings 
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedFromHall, setSelectedFromHall] = useState('');
  const [selectedToHall, setSelectedToHall] = useState('');
  const [onlyManual, setOnlyManual] = useState(false);

  // In-line editing
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [editingMinutes, setEditingMinutes] = useState<number>(0);

  const filteredRoutes = routes.filter(r => {
    const fromH = halls.find(h => h.id === r.fromHallId);
    const toH = halls.find(h => h.id === r.toHallId);
    if (!fromH || !toH) return false;

    const matchSearch = 
      fromH.code.toLowerCase().includes(search.toLowerCase()) ||
      toH.code.toLowerCase().includes(search.toLowerCase()) ||
      fromH.name.toLowerCase().includes(search.toLowerCase()) ||
      toH.name.toLowerCase().includes(search.toLowerCase());

    const matchFrom = !selectedFromHall || r.fromHallId === selectedFromHall;
    const matchTo = !selectedToHall || r.toHallId === selectedToHall;
    const matchManual = !onlyManual || r.manualMinutes !== undefined;

    return matchSearch && matchFrom && matchTo && matchManual;
  });

  const handleStartEdit = (routeId: string, currentVal: number) => {
    setEditingRouteId(routeId);
    setEditingMinutes(currentVal);
  };

  const handleSaveEdit = (routeId: string) => {
    updateRouteManualTime(routeId, editingMinutes);
    setEditingRouteId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Správa časů přesunů mezi halami
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kompletní matice pěších/vozových tras · Ruční úpravy mají přednost před automatickým výpočtem
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={recalculateAllRoutes}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs"
            title="Přepočítat automatické časy všech tras podle rychlosti a souřadnic"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>Přepočítat automatické trasy</span>
          </button>

          <button
            type="button"
            onClick={() => {
              generateSchedule({ preserveLockedItems: true });
              setActiveTab('schedule');
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-sm"
          >
            <CalendarRange className="w-3.5 h-3.5" />
            <span>Přepočítat plán s novými časy</span>
          </button>
        </div>
      </div>

      {/* Rules Notice */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Footprints className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            Výchozí rychlost přesunu: <strong>{settings.walkingSpeedKmh} km/h</strong> (režim {settings.transitMode === 'walking' ? 'pěší chůze' : 'jízdní kolo'}). Každý ručně upravený čas je v plánovacím algoritmu striktně dodržován.
          </span>
        </div>
        <span className="font-mono text-emerald-800 font-semibold shrink-0">
          Celkem {routes.length} tras v matici
        </span>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrovat haly..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedFromHall}
            onChange={(e) => setSelectedFromHall(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
          >
            <option value="">Výchozí hala (vše)</option>
            {halls.map(h => (
              <option key={h.id} value={h.id}>{h.code}</option>
            ))}
          </select>

          <span className="text-slate-400">➔</span>

          <select
            value={selectedToHall}
            onChange={(e) => setSelectedToHall(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
          >
            <option value="">Cílová hala (vše)</option>
            {halls.map(h => (
              <option key={h.id} value={h.id}>{h.code}</option>
            ))}
          </select>

          <label className="flex items-center gap-1.5 cursor-pointer ml-2 text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={onlyManual}
              onChange={(e) => setOnlyManual(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Pouze ručně upravené trasy</span>
          </label>
        </div>
      </div>

      {/* Routes Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="p-2.5">Trasa</th>
                <th className="p-2.5">Výchozí hala</th>
                <th className="p-2.5">Cílová hala</th>
                <th className="p-2.5">Vzdálenost</th>
                <th className="p-2.5">Automatický čas</th>
                <th className="p-2.5">Ručně upravený čas</th>
                <th className="p-2.5">Aktivně používaný čas</th>
                <th className="p-2.5">Způsob určení</th>
                <th className="p-2.5 text-right">Akce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRoutes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    Nenalezena žádná trasa odpovídající filtru.
                  </td>
                </tr>
              ) : (
                filteredRoutes.map(route => {
                  const fromH = halls.find(h => h.id === route.fromHallId);
                  const toH = halls.find(h => h.id === route.toHallId);
                  const isManual = route.manualMinutes !== undefined;
                  const activeMinutes = isManual ? route.manualMinutes! : route.autoMinutes;
                  const isEditing = editingRouteId === route.id;

                  return (
                    <tr key={route.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-2.5 font-mono font-bold text-slate-900">
                        {fromH?.code} ➔ {toH?.code}
                      </td>

                      <td className="p-2.5 text-slate-700">
                        <span className="font-semibold">{fromH?.code}</span> – {fromH?.name}
                      </td>

                      <td className="p-2.5 text-slate-700">
                        <span className="font-semibold">{toH?.code}</span> – {toH?.name}
                      </td>

                      <td className="p-2.5 font-mono text-slate-600">
                        {route.distanceMeters} m
                      </td>

                      <td className="p-2.5 font-mono text-slate-600">
                        {route.autoMinutes} min
                      </td>

                      {/* Manual time column */}
                      <td className="p-2.5">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={1}
                              max={120}
                              value={editingMinutes}
                              onChange={(e) => setEditingMinutes(Number(e.target.value))}
                              className="w-16 bg-white border border-emerald-600 rounded px-2 py-0.5 text-xs font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(route.id)}
                              className="p-1 text-emerald-700 hover:text-emerald-900"
                              title="Uložit"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className={`font-mono ${isManual ? 'font-bold text-amber-800' : 'text-slate-400'}`}>
                            {isManual ? `${route.manualMinutes} min` : '–'}
                          </span>
                        )}
                      </td>

                      {/* Active time column */}
                      <td className="p-2.5 font-mono font-bold text-slate-900">
                        {activeMinutes} min
                      </td>

                      {/* Method column */}
                      <td className="p-2.5">
                        {isManual ? (
                          <span className="text-amber-800 font-medium">
                            Manuální úprava
                          </span>
                        ) : (
                          <span className="text-slate-600">
                            Automatický výpočet
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isEditing && (
                            <button
                              type="button"
                              onClick={() => handleStartEdit(route.id, activeMinutes)}
                              className="px-2 py-0.5 rounded text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
                            >
                              Upravit
                            </button>
                          )}
                          {isManual && (
                            <button
                              type="button"
                              onClick={() => resetRouteToAuto(route.id)}
                              className="px-2 py-0.5 rounded text-xs text-slate-500 hover:text-rose-700 hover:bg-rose-50"
                              title="Vrátit na automatickou hodnotu"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
