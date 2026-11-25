import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  UserCheck2, 
  FileSpreadsheet, 
  CalendarRange, 
  Upload
} from 'lucide-react';
import { exportScheduleToExcel } from '../services/excelService';

export const Header: React.FC = () => {
  const { 
    activities, 
    unassigned, 
    metrics, 
    halls, 
    technicians, 
    routes,
    setActiveTab,
    campaignName
  } = useApp();

  const handleQuickExport = () => {
    exportScheduleToExcel(
      activities,
      unassigned,
      metrics,
      halls,
      technicians,
      routes,
      undefined,
      `Skoda_Auto_Harmonogram_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  const activeTech = technicians.find(t => t.active) || technicians[0];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand & Site Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold tracking-wider text-base shadow-sm">
            ŠA
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 leading-tight">
              ŠKODA AUTO
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Měření zraku & Výroba pracovních dioptrických brýlí · Mladá Boleslav
            </span>
          </div>
        </div>

        {/* Zone 2: Campaign & Optometrist status badge & live counters */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Active Campaign badge */}
          <div 
            onClick={() => setActiveTab('settings')}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100/90 hover:bg-slate-200/90 border border-slate-300 rounded-lg text-xs cursor-pointer text-slate-700 transition-colors"
            title="Kliknutím otevřete správu a archiv výjezdů v Nastavení"
          >
            <CalendarRange className="w-3.5 h-3.5 text-emerald-700" />
            <span className="font-semibold text-slate-900">{campaignName}</span>
          </div>

          {/* Active Optometrist indicator badge */}
          <div 
            onClick={() => setActiveTab('technicians')}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs cursor-pointer hover:bg-emerald-100/70 transition-colors"
            title="Kliknutím zobrazíte detail měřičů výjezdu"
          >
            <UserCheck2 className="w-3.5 h-3.5 text-emerald-700" />
            <span className="text-slate-600">Měřiči na výjezdu:</span>
            <span className="font-bold text-emerald-900">
              {technicians.filter(t => t.active).map(t => t.name.split(' ')[1] || t.name).join(' & ') || 'J. Kolomazník'}
            </span>
            <span className="font-mono text-[10px] bg-emerald-200/80 text-emerald-900 px-1.5 py-0.2 rounded font-semibold">
              {technicians.filter(t => t.active).length} aktivní
            </span>
          </div>

          {/* Quick status counters */}
          <div className="hidden lg:flex items-center gap-4 text-xs text-slate-600 pl-3 border-l border-slate-200">
            <span className="flex items-center gap-1.5" title="Naplánovaná vyšetření">
              <span className="font-semibold text-slate-900 font-mono tabular-nums">
                {activities.filter(a => a.type === 'measurement').length}
              </span>
              <span>naplánováno</span>
            </span>

            {unassigned.length > 0 && (
              <span className="flex items-center gap-1.5 text-amber-700 font-medium" title="Čeká na zařazení do plánu">
                <span className="font-semibold font-mono tabular-nums">{unassigned.length}</span>
                <span>nezařazeno</span>
              </span>
            )}
          </div>
        </div>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap shadow-2xs"
            title="Nahrát Excel od vedoucích obdržený e-mailem"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Nahrát Excel z e-mailu</span>
          </button>

          <button
            type="button"
            onClick={handleQuickExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap"
            title="Stáhnout kompletní harmonogram do více-listového Excelu"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Excel export (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('planning')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-sm whitespace-nowrap"
          >
            <CalendarRange className="w-3.5 h-3.5" />
            <span>Spustit plánování</span>
          </button>
        </div>

      </div>
    </header>
  );
};
