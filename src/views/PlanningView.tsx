import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CalendarRange, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Users, 
  Route, 
  Lock, 
  ArrowRight,
  Sparkles,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { ShiftType } from '../types';

export const PlanningView: React.FC = () => {
  const { 
    planningPeriod, 
    setPlanningPeriod, 
    technicians, 
    selectedTechIds, 
    setSelectedTechIds, 
    selectedShifts, 
    setSelectedShifts, 
    bufferMinutes, 
    setBufferMinutes, 
    generateSchedule, 
    requests, 
    unassigned, 
    metrics, 
    activities, 
    halls, 
    setActiveTab 
  } = useApp();

  const [preserveLocked, setPreserveLocked] = useState(true);
  const [isSolving, setIsSolving] = useState(false);
  const [solveSuccess, setSolveSuccess] = useState<boolean | null>(null);

  const lockedCount = activities.filter(a => a.type === 'measurement' && a.locked).length;

  const handleRunOptimizer = () => {
    setIsSolving(true);
    setSolveSuccess(null);

    setTimeout(() => {
      generateSchedule({
        preserveLockedItems: preserveLocked
      });
      setIsSolving(false);
      setSolveSuccess(true);
    }, 600);
  };

  const handleToggleTech = (id: string) => {
    setSelectedTechIds(
      selectedTechIds.includes(id)
        ? selectedTechIds.filter(x => x !== id)
        : [...selectedTechIds, id]
    );
  };

  const handleToggleShift = (shift: ShiftType) => {
    if (selectedShifts.includes(shift) && selectedShifts.length === 1) return; // keep at least 1
    setSelectedShifts(
      selectedShifts.includes(shift)
        ? selectedShifts.filter(s => s !== shift)
        : [...selectedShifts, shift]
    );
  };

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Automatické plánování výjezdu Škoda Auto
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Optimalizace harmonogramu pro Jaromíra Kolomazníka & Ondřeje Švébise napříč halami areálu Mladá Boleslav
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Zobrazit harmonogram výjezdu</span>
          </button>
        </div>
      </div>

      {/* Main Solver Setup Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Parameters Configuration */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarRange className="w-4 h-4 text-emerald-700" />
              <span>1. Termín týdenního výjezdu</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Zvolte dny jednorázového výjezdu (např. pondělí až pátek).
            </p>
          </div>

          {/* Dates & Shifts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Datum zahájení výjezdu</label>
              <input
                type="date"
                value={planningPeriod.start}
                onChange={(e) => setPlanningPeriod({ ...planningPeriod, start: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Datum ukončení výjezdu</label>
              <input
                type="date"
                value={planningPeriod.end}
                onChange={(e) => setPlanningPeriod({ ...planningPeriod, end: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Shifts Selection */}
          <div className="space-y-2 text-xs">
            <label className="font-semibold text-slate-700">Aktivní směny v plánu</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleToggleShift('morning')}
                className={`p-3 rounded-lg border text-left flex items-start justify-between transition-all ${
                  selectedShifts.includes('morning')
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-medium'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <div>
                  <div className="font-bold text-xs">Ranní směna</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">06:00 – 14:00</div>
                </div>
                {selectedShifts.includes('morning') && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleToggleShift('afternoon')}
                className={`p-3 rounded-lg border text-left flex items-start justify-between transition-all ${
                  selectedShifts.includes('afternoon')
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-medium'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <div>
                  <div className="font-bold text-xs">Odpolední směna</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">14:00 – 22:00</div>
                </div>
                {selectedShifts.includes('afternoon') && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </button>
            </div>
          </div>

          {/* Technicians Selection */}
          <div className="space-y-2 text-xs border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700">2. Kdo jede na výjezd měřit</label>
              <span className="text-[11px] text-slate-500 font-mono">
                Vybráno: {selectedTechIds.length} z {technicians.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {technicians.map(tech => {
                const isSelected = selectedTechIds.includes(tech.id);
                return (
                  <label
                    key={tech.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer text-xs transition-all ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-50/60 text-slate-900 font-medium ring-1 ring-emerald-300 shadow-2xs'
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleTech(tech.id)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-mono bg-emerald-700 text-white text-[11px] px-2 py-0.5 rounded font-bold">
                      {tech.code}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900">{tech.name}</div>
                      <div className="text-[11px] text-slate-500">{tech.title || 'Optometrista'}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Buffers and Locking options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-t border-slate-100 pt-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Časová rezerva mezi aktivitami (minuty)</label>
              <input
                type="number"
                min={0}
                max={30}
                value={bufferMinutes}
                onChange={(e) => setBufferMinutes(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
              <span className="text-[11px] text-slate-500 block">Bezpečnostní polštář pro zpoždění a administrativu.</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Ochrana ručních úprav</label>
              <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={preserveLocked}
                  onChange={(e) => setPreserveLocked(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-800 font-medium">Zachovat ručně uzamčené položky ({lockedCount})</span>
              </label>
              <span className="text-[11px] text-slate-500 block">Zamčená měření nebudou algoritmem přesunuta.</span>
            </div>
          </div>

          {/* Trigger Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isSolving || selectedTechIds.length === 0}
              onClick={handleRunOptimizer}
              className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
            >
              {isSolving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Propočítávám optimální trasy a směny...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Vygenerovat optimální plán měření</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Col: Solver Rules & Status */}
        <div className="space-y-4">
          
          {/* Optimization Priority Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">
              Optimalizační pravidla Škoda Auto
            </h3>

            <ol className="space-y-2 text-slate-600 list-decimal pl-4">
              <li>
                <strong className="text-slate-800">Dostupnost zaměstnanců:</strong> Měření je zařazeno výhradně do směny a data, které zadal manažer.
              </li>
              <li>
                <strong className="text-slate-800">Seskupování v halách:</strong> Algoritmus maximalizuje počet po sobě jdoucích měření v jedné hale (0 přesun).
              </li>
              <li>
                <strong className="text-slate-800">Skutečné trasy areálu:</strong> Čas přesunu je započítán dle matice pěších/vozových komunikací.
              </li>
              <li>
                <strong className="text-slate-800">Žádné překryvy:</strong> Každý měřič má v jednom čase nejvýše jednu aktivitu a garantované přestávky.
              </li>
            </ol>
          </div>

          {/* Result Card */}
          {solveSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Plán byl úspěšně vygenerován!</span>
              </div>

              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span>Naplánováno měření:</span>
                  <strong className="font-mono text-emerald-800">{metrics.scheduledCount}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Čas čistého měření:</span>
                  <strong className="font-mono text-slate-900">{Math.round(metrics.totalMeasurementMinutes / 60 * 10) / 10} h</strong>
                </div>
                <div className="flex justify-between">
                  <span>Čas přesunů mezi halami:</span>
                  <strong className="font-mono text-slate-900">{Math.round(metrics.totalTransitMinutes / 60 * 10) / 10} h</strong>
                </div>
                <div className="flex justify-between">
                  <span>Vytíženost kapacity:</span>
                  <strong className="font-mono text-slate-900">{metrics.utilizationRate} %</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('schedule')}
                className="w-full mt-2 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Prohlédnout harmonogram</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Unassigned Diagnostic Section (Section 7 requirement: "Pokud nelze všechny požadavky naplánovat...") */}
      {unassigned.length > 0 && (
        <div className="bg-white border border-amber-300 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Nezařazené požadavky ({unassigned.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Tyto požadavky nemohly být začleněny bez porušení časových či kapacitních pravidel.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-50 border-b border-amber-200 text-amber-950 font-semibold">
                  <th className="p-2.5">Zaměstnanec</th>
                  <th className="p-2.5">Hala</th>
                  <th className="p-2.5">Požadované dny</th>
                  <th className="p-2.5">Směny</th>
                  <th className="p-2.5">Konkrétní příčina</th>
                  <th className="p-2.5">Doporučené řešení</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unassigned.map((u, i) => {
                  const hall = halls.find(h => h.id === u.hallId);

                  return (
                    <tr key={i} className="hover:bg-amber-50/30">
                      <td className="p-2.5 font-semibold text-slate-900">{u.employeeName}</td>
                      <td className="p-2.5 font-mono font-bold">{hall ? hall.code : u.hallId}</td>
                      <td className="p-2.5 font-mono">{u.requestedDates.join(', ')}</td>
                      <td className="p-2.5">
                        {u.availableShifts.map(s => s === 'morning' ? 'Ranní' : 'Odpolední').join(' / ')}
                      </td>
                      <td className="p-2.5 text-rose-700 font-medium">{u.reason}</td>
                      <td className="p-2.5 text-emerald-800 font-medium">{u.suggestion}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
