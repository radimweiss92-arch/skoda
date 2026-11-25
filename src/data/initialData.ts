/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Reálná data areálu Škoda Auto a.s. Mladá Boleslav
 * Zavedeno z originálních objednávkových formulářů mistrů a oficiálního rozpisu měření.
 */

import { Hall, Technician, MeasurementRequest, AppSettings, TransferRoute } from '../types';

export const INITIAL_SETTINGS: AppSettings = {
  morningShiftStart: "08:00",
  morningShiftEnd: "14:00",
  afternoonShiftStart: "14:00",
  afternoonShiftEnd: "23:45",
  defaultMeasurementMinutes: 10,
  defaultBufferMinutes: 5,
  walkingSpeedKmh: 4.5,
  allowBicycleTransit: true,
  bicycleSpeedKmh: 12.0,
  transitMode: 'walking',
  siteName: 'Škoda Auto a.s. – Závod Mladá Boleslav',
  defaultSafetyLensMaterial: 'Polykarbonát s tvrzenou a antireflexní vrstvou'
};

export const INITIAL_HALLS: Hall[] = [
  {
    "id": "hall-h3",
    "code": "H3",
    "name": "Hala H3 – Odpočinková místnost NS 1113",
    "buildingType": "Montáž vozů",
    "x": 62,
    "y": 50,
    "gpsLat": 50.425000000000004,
    "gpsLng": 14.9262,
    "notes": "H3 / Jinde:",
    "active": true
  },
  {
    "id": "hall-m2",
    "code": "M2",
    "name": "Hala M2 – Zasedací místnost u sloupu G6",
    "buildingType": "Agregáty & Motory",
    "x": 52,
    "y": 25,
    "gpsLat": 50.4225,
    "gpsLng": 14.9252,
    "notes": "hala M2 / Jinde:",
    "active": true
  },
  {
    "id": "hall-z18",
    "code": "Z18",
    "name": "Hala Z18 (U16) – Zkušební centrum",
    "buildingType": "Zkušebna & Vývoj",
    "x": 75,
    "y": 40,
    "gpsLat": 50.424,
    "gpsLng": 14.9275,
    "notes": "Z18 (U16) / Jinde:",
    "active": true
  },
  {
    "id": "hall-c32",
    "code": "C32",
    "name": "Hala C32 – LZO nová hala u dálnice",
    "buildingType": "Logistika & Expedice",
    "x": 88,
    "y": 65,
    "gpsLat": 50.426500000000004,
    "gpsLng": 14.9288,
    "notes": "hala C32 / Jinde:",
    "active": true
  },
  {
    "id": "hall-m5",
    "code": "M5",
    "name": "Hala M5 – Kancelář č. MB-M5.039",
    "buildingType": "Obrobna & Montáž",
    "x": 48,
    "y": 35,
    "gpsLat": 50.423500000000004,
    "gpsLng": 14.9248,
    "notes": "M4/M5 č.kanceláře: MB-M5.039  / Jinde:",
    "active": true
  },
  {
    "id": "hall-m12b",
    "code": "M12B",
    "name": "Hala M12B – Kancelář FBL č. 19",
    "buildingType": "Výroba & Logistika",
    "x": 32,
    "y": 40,
    "gpsLat": 50.424,
    "gpsLng": 14.9232,
    "notes": "M12B / kancelář FBL č. 19",
    "active": true
  },
  {
    "id": "hall-m1",
    "code": "M1",
    "name": "Hala M1 – Hlavní areál",
    "buildingType": "Výroba",
    "x": 50,
    "y": 50,
    "gpsLat": 50.425000000000004,
    "gpsLng": 14.925,
    "notes": "M 12B / Uveďte prosím, na jakou jinou halu mohou dojít zájemci",
    "active": true
  },
  {
    "id": "hall-m13",
    "code": "M13",
    "name": "Hala M13 – Zasedačka č. 129 (sloup Q8)",
    "buildingType": "Výroba komponent",
    "x": 38,
    "y": 44,
    "gpsLat": 50.4244,
    "gpsLng": 14.9238,
    "notes": "hala M13,zas.129(sloup Q8) / Jinde:",
    "active": true
  },
  {
    "id": "hall-m14",
    "code": "M14",
    "name": "Hala M14 – Zasedací místnost č. 007",
    "buildingType": "Výroba",
    "x": 42,
    "y": 48,
    "gpsLat": 50.424800000000005,
    "gpsLng": 14.9242,
    "notes": "M14",
    "active": true
  },
  {
    "id": "hall-m16",
    "code": "M16",
    "name": "Hala M16 – Svačinový kout (sloup C4)",
    "buildingType": "Montáž",
    "x": 46,
    "y": 52,
    "gpsLat": 50.425200000000004,
    "gpsLng": 14.9246,
    "notes": "M16 svačinový kout u sloupu C4 / Jinde:",
    "active": true
  },
  {
    "id": "hall-m17",
    "code": "M17",
    "name": "Hala M17 – Odpočinková místnost (kiosek D30)",
    "buildingType": "Výroba motorů",
    "x": 50,
    "y": 55,
    "gpsLat": 50.4255,
    "gpsLng": 14.925,
    "notes": "hala M17 / Jinde:",
    "active": true
  },
  {
    "id": "hall-v17",
    "code": "V17",
    "name": "Hala V17 – 5. loď",
    "buildingType": "Vývoj & Kvalita (Česana)",
    "x": 70,
    "y": 75,
    "gpsLat": 50.4275,
    "gpsLng": 14.927,
    "notes": "hala V17, 5 loď / Uveďte prosím, na jakou jinou halu mohou dojít zájemci",
    "active": true
  },
  {
    "id": "hall-m12e",
    "code": "M12E",
    "name": "Hala M12E – Údržba lisovacího nářadí (ÚLN)",
    "buildingType": "Lisovna & Nářaďovna",
    "x": 28,
    "y": 36,
    "gpsLat": 50.4236,
    "gpsLng": 14.9228,
    "notes": "Mladá Boleslav / Týmový prostor ÚLN M12E",
    "active": true
  },
  {
    "id": "hall-tc",
    "code": "TC",
    "name": "Česana – Technologické centrum, kancelář 230/1",
    "buildingType": "Technický vývoj (Česana)",
    "x": 80,
    "y": 82,
    "gpsLat": 50.428200000000004,
    "gpsLng": 14.927999999999999,
    "notes": "hala / Technologické centrum - ČESANA, kancelář 230/1",
    "active": true
  },
  {
    "id": "hall-m6",
    "code": "M6",
    "name": "Hala M6 – Výrobní prostor",
    "buildingType": "Lisovna",
    "x": 55,
    "y": 38,
    "gpsLat": 50.4238,
    "gpsLng": 14.9255,
    "notes": "M6 / Jinde:",
    "active": true
  }
];

