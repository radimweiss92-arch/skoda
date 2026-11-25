import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserRole, 
  Hall, 
  Technician, 
  MeasurementRequest, 
  TransferRoute, 
  ScheduledActivity, 
  UnassignedDiagnostic, 
  ScheduleMetrics, 
  ScheduleVersion, 
  AppSettings,
  ShiftType,
  OpticalRecord,
  GlassesProductionStatus,
  CampaignArchive
} from '../types';
import { 
  INITIAL_HALLS, 
  INITIAL_TECHNICIANS, 
  INITIAL_REQUESTS, 
  INITIAL_SETTINGS, 
  generateInitialRoutes,
  calculateAutoDistanceAndMinutes 
} from '../data/initialData';
import { runOptimization, OptimizationOptions } from '../services/optimizer';

export type ActiveNavTab = 
  | 'dashboard' 
  | 'requests' 
  | 'employees' 
  | 'technicians' 
  | 'planning' 
  | 'schedule' 
  | 'map' 
  | 'transfers' 
  | 'exports' 
  | 'settings';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentManagerName: string;
  setCurrentManagerName: (name: string) => void;
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;

  // Data
  halls: Hall[];
  technicians: Technician[];
  requests: MeasurementRequest[];
  routes: TransferRoute[];
  settings: AppSettings;
  activities: ScheduledActivity[];
  unassigned: UnassignedDiagnostic[];
  metrics: ScheduleMetrics;
  versions: ScheduleVersion[];
  selectedVersionId: string | null;
  setSelectedVersionId: (id: string | null) => void;

  // Planning state
  planningPeriod: { start: string; end: string };
  setPlanningPeriod: (period: { start: string; end: string }) => void;
  selectedTechIds: string[];
  setSelectedTechIds: (ids: string[]) => void;
  selectedShifts: ShiftType[];
  setSelectedShifts: (shifts: ShiftType[]) => void;
  bufferMinutes: number;
  setBufferMinutes: (m: number) => void;

  // Request actions
  addRequest: (req: Omit<MeasurementRequest, 'id' | 'createdAt' | 'status'>) => void;
  bulkAddRequests: (reqs: Partial<MeasurementRequest>[]) => void;
  updateRequest: (id: string, updates: Partial<MeasurementRequest>) => void;
  deleteRequest: (id: string) => void;
  updateOpticalRecord: (requestId: string, record: OpticalRecord, nextStatus?: GlassesProductionStatus) => void;
  updateGlassesStatus: (requestId: string, status: GlassesProductionStatus) => void;

  // Hall actions
  addHall: (hall: Omit<Hall, 'id'>) => void;
  updateHall: (id: string, updates: Partial<Hall>) => void;
  updateHallPosition: (id: string, x: number, y: number) => void;
  deleteHall: (id: string) => void;

  // Technician actions
  addTechnician: (tech: Omit<Technician, 'id'>) => void;
  updateTechnician: (id: string, updates: Partial<Technician>) => void;
  deleteTechnician: (id: string) => void;

  // Transfer routes actions
  updateRouteManualTime: (routeId: string, manualMinutes?: number) => void;
  resetRouteToAuto: (routeId: string) => void;
  recalculateAllRoutes: () => void;

  // Scheduling actions
  generateSchedule: (options?: Partial<OptimizationOptions>) => { unassignedCount: number; scheduledCount: number };
  updateScheduledActivity: (id: string, updates: Partial<ScheduledActivity>) => void;
  toggleActivityLock: (id: string) => void;
  deleteActivity: (id: string) => void;
  addManualActivity: (act: Omit<ScheduledActivity, 'id'>) => void;
  restoreVersion: (versionId: string) => void;
  deleteVersion: (versionId: string) => void;

  // Settings & Backup
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetAllDataToDefaults: () => void;
  exportFullBackupJson: () => string;
  importFullBackupJson: (jsonString: string) => boolean;

  // Campaign management & Year-to-year Archive
  campaignName: string;
  setCampaignName: (name: string) => void;
  campaignArchives: CampaignArchive[];
  closeAndArchiveCampaign: (archiveName: string, note?: string) => void;
  startNewCampaign: (name: string, startDate: string, endDate: string) => void;
  restoreArchivedCampaign: (archiveId: string) => void;
  deleteArchivedCampaign: (archiveId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'skoda_auto_planner_state_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('admin');
  const [currentManagerName, setCurrentManagerName] = useState<string>('Martin Paldus');
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');

  // Load from local storage or fallback to defaults
  const [halls, setHalls] = useState<Hall[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_halls`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_HALLS.length) {
          return parsed;
        }
      }
      return INITIAL_HALLS;
    } catch {
      return INITIAL_HALLS;
    }
  });

  const [technicians, setTechnicians] = useState<Technician[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_technicians`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasKolomaznik = parsed.some((t: Technician) => t.name.includes('Kolomazník'));
          const hasSvebis = parsed.some((t: Technician) => t.name.includes('Švébis'));
          if (hasKolomaznik && hasSvebis) {
            return parsed;
          }
        }
      }
      return INITIAL_TECHNICIANS;
    } catch {
      return INITIAL_TECHNICIANS;
    }
  });

  const [requests, setRequests] = useState<MeasurementRequest[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_requests`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_REQUESTS.length) {
          return parsed;
        }
      }
      return INITIAL_REQUESTS;
    } catch {
      return INITIAL_REQUESTS;
    }
  });

  const [campaignName, setCampaignName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_campaign_name`);
      return saved || 'Výjezd Škoda Auto – Listopad 2026';
    } catch {
      return 'Výjezd Škoda Auto – Listopad 2026';
    }
  });

  const [campaignArchives, setCampaignArchives] = useState<CampaignArchive[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_campaign_archives`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [routes, setRoutes] = useState<TransferRoute[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_routes`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= (INITIAL_HALLS.length * (INITIAL_HALLS.length - 1))) {
          return parsed;
        }
      }
      return generateInitialRoutes(INITIAL_HALLS, INITIAL_SETTINGS.walkingSpeedKmh);
    } catch {
      return generateInitialRoutes(INITIAL_HALLS, INITIAL_SETTINGS.walkingSpeedKmh);
    }
  });

  const [activities, setActivities] = useState<ScheduledActivity[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_activities`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((a: ScheduledActivity) => ({
            ...a,
            technicianId: (a.technicianId === 'tech-1' || !a.technicianId) ? 'tech-kolomaznik' : a.technicianId
          }));
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [unassigned, setUnassigned] = useState<UnassignedDiagnostic[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_unassigned`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [metrics, setMetrics] = useState<ScheduleMetrics>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_metrics`);
      return saved ? JSON.parse(saved) : {
        totalRequests: INITIAL_REQUESTS.length,
        scheduledCount: 0,
        unassignedCount: 0,
        activeTechniciansCount: INITIAL_TECHNICIANS.filter(t => t.active).length,
        totalMeasurementMinutes: 0,
        totalTransitMinutes: 0,
        totalIdleMinutes: 0,
        utilizationRate: 0,
        readyForProductionCount: INITIAL_REQUESTS.filter(r => r.glassesStatus === 'screened_ready_for_production').length,
        inProductionCount: INITIAL_REQUESTS.filter(r => r.glassesStatus === 'in_production').length,
        completedGlassesCount: INITIAL_REQUESTS.filter(r => r.glassesStatus === 'produced_ready_for_handover' || r.glassesStatus === 'handed_over').length
      };
    } catch {
      return {
        totalRequests: INITIAL_REQUESTS.length,
        scheduledCount: 0,
        unassignedCount: 0,
        activeTechniciansCount: INITIAL_TECHNICIANS.filter(t => t.active).length,
        totalMeasurementMinutes: 0,
        totalTransitMinutes: 0,
        totalIdleMinutes: 0,
        utilizationRate: 0,
        readyForProductionCount: 0,
        inProductionCount: 0,
        completedGlassesCount: 0
      };
    }
  });

  const [versions, setVersions] = useState<ScheduleVersion[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_versions`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  // Planning parameters state for 1-week trip
  const [planningPeriod, setPlanningPeriod] = useState<{ start: string; end: string }>({
    start: '2026-11-10',
    end: '2026-11-14'
  });
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>(() => 
    INITIAL_TECHNICIANS.filter(t => t.active).map(t => t.id)
  );
  const [selectedShifts, setSelectedShifts] = useState<ShiftType[]>(['morning', 'afternoon']);
  const [bufferMinutes, setBufferMinutes] = useState<number>(5);

  // Persistence effects
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_campaign_name`, campaignName); }, [campaignName]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_campaign_archives`, JSON.stringify(campaignArchives)); }, [campaignArchives]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_halls`, JSON.stringify(halls)); }, [halls]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_technicians`, JSON.stringify(technicians)); }, [technicians]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_requests`, JSON.stringify(requests)); }, [requests]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_routes`, JSON.stringify(routes)); }, [routes]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_activities`, JSON.stringify(activities)); }, [activities]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_unassigned`, JSON.stringify(unassigned)); }, [unassigned]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_metrics`, JSON.stringify(metrics)); }, [metrics]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_versions`, JSON.stringify(versions)); }, [versions]);

  // Run initial planning calculation if first load has empty activities
  useEffect(() => {
    if (activities.length === 0 && requests.length > 0) {
      const result = runOptimization(
        requests,
        technicians,
        halls,
        routes,
        settings,
        {
          periodDates: ['2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14'],
          selectedTechnicianIds: technicians.map(t => t.id),
          activeShifts: ['morning', 'afternoon'],
          bufferMinutes: 5,
          preserveLockedItems: false
        }
      );
      setActivities(result.activities);
      setUnassigned(result.unassigned);
      setMetrics(result.metrics);

      // Create initial version
      const initVer: ScheduleVersion = {
        id: `ver-${Date.now()}`,
        versionName: 'Výchozí optimalizovaný harmonogram v1.0',
        createdAt: new Date().toISOString(),
        createdBy: 'Automatický plánovač',
        periodStart: '2026-11-10',
        periodEnd: '2026-11-11',
        activities: result.activities,
        unassigned: result.unassigned,
        metrics: result.metrics,
        note: 'Automaticky vytvořeno při inicializaci areálu'
      };
      setVersions([initVer]);
    }
  }, []);

  // Request actions
  const addRequest = (req: Omit<MeasurementRequest, 'id' | 'createdAt' | 'status'>) => {
    const newReq: MeasurementRequest = {
      ...req,
      id: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      currentGlassesUser: req.currentGlassesUser ?? false,
      preferredCorrection: req.preferredCorrection || 'safety_general',
      workplaceVisualHazard: req.workplaceVisualHazard || 'Běžné mechanické riziko',
      glassesStatus: req.glassesStatus || 'pending_screening'
    };
    setRequests(prev => [newReq, ...prev]);
  };

  const bulkAddRequests = (newReqs: Partial<MeasurementRequest>[]) => {
    const formatted: MeasurementRequest[] = newReqs.map((r, i) => ({
      id: r.id || `req-${Date.now()}-${i}`,
      employeeName: r.employeeName || 'Neznámý zaměstnanec',
      employeeId: r.employeeId,
      department: r.department || 'Výroba',
      managerName: r.managerName || currentManagerName,
      managerEmail: r.managerEmail,
      hallId: r.hallId || (halls[0]?.id || ''),
      requestedDates: r.requestedDates && r.requestedDates.length > 0 ? r.requestedDates : ['2026-11-10'],
      availableShifts: r.availableShifts && r.availableShifts.length > 0 ? r.availableShifts : ['morning'],
      durationMinutes: r.durationMinutes || settings.defaultMeasurementMinutes,
      notes: r.notes,
      currentGlassesUser: r.currentGlassesUser ?? false,
      preferredCorrection: r.preferredCorrection || 'safety_general',
      workplaceVisualHazard: r.workplaceVisualHazard || 'Mechanické riziko',
      glassesStatus: r.glassesStatus || 'pending_screening',
      status: 'pending',
      createdAt: new Date().toISOString()
    }));
    setRequests(prev => [...formatted, ...prev]);
  };

  const updateRequest = (id: string, updates: Partial<MeasurementRequest>) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    // Also update matching activity if present
    setActivities(prev => prev.map(a => a.requestId === id ? { 
      ...a, 
      employeeName: updates.employeeName || a.employeeName,
      preferredCorrection: updates.preferredCorrection || a.preferredCorrection,
      glassesStatus: updates.glassesStatus || a.glassesStatus,
      opticalRecord: updates.opticalRecord || a.opticalRecord
    } : a));
  };

  const updateOpticalRecord = (requestId: string, record: OpticalRecord, nextStatus: GlassesProductionStatus = 'screened_ready_for_production') => {
    setRequests(prev => prev.map(r => r.id === requestId ? {
      ...r,
      opticalRecord: record,
      glassesStatus: nextStatus
    } : r));
    setActivities(prev => prev.map(a => a.requestId === requestId ? {
      ...a,
      opticalRecord: record,
      glassesStatus: nextStatus
    } : a));
  };

  const updateGlassesStatus = (requestId: string, status: GlassesProductionStatus) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, glassesStatus: status } : r));
    setActivities(prev => prev.map(a => a.requestId === requestId ? { ...a, glassesStatus: status } : a));
  };

  const deleteRequest = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    setActivities(prev => prev.filter(a => a.requestId !== id));
  };

  // Hall actions
  const addHall = (hall: Omit<Hall, 'id'>) => {
    const newHall: Hall = {
      ...hall,
      id: `hall-${hall.code.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`
    };
    const updatedHalls = [...halls, newHall];
    setHalls(updatedHalls);

    // Generate new routes to/from new hall
    const speed = settings.transitMode === 'bicycle' ? settings.bicycleSpeedKmh : settings.walkingSpeedKmh;
    const newRoutes = [...routes];
    for (const h of halls) {
      const forward = calculateAutoDistanceAndMinutes(h, newHall, speed);
      newRoutes.push({
        id: `route-${h.id}-${newHall.id}`,
        fromHallId: h.id,
        toHallId: newHall.id,
        distanceMeters: forward.distanceMeters,
        autoMinutes: forward.autoMinutes,
        calculationMethod: 'auto',
        updatedAt: new Date().toISOString()
      });
      const back = calculateAutoDistanceAndMinutes(newHall, h, speed);
      newRoutes.push({
        id: `route-${newHall.id}-${h.id}`,
        fromHallId: newHall.id,
        toHallId: h.id,
        distanceMeters: back.distanceMeters,
        autoMinutes: back.autoMinutes,
        calculationMethod: 'auto',
        updatedAt: new Date().toISOString()
      });
    }
    setRoutes(newRoutes);
  };

  const updateHall = (id: string, updates: Partial<Hall>) => {
    setHalls(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const updateHallPosition = (id: string, x: number, y: number) => {
    const clampedX = Math.max(2, Math.min(98, Math.round(x)));
    const clampedY = Math.max(2, Math.min(98, Math.round(y)));
    const updated = halls.map(h => h.id === id ? { ...h, x: clampedX, y: clampedY } : h);
    setHalls(updated);

    // Recompute auto times for routes involving this hall
    const speed = settings.transitMode === 'bicycle' ? settings.bicycleSpeedKmh : settings.walkingSpeedKmh;
    const movedHall = updated.find(h => h.id === id)!;
    setRoutes(prev => prev.map(r => {
      if (r.fromHallId === id || r.toHallId === id) {
        const fromH = updated.find(h => h.id === r.fromHallId);
        const toH = updated.find(h => h.id === r.toHallId);
        if (fromH && toH) {
          const { distanceMeters, autoMinutes } = calculateAutoDistanceAndMinutes(fromH, toH, speed);
          return {
            ...r,
            distanceMeters,
            autoMinutes,
            updatedAt: new Date().toISOString()
          };
        }
      }
      return r;
    }));
  };

  const deleteHall = (id: string) => {
    setHalls(prev => prev.filter(h => h.id !== id));
    setRoutes(prev => prev.filter(r => r.fromHallId !== id && r.toHallId !== id));
  };

  // Technician actions
  const addTechnician = (tech: Omit<Technician, 'id'>) => {
    const newTech: Technician = {
      ...tech,
      id: `tech-${Date.now()}`
    };
    setTechnicians(prev => [...prev, newTech]);
    setSelectedTechIds(prev => [...prev, newTech.id]);
  };

  const updateTechnician = (id: string, updates: Partial<Technician>) => {
    setTechnicians(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTechnician = (id: string) => {
    setTechnicians(prev => prev.filter(t => t.id !== id));
    setSelectedTechIds(prev => prev.filter(x => x !== id));
  };

  // Transfer routes actions
  const updateRouteManualTime = (routeId: string, manualMinutes?: number) => {
    setRoutes(prev => prev.map(r => {
      if (r.id === routeId) {
        return {
          ...r,
          manualMinutes,
          calculationMethod: manualMinutes !== undefined ? 'manual' : 'auto',
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    }));
  };

  const resetRouteToAuto = (routeId: string) => {
    updateRouteManualTime(routeId, undefined);
  };

  const recalculateAllRoutes = () => {
    const speed = settings.transitMode === 'bicycle' ? settings.bicycleSpeedKmh : settings.walkingSpeedKmh;
    setRoutes(prev => prev.map(r => {
      const from = halls.find(h => h.id === r.fromHallId);
      const to = halls.find(h => h.id === r.toHallId);
      if (!from || !to) return r;
      const { distanceMeters, autoMinutes } = calculateAutoDistanceAndMinutes(from, to, speed);
      return {
        ...r,
        distanceMeters,
        autoMinutes,
        updatedAt: new Date().toISOString()
      };
    }));
  };

  // Scheduling actions
  const generateSchedule = (optionsOverride?: Partial<OptimizationOptions>) => {
    // Collect dates in planning period
    const start = new Date(planningPeriod.start);
    const end = new Date(planningPeriod.end);
    const dates: string[] = [];
    const curr = new Date(start);
    while (curr <= end) {
      dates.push(curr.toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
    }
    if (dates.length === 0) {
      dates.push(planningPeriod.start);
    }

    const opts: OptimizationOptions = {
      periodDates: dates,
      selectedTechnicianIds: selectedTechIds,
      activeShifts: selectedShifts,
      bufferMinutes: bufferMinutes,
      preserveLockedItems: true,
      existingActivities: activities,
      ...optionsOverride
    };

    const result = runOptimization(
      requests,
      technicians,
      halls,
      routes,
      settings,
      opts
    );

    setActivities(result.activities);
    setUnassigned(result.unassigned);
    setMetrics(result.metrics);

    // Update requests statuses
    const scheduledReqIds = new Set(result.activities.filter(a => a.type === 'measurement' && a.requestId).map(a => a.requestId!));
    setRequests(prev => prev.map(r => ({
      ...r,
      status: scheduledReqIds.has(r.id) ? 'scheduled' : 'unassigned'
    })));

    // Create a new version snapshot
    const verNumber = versions.length + 1;
    const newVersion: ScheduleVersion = {
      id: `ver-${Date.now()}`,
      versionName: `Harmonogram v${verNumber}.0 (${dates.join(' – ')})`,
      createdAt: new Date().toISOString(),
      createdBy: role === 'admin' ? 'Administrátor' : currentManagerName,
      periodStart: planningPeriod.start,
      periodEnd: planningPeriod.end,
      activities: result.activities,
      unassigned: result.unassigned,
      metrics: result.metrics,
      note: `Automaticky optimalizováno pro ${result.metrics.scheduledCount} měření a ${result.metrics.activeTechniciansCount} měřičů`
    };

    setVersions(prev => [newVersion, ...prev]);

    return {
      scheduledCount: result.metrics.scheduledCount,
      unassignedCount: result.metrics.unassignedCount
    };
  };

  const updateScheduledActivity = (id: string, updates: Partial<ScheduledActivity>) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const toggleActivityLock = (id: string) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, locked: !a.locked } : a));
  };

  const deleteActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  const addManualActivity = (act: Omit<ScheduledActivity, 'id'>) => {
    const newAct: ScheduledActivity = {
      ...act,
      id: `man-act-${Date.now()}`,
      locked: true // Manually added activities are locked by default
    };
    setActivities(prev => [...prev, newAct]);
  };

  const restoreVersion = (versionId: string) => {
    const ver = versions.find(v => v.id === versionId);
    if (ver) {
      setActivities(ver.activities);
      setUnassigned(ver.unassigned);
      setMetrics(ver.metrics);
      setSelectedVersionId(versionId);
    }
  };

  const deleteVersion = (versionId: string) => {
    setVersions(prev => prev.filter(v => v.id !== versionId));
    if (selectedVersionId === versionId) {
      setSelectedVersionId(null);
    }
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetAllDataToDefaults = () => {
    setHalls(INITIAL_HALLS);
    setTechnicians(INITIAL_TECHNICIANS);
    setRequests(INITIAL_REQUESTS);
    setSettings(INITIAL_SETTINGS);
    const initialRoutes = generateInitialRoutes(INITIAL_HALLS, INITIAL_SETTINGS.walkingSpeedKmh);
    setRoutes(initialRoutes);
    setActivities([]);
    setUnassigned([]);
    setVersions([]);
    setSelectedVersionId(null);
    setPlanningPeriod({ start: '2026-11-10', end: '2026-11-14' });
    setSelectedTechIds(INITIAL_TECHNICIANS.map(t => t.id));

    // Recompute initial schedule for 1-week trip
    const result = runOptimization(
      INITIAL_REQUESTS,
      INITIAL_TECHNICIANS,
      INITIAL_HALLS,
      initialRoutes,
      INITIAL_SETTINGS,
      {
        periodDates: ['2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14'],
        selectedTechnicianIds: INITIAL_TECHNICIANS.map(t => t.id),
        activeShifts: ['morning', 'afternoon'],
        bufferMinutes: 5,
        preserveLockedItems: false
      }
    );
    setActivities(result.activities);
    setUnassigned(result.unassigned);
    setMetrics(result.metrics);
  };

  const exportFullBackupJson = (): string => {
    const backupData = {
      app: 'SkodaAutoOptikaPlanner',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      campaignName,
      campaignArchives,
      halls,
      technicians,
      requests,
      settings,
      routes,
      activities,
      unassigned,
      metrics,
      versions
    };
    return JSON.stringify(backupData, null, 2);
  };

  const importFullBackupJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') return false;

      if (parsed.campaignName && typeof parsed.campaignName === 'string') setCampaignName(parsed.campaignName);
      if (Array.isArray(parsed.campaignArchives)) setCampaignArchives(parsed.campaignArchives);
      if (Array.isArray(parsed.halls)) setHalls(parsed.halls);
      if (Array.isArray(parsed.technicians)) setTechnicians(parsed.technicians);
      if (Array.isArray(parsed.requests)) setRequests(parsed.requests);
      if (parsed.settings && typeof parsed.settings === 'object') setSettings(parsed.settings);
      if (Array.isArray(parsed.routes)) setRoutes(parsed.routes);
      if (Array.isArray(parsed.activities)) setActivities(parsed.activities);
      if (Array.isArray(parsed.unassigned)) setUnassigned(parsed.unassigned);
      if (parsed.metrics && typeof parsed.metrics === 'object') setMetrics(parsed.metrics);
      if (Array.isArray(parsed.versions)) setVersions(parsed.versions);

      return true;
    } catch {
      return false;
    }
  };

  const closeAndArchiveCampaign = (archiveName: string, note?: string) => {
    const archiveId = `archive-${Date.now()}`;
    const newArchive: CampaignArchive = {
      id: archiveId,
      name: archiveName.trim() || campaignName,
      archivedAt: new Date().toISOString(),
      startDate: planningPeriod.start,
      endDate: planningPeriod.end,
      totalRequests: requests.length,
      scheduledCount: activities.filter(a => a.type === 'measurement').length,
      technicianNames: technicians.filter(t => t.active).map(t => t.name),
      note: note || '',
      snapshot: {
        requests: JSON.parse(JSON.stringify(requests)),
        activities: JSON.parse(JSON.stringify(activities)),
        metrics: JSON.parse(JSON.stringify(metrics)),
        planningPeriod: { ...planningPeriod },
        technicians: JSON.parse(JSON.stringify(technicians)),
        settings: JSON.parse(JSON.stringify(settings))
      }
    };

    setCampaignArchives(prev => [newArchive, ...prev]);
  };

  const startNewCampaign = (name: string, startDate: string, endDate: string) => {
    setCampaignName(name);
    setPlanningPeriod({ start: startDate, end: endDate });
    setRequests([]);
    setActivities([]);
    setUnassigned([]);
    setVersions([]);
    setSelectedVersionId(null);
    setMetrics({
      totalRequests: 0,
      scheduledCount: 0,
      unassignedCount: 0,
      activeTechniciansCount: technicians.filter(t => t.active).length,
      totalMeasurementMinutes: 0,
      totalTransitMinutes: 0,
      totalIdleMinutes: 0,
      utilizationRate: 0,
      readyForProductionCount: 0,
      inProductionCount: 0,
      completedGlassesCount: 0
    });
  };

  const restoreArchivedCampaign = (archiveId: string) => {
    const archive = campaignArchives.find(a => a.id === archiveId);
    if (!archive) return;

    setCampaignName(archive.name);
    if (archive.snapshot?.planningPeriod) {
      setPlanningPeriod(archive.snapshot.planningPeriod);
    } else {
      setPlanningPeriod({ start: archive.startDate, end: archive.endDate });
    }
    setRequests(archive.snapshot?.requests || archive.requests || []);
    setActivities(archive.snapshot?.activities || archive.activities || []);
    setMetrics(archive.snapshot?.metrics || archive.metrics || {
      totalRequests: archive.snapshot?.requests?.length || archive.requestsCount || 0,
      scheduledCount: archive.snapshot?.activities?.filter((a: ScheduledActivity) => a.type === 'measurement').length || archive.scheduledCount || 0,
      unassignedCount: 0,
      activeTechniciansCount: archive.snapshot?.technicians?.length || archive.technicians?.length || 1,
      totalMeasurementMinutes: 0,
      totalTransitMinutes: 0,
      totalIdleMinutes: 0,
      utilizationRate: 0,
      readyForProductionCount: 0,
      inProductionCount: 0,
      completedGlassesCount: 0
    });
    setUnassigned([]);
  };

  const deleteArchivedCampaign = (archiveId: string) => {
    setCampaignArchives(prev => prev.filter(a => a.id !== archiveId));
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentManagerName,
        setCurrentManagerName,
        activeTab,
        setActiveTab,
        halls,
        technicians,
        requests,
        routes,
        settings,
        activities,
        unassigned,
        metrics,
        versions,
        selectedVersionId,
        setSelectedVersionId,
        planningPeriod,
        setPlanningPeriod,
        selectedTechIds,
        setSelectedTechIds,
        selectedShifts,
        setSelectedShifts,
        bufferMinutes,
        setBufferMinutes,
        addRequest,
        bulkAddRequests,
        updateRequest,
        deleteRequest,
        updateOpticalRecord,
        updateGlassesStatus,
        addHall,
        updateHall,
        updateHallPosition,
        deleteHall,
        addTechnician,
        updateTechnician,
        deleteTechnician,
        updateRouteManualTime,
        resetRouteToAuto,
        recalculateAllRoutes,
        generateSchedule,
        updateScheduledActivity,
        toggleActivityLock,
        deleteActivity,
        addManualActivity,
        restoreVersion,
        deleteVersion,
        updateSettings,
        resetAllDataToDefaults,
        exportFullBackupJson,
        importFullBackupJson,
        campaignName,
        setCampaignName,
        campaignArchives,
        closeAndArchiveCampaign,
        startNewCampaign,
        restoreArchivedCampaign,
        deleteArchivedCampaign
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
