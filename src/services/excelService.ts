import * as XLSX from 'xlsx';
import { 
  ScheduledActivity, 
  UnassignedDiagnostic, 
  ScheduleMetrics, 
  Hall, 
  Technician, 
  TransferRoute,
  MeasurementRequest,
  ShiftType 
} from '../types';

export interface ExportFilterOptions {
  date?: string;
  technicianId?: string;
  hallId?: string;
  shift?: ShiftType;
}

export function formatCzechDayName(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const days = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];
    return days[d.getDay()] || '';
  } catch {
    return '';
  }
}

export function formatShiftCzech(shift: ShiftType): string {
  return shift === 'morning' ? 'Ranní (06:00–14:00)' : 'Odpolední (14:00–22:00)';
}

export function exportScheduleToExcel(
  activities: ScheduledActivity[],
  unassigned: UnassignedDiagnostic[],
  metrics: ScheduleMetrics,
  halls: Hall[],
  technicians: Technician[],
  routes: TransferRoute[],
  filters?: ExportFilterOptions,
  fileName = 'Skoda_Auto_Harmonogram_Mereni.xlsx'
): void {
  const wb = XLSX.utils.book_new();

  const getHallCode = (id?: string) => {
    if (!id) return '';
    const h = halls.find(x => x.id === id);
    return h ? `${h.code} (${h.name})` : id;
  };

  const getTechName = (id: string) => {
    const t = technicians.find(x => x.id === id);
    return t ? `${t.name} [${t.code}]` : id;
  };

  // Filter activities if needed
  let filteredActivities = [...activities];
  if (filters?.date) {
    filteredActivities = filteredActivities.filter(a => a.date === filters.date);
  }
  if (filters?.technicianId) {
    filteredActivities = filteredActivities.filter(a => a.technicianId === filters.technicianId);
  }
  if (filters?.shift) {
    filteredActivities = filteredActivities.filter(a => a.shift === filters.shift);
  }
  if (filters?.hallId) {
    filteredActivities = filteredActivities.filter(a => a.hallId === filters.hallId || a.fromHallId === filters.hallId || a.toHallId === filters.hallId);
  }

  // Sort chronologically
  filteredActivities.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.shift !== b.shift) return a.shift === 'morning' ? -1 : 1;
    return a.startTime.localeCompare(b.startTime);
  });

  // Sheet 1: Kompletní harmonogram
  const mainRows = filteredActivities.map(act => {
    const opt = act.opticalRecord;
    const dioptrieStr = opt 
      ? `OD: ${opt.rightEyeSph} (cyl ${opt.rightEyeCyl || 0}), OS: ${opt.leftEyeSph} (cyl ${opt.leftEyeCyl || 0}), PD ${opt.pdDistanceMm || 63}mm`
      : '-';

    return {
      'Datum': act.date,
      'Den v týdnu': formatCzechDayName(act.date),
      'Směna': act.shift === 'morning' ? 'Ranní' : 'Odpolední',
      'Optometrista (měřič)': getTechName(act.technicianId),
      'Čas začátku': act.startTime,
      'Čas konce': act.endTime,
      'Typ aktivity': act.type === 'measurement' ? 'Vyšetření zraku zaměstnance' : act.type === 'transit' ? 'Přesun mezi halami' : 'Přestávka',
      'Jméno zaměstnance': act.employeeName || '-',
      'Osobní číslo': act.employeeId || '-',
      'Oddělení': act.department || '-',
      'Hala': act.hallId ? getHallCode(act.hallId) : '-',
      'Požadovaný typ brýlí': act.preferredCorrection ? (act.preferredCorrection === 'near_work' ? 'Na blízko / montáž' : act.preferredCorrection === 'distance' ? 'Na dálku' : act.preferredCorrection === 'progressive' ? 'Multifokální' : act.preferredCorrection === 'bifocal' ? 'Bifokální' : 'Ochranné obecné') : '-',
      'Stav výroby brýlí': act.glassesStatus === 'screened_ready_for_production' ? 'Změřeno - K zadání do výroby' : act.glassesStatus === 'in_production' ? 'Ve výrobě v optice' : act.glassesStatus === 'produced_ready_for_handover' ? 'Vyrobeno - K předání' : act.glassesStatus === 'handed_over' ? 'Předáno na pracovišti' : 'Čeká na měření',
      'Naměřené dioptrie': dioptrieStr,
      'Model bezpečnostní obruby': opt ? opt.frameModel : '-',
      'Materiál čoček': opt ? opt.lensMaterial : '-',
      'Výchozí hala': act.fromHallId ? getHallCode(act.fromHallId) : '-',
      'Cílová hala': act.toHallId ? getHallCode(act.toHallId) : '-',
      'Délka měření (min)': act.type === 'measurement' ? act.durationMinutes : '-',
      'Délka přesunu (min)': act.type === 'transit' ? act.durationMinutes : '-',
      'Poznámka': act.notes || act.breakLabel || (act.distanceMeters ? `Vzdálenost cca ${act.distanceMeters} m` : '')
    };
  });

  const wsMain = XLSX.utils.json_to_sheet(mainRows);
  XLSX.utils.book_append_sheet(wb, wsMain, 'Kompletní harmonogram');

  // Sheet 2: Plán podle měřičů
  const techSorted = [...filteredActivities].sort((a, b) => a.technicianId.localeCompare(b.technicianId) || a.startTime.localeCompare(b.startTime));
  const techRows = techSorted.map(act => ({
    'Měřič': getTechName(act.technicianId),
    'Datum': act.date,
    'Směna': act.shift === 'morning' ? 'Ranní' : 'Odpolední',
    'Čas od': act.startTime,
    'Čas do': act.endTime,
    'Aktivita': act.type === 'measurement' ? `Měření: ${act.employeeName}` : act.type === 'transit' ? `Přesun: ${getHallCode(act.fromHallId)} ➔ ${getHallCode(act.toHallId)}` : `Pauza: ${act.breakLabel}`,
    'Hala': act.hallId ? getHallCode(act.hallId) : '',
    'Doba (min)': act.durationMinutes,
    'Oddělení zaměstnance': act.department || ''
  }));
  const wsTech = XLSX.utils.json_to_sheet(techRows);
  XLSX.utils.book_append_sheet(wb, wsTech, 'Plán podle měřičů');

  // Sheet 3: Plán podle hal
  const hallSorted = [...filteredActivities.filter(a => a.type === 'measurement')].sort((a, b) => (a.hallId || '').localeCompare(b.hallId || ''));
  const hallRows = hallSorted.map(act => ({
    'Hala': getHallCode(act.hallId),
    'Datum': act.date,
    'Směna': act.shift === 'morning' ? 'Ranní' : 'Odpolední',
    'Čas': `${act.startTime} – ${act.endTime}`,
    'Zaměstnanec': act.employeeName,
    'Osobní číslo': act.employeeId,
    'Oddělení': act.department,
    'Přiřazený měřič': getTechName(act.technicianId),
    'Délka (min)': act.durationMinutes,
    'Poznámka': act.notes || ''
  }));
  const wsHall = XLSX.utils.json_to_sheet(hallRows);
  XLSX.utils.book_append_sheet(wb, wsHall, 'Plán podle hal');

  // Sheet 4: Ranní směna
  const morningRows = filteredActivities.filter(a => a.shift === 'morning').map(act => ({
    'Datum': act.date,
    'Měřič': getTechName(act.technicianId),
    'Čas': `${act.startTime} – ${act.endTime}`,
    'Typ': act.type === 'measurement' ? 'Měření' : act.type === 'transit' ? 'Přesun' : 'Pauza',
    'Zaměstnanec': act.employeeName || '-',
    'Hala': act.hallId ? getHallCode(act.hallId) : (act.toHallId ? `${getHallCode(act.fromHallId)} ➔ ${getHallCode(act.toHallId)}` : '-'),
    'Trvání (min)': act.durationMinutes
  }));
  const wsMorning = XLSX.utils.json_to_sheet(morningRows);
  XLSX.utils.book_append_sheet(wb, wsMorning, 'Ranní směna');

  // Sheet 5: Odpolední směna
  const afternoonRows = filteredActivities.filter(a => a.shift === 'afternoon').map(act => ({
    'Datum': act.date,
    'Měřič': getTechName(act.technicianId),
    'Čas': `${act.startTime} – ${act.endTime}`,
    'Typ': act.type === 'measurement' ? 'Měření' : act.type === 'transit' ? 'Přesun' : 'Pauza',
    'Zaměstnanec': act.employeeName || '-',
    'Hala': act.hallId ? getHallCode(act.hallId) : (act.toHallId ? `${getHallCode(act.fromHallId)} ➔ ${getHallCode(act.toHallId)}` : '-'),
    'Trvání (min)': act.durationMinutes
  }));
  const wsAfternoon = XLSX.utils.json_to_sheet(afternoonRows);
  XLSX.utils.book_append_sheet(wb, wsAfternoon, 'Odpolední směna');

  // Sheet 6: Nezařazené požadavky
  const unassignedRows = unassigned.map(u => ({
    'ID požadavku': u.requestId,
    'Zaměstnanec': u.employeeName,
    'Hala': getHallCode(u.hallId),
    'Dostupná data': u.requestedDates.join(', '),
    'Dostupné směny': u.availableShifts.map(s => s === 'morning' ? 'Ranní' : 'Odpolední').join(', '),
    'Důvod nezařazení': u.reason,
    'Doporučené řešení': u.suggestion
  }));
  const wsUnassigned = XLSX.utils.json_to_sheet(unassignedRows.length > 0 ? unassignedRows : [{ 'Stav': 'Všechny požadavky byly úspěšně naplánovány.' }]);
  XLSX.utils.book_append_sheet(wb, wsUnassigned, 'Nezařazené požadavky');

  // Sheet 7: Souhrnné statistiky
  const statsRows = [
    { 'Ukazatel': 'Celkový počet evidovaných požadavků', 'Hodnota': metrics.totalRequests, 'Jednotka': 'požadavků' },
    { 'Ukazatel': 'Úspěšně naplánovaná měření', 'Hodnota': metrics.scheduledCount, 'Jednotka': 'zaměstnanců' },
    { 'Ukazatel': 'Nezařazené požadavky', 'Hodnota': metrics.unassignedCount, 'Jednotka': 'požadavků' },
    { 'Ukazatel': 'Počet aktivních měřičů v plánu', 'Hodnota': metrics.activeTechniciansCount, 'Jednotka': 'osob' },
    { 'Ukazatel': 'Celkový čas měření', 'Hodnota': `${Math.round(metrics.totalMeasurementMinutes / 60 * 10) / 10} h (${metrics.totalMeasurementMinutes} min)`, 'Jednotka': 'hodin' },
    { 'Ukazatel': 'Celkový čas přesunů mezi halami', 'Hodnota': `${Math.round(metrics.totalTransitMinutes / 60 * 10) / 10} h (${metrics.totalTransitMinutes} min)`, 'Jednotka': 'hodin' },
    { 'Ukazatel': 'Celkový volný čas (prostoje)', 'Hodnota': `${Math.round(metrics.totalIdleMinutes / 60 * 10) / 10} h (${metrics.totalIdleMinutes} min)`, 'Jednotka': 'hodin' },
    { 'Ukazatel': 'Celková efektivita / vytížení měřičů', 'Hodnota': `${metrics.utilizationRate} %`, 'Jednotka': '%' }
  ];
  const wsStats = XLSX.utils.json_to_sheet(statsRows);
  XLSX.utils.book_append_sheet(wb, wsStats, 'Souhrnné statistiky');

  // Sheet 8: Přehled časů přesunů mezi halami
  const routeRows = routes.map(r => {
    const fromH = halls.find(h => h.id === r.fromHallId);
    const toH = halls.find(h => h.id === r.toHallId);
    return {
      'Trasa': `${fromH ? fromH.code : r.fromHallId} ➔ ${toH ? toH.code : r.toHallId}`,
      'Výchozí hala': fromH ? `${fromH.code} – ${fromH.name}` : r.fromHallId,
      'Cílová hala': toH ? `${toH.code} – ${toH.name}` : r.toHallId,
      'Vzdálenost': `${r.distanceMeters} m`,
      'Automatický čas': `${r.autoMinutes} min`,
      'Ručně upravený čas': r.manualMinutes !== undefined ? `${r.manualMinutes} min` : '-',
      'Aktivně používaný čas': `${r.manualMinutes !== undefined ? r.manualMinutes : r.autoMinutes} min`,
      'Způsob určení': r.manualMinutes !== undefined ? 'Manuální úprava' : 'Automatický výpočet trasy'
    };
  });
  const wsRoutes = XLSX.utils.json_to_sheet(routeRows);
  XLSX.utils.book_append_sheet(wb, wsRoutes, 'Přehled časů přesunů');

  // Write file
  XLSX.writeFile(wb, fileName);
}

