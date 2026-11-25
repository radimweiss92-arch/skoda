import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileSpreadsheet, 
  Download, 
  Filter, 
  CheckCircle2, 
  FileText, 
  Calendar, 
  Clock, 
  Building, 
  Users 
} from 'lucide-react';
import { exportScheduleToExcel, ExportFilterOptions } from '../services/excelService';
import { ShiftType } from '../types';

export const ExportsView: React.FC = () => {
  const { 
    activities, 
    unassigned, 
    metrics, 
    halls, 
    technicians, 
    routes 
  } = useApp();

  const [filterDate, setFilterDate] = useState<string>('');
  const [filterTech, setFilterTech] = useState<string>('');
  const [filterHall, setFilterHall] = useState<string>('');
  const [filterShift, setFilterShift] = useState<string>('');

  const distinctDates = Array.from(new Set(activities.map(a => a.date))).sort();

  const handleExportFull = () => {
    const today = new Date().toISOString().split('T')[0];
    exportScheduleToExcel(
      activities,
      unassigned,
      metrics,
      halls,
      technicians,
      routes,
      undefined,
      `Skoda_Auto_Kompletni_Harmonogram_${today}.xlsx`
    );
  };

  const handleExportFiltered = () => {
    const filters: ExportFilterOptions = {};
    if (filterDate) filters.date = filterDate;
    if (filterTech) filters.technicianId = filterTech;
    if (filterHall) filters.hallId = filterHall;
    if (filterShift) filters.shift = filterShift as ShiftType;

    const today = new Date().toISOString().split('T')[0];
    exportScheduleToExcel(
      activities,
      unassigned,
      metrics,
      halls,
      technicians,
      routes,
      filters,
      `Skoda_Auto_Harmonogram_Vyber_${today}.xlsx`
    );
  };

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Export harmonogramu do Microsoft Excel (.xlsx)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Profesionální více-listový XLSX export pro mistry směn, plánování výroby a kontrolu kvality
          </p>
        </div>
      </div>

      {/* Main Download Options Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: 1-Click Full Export */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Kompletní harmonogram se všemi 8 listy
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Vygeneruje plný Excel sešit obsahující všechny naplánované směny, měřiče, haly, přesuny i statistiky dle podnikových standardů Škoda Auto.
              </p>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="font-semibold text-slate-900">Sešit obsahuje tyto samostatné listy:</div>
              <ul className="grid grid-cols-2 gap-1 text-[11px] list-disc pl-4 text-slate-600">
                <li>1. Kompletní harmonogram</li>
                <li>2. Plán podle měřičů</li>
                <li>3. Plán podle hal</li>
                <li>4. Ranní směna</li>
                <li>5. Odpolední směna</li>
                <li>6. Nezařazené požadavky</li>
                <li>7. Souhrnné statistiky</li>
                <li>8. Časy přesunů mezi halami</li>
              </ul>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportFull}
            className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs"
          >
            <Download className="w-4 h-4" />
            <span>Stáhnout kompletní sešit (.xlsx)</span>
          </button>
        </div>

        {/* Card 2: Filtered Custom Export */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-700" />
              <span>Filtrovaný dílčí export</span>
            </h2>
            <p className="text-xs text-slate-500">
              Exportujte pouze data pro konkrétní den, vybraného měřiče, halu nebo konkrétní směnu.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Vybraný den</label>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
              >
                <option value="">Všechny dny</option>
                {distinctDates.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Vybraný měřič</label>
              <select
                value={filterTech}
                onChange={(e) => setFilterTech(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
              >
                <option value="">Všichni měřiči</option>
                {technicians.map(t => (
                  <option key={t.id} value={t.id}>[{t.code}] {t.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Výrobní hala</label>
              <select
                value={filterHall}
                onChange={(e) => setFilterHall(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
              >
                <option value="">Všechny haly</option>
                {halls.map(h => (
                  <option key={h.id} value={h.id}>{h.code} – {h.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Směna</label>
              <select
                value={filterShift}
                onChange={(e) => setFilterShift(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
              >
                <option value="">Obě směny</option>
                <option value="morning">Pouze ranní směna</option>
                <option value="afternoon">Pouze odpolední směna</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportFiltered}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Stáhnout filtrovaný výběr (.xlsx)</span>
          </button>
        </div>

      </div>

    </div>
  );
};
