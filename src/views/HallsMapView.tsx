import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  RotateCcw, 
  Navigation, 
  Building, 
  Info, 
  Check, 
  X,
  Footprints,
  Compass
} from 'lucide-react';
import { Hall } from '../types';

export const HallsMapView: React.FC = () => {
  const { 
    halls, 
    addHall, 
    updateHall, 
    updateHallPosition, 
    deleteHall, 
    routes, 
    activities, 
    settings, 
    updateSettings 
  } = useApp();

  const [selectedHallId, setSelectedHallId] = useState<string | null>(halls[0]?.id || null);
  const [isMoveModeActive, setIsMoveModeActive] = useState<boolean>(false);
  const [isHallModalOpen, setIsHallModalOpen] = useState(false);
  const [editingHall, setEditingHall] = useState<Hall | null>(null);

  // Form for Add/Edit Hall
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    buildingType: string;
    x: number;
    y: number;
    gpsLat: number;
    gpsLng: number;
    notes: string;
    active: boolean;
  }>({
    code: '',
    name: '',
    buildingType: 'Výroba',
    x: 50,
    y: 50,
    gpsLat: 50.4200,
    gpsLng: 14.9200,
    notes: '',
    active: true
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedHall = halls.find(h => h.id === selectedHallId);

  // Routes connected to selected hall
  const connectedRoutes = selectedHallId 
    ? routes.filter(r => r.fromHallId === selectedHallId || r.toHallId === selectedHallId)
    : [];

  // Measurements in selected hall
  const hallMeasurements = selectedHallId
    ? activities.filter(a => a.type === 'measurement' && a.hallId === selectedHallId)
    : [];

  // Click on map to place or reposition selected hall
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMoveModeActive || !selectedHallId || !mapContainerRef.current) return;

    const rect = mapContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const xPct = Math.round((clickX / rect.width) * 100);
    const yPct = Math.round((clickY / rect.height) * 100);

    updateHallPosition(selectedHallId, xPct, yPct);
    setIsMoveModeActive(false);
  };

  // Upload custom map image
  const handleMapUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        updateSettings({ customMapImage: url });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAdd = () => {
    setEditingHall(null);
    setFormData({
      code: `H${Math.floor(Math.random() * 50) + 50}`,
      name: '',
      buildingType: 'Výroba',
      x: 50,
      y: 50,
      gpsLat: 50.4210,
      gpsLng: 14.9220,
      notes: '',
      active: true
    });
    setIsHallModalOpen(true);
  };

  const handleOpenEdit = (h: Hall) => {
    setEditingHall(h);
    setFormData({
      code: h.code,
      name: h.name,
      buildingType: h.buildingType,
      x: h.x,
      y: h.y,
      gpsLat: h.gpsLat || 50.4210,
      gpsLng: h.gpsLng || 14.9220,
      notes: h.notes || '',
      active: h.active
    });
    setIsHallModalOpen(true);
  };

  const handleSubmitHall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) return;

    if (editingHall) {
      updateHall(editingHall.id, formData);
    } else {
      addHall(formData);
    }
    setIsHallModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Mapa areálu Škoda Auto a správa hal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Závod Mladá Boleslav · Interaktivní mapa výrobních objektů, polohování a trasy
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleMapUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs"
            title="Nahrát vlastní mapový podklad areálu (např. PNG/JPG plánek)"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Nahrát mapový podklad</span>
          </button>

          {settings.customMapImage && (
            <button
              type="button"
              onClick={() => updateSettings({ customMapImage: undefined })}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
              title="Obnovit výchozí vektorovou mapu Škoda"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Přidat halu</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Map Canvas (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-700" />
              <span className="font-semibold text-slate-800">
                Areál Škoda Auto a.s. · Závod I & II Mladá Boleslav
              </span>
            </div>

            <div className="flex items-center gap-2">
              {selectedHall && (
                <button
                  type="button"
                  onClick={() => setIsMoveModeActive(!isMoveModeActive)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 ${
                    isMoveModeActive
                      ? 'bg-amber-500 text-white animate-pulse'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Navigation className="w-3 h-3" />
                  <span>{isMoveModeActive ? 'Klikněte na mapu pro umístění' : 'Změnit polohu haly na mapě'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Plant Schematic */}
          <div
            ref={mapContainerRef}
            onClick={handleMapClick}
            className={`relative w-full aspect-16/10 rounded-xl overflow-hidden border border-slate-300 select-none ${
              isMoveModeActive ? 'cursor-crosshair ring-2 ring-amber-500' : 'cursor-default'
            }`}
            style={{
              backgroundColor: '#e2e8f0',
              backgroundImage: settings.customMapImage ? `url(${settings.customMapImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* If no custom map image, render authentic SVG Škoda Auto factory schematic */}
            {!settings.customMapImage && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                {/* Factory ground grid */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Plant boundaries / perimeter fence */}
                <rect x="5%" y="6%" width="90%" height="88%" rx="12" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 3" />

                {/* River Jizera schematic on west */}
                <path d="M 2% 0% Q 6% 35% 3% 70% T 5% 100%" fill="none" stroke="#93c5fd" strokeWidth="14" opacity="0.6" />
                <text x="3%" y="95%" fontSize="9" fill="#3b82f6" transform="rotate(-90 20 500)">řeka Jizera</text>

                {/* Plant Gates */}
                <text x="7%" y="9%" fontSize="10" fontWeight="bold" fill="#64748b">Brána 1 (Václavka)</text>
                <text x="50%" y="9%" fontSize="10" fontWeight="bold" fill="#64748b">Brána 6 (Zákaznické centrum)</text>
                <text x="91%" y="45%" fontSize="10" fontWeight="bold" fill="#64748b">Brána 8 (Logistika)</text>
                <text x="45%" y="97%" fontSize="10" fontWeight="bold" fill="#64748b">Brána 11 (Česana vývoj)</text>

                {/* Railway line */}
                <path d="M 12% 94% L 78% 70% L 94% 45%" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="3 3" />
                <text x="72%" y="74%" fontSize="9" fill="#64748b" transform="rotate(-18 450 400)">vlečka ČD / Škoda</text>

                {/* Plant main avenues / internal roads */}
                <path d="M 10% 50% L 88% 50%" stroke="#e2e8f0" strokeWidth="18" fill="none" />
                <path d="M 50% 10% L 50% 90%" stroke="#e2e8f0" strokeWidth="18" fill="none" />
                <path d="M 10% 50% L 88% 50%" stroke="#cbd5e1" strokeWidth="2" fill="none" />
                <path d="M 50% 10% L 50% 90%" stroke="#cbd5e1" strokeWidth="2" fill="none" />
                <text x="52%" y="53%" fontSize="9" fill="#94a3b8">Třída Václava Klementa</text>

                {/* Route lines connecting selected hall to others */}
                {selectedHall && connectedRoutes.map(r => {
                  const otherHallId = r.fromHallId === selectedHall.id ? r.toHallId : r.fromHallId;
                  const otherHall = halls.find(h => h.id === otherHallId);
                  if (!otherHall) return null;

                  const isCustom = r.manualMinutes !== undefined;

                  return (
                    <g key={r.id}>
                      <line
                        x1={`${selectedHall.x}%`}
                        y1={`${selectedHall.y}%`}
                        x2={`${otherHall.x}%`}
                        y2={`${otherHall.y}%`}
                        stroke={isCustom ? '#d97706' : '#059669'}
                        strokeWidth="2"
                        strokeDasharray={isCustom ? '4 2' : 'none'}
                        opacity="0.75"
                      />
                    </g>
                  );
                })}
              </svg>
            )}

            {/* Hall Nodes / Pins */}
            {halls.map(hall => {
              const isSelected = hall.id === selectedHallId;
              const measurementCount = activities.filter(a => a.type === 'measurement' && a.hallId === hall.id).length;

              return (
                <div
                  key={hall.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedHallId(hall.id);
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform ${
                    isSelected ? 'scale-110 z-30' : 'hover:scale-105 z-20'
                  }`}
                  style={{ left: `${hall.x}%`, top: `${hall.y}%` }}
                >
                  <div className={`flex flex-col items-center`}>
                    
                    {/* Badge */}
                    <div className={`px-2 py-1 rounded-md text-xs font-bold font-mono shadow-md border flex items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-emerald-800 text-white border-emerald-950 ring-2 ring-emerald-400'
                        : 'bg-white text-slate-800 border-slate-300 hover:border-emerald-600'
                    }`}>
                      <Building className="w-3 h-3 text-emerald-500" />
                      <span>{hall.code}</span>
                      {measurementCount > 0 && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-900 rounded px-1 ml-0.5">
                          {measurementCount}
                        </span>
                      )}
                    </div>

                    {/* Subtitle Pin Label */}
                    <span className="text-[10px] font-semibold text-slate-700 bg-white/90 backdrop-blur-xs px-1 rounded shadow-xs mt-0.5 truncate max-w-[100px]">
                      {hall.name}
                    </span>

                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>Zelené čáry: Automaticky vypočtené trasy · Oranžové čárkované: Manuálně upravené časy</span>
            <span>Měřítko areálu: 1 cm ≈ 120 m</span>
          </div>

        </div>

        {/* Selected Hall Info & Connections (1 Col) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          
          {selectedHall ? (
            <>
              {/* Hall Title */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded">
                      {selectedHall.code}
                    </span>
                    <span className="text-xs text-slate-500">{selectedHall.buildingType}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {selectedHall.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(selectedHall)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded"
                    title="Upravit halu"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Smazat halu ${selectedHall.code}?`)) {
                        deleteHall(selectedHall.id);
                        setSelectedHallId(halls[0]?.id || null);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Smazat halu"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Coordinates & Notes */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Souřadnice areálu:</span>
                  <span className="font-mono text-slate-800">X: {selectedHall.x}% · Y: {selectedHall.y}%</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>GPS poloha:</span>
                  <span className="font-mono text-slate-800">{selectedHall.gpsLat}° N, {selectedHall.gpsLng}° E</span>
                </div>
                {selectedHall.notes && (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-[11px]">
                    <strong>Poznámka k hale:</strong> {selectedHall.notes}
                  </div>
                )}
              </div>

              {/* Active Scheduled Measurements in this hall */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>Naplánovaná měření v této hale ({hallMeasurements.length})</span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs">
                  {hallMeasurements.length === 0 ? (
                    <p className="text-slate-400 text-xs py-2">Žádná aktivní měření.</p>
                  ) : (
                    hallMeasurements.map(act => (
                      <div key={act.id} className="p-2 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{act.employeeName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{act.date} · {act.startTime}–{act.endTime}</div>
                        </div>
                        <span className="font-mono text-emerald-800 font-semibold">{act.durationMinutes} min</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Connected routes times */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>Časy přesunů z {selectedHall.code} do ostatních hal</span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
                  {connectedRoutes.filter(r => r.fromHallId === selectedHall.id).map(r => {
                    const toH = halls.find(h => h.id === r.toHallId);
                    if (!toH) return null;
                    const isManual = r.manualMinutes !== undefined;
                    const mins = isManual ? r.manualMinutes : r.autoMinutes;

                    return (
                      <div key={r.id} className="p-2 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 font-mono">➔ {toH.code}</span>
                          <span className="text-[11px] text-slate-500 truncate max-w-[120px]">({toH.name})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-mono">{r.distanceMeters} m</span>
                          <span className={`font-mono font-bold ${isManual ? 'text-amber-700' : 'text-emerald-800'}`}>
                            {mins} min
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Vyberte halu kliknutím na mapu.
            </div>
          )}

        </div>

      </div>

      {/* Hall Management Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Seznam a evidence všech výrobních hal ({halls.length})
          </h2>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            + Přidat další halu
          </button>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="p-2.5">Kód haly</th>
                <th className="p-2.5">Název a popis objektu</th>
                <th className="p-2.5">Typ provozu</th>
                <th className="p-2.5">Poloha na mapě</th>
                <th className="p-2.5">GPS</th>
                <th className="p-2.5">Poznámka / omezení</th>
                <th className="p-2.5 text-right">Akce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {halls.map(h => (
                <tr key={h.id} className="hover:bg-slate-50">
                  <td className="p-2.5 font-mono font-bold text-slate-900">{h.code}</td>
                  <td className="p-2.5 font-semibold text-slate-800">{h.name}</td>
                  <td className="p-2.5 text-slate-600">{h.buildingType}</td>
                  <td className="p-2.5 font-mono text-slate-500">[{h.x}%, {h.y}%]</td>
                  <td className="p-2.5 font-mono text-slate-500">{h.gpsLat}, {h.gpsLng}</td>
                  <td className="p-2.5 text-slate-500">{h.notes || '-'}</td>
                  <td className="p-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedHallId(h.id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-2 py-1 text-slate-600 hover:text-emerald-800 font-medium"
                      >
                        Vybrat na mapě
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(h)}
                        className="p-1 text-slate-400 hover:text-slate-700"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Add / Edit Hall */}
      {isHallModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingHall ? 'Upravit halu' : 'Přidat novou halu'}
              </h3>
              <button onClick={() => setIsHallModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitHall} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Označení haly *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Např. H31, M1"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Typ provozu</label>
                  <input
                    type="text"
                    value={formData.buildingType}
                    onChange={(e) => setFormData({ ...formData, buildingType: e.target.value })}
                    placeholder="Finální montáž, Svařovna..."
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Název nebo popis haly *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Např. Montáž vozů Octavia & Karoq"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Poloha X (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.x}
                    onChange={(e) => setFormData({ ...formData, x: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Poloha Y (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.y}
                    onChange={(e) => setFormData({ ...formData, y: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Poznámky nebo omezení vstupu</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Vstup přes bránu 8, nutné chrániče sluchu..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsHallModalOpen(false)}
                  className="px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm"
                >
                  {editingHall ? 'Uložit halu' : 'Vytvořit halu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
