import { 
  Technician, 
  MeasurementRequest, 
  Hall, 
  TransferRoute, 
  ScheduledActivity, 
  UnassignedDiagnostic, 
  ScheduleMetrics,
  ShiftType,
  AppSettings
} from '../types';

export interface OptimizationOptions {
  periodDates: string[]; // e.g. ['2026-11-10', '2026-11-11']
  selectedTechnicianIds: string[];
  activeShifts: ShiftType[];
  bufferMinutes: number; // e.g. 5
  preserveLockedItems?: boolean;
  existingActivities?: ScheduledActivity[];
}

export interface OptimizationResult {
  activities: ScheduledActivity[];
  unassigned: UnassignedDiagnostic[];
  metrics: ScheduleMetrics;
}

// Utility: Convert "HH:mm" to minutes from midnight
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Utility: Convert minutes from midnight to "HH:mm"
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = Math.floor(minutes % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Utility: Get active transit time in minutes between two halls
export function getTransitMinutes(fromHallId: string, toHallId: string, routes: TransferRoute[]): { minutes: number, distanceMeters: number } {
  if (fromHallId === toHallId) return { minutes: 0, distanceMeters: 0 };
  
  const route = routes.find(r => r.fromHallId === fromHallId && r.toHallId === toHallId);
  if (route) {
    const mins = route.manualMinutes !== undefined ? route.manualMinutes : route.autoMinutes;
    return { minutes: mins, distanceMeters: route.distanceMeters };
  }
  
  // Symmetrical fallback
  const rev = routes.find(r => r.fromHallId === toHallId && r.toHallId === fromHallId);
  if (rev) {
    const mins = rev.manualMinutes !== undefined ? rev.manualMinutes : rev.autoMinutes;
    return { minutes: mins, distanceMeters: rev.distanceMeters };
  }
  
  // Default fallback if route not in table (never assume 0! Prompt rule: "Aplikace nesmí předpokládat nulový čas přesunu")
  return { minutes: 10, distanceMeters: 800 };
}

export function runOptimization(
  requests: MeasurementRequest[],
  technicians: Technician[],
  halls: Hall[],
  routes: TransferRoute[],
  settings: AppSettings,
  options: OptimizationOptions
): OptimizationResult {
  const {
    periodDates,
    selectedTechnicianIds,
    activeShifts,
    bufferMinutes = 5,
    preserveLockedItems = true,
    existingActivities = []
  } = options;

  const activeTechnicians = technicians.filter(t => t.active && selectedTechnicianIds.includes(t.id));
  const newActivities: ScheduledActivity[] = [];
  const scheduledRequestIds = new Set<string>();
  const unassigned: UnassignedDiagnostic[] = [];

  // Step 1: Preserve locked items if requested
  if (preserveLockedItems && existingActivities.length > 0) {
    for (const act of existingActivities) {
      if (act.type === 'measurement' && act.locked) {
        newActivities.push(act);
        if (act.requestId) {
          scheduledRequestIds.add(act.requestId);
        }
      }
    }
  }

  // Filter requests that are not yet scheduled
  const pendingRequests = requests.filter(r => !scheduledRequestIds.has(r.id));

  // Sort pending requests by urgency / constraint tightness
  // 1. Fewer available dates first
  // 2. Single shift preference before flexible both-shift
  // 3. Hall clustering priority
  const sortedRequests = [...pendingRequests].sort((a, b) => {
    if (a.requestedDates.length !== b.requestedDates.length) {
      return a.requestedDates.length - b.requestedDates.length;
    }
    if (a.availableShifts.length !== b.availableShifts.length) {
      return a.availableShifts.length - b.availableShifts.length;
    }
    return 0;
  });

  // Schedule by date and shift
  for (const date of periodDates) {
    for (const shift of activeShifts) {
      // Find technicians available for this date and shift
      const shiftTechs = activeTechnicians.filter(t => 
        t.workDays.includes(date) && 
        t.availableShifts.includes(shift)
      );

      if (shiftTechs.length === 0) continue;

      // Group candidate requests for this date & shift
      const candidateRequests = sortedRequests.filter(r => 
        !scheduledRequestIds.has(r.id) &&
        r.requestedDates.includes(date) &&
        r.availableShifts.includes(shift)
      );

      if (candidateRequests.length === 0) continue;

      // Organize by Hall for clustering
      const requestsByHall: Map<string, MeasurementRequest[]> = new Map();
      for (const req of candidateRequests) {
        const list = requestsByHall.get(req.hallId) || [];
        list.push(req);
        requestsByHall.set(req.hallId, list);
      }

      // Track technician timeline state for this date & shift
      interface TechState {
        tech: Technician;
        currentTime: number; // in minutes from midnight
        shiftEnd: number;
        currentHallId: string | null;
        breaks: { start: number; end: number; label: string }[];
      }

      const techStates: TechState[] = shiftTechs.map(tech => {
        const hours = shift === 'morning' ? tech.shiftHours.morning : tech.shiftHours.afternoon;
        const shiftStart = timeToMinutes(hours.start);
        const shiftEnd = timeToMinutes(hours.end);

        // Filter breaks for this shift
        const techBreaks = tech.breaks
          .map(b => ({
            start: timeToMinutes(b.start),
            end: timeToMinutes(b.end),
            label: b.label
          }))
          .filter(b => b.start >= shiftStart && b.end <= shiftEnd);

        // Check if technician already has locked activities on this date & shift
        const lockedActs = newActivities.filter(a => 
          a.technicianId === tech.id && 
          a.date === date && 
          a.shift === shift && 
          a.locked
        ).sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

        let currentHall: string | null = null;
        let currentTime = shiftStart;

        if (lockedActs.length > 0) {
          const lastLocked = lockedActs[lockedActs.length - 1];
          currentTime = Math.max(currentTime, timeToMinutes(lastLocked.endTime) + bufferMinutes);
          currentHall = lastLocked.hallId || null;
        }

        return {
          tech,
          currentTime,
          shiftEnd,
          currentHallId: currentHall,
          breaks: techBreaks
        };
      });

      // While there are candidate requests and available technician time
      let madeProgress = true;
      while (madeProgress) {
        madeProgress = false;

        for (const state of techStates) {
          // Check if technician reached end of shift
          if (state.currentTime >= state.shiftEnd - 20) continue;

          // Check for break intersection
          for (const b of state.breaks) {
            if (state.currentTime >= b.start && state.currentTime < b.end) {
              // Technician is in break, insert break activity if not already present
              const breakId = `brk-${state.tech.id}-${date}-${shift}-${b.start}`;
              if (!newActivities.some(a => a.id === breakId)) {
                newActivities.push({
                  id: breakId,
                  type: 'break',
                  date,
                  shift,
                  technicianId: state.tech.id,
                  startTime: minutesToTime(b.start),
                  endTime: minutesToTime(b.end),
                  durationMinutes: b.end - b.start,
                  breakLabel: b.label
                });
              }
              state.currentTime = b.end;
            }
          }

          // Pick best next request:
          // 1. Prefer request in CURRENT hall (0 transit time!)
          // 2. Otherwise prefer hall with minimal transit time from current hall
          let chosenRequest: MeasurementRequest | null = null;
          let travelTime = 0;
          let travelDist = 0;
          let nextHallId = state.currentHallId;

          if (state.currentHallId && requestsByHall.has(state.currentHallId)) {
            const sameHallList = requestsByHall.get(state.currentHallId)!;
            const availableInSameHall = sameHallList.filter(r => !scheduledRequestIds.has(r.id));
            if (availableInSameHall.length > 0) {
              chosenRequest = availableInSameHall[0];
              travelTime = 0;
              travelDist = 0;
              nextHallId = state.currentHallId;
            }
          }

          // If no request in same hall, search among other halls with pending requests
          if (!chosenRequest) {
            let shortestTravel = Infinity;
            let bestCandidate: MeasurementRequest | null = null;
            let bestDistance = 0;
            let targetHallId = '';

            for (const [hallId, reqs] of requestsByHall.entries()) {
              const pending = reqs.filter(r => !scheduledRequestIds.has(r.id));
              if (pending.length === 0) continue;

              const transitInfo = state.currentHallId 
                ? getTransitMinutes(state.currentHallId, hallId, routes)
                : { minutes: 0, distanceMeters: 0 }; // Starting point

              if (transitInfo.minutes < shortestTravel) {
                shortestTravel = transitInfo.minutes;
                bestCandidate = pending[0];
                bestDistance = transitInfo.distanceMeters;
                targetHallId = hallId;
              }
            }

            if (bestCandidate) {
              chosenRequest = bestCandidate;
              travelTime = shortestTravel;
              travelDist = bestDistance;
              nextHallId = targetHallId;
            }
          }

          if (!chosenRequest) continue;

          const duration = chosenRequest.durationMinutes || settings.defaultMeasurementMinutes;
          let potentialStartTime = state.currentTime;

          // If travel is required, add transit time
          if (travelTime > 0 && state.currentHallId && state.currentHallId !== nextHallId) {
            potentialStartTime += travelTime;
          }

          let potentialEndTime = potentialStartTime + duration;

          // Check if measurement overlaps with a technician break
          for (const b of state.breaks) {
            if (
              (potentialStartTime < b.end && potentialEndTime > b.start) ||
              (potentialStartTime >= b.start && potentialStartTime < b.end)
            ) {
              // Delay after break
              const delay = b.end - potentialStartTime;
              potentialStartTime = b.end;
              potentialEndTime = potentialStartTime + duration;
              
              // Also record the break block
              const breakId = `brk-${state.tech.id}-${date}-${shift}-${b.start}`;
              if (!newActivities.some(a => a.id === breakId)) {
                newActivities.push({
                  id: breakId,
                  type: 'break',
                  date,
                  shift,
                  technicianId: state.tech.id,
                  startTime: minutesToTime(b.start),
                  endTime: minutesToTime(b.end),
                  durationMinutes: b.end - b.start,
                  breakLabel: b.label
                });
              }
            }
          }

          // Check if it fits within shift hours
          if (potentialEndTime <= state.shiftEnd) {
            // If there was a transfer, insert transit activity
            if (travelTime > 0 && state.currentHallId && state.currentHallId !== nextHallId) {
              const transitStartTime = state.currentTime;
              const transitEndTime = transitStartTime + travelTime;
              newActivities.push({
                id: `trn-${state.tech.id}-${date}-${shift}-${transitStartTime}`,
                type: 'transit',
                date,
                shift,
                technicianId: state.tech.id,
                startTime: minutesToTime(transitStartTime),
                endTime: minutesToTime(transitEndTime),
                durationMinutes: travelTime,
                fromHallId: state.currentHallId,
                toHallId: nextHallId || undefined,
                distanceMeters: travelDist
              });
            }

            // Insert measurement activity
            newActivities.push({
              id: `act-${chosenRequest.id}-${date}-${shift}`,
              type: 'measurement',
              date,
              shift,
              technicianId: state.tech.id,
              startTime: minutesToTime(potentialStartTime),
              endTime: minutesToTime(potentialEndTime),
              durationMinutes: duration,
              requestId: chosenRequest.id,
              employeeName: chosenRequest.employeeName,
              employeeId: chosenRequest.employeeId,
              department: chosenRequest.department,
              hallId: chosenRequest.hallId,
              preferredCorrection: chosenRequest.preferredCorrection,
              glassesStatus: chosenRequest.glassesStatus,
              opticalRecord: chosenRequest.opticalRecord,
              locked: false,
              notes: chosenRequest.notes
            });

            scheduledRequestIds.add(chosenRequest.id);
            state.currentTime = potentialEndTime + bufferMinutes;
            state.currentHallId = nextHallId;
            madeProgress = true;
          }
        }
      }
    }
  }

  // Diagnostic for any unassigned requests
  for (const req of requests) {
    if (!scheduledRequestIds.has(req.id)) {
      // Analyze cause
      let reason = 'Kapacita plánovaných směn a měřičů byla plně vyčerpána.';
      let suggestion = 'Rozšiřte plánovací dny nebo přidejte dalšího měřiče.';

      const matchingPeriodDates = req.requestedDates.filter(d => periodDates.includes(d));
      if (matchingPeriodDates.length === 0) {
        reason = `Požadovaná data zaměstnance (${req.requestedDates.join(', ')}) nespadají do vybraného období plánování.`;
        suggestion = 'Upravte časové okno generování plánu nebo doplňte dostupná data zaměstnance.';
      } else {
        const matchingShifts = req.availableShifts.filter(s => activeShifts.includes(s));
        if (matchingShifts.length === 0) {
          reason = `Zaměstnanec je dostupný pouze ve směnách (${req.availableShifts.map(s => s === 'morning' ? 'ranní' : 'odpolední').join(', ')}), které nejsou v plánování aktivní.`;
          suggestion = 'Aktivujte požadovanou směnu v parametrech generování plánu.';
        } else {
          // Check if any technician worked in that shift
          const activeTechsInReqWindow = activeTechnicians.filter(t => 
            matchingPeriodDates.some(d => t.workDays.includes(d)) &&
            matchingShifts.some(s => t.availableShifts.includes(s))
          );
          if (activeTechsInReqWindow.length === 0) {
            reason = 'Žádný z vybraných měřičů nemá naplánovanou směnu v požadovaných dnech a časech zaměstnance.';
            suggestion = 'Přiřaďte měřiče na požadovanou směnu ve Správě měřičů.';
          } else {
            reason = `Vysoká vytíženost haly a časových slotů v požadovaných termínech. Přesuny mezi vzdálenými halami nedovolily zařazení do směny.`;
            suggestion = 'Povolte pro zaměstnance druhou směnu (např. odpolední i ranní) nebo zkraťte časovou rezervu přesunů.';
          }
        }
      }

      unassigned.push({
        requestId: req.id,
        employeeName: req.employeeName,
        hallId: req.hallId,
        requestedDates: req.requestedDates,
        availableShifts: req.availableShifts,
        reason,
        suggestion
      });
    }
  }

  // Compute overall schedule metrics
  let totalMeasurementMinutes = 0;
  let totalTransitMinutes = 0;

  for (const act of newActivities) {
    if (act.type === 'measurement') {
      totalMeasurementMinutes += act.durationMinutes;
    } else if (act.type === 'transit') {
      totalTransitMinutes += act.durationMinutes;
    }
  }

  // Total working window capacity across active technicians
  let totalCapacityMinutes = 0;
  for (const date of periodDates) {
    for (const shift of activeShifts) {
      const shiftTechs = activeTechnicians.filter(t => t.workDays.includes(date) && t.availableShifts.includes(shift));
      for (const t of shiftTechs) {
        const hours = shift === 'morning' ? t.shiftHours.morning : t.shiftHours.afternoon;
        const dur = timeToMinutes(hours.end) - timeToMinutes(hours.start);
        totalCapacityMinutes += Math.max(0, dur);
      }
    }
  }

  const scheduledCount = scheduledRequestIds.size;
  const unassignedCount = unassigned.length;
  const totalIdleMinutes = Math.max(0, totalCapacityMinutes - totalMeasurementMinutes - totalTransitMinutes);
  const utilizationRate = totalCapacityMinutes > 0
    ? Math.round(((totalMeasurementMinutes + totalTransitMinutes) / totalCapacityMinutes) * 100)
    : 0;

  const metrics: ScheduleMetrics = {
    totalRequests: requests.length,
    scheduledCount,
    unassignedCount,
    activeTechniciansCount: activeTechnicians.length,
    totalMeasurementMinutes,
    totalTransitMinutes,
    totalIdleMinutes,
    utilizationRate,
    readyForProductionCount: requests.filter(r => r.glassesStatus === 'screened_ready_for_production').length,
    inProductionCount: requests.filter(r => r.glassesStatus === 'in_production').length,
    completedGlassesCount: requests.filter(r => r.glassesStatus === 'produced_ready_for_handover' || r.glassesStatus === 'handed_over').length
  };

  return {
    activities: newActivities,
    unassigned,
    metrics
  };
}
