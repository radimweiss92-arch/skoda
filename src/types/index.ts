export type UserRole = 'admin' | 'manager';

export type ShiftType = 'morning' | 'afternoon';

export type EyeCorrectionType = 
  | 'distance'            // Na dálku (operátoři VZV, zkušebna, logistika)
  | 'near_work'           // Na blízko / montáž jemných dílů
  | 'bifocal'             // Bifokální (kombinace montáž + dohled)
  | 'progressive'         // Multifokální / progresivní (univerzální)
  | 'safety_general';     // Bezpečnostní ochranné dioptrické obecné

export type GlassesProductionStatus = 
  | 'pending_screening'              // Čeká na měření zraku
  | 'screened_ready_for_production'  // Změřeno optometristou ➔ Připraveno pro výrobu brýlí
  | 'in_production'                  // Ve výrobě v optické laboratoři
  | 'produced_ready_for_handover'    // Vyrobeno ➔ K předání zaměstnanci
  | 'handed_over';                   // Předáno zaměstnanci na pracovišti

export interface OpticalRecord {
  rightEyeSph: number;    // např. -1.50 nebo +2.00
  rightEyeCyl?: number;   // cylindr
  rightEyeAxis?: number;  // osa
  leftEyeSph: number;
  leftEyeCyl?: number;
  leftEyeAxis?: number;
  pdDistanceMm?: number;  // pupilární vzdálenost v mm (např. 63)
  lensMaterial: 'polycarbonate' | 'trivex' | 'hardened_resin'; // Nárazuvzdorný polykarbonát / trivex
  frameModel: string;     // např. "UVEX rx 5505", "Univet 5X7", "Infield Safety"
  measuredAt?: string;
  optometristName?: string;
  optometristNotes?: string;
}

export interface Hall {
  id: string;
  code: string; // e.g. H31, H32, H45, M1
  name: string; // e.g. Montáž vozů Octavia / Enyaq
  buildingType: string; // Výroba, Svařovna, Lakovna, Logistika
  x: number; // percentage on map (0-100)
  y: number; // percentage on map (0-100)
  gpsLat?: number;
  gpsLng?: number;
  notes?: string;
  active: boolean;
}

export interface TransferRoute {
  id: string;
  fromHallId: string;
  toHallId: string;
  distanceMeters: number;
  autoMinutes: number;
  manualMinutes?: number;
  calculationMethod: 'auto' | 'manual';
  updatedAt: string;
}

export interface BreakPeriod {
  start: string; // "10:30"
  end: string;   // "11:00"
  label: string; // "Obědová pauza"
}

export interface Technician {
  id: string;
  name: string;
  code: string; // e.g. M-01 (Optometrista)
  title?: string; // např. "Hlavní optometrista", "Externí optometrická posila"
  email: string;
  phone: string;
  active: boolean;
  isPrimary?: boolean; // běžně je jeden hlavní měřič
  workDays: string[]; // ['2026-11-10', '2026-11-11', ...]
  availableShifts: ShiftType[];
  shiftHours: {
    morning: { start: string; end: string };
    afternoon: { start: string; end: string };
  };
  breaks: BreakPeriod[];
  maxDailyMeasurements?: number;
  notes?: string;
}

export interface MeasurementRequest {
  id: string;
  employeeName: string;
  employeeId?: string; // personal number e.g. "SK-10492"
  department: string;
  managerName: string;
  managerEmail?: string;
  hallId: string;
  requestedDates: string[]; // YYYY-MM-DD
  availableShifts: ShiftType[];
  durationMinutes: number; // default 25 min pro vyšetření zraku
  notes?: string;
  
  // Specific to Eye Screening & Glasses
  currentGlassesUser: boolean; // zda již nosí brýle
  preferredCorrection: EyeCorrectionType;
  workplaceVisualHazard: string; // specifikace rizik pracoviště (třísky, prach, monitor, sváření)
  glassesStatus: GlassesProductionStatus;
  opticalRecord?: OpticalRecord;

  status: 'pending' | 'scheduled' | 'unassigned';
  unassignedReason?: string;
  createdAt: string;
}

export interface ScheduledActivity {
  id: string;
  type: 'measurement' | 'transit' | 'break';
  date: string; // YYYY-MM-DD
  shift: ShiftType;
  technicianId: string;
  startTime: string; // "06:30"
  endTime: string;   // "07:00"
  durationMinutes: number;
  
  // Specific to measurement
  requestId?: string;
  employeeName?: string;
  employeeId?: string;
  department?: string;
  hallId?: string;
  locked?: boolean;
  notes?: string;

  // Eye examination context
  preferredCorrection?: EyeCorrectionType;
  glassesStatus?: GlassesProductionStatus;
  opticalRecord?: OpticalRecord;

  // Specific to transit
  fromHallId?: string;
  toHallId?: string;
  distanceMeters?: number;

  // Specific to break
  breakLabel?: string;
}

export interface UnassignedDiagnostic {
  requestId: string;
  employeeName: string;
  hallId: string;
  requestedDates: string[];
  availableShifts: ShiftType[];
  reason: string;
  suggestion: string;
}

export interface ScheduleMetrics {
  totalRequests: number;
  scheduledCount: number;
  unassignedCount: number;
  activeTechniciansCount: number;
  totalMeasurementMinutes: number;
  totalTransitMinutes: number;
  totalIdleMinutes: number;
  utilizationRate: number; // percentage 0-100
  
  // Glasses pipeline metrics
  readyForProductionCount: number;
  inProductionCount: number;
  completedGlassesCount: number;
}

export interface ScheduleVersion {
  id: string;
  versionName: string;
  createdAt: string;
  createdBy: string;
  periodStart: string;
  periodEnd: string;
  activities: ScheduledActivity[];
  unassigned: UnassignedDiagnostic[];
  metrics: ScheduleMetrics;
  note?: string;
}

export interface AppSettings {
  morningShiftStart: string; // "06:00"
  morningShiftEnd: string;   // "14:00"
  afternoonShiftStart: string; // "14:00"
  afternoonShiftEnd: string;   // "22:00"
  defaultMeasurementMinutes: number; // 25 (vyšetření zraku a výběr obruby)
  defaultBufferMinutes: number; // 5
  walkingSpeedKmh: number; // 4.5 km/h walking inside plant
  allowBicycleTransit: boolean;
  bicycleSpeedKmh: number; // 12 km/h
  transitMode: 'walking' | 'bicycle';
  customMapImage?: string;
  siteName: string;
  defaultSafetyLensMaterial: string;
}

export interface CampaignArchive {
  id: string;
  name: string;
  year?: number;
  startDate: string;
  endDate: string;
  archivedAt: string;
  closedAt?: string;
  totalRequests?: number;
  requestsCount?: number;
  scheduledCount: number;
  technicianNames?: string[];
  technicians?: Technician[];
  requests?: MeasurementRequest[];
  activities?: ScheduledActivity[];
  metrics?: ScheduleMetrics;
  note?: string;
  snapshot?: {
    requests: MeasurementRequest[];
    activities: ScheduledActivity[];
    metrics: ScheduleMetrics;
    planningPeriod: { start: string; end: string };
    technicians: Technician[];
    settings: AppSettings;
  };
}