export const INITIAL_TECHNICIANS: Technician[] = [
  {
    id: 'tech-kolomaznik',
    name: 'Jaromír Kolomazník',
    code: 'JK-01',
    title: 'Majitel firmy & vedoucí optometrista',
    email: 'kolomaznik@optika-kolomaznik.cz',
    phone: '+420 603 123 456',
    active: true,
    isPrimary: true,
    workDays: ['2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14'],
    availableShifts: ['morning', 'afternoon'],
    shiftHours: {
      morning: { start: '08:00', end: '14:00' },
      afternoon: { start: '14:00', end: '23:45' }
    },
    breaks: [
      { start: '11:30', end: '12:00', label: 'Obědová pauza' },
      { start: '18:00', end: '18:30', label: 'Večeře / Přestávka' }
    ],
    maxDailyMeasurements: 50,
    notes: 'Komplexní refrakce zraku a předpis certifikovaných bezpečnostních dioptrických brýlí'
  },
  {
    id: 'tech-svebis',
    name: 'Ondřej Švébiš',
    code: 'OS-02',
    title: 'Optometrista & měřič výjezdu Škoda Auto',
    email: 'svebis@optika-kolomaznik.cz',
    phone: '+420 724 374 116',
    active: true,
    isPrimary: false,
    workDays: ['2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14'],
    availableShifts: ['morning', 'afternoon'],
    shiftHours: {
      morning: { start: '08:00', end: '14:00' },
      afternoon: { start: '14:00', end: '23:45' }
    },
    breaks: [
      { start: '11:30', end: '12:00', label: 'Obědová pauza' },
      { start: '18:00', end: '18:30', label: 'Večeře / Přestávka' }
    ],
    maxDailyMeasurements: 50,
    notes: 'Měření zraku v provozech, zkoušení bezpečnostních obrub a pupilometrie'
  }
];

