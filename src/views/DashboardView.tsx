import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  CalendarCheck, 
  AlertTriangle, 
  Clock, 
  Footprints, 
  Hourglass, 
  TrendingUp, 
  Building2, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    metrics, 
    requests, 
    activities, 
    unassigned, 
    halls, 
    technicians, 
    setActiveTab
  } = useApp();

  const measurementActs = activities.filter(a => a.type === 'measurement');
  const transitActs = activities.filter(a => a.type === 'transit');

  // Breakdown by hall
  const measurementsByHall = halls.map(hall => {
    const count = measurementActs.filter(a => a.hallId === hall.id).length;
    return {
      hall,
      count
    };
  }).filter(item => item.count > 0).sort((a, b) => b.count - a.count);

  // Breakdown by day
  const daysMap: Record<string, { morning: number; afternoon: number }> = {};
  measurementActs.forEach(act => {
    if (!daysMap[act.date]) {
      daysMap[act.date] = { morning: 0, afternoon: 0 };
    }
    if (act.shift === 'morning') daysMap[act.date].morning++;
    else daysMap[act.date].afternoon++;
  });
  const daysList = Object.entries(daysMap).sort(([a], [b]) => a.localeCompare(b));

  // Technician workloads
  const techWorkloads = technicians.map(tech => {
    const techActs = measurementActs.filter(a => a.technicianId === tech.id);
    const totalMinutes = techActs.reduce((acc, cur) => acc + cur.durationMinutes, 0);
    const transitMinutes = transitActs
      .filter(a => a.technicianId === tech.id)
      .reduce((acc, cur) => acc + cur.durationMinutes, 0);
    return {
      tech,
      measurementCount: techActs.length,
      measurementHours: Math.round(totalMinutes / 60 * 10) / 10,
      transitHours: Math.round(transitMinutes / 60 * 10) / 10,
      totalMinutes: totalMinutes + transitMinutes
    };
  });

  const totalTime = metrics.totalMeasurementMinutes + metrics.totalTransitMinutes + metrics.totalIdleMinutes;
  const measurementPct = totalTime > 0 ? Math.round((metrics.totalMeasurementMinutes / totalTime) * 100) : 0;
  const transitPct = totalTime > 0 ? Math.round((metrics.totalTransitMinutes / totalTime) * 100) : 0;
  const idlePct = totalTime > 0 ? Math.max(0, 100 - measurementPct - transitPct) : 0;

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Přehled stavu plánování měření
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Výrobní závod Mladá Boleslav · Aktuální kapacita, rozvrh směn a vytížení měřičů
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('planning')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-sm"
          >
            <span>Přejít na plánování</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Celkem požadavků */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Celkem požadavků</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {metrics.totalRequests}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>Zadáno vedoucími provozu</span>
          </div>
        </div>

        {/* Naplánovaná měření */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Naplánováno</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            {metrics.scheduledCount}
          </div>
          <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Úspěšně v harmonogramu</span>
          </div>
        </div>

        {/* Nezařazeno */}
        <div className={`bg-white border rounded-xl p-4 shadow-xs ${unassigned.length > 0 ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Nezařazeno</span>
            <AlertTriangle className={`w-4 h-4 ${unassigned.length > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
          </div>
          <div className={`text-2xl font-bold font-mono tabular-nums ${unassigned.length > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
            {metrics.unassignedCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {unassigned.length > 0 ? (
              <span className="text-amber-700 font-medium cursor-pointer hover:underline" onClick={() => setActiveTab('planning')}>
                Zobrazit příčiny a doporučení →
              </span>
            ) : (
              <span>100% pokrytí požadavků</span>
            )}
          </div>
        </div>

        {/* Vytížení měřičů */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Vytíženost optometristy</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {metrics.utilizationRate} %
          </div>
          <div className="text-xs text-slate-500 mt-1">
            <span>{technicians.filter(t => t.active).length} aktivní optometrista (měřič)</span>
          </div>
        </div>

      </div>

      {/* Trip & Schedule Status Summary Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">
                Výjezdní měření zraku zaměstnanců · Škoda Auto
              </h2>
              <p className="text-xs text-slate-300">
                Měřiči: {technicians.filter(t => t.active).map(t => t.name).join(' a ') || 'Jaromír Kolomazník'} · Plánovač optimalizuje přesuny po halách a časy měření
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('planning')}
              className="px-3.5 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>Upravit plán výjezdu</span>
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>Zobrazit harmonogram</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10 text-xs">
          <div className="bg-white/5 rounded-lg p-2.5">
            <span className="text-slate-400 block text-[11px]">Celkem zaměstnanců</span>
            <span className="text-base font-bold font-mono text-emerald-300">
              {requests.length} osob
            </span>
          </div>
          <div className="bg-white/5 rounded-lg p-2.5">
            <span className="text-slate-400 block text-[11px]">Naplánováno v rozvrhu</span>
            <span className="text-base font-bold font-mono text-sky-300">
              {activities.filter(a => a.type === 'measurement').length} vyšetření
            </span>
          </div>
          <div className="bg-white/5 rounded-lg p-2.5">
            <span className="text-slate-400 block text-[11px]">Zapojené výrobní haly</span>
            <span className="text-base font-bold font-mono text-indigo-300">
              {new Set(activities.filter(a => a.type === 'measurement').map(a => a.hallId)).size} hal
            </span>
          </div>
          <div className="bg-white/5 rounded-lg p-2.5">
            <span className="text-slate-400 block text-[11px]">Celkový čas měření</span>
            <span className="text-base font-bold font-mono text-amber-300">
              {Math.round(metrics.totalMeasurementMinutes / 60 * 10) / 10} hod
            </span>
          </div>
        </div>
      </div>

      {/* Time Allocation & Ratio Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Bilance pracovního času měřičů
            </h2>
            <p className="text-xs text-slate-500">
              Poměr čistého času měření, nezbytných přesunů mezi halami a rezervní kapacity
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" />
              <span>Měření: <strong className="font-mono tabular-nums">{Math.round(metrics.totalMeasurementMinutes / 60 * 10) / 10} h</strong> ({measurementPct}%)</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 rounded-sm bg-slate-400 inline-block" />
              <span>Přesuny: <strong className="font-mono tabular-nums">{Math.round(metrics.totalTransitMinutes / 60 * 10) / 10} h</strong> ({transitPct}%)</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 rounded-sm bg-slate-200 inline-block" />
              <span>Rezerva / Volno: <strong className="font-mono tabular-nums">{Math.round(metrics.totalIdleMinutes / 60 * 10) / 10} h</strong> ({idlePct}%)</span>
            </span>
          </div>
        </div>

        {/* Progress ratio segmented bar */}
        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
          <div 
            style={{ width: `${measurementPct}%` }} 
            className="bg-emerald-600 h-full transition-all duration-300" 
            title={`Měření: ${measurementPct}%`}
          />
          <div 
            style={{ width: `${transitPct}%` }} 
            className="bg-slate-400 h-full transition-all duration-300" 
            title={`Přesuny: ${transitPct}%`}
          />
          <div 
            style={{ width: `${idlePct}%` }} 
            className="bg-slate-200 h-full transition-all duration-300" 
            title={`Volná kapacita: ${idlePct}%`}
          />
        </div>
      </div>

      {/* Middle Grid: Technicians Workload & Hall Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Vytížení jednotlivých měřičů */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Vytíženost jednotlivých měřičů
            </h2>
            <button
              onClick={() => setActiveTab('technicians')}
              className="text-xs text-emerald-700 hover:underline font-medium"
            >
              Správa měřičů →
            </button>
          </div>

          <div className="space-y-3">
            {techWorkloads.map(({ tech, measurementCount, measurementHours, transitHours, totalMinutes }) => {
              const maxMinutes = 8 * 60; // 8h shift baseline
              const pct = Math.min(100, Math.round((totalMinutes / maxMinutes) * 100));

              return (
                <div key={tech.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{tech.name}</span>
                      <span className="text-[11px] font-mono text-slate-500">[{tech.code}]</span>
                    </div>
                    <div className="text-slate-600 font-mono tabular-nums">
                      {measurementCount} měření · {measurementHours} h práce ({transitHours} h přesun)
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-emerald-600 h-full" 
                      style={{ width: `${Math.min(100, (measurementHours * 60 / maxMinutes) * 100)}%` }}
                    />
                    <div 
                      className="bg-slate-400 h-full" 
                      style={{ width: `${Math.min(100, (transitHours * 60 / maxMinutes) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rozdělení měření podle hal */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Objem měření podle hal areálu
            </h2>
            <button
              onClick={() => setActiveTab('map')}
              className="text-xs text-emerald-700 hover:underline font-medium"
            >
              Mapa areálu →
            </button>
          </div>

          <div className="space-y-2.5">
            {measurementsByHall.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Zatím nejsou naplánována žádná měření.</p>
            ) : (
              measurementsByHall.map(({ hall, count }) => {
                const maxInHall = Math.max(...measurementsByHall.map(m => m.count), 1);
                const widthPct = Math.round((count / maxInHall) * 100);

                return (
                  <div key={hall.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 font-mono">{hall.code}</span>
                        <span className="text-slate-600 truncate max-w-[200px]">{hall.name}</span>
                      </div>
                      <span className="font-mono font-semibold text-slate-800 tabular-nums">
                        {count} měření
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-700 h-full rounded-full transition-all"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Days & Shift Distribution Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Rozložení měření v jednotlivých dnech a směnách
          </h2>
          <button
            onClick={() => setActiveTab('schedule')}
            className="text-xs text-emerald-700 hover:underline font-medium"
          >
            Otevřít harmonogram →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 px-3 font-semibold">Datum</th>
                <th className="py-2 px-3 font-semibold">Ranní směna (06:00–14:00)</th>
                <th className="py-2 px-3 font-semibold">Odpolední směna (14:00–22:00)</th>
                <th className="py-2 px-3 font-semibold">Celkem za den</th>
                <th className="py-2 px-3 font-semibold text-right">Stav kapacity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {daysList.map(([date, counts]) => {
                const totalDay = counts.morning + counts.afternoon;
                return (
                  <tr key={date} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-semibold font-mono text-slate-800">
                      {date}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono tabular-nums font-semibold text-emerald-800">
                        {counts.morning} měření
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono tabular-nums font-semibold text-sky-800">
                        {counts.afternoon} měření
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold font-mono text-slate-900 tabular-nums">
                      {totalDay} měření
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-emerald-700 font-medium">
                        Optimální zatížení
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
