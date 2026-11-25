import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Clock, 
  Calendar, 
  Building, 
  UserCheck2, 
  Lock, 
  Unlock, 
  Edit3, 
  Trash2, 
  History, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Footprints, 
  Coffee, 
  X,
  FileSpreadsheet,
  ArrowRight,
  Filter
} from 'lucide-react';
import { ScheduledActivity, ShiftType, ScheduleVersion } from '../types';
import { exportScheduleToExcel } from '../services/excelService';

export const ScheduleView: React.FC = () => {
  const { 
    activities, 
    updateScheduledActivity, 
    toggleActivityLock, 
    deleteActivity, 
    addManualActivity, 
    technicians, 
    halls, 
    unassigned, 
    metrics, 
    routes,
    versions, 
    restoreVersion,
    deleteVersion
  } = useApp();

  // 3 Modes: 'technicians' | 'days' | 'halls'
  const [viewMode, setViewMode] = useState<'technicians' | 'days' | 'halls'>('technicians');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [selectedHall, setSelectedHall] = useState<string>('all');

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ScheduledActivity | null>(null);

  // Edit Activity Form
  const [editForm, setEditForm] = useState<{
    date: string;
    shift: ShiftType;
    technicianId: string;
    startTime: string;
    endTime: string;
    employeeName: string;
    employeeId: string;
    department: string;
    hallId: string;
    durationMinutes: number;
    locked: boolean;
    notes: string;
  }>({
    date: '2026-11-10',
    shift: 'morning',
    technicianId: technicians[0]?.id || '',
    startTime: '06:00',
    endTime: '06:30',
    employeeName: '',
    employeeId: '',
    department: '',
    hallId: halls[0]?.id || '',
    durationMinutes: 30,
    locked: false,
    notes: ''
  });

  // Extract distinct dates
  const distinctDates = Array.from(new Set(activities.map(a => a.date))).sort();

  // Filter activities
  const filteredActivities = activities.filter(a => {
    const matchDay = selectedDay === 'all' || a.date === selectedDay;
    const matchShift = selectedShift === 'all' || a.shift === selectedShift;
    const matchHall = selectedHall === 'all' || a.hallId === selectedHall || a.fromHallId === selectedHall || a.toHallId === selectedHall;
    return matchDay && matchShift && matchHall;
  });

  // Conflict detection: detect if two activities overlap for the same technician
  const getConflicts = () => {
    const conflicts = new Set<string>();
    const byTechAndDate: Record<string, ScheduledActivity[]> = {};

    activities.forEach(a => {
      const key = `${a.technicianId}__${a.date}`;
      if (!byTechAndDate[key]) byTechAndDate[key] = [];
      byTechAndDate[key].push(a);
    });

    Object.values(byTechAndDate).forEach(group => {
      const sorted = [...group].sort((x, y) => x.startTime.localeCompare(y.startTime));
      for (let i = 0; i < sorted.length - 1; i++) {
        const curr = sorted[i];
        const next = sorted[i + 1];
        if (curr.endTime > next.startTime) {
          conflicts.add(curr.id);
          conflicts.add(next.id);
        }
      }
    });

    return conflicts;
  };

  const conflicts = getConflicts();

  // Handlers for modal
  const handleOpenEdit = (act: ScheduledActivity) => {
    setSelectedActivity(act);
    setEditForm({
      date: act.date,
      shift: act.shift,
      technicianId: act.technicianId,
      startTime: act.startTime,
      endTime: act.endTime,
      employeeName: act.employeeName || '',
      employeeId: act.employeeId || '',
      department: act.department || '',
      hallId: act.hallId || halls[0]?.id || '',
      durationMinutes: act.durationMinutes,
      locked: !!act.locked,
      notes: act.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;

    updateScheduledActivity(selectedActivity.id, {
      date: editForm.date,
      shift: editForm.shift,
      technicianId: editForm.technicianId,
      startTime: editForm.startTime,
      endTime: editForm.endTime,
      employeeName: editForm.employeeName,
      employeeId: editForm.employeeId,
      department: editForm.department,
      hallId: editForm.hallId,
      durationMinutes: Number(editForm.durationMinutes),
      locked: editForm.locked,
      notes: editForm.notes
    });

    setIsEditModalOpen(false);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    addManualActivity({
      type: 'measurement',
      date: editForm.date,
      shift: editForm.shift,
      technicianId: editForm.technicianId,
      startTime: editForm.startTime,
      endTime: editForm.endTime,
      durationMinutes: Number(editForm.durationMinutes),
      employeeName: editForm.employeeName,
      employeeId: editForm.employeeId,
      department: editForm.department,
      hallId: editForm.hallId,
      locked: true,
      notes: editForm.notes
    });
    setIsAddModalOpen(false);
  };

  const getHallCode = (id?: string) => {
    if (!id) return '';
    const h = halls.find(x => x.id === id);
    return h ? `${h.code} (${h.name})` : id;
  };

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Výsledný harmonogram měření
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Interaktivní rozvrh měření, časové osy, trasy přesunů a ruční editace s uzamykáním
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsHistoryModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs"
          >
            <History className="w-3.5 h-3.5 text-slate-600" />
            <span>Historie verzí ({versions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditForm({
                date: distinctDates[0] || '2026-11-10',
                shift: 'morning',
                technicianId: technicians[0]?.id || '',
                startTime: '08:00',
                endTime: '08:30',
                employeeName: '',
                employeeId: '',
                department: 'Výroba',
                hallId: halls[0]?.id || '',
                durationMinutes: 30,
                locked: true,
                notes: ''
              });
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Vložit měření ručně</span>
          </button>

          <button
            type="button"
            onClick={() => exportScheduleToExcel(activities, unassigned, metrics, halls, technicians, routes)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Exportovat plán do Excelu</span>
          </button>
        </div>
      </div>

      {/* Conflicts Banner if any exist */}
      {conflicts.size > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between text-xs text-rose-900">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Pozor:</strong> Zjištěna časová kolize nebo překryv u {conflicts.size} položek v harmonogramu. Zkontrolujte červeně zvýrazněné bloky.
            </span>
          </div>
        </div>
      )}

      {/* Control Tabs: Mode Switcher & Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        
        {/* 3 Modes Segmented Control */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode('technicians')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              viewMode === 'technicians'
                ? 'bg-white text-emerald-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            A. Podle měřičů (Gantt)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('days')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              viewMode === 'days'
                ? 'bg-white text-emerald-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            B. Podle dnů (Časová osa)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('halls')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              viewMode === 'halls'
                ? 'bg-white text-emerald-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            C. Podle hal
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Day filter */}
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
          >
            <option value="all">Všechny dny</option>
            {distinctDates.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Shift filter */}
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
          >
            <option value="all">Všechny směny</option>
            <option value="morning">Ranní směna</option>
            <option value="afternoon">Odpolední směna</option>
          </select>

          {/* Hall filter */}
          <select
            value={selectedHall}
            onChange={(e) => setSelectedHall(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
          >
            <option value="all">Všechny haly</option>
            {halls.map(h => (
              <option key={h.id} value={h.id}>{h.code} – {h.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Visual Legend */}
      <div className="flex items-center gap-6 text-xs text-slate-600 px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-emerald-600 border border-emerald-700 inline-block" />
          <span>Měření zaměstnance</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-slate-300 border border-slate-400 inline-block" />
          <span>Přesun mezi halami</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-300 inline-block" />
          <span>Přestávka / oběd</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          <span>Ručně uzamčeno</span>
        </span>
        {conflicts.size > 0 && (
          <span className="flex items-center gap-1.5 text-rose-700 font-medium">
            <span className="w-3.5 h-3.5 rounded bg-rose-500 border border-rose-600 inline-block" />
            <span>Časová kolize</span>
          </span>
        )}
      </div>

      {/* MODE A: Podle měřičů (Gantt & Cards) */}
      {viewMode === 'technicians' && (
        <div className="space-y-6">
          {technicians.map(tech => {
            const techActivities = filteredActivities
              .filter(a => a.technicianId === tech.id)
              .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

            if (techActivities.length === 0) return null;

            return (
              <div key={tech.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                
                {/* Tech Title */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-mono font-bold flex items-center justify-center text-xs">
                      {tech.code}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{tech.name}</h3>
                      <p className="text-[11px] text-slate-500">
                        {techActivities.filter(a => a.type === 'measurement').length} měření · Celkem {techActivities.length} bloků
                      </p>
                    </div>
                  </div>

                  <span className="text-xs text-slate-500 font-mono">
                    Směny: {tech.availableShifts.map(s => s === 'morning' ? 'Ranní' : 'Odpolední').join(', ')}
                  </span>
                </div>

                {/* Timeline Gantt Strip */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
                    <span>06:00</span>
                    <span>09:00</span>
                    <span>12:00</span>
                    <span>15:00</span>
                    <span>18:00</span>
                    <span>22:00</span>
                  </div>

                  {/* Activity Blocks */}
                  <div className="space-y-2">
                    {techActivities.map(act => {
                      const isConflict = conflicts.has(act.id);
                      const hall = halls.find(h => h.id === act.hallId);
                      const fromH = halls.find(h => h.id === act.fromHallId);
                      const toH = halls.find(h => h.id === act.toHallId);

                      if (act.type === 'transit') {
                        return (
                          <div
                            key={act.id}
                            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                              isConflict 
                                ? 'bg-rose-50 border-rose-300 text-rose-950' 
                                : 'bg-slate-100 border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Footprints className="w-3.5 h-3.5 text-slate-500" />
                              <span className="font-mono font-semibold">{act.startTime} – {act.endTime}</span>
                              <span className="text-slate-400">·</span>
                              <span className="font-medium">Přesun mezi halami:</span>
                              <span className="font-bold text-slate-900">
                                {fromH ? fromH.code : act.fromHallId} ➔ {toH ? toH.code : act.toHallId}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                              <span>{act.durationMinutes} min</span>
                              {act.distanceMeters && <span>({act.distanceMeters} m)</span>}
                            </div>
                          </div>
                        );
                      }

                      if (act.type === 'break') {
                        return (
                          <div
                            key={act.id}
                            className="p-2 rounded-lg border border-amber-200 bg-amber-50/60 text-xs flex items-center justify-between text-amber-900"
                          >
                            <div className="flex items-center gap-2">
                              <Coffee className="w-3.5 h-3.5 text-amber-600" />
                              <span className="font-mono font-semibold">{act.startTime} – {act.endTime}</span>
                              <span className="font-medium">{act.breakLabel || 'Přestávka měřiče'}</span>
                            </div>
                            <span className="text-[11px] font-mono text-amber-800">{act.durationMinutes} min</span>
                          </div>
                        );
                      }

                      // Measurement block
                      return (
                        <div
                          key={act.id}
                          onClick={() => handleOpenEdit(act)}
                          className={`p-3 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                            isConflict
                              ? 'bg-rose-50 border-rose-400 shadow-xs'
                              : 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-400 shadow-xs'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="font-mono font-bold text-emerald-950 text-xs">
                              {act.startTime} – {act.endTime}
                            </div>

                            <span className="text-slate-300">|</span>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-sm">
                                  {act.employeeName}
                                </span>
                                {act.employeeId && (
                                  <span className="text-[11px] font-mono text-slate-500">[{act.employeeId}]</span>
                                )}
                                {act.locked && (
                                  <span title="Ručně uzamčeno">
                                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-600 flex items-center gap-1.5 mt-0.5">
                                <span>{act.department}</span>
                                <span>·</span>
                                <span>Datum: <strong className="font-mono">{act.date}</strong></span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-mono font-bold text-slate-900 text-xs">
                                {hall ? hall.code : act.hallId}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {hall?.name}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 pl-2 border-l border-emerald-200" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => toggleActivityLock(act.id)}
                                className="p-1 text-slate-400 hover:text-slate-700"
                                title={act.locked ? 'Odemknout pro automatickou optimalizaci' : 'Uzamknout pro zachování času'}
                              >
                                {act.locked ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(act)}
                                className="p-1 text-slate-400 hover:text-slate-700"
                                title="Upravit měření"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteActivity(act.id)}
                                className="p-1 text-slate-400 hover:text-rose-600"
                                title="Odstranit"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* MODE B: Podle dnů */}
      {viewMode === 'days' && (
        <div className="space-y-6">
          {distinctDates.map(date => {
            const dayActivities = filteredActivities.filter(a => a.date === date);
            if (dayActivities.length === 0) return null;

            const morningActs = dayActivities.filter(a => a.shift === 'morning');
            const afternoonActs = dayActivities.filter(a => a.shift === 'afternoon');

            return (
              <div key={date} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-sm font-bold text-slate-900 font-mono">{date}</h3>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    Ranní: {morningActs.filter(a => a.type === 'measurement').length} měření · Odpolední: {afternoonActs.filter(a => a.type === 'measurement').length} měření
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Ranní směna */}
                  <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50/50">
                    <div className="font-semibold text-xs text-slate-800 flex items-center justify-between">
                      <span>Ranní směna (06:00 – 14:00)</span>
                      <span className="font-mono text-emerald-700">{morningActs.length} aktivit</span>
                    </div>

                    <div className="space-y-1.5">
                      {morningActs.length === 0 ? (
                        <p className="text-slate-400 text-xs py-2">Žádné aktivity</p>
                      ) : (
                        morningActs.map(act => {
                          const tech = technicians.find(t => t.id === act.technicianId);
                          const hall = halls.find(h => h.id === act.hallId);

                          return (
                            <div key={act.id} className="p-2 bg-white border border-slate-200 rounded text-xs flex items-center justify-between">
                              <div>
                                <span className="font-mono font-bold text-slate-900 mr-2">{act.startTime}–{act.endTime}</span>
                                {act.type === 'measurement' ? (
                                  <span className="font-medium text-emerald-900">{act.employeeName}</span>
                                ) : act.type === 'transit' ? (
                                  <span className="text-slate-500">Přesun hal</span>
                                ) : (
                                  <span className="text-amber-700">{act.breakLabel}</span>
                                )}
                              </div>
                              <div className="font-mono text-slate-500 text-[11px]">
                                {tech?.code} · {hall?.code || ''}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Odpolední směna */}
                  <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50/50">
                    <div className="font-semibold text-xs text-slate-800 flex items-center justify-between">
                      <span>Odpolední směna (14:00 – 22:00)</span>
                      <span className="font-mono text-sky-700">{afternoonActs.length} aktivit</span>
                    </div>

                    <div className="space-y-1.5">
                      {afternoonActs.length === 0 ? (
                        <p className="text-slate-400 text-xs py-2">Žádné aktivity</p>
                      ) : (
                        afternoonActs.map(act => {
                          const tech = technicians.find(t => t.id === act.technicianId);
                          const hall = halls.find(h => h.id === act.hallId);

                          return (
                            <div key={act.id} className="p-2 bg-white border border-slate-200 rounded text-xs flex items-center justify-between">
                              <div>
                                <span className="font-mono font-bold text-slate-900 mr-2">{act.startTime}–{act.endTime}</span>
                                {act.type === 'measurement' ? (
                                  <span className="font-medium text-sky-900">{act.employeeName}</span>
                                ) : act.type === 'transit' ? (
                                  <span className="text-slate-500">Přesun hal</span>
                                ) : (
                                  <span className="text-amber-700">{act.breakLabel}</span>
                                )}
                              </div>
                              <div className="font-mono text-slate-500 text-[11px]">
                                {tech?.code} · {hall?.code || ''}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODE C: Podle hal */}
      {viewMode === 'halls' && (
        <div className="space-y-6">
          {halls.map(hall => {
            const hallActivities = filteredActivities
              .filter(a => a.type === 'measurement' && a.hallId === hall.id)
              .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

            if (hallActivities.length === 0 && selectedHall !== 'all') return null;

            return (
              <div key={hall.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                      {hall.code}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{hall.name}</h3>
                    <span className="text-xs text-slate-400">· {hall.buildingType}</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-800 font-semibold">
                    {hallActivities.length} měření
                  </span>
                </div>

                {hallActivities.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">V této hale nejsou pro zvolené filtry plánována žádná měření.</p>
                ) : (
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                          <th className="p-2">Datum</th>
                          <th className="p-2">Čas</th>
                          <th className="p-2">Zaměstnanec</th>
                          <th className="p-2">Oddělení</th>
                          <th className="p-2">Měřič</th>
                          <th className="p-2">Trvání</th>
                          <th className="p-2">Poznámka</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {hallActivities.map(act => {
                          const tech = technicians.find(t => t.id === act.technicianId);
                          return (
                            <tr key={act.id} className="hover:bg-slate-50">
                              <td className="p-2 font-mono">{act.date}</td>
                              <td className="p-2 font-mono font-bold">{act.startTime} – {act.endTime}</td>
                              <td className="p-2 font-semibold text-slate-900">{act.employeeName}</td>
                              <td className="p-2 text-slate-600">{act.department}</td>
                              <td className="p-2 font-mono text-slate-700">{tech?.name} [{tech?.code}]</td>
                              <td className="p-2 font-mono">{act.durationMinutes} min</td>
                              <td className="p-2 text-slate-500">{act.notes || '-'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Edit Activity */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Ruční úprava položky harmonogramu
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Zaměstnanec</label>
                <input
                  type="text"
                  value={editForm.employeeName}
                  onChange={(e) => setEditForm({ ...editForm, employeeName: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Datum</label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Přiřazený měřič</label>
                  <select
                    value={editForm.technicianId}
                    onChange={(e) => setEditForm({ ...editForm, technicianId: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                  >
                    {technicians.map(t => (
                      <option key={t.id} value={t.id}>[{t.code}] {t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Čas od (HH:mm)</label>
                  <input
                    type="time"
                    value={editForm.startTime}
                    onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Čas do (HH:mm)</label>
                  <input
                    type="time"
                    value={editForm.endTime}
                    onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Výrobní hala</label>
                  <select
                    value={editForm.hallId}
                    onChange={(e) => setEditForm({ ...editForm, hallId: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                  >
                    {halls.map(h => (
                      <option key={h.id} value={h.id}>{h.code} – {h.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Trvání (min)</label>
                  <input
                    type="number"
                    value={editForm.durationMinutes}
                    onChange={(e) => setEditForm({ ...editForm, durationMinutes: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Lock Toggle */}
              <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.locked}
                  onChange={(e) => setEditForm({ ...editForm, locked: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex items-center gap-1.5 font-medium text-slate-800">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Uzamknout položku (ochránit před přepočtem)</span>
                </div>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm"
                >
                  Uložit změny
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: Add Manual Activity */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Vložit ruční měření do harmonogramu
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Jméno zaměstnance *</label>
                <input
                  type="text"
                  required
                  value={editForm.employeeName}
                  onChange={(e) => setEditForm({ ...editForm, employeeName: e.target.value })}
                  placeholder="Např. Jan Novák"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Datum</label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Přiřazený měřič</label>
                  <select
                    value={editForm.technicianId}
                    onChange={(e) => setEditForm({ ...editForm, technicianId: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                  >
                    {technicians.map(t => (
                      <option key={t.id} value={t.id}>[{t.code}] {t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Čas od</label>
                  <input
                    type="time"
                    value={editForm.startTime}
                    onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Čas do</label>
                  <input
                    type="time"
                    value={editForm.endTime}
                    onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Hala</label>
                  <select
                    value={editForm.hallId}
                    onChange={(e) => setEditForm({ ...editForm, hallId: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                  >
                    {halls.map(h => (
                      <option key={h.id} value={h.id}>{h.code} – {h.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Trvání (min)</label>
                  <input
                    type="number"
                    value={editForm.durationMinutes}
                    onChange={(e) => setEditForm({ ...editForm, durationMinutes: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm"
                >
                  Vložit do harmonogramu
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL 3: Version History (Section 9 requirement) */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Historie verzí harmonogramu
                </h3>
                <p className="text-xs text-slate-500">
                  Přehled dříve generovaných a uložených verzí s možností porovnání a obnovení.
                </p>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1 text-xs">
              {versions.length === 0 ? (
                <p className="text-slate-500 py-6 text-center">Zatím nebyly uloženy žádné verze.</p>
              ) : (
                versions.map((ver, idx) => (
                  <div key={ver.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{ver.versionName}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Vytvořeno: {new Date(ver.createdAt).toLocaleString('cs-CZ')} · {ver.createdBy}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Opravdu si přejete obnovit ${ver.versionName}? Současné neuložené změny budou nahrazeny.`)) {
                              restoreVersion(ver.id);
                              setIsHistoryModalOpen(false);
                            }
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
                        >
                          Obnovit tuto verzi
                        </button>
                        {versions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => deleteVersion(ver.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-[11px] text-slate-700 font-mono">
                      <div>Naplánováno: <strong>{ver.metrics.scheduledCount}</strong></div>
                      <div>Nezařazeno: <strong>{ver.metrics.unassignedCount}</strong></div>
                      <div>Vytížení: <strong>{ver.metrics.utilizationRate} %</strong></div>
                      <div>Měřičů: <strong>{ver.metrics.activeTechniciansCount}</strong></div>
                    </div>

                    {ver.note && (
                      <p className="text-[11px] text-slate-500 italic">{ver.note}</p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg text-xs"
              >
                Zavřít
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
