import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Glasses, 
  Eye, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Factory, 
  ShieldCheck, 
  Edit3, 
  FileText, 
  X, 
  Check, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { MeasurementRequest, OpticalRecord, GlassesProductionStatus, EyeCorrectionType } from '../types';

export const GlassesProductionView: React.FC = () => {
  const { requests, updateOpticalRecord, updateGlassesStatus, halls, technicians } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [correctionFilter, setCorrectionFilter] = useState<string>('all');
  
  // Optical exam entry modal
  const [selectedReqForExam, setSelectedReqForExam] = useState<MeasurementRequest | null>(null);
  const [examForm, setExamForm] = useState<OpticalRecord>({
    rightEyeSph: -1.0,
    rightEyeCyl: 0,
    rightEyeAxis: 0,
    leftEyeSph: -1.0,
    leftEyeCyl: 0,
    leftEyeAxis: 0,
    pdDistanceMm: 63,
    lensMaterial: 'polycarbonate',
    frameModel: 'UVEX rx 5505 (Polykarbonát čirý)',
    measuredAt: new Date().toISOString().split('T')[0],
    optometristName: technicians.find(t => t.active)?.name || 'Jaromír Kolomazník',
    optometristNotes: 'Ochranné bočnice namontovány, antifog úprava.'
  });

  const getCorrectionLabel = (type: EyeCorrectionType) => {
    switch (type) {
      case 'distance': return 'Na dálku';
      case 'near_work': return 'Na blízko / montáž';
      case 'bifocal': return 'Bifokální';
      case 'progressive': return 'Multifokální / progresivní';
      case 'safety_general': return 'Ochranné dioptrické obecné';
      default: return type;
    }
  };

  const getStatusBadge = (status: GlassesProductionStatus) => {
    switch (status) {
      case 'pending_screening':
        return (
          <span className="text-amber-800 font-semibold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Čeká na změření zraku</span>
          </span>
        );
      case 'screened_ready_for_production':
        return (
          <span className="text-sky-800 font-semibold flex items-center gap-1 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
            <CheckCircle2 className="w-3 h-3 text-sky-600" />
            <span>Změřeno ➔ K zadání do výroby</span>
          </span>
        );
      case 'in_production':
        return (
          <span className="text-indigo-800 font-semibold flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            <Factory className="w-3 h-3 text-indigo-600" />
            <span>Ve výrobě v optice</span>
          </span>
        );
      case 'produced_ready_for_handover':
        return (
          <span className="text-emerald-800 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Vyrobeno ➔ K předání</span>
          </span>
        );
      case 'handed_over':
        return (
          <span className="text-slate-700 font-semibold flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Předáno na pracovišti</span>
          </span>
        );
      default:
        return null;
    }
  };

  const filtered = requests.filter(r => {
    const matchSearch = 
      r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      (r.employeeId && r.employeeId.toLowerCase().includes(search.toLowerCase())) ||
      r.department.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.glassesStatus === statusFilter;
    const matchCorrection = correctionFilter === 'all' || r.preferredCorrection === correctionFilter;
    return matchSearch && matchStatus && matchCorrection;
  });

  const handleOpenExamModal = (req: MeasurementRequest) => {
    setSelectedReqForExam(req);
    if (req.opticalRecord) {
      setExamForm(req.opticalRecord);
    } else {
      setExamForm({
        rightEyeSph: req.currentGlassesUser ? -1.5 : -0.75,
        rightEyeCyl: 0,
        rightEyeAxis: 0,
        leftEyeSph: req.currentGlassesUser ? -1.25 : -0.75,
        leftEyeCyl: 0,
        leftEyeAxis: 0,
        pdDistanceMm: 63,
        lensMaterial: 'polycarbonate',
        frameModel: 'UVEX rx 5505 (Polykarbonát)',
        measuredAt: new Date().toISOString().split('T')[0],
        optometristName: technicians.find(t => t.active)?.name || 'Jaromír Kolomazník',
        optometristNotes: `Vyšetření pro provoz ${req.department}. Požadována boční ochrana a tvrzený lak.`
      });
    }
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqForExam) return;

    updateOpticalRecord(selectedReqForExam.id, examForm, 'screened_ready_for_production');
    setSelectedReqForExam(null);
  };

  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.glassesStatus === 'pending_screening').length,
    ready: requests.filter(r => r.glassesStatus === 'screened_ready_for_production').length,
    inProd: requests.filter(r => r.glassesStatus === 'in_production').length,
    readyHandover: requests.filter(r => r.glassesStatus === 'produced_ready_for_handover').length,
    handedOver: requests.filter(r => r.glassesStatus === 'handed_over').length
  };

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Glasses className="w-5 h-5 text-emerald-700" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Výroba pracovních dioptrických brýlí
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Sledování zakázek brýlí od optometrického vyšetření zraku, přes optickou laboratoř až po předání na pracovišti
          </p>
        </div>
      </div>

      {/* Pipeline Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
        
        <button
          onClick={() => setStatusFilter(statusFilter === 'pending_screening' ? 'all' : 'pending_screening')}
          className={`p-3 rounded-xl border text-left transition-all ${
            statusFilter === 'pending_screening'
              ? 'bg-amber-100/70 border-amber-400 ring-2 ring-amber-300'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="text-slate-500 text-[11px] font-medium">1. Čeká na měření</div>
          <div className="text-xl font-bold font-mono text-amber-800 mt-1">{counts.pending}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Požadavek v plánu</div>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'screened_ready_for_production' ? 'all' : 'screened_ready_for_production')}
          className={`p-3 rounded-xl border text-left transition-all ${
            statusFilter === 'screened_ready_for_production'
              ? 'bg-sky-100/70 border-sky-400 ring-2 ring-sky-300'
              : 'bg-white border-slate-200 hover:border-sky-300'
          }`}
        >
          <div className="text-slate-500 text-[11px] font-medium">2. Změřeno (K výrobě)</div>
          <div className="text-xl font-bold font-mono text-sky-800 mt-1">{counts.ready}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Optometrista změřil zrak</div>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'in_production' ? 'all' : 'in_production')}
          className={`p-3 rounded-xl border text-left transition-all ${
            statusFilter === 'in_production'
              ? 'bg-indigo-100/70 border-indigo-400 ring-2 ring-indigo-300'
              : 'bg-white border-slate-200 hover:border-indigo-300'
          }`}
        >
          <div className="text-slate-500 text-[11px] font-medium">3. Ve výrobě</div>
          <div className="text-xl font-bold font-mono text-indigo-800 mt-1">{counts.inProd}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Zabrušování čoček</div>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'produced_ready_for_handover' ? 'all' : 'produced_ready_for_handover')}
          className={`p-3 rounded-xl border text-left transition-all ${
            statusFilter === 'produced_ready_for_handover'
              ? 'bg-emerald-100/70 border-emerald-400 ring-2 ring-emerald-300'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="text-slate-500 text-[11px] font-medium">4. Hotovo (K výdeji)</div>
          <div className="text-xl font-bold font-mono text-emerald-800 mt-1">{counts.readyHandover}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Připraveno k předání</div>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'handed_over' ? 'all' : 'handed_over')}
          className={`p-3 rounded-xl border text-left transition-all ${
            statusFilter === 'handed_over'
              ? 'bg-slate-200 border-slate-400 ring-2 ring-slate-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-slate-500 text-[11px] font-medium">5. Předáno</div>
          <div className="text-xl font-bold font-mono text-slate-800 mt-1">{counts.handedOver}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Zaměstnanec používá</div>
        </button>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative min-w-[240px] flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hledat zaměstnance, os. číslo, oddělení..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
          >
            <option value="all">Všechny stavy zakázky</option>
            <option value="pending_screening">Čeká na měření zraku</option>
            <option value="screened_ready_for_production">Změřeno ➔ K výrobě</option>
            <option value="in_production">Ve výrobě</option>
            <option value="produced_ready_for_handover">Vyrobeno ➔ K předání</option>
            <option value="handed_over">Předáno zaměstnanci</option>
          </select>

          <select
            value={correctionFilter}
            onChange={(e) => setCorrectionFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
          >
            <option value="all">Všechny typy korekce</option>
            <option value="distance">Na dálku</option>
            <option value="near_work">Na blízko / montáž</option>
            <option value="bifocal">Bifokální</option>
            <option value="progressive">Multifokální / progresivní</option>
            <option value="safety_general">Ochranné obecné</option>
          </select>

          {(search || statusFilter !== 'all' || correctionFilter !== 'all') && (
            <button
              onClick={() => { setSearch(''); setStatusFilter('all'); setCorrectionFilter('all'); }}
              className="text-slate-500 hover:text-slate-800 font-medium px-2 py-1"
            >
              Reset filtrů
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Zaměstnanec</th>
                <th className="py-2.5 px-3">Oddělení & Hala</th>
                <th className="py-2.5 px-3">Požadovaná korekce</th>
                <th className="py-2.5 px-3">Rizika pracoviště</th>
                <th className="py-2.5 px-3">Naměřené dioptrie (OD / OS)</th>
                <th className="py-2.5 px-3">Model obruby & čoček</th>
                <th className="py-2.5 px-3">Stav výroby brýlí</th>
                <th className="py-2.5 px-3 text-right">Akce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Nebyly nalezeny žádné zakázky odpovídající filtru.
                  </td>
                </tr>
              ) : (
                filtered.map(req => {
                  const hall = halls.find(h => h.id === req.hallId);
                  const opt = req.opticalRecord;

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {req.employeeName}
                        {req.employeeId && (
                          <span className="block font-mono text-[11px] text-slate-500 font-normal">
                            {req.employeeId}
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="text-slate-800 font-medium">{req.department}</div>
                        <div className="text-[11px] font-mono text-slate-500">{hall ? hall.code : req.hallId}</div>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-800 block">
                          {getCorrectionLabel(req.preferredCorrection)}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {req.currentGlassesUser ? 'Dosud brýle nosí' : 'První brýle'}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-600 max-w-[160px] truncate" title={req.workplaceVisualHazard}>
                        {req.workplaceVisualHazard || '-'}
                      </td>

                      {/* Optical Refraction Data */}
                      <td className="py-2.5 px-3">
                        {opt ? (
                          <div className="font-mono text-[11px] space-y-0.5">
                            <div><strong>P:</strong> {opt.rightEyeSph > 0 ? `+${opt.rightEyeSph}` : opt.rightEyeSph} dpt {opt.rightEyeCyl ? `(cyl ${opt.rightEyeCyl})` : ''}</div>
                            <div><strong>L:</strong> {opt.leftEyeSph > 0 ? `+${opt.leftEyeSph}` : opt.leftEyeSph} dpt {opt.leftEyeCyl ? `(cyl ${opt.leftEyeCyl})` : ''}</div>
                            <div className="text-[10px] text-slate-400">PD: {opt.pdDistanceMm || 63} mm</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Čeká na měření</span>
                        )}
                      </td>

                      {/* Frame Model & Lens */}
                      <td className="py-2.5 px-3">
                        {opt ? (
                          <div className="text-[11px]">
                            <div className="font-semibold text-slate-800">{opt.frameModel}</div>
                            <div className="text-slate-500 capitalize">{opt.lensMaterial}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Výběr při měření</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        {getStatusBadge(req.glassesStatus)}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Optometrist measurement entry button */}
                          <button
                            type="button"
                            onClick={() => handleOpenExamModal(req)}
                            className="px-2 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold rounded text-xs border border-emerald-200 transition-colors"
                            title="Zapsat nebo upravit výsledek optometrického vyšetření zraku"
                          >
                            <Eye className="w-3.5 h-3.5 inline mr-1" />
                            <span>{opt ? 'Upravit dioptrie' : 'Zapsat zrak'}</span>
                          </button>

                          {/* Fast forward status buttons */}
                          {req.glassesStatus === 'screened_ready_for_production' && (
                            <button
                              type="button"
                              onClick={() => updateGlassesStatus(req.id, 'in_production')}
                              className="px-2 py-1 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 font-semibold rounded text-xs border border-indigo-200 transition-colors"
                              title="Předat do optické laboratoře k výrobě"
                            >
                              Do výroby ➔
                            </button>
                          )}

                          {req.glassesStatus === 'in_production' && (
                            <button
                              type="button"
                              onClick={() => updateGlassesStatus(req.id, 'produced_ready_for_handover')}
                              className="px-2 py-1 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold rounded text-xs transition-colors shadow-xs"
                              title="Označit brýle za vyrobené a připravené k výdeji"
                            >
                              Vyrobeno ✓
                            </button>
                          )}

                          {req.glassesStatus === 'produced_ready_for_handover' && (
                            <button
                              type="button"
                              onClick={() => updateGlassesStatus(req.id, 'handed_over')}
                              className="px-2 py-1 bg-slate-800 text-white hover:bg-slate-900 font-semibold rounded text-xs transition-colors shadow-xs"
                              title="Potvrdit předání brýlí zaměstnanci na hale"
                            >
                              Předat ✍
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Record Optometric Exam Result */}
      {selectedReqForExam && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-700" />
                  <span>Protokol vyšetření zraku pro dioptrické brýle</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Zaměstnanec: <strong>{selectedReqForExam.employeeName}</strong> ({selectedReqForExam.department})
                </p>
              </div>
              <button onClick={() => setSelectedReqForExam(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-4 text-xs">
              
              {/* Right Eye (OD) */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="font-bold text-slate-800 text-xs flex items-center justify-between">
                  <span>Pravé oko (OD - Oculus Dexter)</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-600">Sféra SPH (dpt) *</label>
                    <input
                      type="number"
                      step="0.25"
                      required
                      value={examForm.rightEyeSph}
                      onChange={(e) => setExamForm({ ...examForm, rightEyeSph: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600">Cylindr CYL</label>
                    <input
                      type="number"
                      step="0.25"
                      value={examForm.rightEyeCyl || 0}
                      onChange={(e) => setExamForm({ ...examForm, rightEyeCyl: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600">Osa AXIS (°)</label>
                    <input
                      type="number"
                      min={0}
                      max={180}
                      value={examForm.rightEyeAxis || 0}
                      onChange={(e) => setExamForm({ ...examForm, rightEyeAxis: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Left Eye (OS) */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="font-bold text-slate-800 text-xs flex items-center justify-between">
                  <span>Levé oko (OS - Oculus Sinister)</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-600">Sféra SPH (dpt) *</label>
                    <input
                      type="number"
                      step="0.25"
                      required
                      value={examForm.leftEyeSph}
                      onChange={(e) => setExamForm({ ...examForm, leftEyeSph: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600">Cylindr CYL</label>
                    <input
                      type="number"
                      step="0.25"
                      value={examForm.leftEyeCyl || 0}
                      onChange={(e) => setExamForm({ ...examForm, leftEyeCyl: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600">Osa AXIS (°)</label>
                    <input
                      type="number"
                      min={0}
                      max={180}
                      value={examForm.leftEyeAxis || 0}
                      onChange={(e) => setExamForm({ ...examForm, leftEyeAxis: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* PD & Lens Material & Frame Model */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Zornicová vzdálenost PD (mm)</label>
                  <input
                    type="number"
                    min={50}
                    max={76}
                    value={examForm.pdDistanceMm || 63}
                    onChange={(e) => setExamForm({ ...examForm, pdDistanceMm: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Materiál bezpečnostních čoček</label>
                  <select
                    value={examForm.lensMaterial}
                    onChange={(e) => setExamForm({ ...examForm, lensMaterial: e.target.value as any })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                  >
                    <option value="polycarbonate">Polykarbonát (EN 166 F nárazuvzdorný)</option>
                    <option value="trivex">Trivex (lehký a chemicky odolný)</option>
                    <option value="hardened_resin">Tvrzený optický plast CR-39</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Vybraný model ochranné obruby</label>
                <select
                  value={examForm.frameModel}
                  onChange={(e) => setExamForm({ ...examForm, frameModel: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                >
                  <option value="UVEX rx 5505 (Polykarbonát s boční ochranou)">UVEX rx 5505 (Polykarbonát s boční ochranou)</option>
                  <option value="Univet 5X7 dioptrické ochranné">Univet 5X7 dioptrické ochranné (kompatibilní s respirátorem)</option>
                  <option value="Infield Terminator RX (dielektrické pro BEV)">Infield Terminator RX (dielektrické pro BEV baterie)</option>
                  <option value="Bollé Safety Contour RX">Bollé Safety Contour RX (lehké sportovní)</option>
                  <option value="3M Maxim RX (pro svařování a karosárnu)">3M Maxim RX (pro svařování a karosárnu)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Poznámka optometristy pro optickou dílnu</label>
                <textarea
                  rows={2}
                  value={examForm.optometristNotes || ''}
                  onChange={(e) => setExamForm({ ...examForm, optometristNotes: e.target.value })}
                  placeholder="Antireflex, antifog, montážní těsnění..."
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="text-[11px] text-slate-500">
                  Uložením se stav zakázky posune na „Změřeno ➔ K výrobě“.
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReqForExam(null)}
                    className="px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 rounded-lg text-xs"
                  >
                    Zrušit
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Uložit výsledek měření zraku</span>
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