export const INITIAL_REQUESTS: MeasurementRequest[] = [
  {
    "id": "req-real-001",
    "employeeName": "Kittler Jiří",
    "employeeId": "600087",
    "department": "Středisko 1111.1112",
    "managerName": "Mikulová Jana",
    "managerEmail": "jana.mikulova2@skoda-auto.cz",
    "hallId": "hall-h3",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: Ano · Tel: 605293765 · Místo: H3 / Jinde:",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-002",
    "employeeName": "Bucek Martin",
    "employeeId": "2339",
    "department": "Středisko 1111.1112",
    "managerName": "Mikulová Jana",
    "managerEmail": "jana.mikulova2@skoda-auto.cz",
    "hallId": "hall-h3",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: Ano · Tel: 605293765 · Místo: H3 / Jinde:",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-003",
    "employeeName": "Franc Petr",
    "employeeId": "23383",
    "department": "Středisko 2130",
    "managerName": "Lustigová Jana",
    "managerEmail": "jana.lustigova@skoda-auto.cz",
    "hallId": "hall-m2",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ano · Tel: 734298784 · Místo: hala M2 / Jinde:",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-004",
    "employeeName": "Korsuň Martin",
    "employeeId": "29785",
    "department": "Středisko 2175",
    "managerName": "Michal Rusiňák, Jiří Strouhal",
    "managerEmail": "michal.rusinak@skoda-auto.cz",
    "hallId": "hall-m2",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: Ne · Tel: 730864654 ; 734298779 · Místo: M2 / Jinde:",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-005",
    "employeeName": "Fišer Ondřej",
    "employeeId": "77631",
    "department": "Středisko 2252",
    "managerName": "Oldřich Kmoníček",
    "managerEmail": "oldrich.kmonicek@skoda-auto.cz",
    "hallId": "hall-m2",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ano · Tel: 604292766 · Místo: Hala M2 / Jinde:",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-006",
    "employeeName": "Stibor Vlastimil",
    "employeeId": "24084",
    "department": "Středisko 2252",
    "managerName": "Oldřich Kmoníček",
    "managerEmail": "oldrich.kmonicek@skoda-auto.cz",
    "hallId": "hall-m2",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ano · Tel: 604292766 · Místo: Hala M2 / Jinde:",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-007",
    "employeeName": "Effenberger Tomáš",
    "employeeId": "65148",
    "department": "Středisko 2909",
    "managerName": "Horák Pavel",
    "managerEmail": "Pavel.horak2@skoda-auto.cz",
    "hallId": "hall-z18",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ano · Tel: 730865290 · Místo: Z18 (U16) / Jinde:",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-008",
    "employeeName": "Demeter Lubomír",
    "employeeId": "59578",
    "department": "Středisko 2909",
    "managerName": "Horák Pavel",
    "managerEmail": "Pavel.horak2@skoda-auto.cz",
    "hallId": "hall-z18",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ano · Tel: 730865290 · Místo: Z18 (U16) / Jinde:",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-009",
    "employeeName": "Javůrek Lukáš",
    "employeeId": "56158",
    "department": "Středisko 2909",
    "managerName": "Horák Pavel",
    "managerEmail": "Pavel.horak2@skoda-auto.cz",
    "hallId": "hall-z18",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ano · Tel: 730865290 · Místo: Z18 (U16) / Jinde:",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-010",
    "employeeName": "Kučera Ladislav",
    "employeeId": "58306",
    "department": "Středisko 2909",
    "managerName": "Horák Pavel",
    "managerEmail": "Pavel.horak2@skoda-auto.cz",
    "hallId": "hall-z18",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "bude mít brýle, výměna skel · Poukaz: ne · Tel: 730865290 · Místo: Z18 (U16) / Jinde:",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-011",
    "employeeName": "Čepela Tomáš",
    "employeeId": "47983",
    "department": "Středisko 2909",
    "managerName": "Řánek Petr",
    "managerEmail": " petr.ranek@skoda-auto.cz",
    "hallId": "hall-c32",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Výměna pouze skla · Poukaz: ne · Tel: 730868353 · Místo: hala C32 / Jinde:",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-012",
    "employeeName": "Niedermertl Michal",
    "employeeId": "43793",
    "department": "Středisko 2909",
    "managerName": "Řánek Petr",
    "managerEmail": " petr.ranek@skoda-auto.cz",
    "hallId": "hall-c32",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ne · Tel: 730868353 · Místo: hala C32 / Jinde:",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-013",
    "employeeName": "Řípová Blanka",
    "employeeId": "59166",
    "department": "Středisko 3211",
    "managerName": "Jaroslav Macek",
    "managerEmail": "Jaroslav.Macek@skoda-auto.cz",
    "hallId": "hall-m5",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ne · Tel: 420730866545 · Místo: M4/M5 č.kanceláře: MB-M5.039  / Jinde:",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-014",
    "employeeName": "Siněnko Oleg",
    "employeeId": "10631",
    "department": "Středisko 3211",
    "managerName": "Jaroslav Macek",
    "managerEmail": "Jaroslav.Macek@skoda-auto.cz",
    "hallId": "hall-m5",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ne · Tel: 420730866545 · Místo: M4/M5 č.kanceláře: MB-M5.039  / Jinde:",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-015",
    "employeeName": "Červenka Matěj",
    "employeeId": "89192524",
    "department": "Středisko 3430-3438",
    "managerName": "O-Křovina 605293029 / N - Borecký 704941488 / R - Čihulka 605293099",
    "managerEmail": "jana.fortnerova@skoda-auto.cz",
    "hallId": "hall-m12b",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ano · Místo: M12B / kancelář FBL č. 19",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-016",
    "employeeName": "Formánková Petra",
    "employeeId": "53151",
    "department": "Středisko 3430-3438",
    "managerName": "O-Křovina 605293029 / N - Borecký 704941488 / R - Čihulka 605293099",
    "managerEmail": "jana.fortnerova@skoda-auto.cz",
    "hallId": "hall-m12b",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ano · Místo: M12B / kancelář FBL č. 19",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-017",
    "employeeName": "Komora Viktor",
    "employeeId": "54300",
    "department": "Středisko 3430-3438",
    "managerName": "O-Křovina 605293029 / N - Borecký 704941488 / R - Čihulka 605293099",
    "managerEmail": "jana.fortnerova@skoda-auto.cz",
    "hallId": "hall-m12b",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ano · Místo: M12B / kancelář FBL č. 19",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-018",
    "employeeName": "Saruulgerel Darisuren",
    "employeeId": "89293175",
    "department": "Středisko 3430-3438",
    "managerName": "O-Křovina 605293029 / N - Borecký 704941488 / R - Čihulka 605293099",
    "managerEmail": "jana.fortnerova@skoda-auto.cz",
    "hallId": "hall-m12b",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ano · Místo: M12B / kancelář FBL č. 19",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-019",
    "employeeName": "Zoia Petrova",
    "employeeId": "89257926",
    "department": "Středisko 3430-3438",
    "managerName": "O-Křovina 605293029 / N - Borecký 704941488 / R - Čihulka 605293099",
    "managerEmail": "jana.fortnerova@skoda-auto.cz",
    "hallId": "hall-m12b",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ano · Místo: M12B / kancelář FBL č. 19",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-020",
    "employeeName": "Zoufalý Pavel",
    "employeeId": "23360",
    "department": "Středisko 3430-3438",
    "managerName": "O-Křovina 605293029 / N - Borecký 704941488 / R - Čihulka 605293099",
    "managerEmail": "jana.fortnerova@skoda-auto.cz",
    "hallId": "hall-m12b",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ano · Místo: M12B / kancelář FBL č. 19",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-021",
    "employeeName": "Valenta Vladislav",
    "employeeId": "30012",
    "department": "Středisko 3430-3438",
    "managerName": "O-Křovina 605293029 / N - Borecký 704941488 / R - Čihulka 605293099",
    "managerEmail": "jana.fortnerova@skoda-auto.cz",
    "hallId": "hall-m12b",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ano · Místo: M12B / kancelář FBL č. 19",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-022",
    "employeeName": "Láska Lukáš",
    "employeeId": "70421",
    "department": "Středisko 3450",
    "managerName": "Monika Pajerová",
    "managerEmail": "Monika.Pajerova@skoda-auto.cz",
    "hallId": "hall-m1",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ano · Tel: 734298940 · Místo: M 12B / Uveďte prosím, na jakou jinou halu mohou dojít zájemci",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-023",
    "employeeName": "Štyler Roman",
    "employeeId": "10253",
    "department": "Středisko 3450",
    "managerName": "Monika Pajerová",
    "managerEmail": "Monika.Pajerova@skoda-auto.cz",
    "hallId": "hall-m1",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ano · Tel: 734298940 · Místo: M 12B / Uveďte prosím, na jakou jinou halu mohou dojít zájemci",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-024",
    "employeeName": "Hons Martin",
    "employeeId": "52251",
    "department": "Středisko 3472,3476,3477,3479,3481",
    "managerName": "Kateřina Šípová",
    "managerEmail": "Katerina.Sipova@skoda-auto.cz",
    "hallId": "hall-m13",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Novák 730866561 · Poukaz: ano · Tel: 730861987 · Místo: hala M13,zas.129(sloup Q8) / Jinde:",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-025",
    "employeeName": "Kopřiva Oldřich",
    "employeeId": "40051",
    "department": "Středisko 3472,3476,3477,3479,3481",
    "managerName": "Kateřina Šípová",
    "managerEmail": "Katerina.Sipova@skoda-auto.cz",
    "hallId": "hall-m13",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Podhajský 730868241 · Poukaz: ano · Tel: 730861987 · Místo: hala M13,zas.129(sloup Q8) / Jinde:",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-026",
    "employeeName": "Krsová Helena",
    "employeeId": "61226",
    "department": "Středisko 3472,3476,3477,3479,3481",
    "managerName": "Kateřina Šípová",
    "managerEmail": "Katerina.Sipova@skoda-auto.cz",
    "hallId": "hall-m13",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Wysluch 731296966 · Poukaz: ne · Tel: 730861987 · Místo: hala M13,zas.129(sloup Q8) / Jinde:",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-027",
    "employeeName": "Pavlousková Lenka",
    "employeeId": "32624",
    "department": "Středisko 3472,3476,3477,3479,3481",
    "managerName": "Kateřina Šípová",
    "managerEmail": "Katerina.Sipova@skoda-auto.cz",
    "hallId": "hall-m13",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Hušák 730868576 · Poukaz: ano · Tel: 730861987 · Místo: hala M13,zas.129(sloup Q8) / Jinde:",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-028",
    "employeeName": "Rydval Ondřej",
    "employeeId": "76986",
    "department": "Středisko 3472,3476,3477,3479,3481",
    "managerName": "Kateřina Šípová",
    "managerEmail": "Katerina.Sipova@skoda-auto.cz",
    "hallId": "hall-m13",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Novák 730866561 · Poukaz: ano · Tel: 730861987 · Místo: hala M13,zas.129(sloup Q8) / Jinde:",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-029",
    "employeeName": "Nikodém Jaromír",
    "employeeId": "28580",
    "department": "Středisko 3472,3476,3477,3479,3481",
    "managerName": "Kateřina Šípová",
    "managerEmail": "Katerina.Sipova@skoda-auto.cz",
    "hallId": "hall-m13",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Laurýn 704941394 · Poukaz: ano · Tel: 730861987 · Místo: hala M13,zas.129(sloup Q8) / Jinde:",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-030",
    "employeeName": "Macháček Zdeněk",
    "employeeId": "20041",
    "department": "Středisko 3472,3476,3477,3479,3481",
    "managerName": "Kateřina Šípová",
    "managerEmail": "Katerina.Sipova@skoda-auto.cz",
    "hallId": "hall-m13",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Stránský 730869482 · Poukaz: ne · Tel: 730861987 · Místo: hala M13,zas.129(sloup Q8) / Jinde:",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-031",
    "employeeName": "Raba Jaromir",
    "employeeId": "8066",
    "department": "Středisko 3472,3476,3477,3479,3481",
    "managerName": "Kateřina Šípová",
    "managerEmail": "Katerina.Sipova@skoda-auto.cz",
    "hallId": "hall-m13",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Pelc 732294070 · Poukaz: ano · Tel: 730861987 · Místo: hala M13,zas.129(sloup Q8) / Jinde:",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-032",
    "employeeName": "Eder Ladislav",
    "employeeId": "40672",
    "department": "Středisko 3481",
    "managerName": "Vlkovský David",
    "managerEmail": "David.Vlkovsky@skoda-auto.cz",
    "hallId": "hall-m13",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "116b, sloup L7 tel.730868946 · Poukaz: ne · Tel: 734290327 · Místo: hala M13  / Jinde:",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-033",
    "employeeName": "Miler Tomáš",
    "employeeId": "36270",
    "department": "Středisko 3481",
    "managerName": "Vlkovský David",
    "managerEmail": "David.Vlkovsky@skoda-auto.cz",
    "hallId": "hall-m13",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "116b, sloup L7 tel. 730863353 · Poukaz: ne · Tel: 734290327 · Místo: hala M13  / Jinde:",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-034",
    "employeeName": "Dráb Josef",
    "employeeId": "51050",
    "department": "Středisko 3534",
    "managerName": "Alena Brixová",
    "managerEmail": "alena.brixova@skoda-auto.cz",
    "hallId": "hall-m14",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: NE · Tel: 734294592 · Místo: M14",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-035",
    "employeeName": "Medžibrický Jozef",
    "employeeId": "46186",
    "department": "Středisko 3534",
    "managerName": "Alena Brixová",
    "managerEmail": "alena.brixova@skoda-auto.cz",
    "hallId": "hall-m14",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ne · Tel: 734294592 · Místo: M14",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-036",
    "employeeName": "Medek Vladimír",
    "employeeId": "53519",
    "department": "Středisko 3534",
    "managerName": "Alena Brixová",
    "managerEmail": "alena.brixova@skoda-auto.cz",
    "hallId": "hall-m14",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ne · Tel: 734294592 · Místo: M14",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-037",
    "employeeName": "Strnad Ladisla",
    "employeeId": "31145",
    "department": "Středisko 3534",
    "managerName": "Alena Brixová",
    "managerEmail": "alena.brixova@skoda-auto.cz",
    "hallId": "hall-m14",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ne · Tel: 734294592 · Místo: M14",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-038",
    "employeeName": "Kapustyanskiy Alexandr",
    "employeeId": "16920",
    "department": "Středisko 3534",
    "managerName": "Alena Brixová",
    "managerEmail": "alena.brixova@skoda-auto.cz",
    "hallId": "hall-m14",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: NE · Tel: 734294592 · Místo: M14",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-039",
    "employeeName": "Naďo Ivan",
    "employeeId": "28235",
    "department": "Středisko 3534",
    "managerName": "Alena Brixová",
    "managerEmail": "alena.brixova@skoda-auto.cz",
    "hallId": "hall-m14",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ano · Tel: 734294592 · Místo: M14",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-040",
    "employeeName": "Landsman Jozef",
    "employeeId": "31868",
    "department": "Středisko 3561",
    "managerName": "Petr Vymlátil",
    "managerEmail": "Petr.Vymlatil@skoda-auto.cz",
    "hallId": "hall-m16",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: Ano · Tel: 730861227 · Místo: M16 svačinový kout u sloupu C4 / Jinde:",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-041",
    "employeeName": "Bajgart Marek",
    "employeeId": "28711",
    "department": "Středisko 3572",
    "managerName": "Milan Trnka",
    "managerEmail": "            milan.trnka@skoda-auto.cz",
    "hallId": "hall-m17",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "směna od  06:00 -18:00h · Poukaz: ano · Tel: 731296706 · Místo: hala M17 / Jinde:",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-042",
    "employeeName": "Fidrmuc Martin",
    "employeeId": "22279",
    "department": "Středisko 3572",
    "managerName": "Milan Trnka",
    "managerEmail": "            milan.trnka@skoda-auto.cz",
    "hallId": "hall-m17",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "směna od  06:00 -18:00h · Poukaz: ano · Tel: 731296706 · Místo: hala M17 / Jinde:",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-043",
    "employeeName": "Sokola Karel",
    "employeeId": "76285",
    "department": "Středisko 3572",
    "managerName": "Milan Trnka",
    "managerEmail": "            milan.trnka@skoda-auto.cz",
    "hallId": "hall-m17",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "směna od  06:00 -18:00h · Poukaz: ano · Tel: 731296706 · Místo: hala M17 / Jinde:",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-044",
    "employeeName": "Danyi Norbert",
    "employeeId": "49945",
    "department": "Středisko 3660",
    "managerName": "Ondřej Hanzlíček",
    "managerEmail": "ondrej.hanzlicek@skoda-auto.cz",
    "hallId": "hall-m1",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ne · Tel: 730863282 · Místo: M1, kancelář 507 / Jinde:",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-045",
    "employeeName": "Košek Roman",
    "employeeId": "387852",
    "department": "Středisko 3812",
    "managerName": "Roman Košek",
    "managerEmail": "David.Londa@skoda-auto.cz",
    "hallId": "hall-m14",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ne · Tel: 730866430 · Místo: M14 / Jinde:",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-046",
    "employeeName": "Bílek Ondřej",
    "employeeId": "49659",
    "department": "Středisko 4056",
    "managerName": "Hodačová  Radmila",
    "managerEmail": "Radmila.Hodacova@skoda-auto.cz",
    "hallId": "hall-v17",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Tel: 724522399 · Místo: hala V17, 5 loď / Uveďte prosím, na jakou jinou halu mohou dojít zájemci",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-047",
    "employeeName": "Fišera Jakub",
    "employeeId": "614142",
    "department": "Středisko 4056",
    "managerName": "Hodačová  Radmila",
    "managerEmail": "Radmila.Hodacova@skoda-auto.cz",
    "hallId": "hall-v17",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Tel: 724522399 · Místo: hala V17, 5 loď / Uveďte prosím, na jakou jinou halu mohou dojít zájemci",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-048",
    "employeeName": "Hofman Milan",
    "employeeId": "52581",
    "department": "Středisko 4056",
    "managerName": "Hodačová  Radmila",
    "managerEmail": "Radmila.Hodacova@skoda-auto.cz",
    "hallId": "hall-v17",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Tel: 724522399 · Místo: hala V17, 5 loď / Uveďte prosím, na jakou jinou halu mohou dojít zájemci",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-049",
    "employeeName": "Krulich Jiří",
    "employeeId": "10664",
    "department": "Středisko 4056",
    "managerName": "Hodačová  Radmila",
    "managerEmail": "Radmila.Hodacova@skoda-auto.cz",
    "hallId": "hall-v17",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Tel: 724522399 · Místo: hala V17, 5 loď / Uveďte prosím, na jakou jinou halu mohou dojít zájemci",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-050",
    "employeeName": "Máj Josef",
    "employeeId": "39368",
    "department": "Středisko 4056",
    "managerName": "Hodačová  Radmila",
    "managerEmail": "Radmila.Hodacova@skoda-auto.cz",
    "hallId": "hall-v17",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Tel: 724522399 · Místo: hala V17, 5 loď / Uveďte prosím, na jakou jinou halu mohou dojít zájemci",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-051",
    "employeeName": "Moc Jiří",
    "employeeId": "53034",
    "department": "Středisko 4056",
    "managerName": "Hodačová  Radmila",
    "managerEmail": "Radmila.Hodacova@skoda-auto.cz",
    "hallId": "hall-v17",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Tel: 724522399 · Místo: hala V17, 5 loď / Uveďte prosím, na jakou jinou halu mohou dojít zájemci",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-052",
    "employeeName": "Nohejl Petr",
    "employeeId": "43913",
    "department": "Středisko 4056",
    "managerName": "Hodačová  Radmila",
    "managerEmail": "Radmila.Hodacova@skoda-auto.cz",
    "hallId": "hall-v17",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Tel: 724522399 · Místo: hala V17, 5 loď / Uveďte prosím, na jakou jinou halu mohou dojít zájemci",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-053",
    "employeeName": "Raclavský Michal",
    "employeeId": "30976",
    "department": "Středisko 4056",
    "managerName": "Hodačová  Radmila",
    "managerEmail": "Radmila.Hodacova@skoda-auto.cz",
    "hallId": "hall-v17",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Tel: 724522399 · Místo: hala V17, 5 loď / Uveďte prosím, na jakou jinou halu mohou dojít zájemci",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-054",
    "employeeName": "Siklenka Petr",
    "employeeId": "33697",
    "department": "Středisko 4056",
    "managerName": "Hodačová  Radmila",
    "managerEmail": "Radmila.Hodacova@skoda-auto.cz",
    "hallId": "hall-v17",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Tel: 724522399 · Místo: hala V17, 5 loď / Uveďte prosím, na jakou jinou halu mohou dojít zájemci",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-055",
    "employeeName": "Vrabec Jan",
    "employeeId": "32319",
    "department": "Středisko 4056",
    "managerName": "Hodačová  Radmila",
    "managerEmail": "Radmila.Hodacova@skoda-auto.cz",
    "hallId": "hall-v17",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Tel: 724522399 · Místo: hala V17, 5 loď / Uveďte prosím, na jakou jinou halu mohou dojít zájemci",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-056",
    "employeeName": "Kočí Ondřej",
    "employeeId": "43870",
    "department": "Středisko 4056",
    "managerName": "Hodačová  Radmila",
    "managerEmail": "Radmila.Hodacova@skoda-auto.cz",
    "hallId": "hall-v17",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Tel: 724522399 · Místo: hala V17, 5 loď / Uveďte prosím, na jakou jinou halu mohou dojít zájemci",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-057",
    "employeeName": "Pytloun Miroslav",
    "employeeId": "30975",
    "department": "Středisko 4314 - Údržba lisovacího nářadí",
    "managerName": "Martin Paldus",
    "managerEmail": "martin.paldus@skoda-auto.cz",
    "hallId": "hall-m12e",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ano · Tel: +420604292915 · Místo: Mladá Boleslav / Týmový prostor ÚLN M12E",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-058",
    "employeeName": "Andelt Marek",
    "employeeId": "30500",
    "department": "Středisko 4314 - Údržba lisovacího nářadí",
    "managerName": "Martin Paldus",
    "managerEmail": "martin.paldus@skoda-auto.cz",
    "hallId": "hall-m12e",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "brýle na blízko po kozultaci · Poukaz: ne · Tel: +420604292915 · Místo: Mladá Boleslav / Týmový prostor ÚLN M12E",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "near_work",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-059",
    "employeeName": "Pavelec Jaromír",
    "employeeId": "562",
    "department": "Středisko 4314 - Údržba lisovacího nářadí",
    "managerName": "Martin Paldus",
    "managerEmail": "martin.paldus@skoda-auto.cz",
    "hallId": "hall-m12e",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ne · Tel: +420604292915 · Místo: Mladá Boleslav / Týmový prostor ÚLN M12E",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-060",
    "employeeName": "Jankovský David",
    "employeeId": "77220",
    "department": "Středisko 4314 - Údržba lisovacího nářadí",
    "managerName": "Martin Paldus",
    "managerEmail": "martin.paldus@skoda-auto.cz",
    "hallId": "hall-m12e",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ne · Tel: +420604292915 · Místo: Mladá Boleslav / Týmový prostor ÚLN M12E",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-061",
    "employeeName": "Netolický Libor",
    "employeeId": "33105",
    "department": "Středisko 4314 - Údržba lisovacího nářadí",
    "managerName": "Martin Paldus",
    "managerEmail": "martin.paldus@skoda-auto.cz",
    "hallId": "hall-m12e",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ne · Tel: +420604292915 · Místo: Mladá Boleslav / Týmový prostor ÚLN M12E",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-062",
    "employeeName": "Krejbich Aleš",
    "employeeId": "40060",
    "department": "Středisko 4314 - Údržba lisovacího nářadí",
    "managerName": "Martin Paldus",
    "managerEmail": "martin.paldus@skoda-auto.cz",
    "hallId": "hall-m12e",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ne · Tel: +420604292915 · Místo: Mladá Boleslav / Týmový prostor ÚLN M12E",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-063",
    "employeeName": "Khail Miloš",
    "employeeId": "39322",
    "department": "Středisko 4314 - Údržba lisovacího nářadí",
    "managerName": "Martin Paldus",
    "managerEmail": "martin.paldus@skoda-auto.cz",
    "hallId": "hall-m12e",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ne · Tel: +420604292915 · Místo: Mladá Boleslav / Týmový prostor ÚLN M12E",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-064",
    "employeeName": "Novák Radek",
    "employeeId": "1812",
    "department": "Středisko 4314 - Údržba lisovacího nářadí",
    "managerName": "Martin Paldus",
    "managerEmail": "martin.paldus@skoda-auto.cz",
    "hallId": "hall-m12e",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ne · Tel: +420604292915 · Místo: Mladá Boleslav / Týmový prostor ÚLN M12E",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-065",
    "employeeName": "Stibrányi Jiří",
    "employeeId": "39743",
    "department": "Středisko 4314 - Údržba lisovacího nářadí",
    "managerName": "Martin Paldus",
    "managerEmail": "martin.paldus@skoda-auto.cz",
    "hallId": "hall-m12e",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ne · Tel: +420604292915 · Místo: Mladá Boleslav / Týmový prostor ÚLN M12E",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-066",
    "employeeName": "Dvořák Milan",
    "employeeId": "30195",
    "department": "Středisko 4314 - Údržba lisovacího nářadí",
    "managerName": "Martin Paldus",
    "managerEmail": "martin.paldus@skoda-auto.cz",
    "hallId": "hall-m12e",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ne · Tel: +420604292915 · Místo: Mladá Boleslav / Týmový prostor ÚLN M12E",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-067",
    "employeeName": "Novák Václav",
    "employeeId": "36291",
    "department": "Středisko 4314 - Údržba lisovacího nářadí",
    "managerName": "Martin Paldus",
    "managerEmail": "martin.paldus@skoda-auto.cz",
    "hallId": "hall-m12e",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ne · Tel: +420604292915 · Místo: Mladá Boleslav / Týmový prostor ÚLN M12E",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-068",
    "employeeName": "Bulíř Milan",
    "employeeId": "72196",
    "department": "Středisko 4314 - Údržba lisovacího nářadí",
    "managerName": "Martin Paldus",
    "managerEmail": "martin.paldus@skoda-auto.cz",
    "hallId": "hall-m12e",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ne · Tel: +420604292915 · Místo: Mladá Boleslav / Týmový prostor ÚLN M12E",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-069",
    "employeeName": "Velechovský Tomáš",
    "employeeId": "42923",
    "department": "Středisko 4314 - Údržba lisovacího nářadí",
    "managerName": "Martin Paldus",
    "managerEmail": "martin.paldus@skoda-auto.cz",
    "hallId": "hall-m12e",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ne · Tel: +420604292915 · Místo: Mladá Boleslav / Týmový prostor ÚLN M12E",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-070",
    "employeeName": "Hrbáček Jakub",
    "employeeId": "77553",
    "department": "Středisko 4314 - Údržba lisovacího nářadí",
    "managerName": "Martin Paldus",
    "managerEmail": "martin.paldus@skoda-auto.cz",
    "hallId": "hall-m12e",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ne · Tel: +420604292915 · Místo: Mladá Boleslav / Týmový prostor ÚLN M12E",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-071",
    "employeeName": "Stránský Lukáš",
    "employeeId": "41556",
    "department": "Středisko 4314 - Údržba lisovacího nářadí",
    "managerName": "Martin Paldus",
    "managerEmail": "martin.paldus@skoda-auto.cz",
    "hallId": "hall-m12e",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ne · Tel: +420604292915 · Místo: Mladá Boleslav / Týmový prostor ÚLN M12E",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-072",
    "employeeName": "Nič Tomáš",
    "employeeId": "72313",
    "department": "Středisko 4314 - Údržba lisovacího nářadí",
    "managerName": "Martin Paldus",
    "managerEmail": "martin.paldus@skoda-auto.cz",
    "hallId": "hall-m12e",
    "requestedDates": [
      "2026-11-11"
    ],
    "availableShifts": [
      "afternoon"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ne · Tel: +420604292915 · Místo: Mladá Boleslav / Týmový prostor ÚLN M12E",
    "currentGlassesUser": false,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-073",
    "employeeName": "Dvořák Jan",
    "employeeId": "36076",
    "department": "Středisko 6032",
    "managerName": "Pavel Rynd",
    "managerEmail": "pavel.rynd@skoda-auto.cz",
    "hallId": "hall-tc",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Poukaz: ano · Tel: 605293445 · Místo: hala / Technologické centrum - ČESANA, kancelář 230/1",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  },
  {
    "id": "req-real-074",
    "employeeName": "Muž Piotr",
    "employeeId": "47868",
    "department": "Středisko 8303",
    "managerName": "Cabálková tel.775947067",
    "managerEmail": "jaroslava.cabalkova@skoda-auto.cz",
    "hallId": "hall-m6",
    "requestedDates": [
      "2026-11-12"
    ],
    "availableShifts": [
      "morning"
    ],
    "durationMinutes": 10,
    "notes": "Tel: 777280741 · Místo: M6 / Jinde:",
    "currentGlassesUser": true,
    "workplaceVisualHazard": "Ochrana zraku při práci ve výrobním areálu Škoda Auto",
    "preferredCorrection": "safety_general",
    "glassesStatus": "pending_screening",
    "status": "pending",
    "createdAt": "2026-11-01T08:00:00Z"
  }
];


// Výpočet euklidovské vzdálenosti a minut pěšího přesunu mezi halami
export function calculateAutoDistanceAndMinutes(
  fromHall: Hall, 
  toHall: Hall, 
  walkingSpeedKmh: number = 4.5
): { distanceMeters: number, autoMinutes: number } {
  if (fromHall.id === toHall.id) {
    return { distanceMeters: 0, autoMinutes: 0 };
  }

  // Přibližné souřadnice v metrech z procentuální mapy areálu
  const dx = (fromHall.x - toHall.x) * 22; // ~2200m rozsah areálu MB
  const dy = (fromHall.y - toHall.y) * 18;
  const directDist = Math.sqrt(dx * dx + dy * dy);
  
  // Přirážka za obcházení budov v areálu (faktor 1.35)
  const distanceMeters = Math.max(80, Math.round(directDist * 1.35));

  // Pěší rychlost (např. 4.5 km/h = 75 m/min)
  const metersPerMinute = (walkingSpeedKmh * 1000) / 60;
  
  // Zvláštní pravidlo pro Česanu (Technologické centrum mimo hlavní závod)
  const isCesanaTransit = fromHall.code === 'TC' || toHall.code === 'TC';
  let autoMinutes = isCesanaTransit ? 30 : Math.ceil(distanceMeters / metersPerMinute);
  
  // Minimální reálný přesun mezi různými halami je 5-15 min
  if (!isCesanaTransit && autoMinutes < 5) autoMinutes = 5;
  if (!isCesanaTransit && autoMinutes > 20) autoMinutes = 20;

  return { distanceMeters, autoMinutes };
}

export function generateInitialRoutes(halls: Hall[], walkingSpeedKmh: number = 4.5): TransferRoute[] {
  const routes: TransferRoute[] = [];
  const now = new Date().toISOString();

  for (let i = 0; i < halls.length; i++) {
    for (let j = 0; j < halls.length; j++) {
      if (i === j) continue;
      const from = halls[i];
      const to = halls[j];
      const { distanceMeters, autoMinutes } = calculateAutoDistanceAndMinutes(from, to, walkingSpeedKmh);

      // Reálné časy přesunů dle podkladů Škoda Auto
      let manualMinutes: number | undefined = undefined;
      if (from.code === 'TC' || to.code === 'TC') {
        manualMinutes = 30; // Česana přejezd
      } else {
        manualMinutes = 15; // Standardní přesun mezi halami MB v rozpisu
      }

      routes.push({
        id: `route-${from.id}-${to.id}`,
        fromHallId: from.id,
        toHallId: to.id,
        distanceMeters,
        autoMinutes,
        manualMinutes,
        calculationMethod: manualMinutes !== undefined ? 'manual' : 'auto',
        updatedAt: now
      });
    }
  }

  return routes;
}