// Excel / CSV Import Parser
export interface ImportPreviewItem {
  valid: boolean;
  errors: string[];
  data: Partial<MeasurementRequest>;
  rawRow: Record<string, any>;
}

export function parseEmployeeFile(
  fileData: ArrayBuffer,
  halls: Hall[],
  columnMapping?: Record<string, string>
): { preview: ImportPreviewItem[]; validCount: number; errorCount: number; duplicateCount: number } {
  const wb = XLSX.read(fileData, { type: 'array' });
  const firstSheetName = wb.SheetNames[0];
  const ws = wb.Sheets[firstSheetName];
  const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

  const preview: ImportPreviewItem[] = [];
  const seenEmployees = new Set<string>();
  let validCount = 0;
  let errorCount = 0;
  let duplicateCount = 0;

  for (let idx = 0; idx < rawJson.length; idx++) {
    const row = rawJson[idx];
    const errors: string[] = [];

    // Helper to find column case-insensitively or via mapping
    const getVal = (fieldKey: string, synonyms: string[]): string => {
      if (columnMapping && columnMapping[fieldKey] && row[columnMapping[fieldKey]] !== undefined) {
        return String(row[columnMapping[fieldKey]]).trim();
      }
      for (const s of synonyms) {
        const foundKey = Object.keys(row).find(k => k.trim().toLowerCase() === s.toLowerCase());
        if (foundKey && row[foundKey] !== undefined) {
          return String(row[foundKey]).trim();
        }
      }
      return '';
    };

    const employeeName = getVal('employeeName', ['jméno a příjmení', 'jméno', 'zaměstnanec', 'name', 'employee']);
    const employeeId = getVal('employeeId', ['osobní číslo', 'identifikační číslo', 'id', 'osobní', 'personal number']);
    const department = getVal('department', ['oddělení', 'tým', 'department', 'středisko']) || 'Výrobní linka';
    const managerName = getVal('managerName', ['manažer', 'vedoucí', 'manager', 'mistr']) || 'Interní zadání';
    const hallStr = getVal('hallId', ['hala', 'budova', 'hall', 'místo', 'lokalita']);
    const datesStr = getVal('dates', ['datum', 'termín', 'date', 'dny']);
    const shiftStr = getVal('shift', ['směna', 'dostupnost', 'shift', 'směny']).toLowerCase();
    const notes = getVal('notes', ['poznámka', 'omezení', 'note', 'komentář']);

    if (!employeeName) {
      errors.push('Chybí jméno zaměstnance');
    }

    // Hall resolution
    let matchedHallId = '';
    if (hallStr) {
      const match = halls.find(h => 
        h.code.toLowerCase() === hallStr.toLowerCase() ||
        h.name.toLowerCase().includes(hallStr.toLowerCase())
      );
      if (match) {
        matchedHallId = match.id;
      } else {
        errors.push(`Neznámá hala: "${hallStr}"`);
      }
    } else {
      errors.push('Chybí označení haly');
    }

    // Shifts parsing
    const shifts: ShiftType[] = [];
    if (shiftStr.includes('rann') || shiftStr.includes('morn') || shiftStr.includes('1') || shiftStr === 'r') {
      shifts.push('morning');
    }
    if (shiftStr.includes('odpoled') || shiftStr.includes('aft') || shiftStr.includes('2') || shiftStr === 'o') {
      shifts.push('afternoon');
    }
    if (shifts.length === 0) {
      // Default both if not specified or contains "obě" / "vše"
      shifts.push('morning');
    }

    // Dates parsing
    let dates: string[] = [];
    if (datesStr) {
      const parts = datesStr.split(/[,;\s]+/);
      for (const p of parts) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(p)) {
          dates.push(p);
        } else if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(p)) {
          const [d, m, y] = p.split('.');
          dates.push(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
        }
      }
    }
    if (dates.length === 0) {
      // Default to next working day
      dates = ['2026-11-10'];
    }

    // Duplicate check
    const dupKey = `${employeeName.toLowerCase()}__${matchedHallId}`;
    if (seenEmployees.has(dupKey)) {
      errors.push('Možná duplicita: zaměstnanec v této hale již existuje v importu');
      duplicateCount++;
    } else {
      seenEmployees.add(dupKey);
    }

    const isValid = errors.length === 0;
    if (isValid) validCount++; else errorCount++;

    preview.push({
      valid: isValid,
      errors,
      data: {
        id: `import-${Date.now()}-${idx}`,
        employeeName,
        employeeId: employeeId || undefined,
        department,
        managerName,
        hallId: matchedHallId,
        requestedDates: dates,
        availableShifts: shifts,
        durationMinutes: 25,
        notes: notes || undefined,
        currentGlassesUser: false,
        preferredCorrection: 'safety_general',
        workplaceVisualHazard: 'Mechanické riziko výroby',
        glassesStatus: 'pending_screening',
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      rawRow: row
    });
  }

  return { preview, validCount, errorCount, duplicateCount };
}
