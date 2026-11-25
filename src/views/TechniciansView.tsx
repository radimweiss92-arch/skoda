import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  UserCheck2, 
  Plus, 
  Edit3, 
  Trash2, 
  Clock, 
  Calendar, 
  Coffee, 
  X,
  Phone,
  Mail,
  Shield
} from 'lucide-react';
import { Technician, ShiftType, BreakPeriod } from '../types';

export const TechniciansView: React.FC = () => {
  const { technicians, addTechnician, updateTechnician, deleteTechnician, settings } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    email: string;
    phone: string;
    active: boolean;
    workDays: string[];
    availableShifts: ShiftType[];
    morningStart: string;
    morningEnd: string;
    afternoonStart: string;
    afternoonEnd: string;
    breaks: BreakPeriod[];
    notes: string;
  }>({
    name: '',
    code: '',
    email: '',
    phone: '',
    active: true,
    workDays: ['2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14'],
    availableShifts: ['morning', 'afternoon'],
    morningStart: '06:00',
    morningEnd: '14:00',
    afternoonStart: '14:00',
    afternoonEnd: '22:00',
    breaks: [{ start: '10:30', end: '11:00', label: 'Obědová pauza' }],
    notes: ''
  });

  const handleOpenModal = (tech?: Technician) => {
    if (tech) {
      setEditingTech(tech);
      setFormData({
        name: tech.name,
        code: tech.code,
        email: tech.email,
        phone: tech.phone,
        active: tech.active,
        workDays: tech.workDays,
        availableShifts: tech.availableShifts,
        morningStart: tech.shiftHours.morning.start,
        morningEnd: tech.shiftHours.morning.end,
        afternoonStart: tech.shiftHours.afternoon.start,
        afternoonEnd: tech.shiftHours.afternoon.end,
        breaks: tech.breaks,
        notes: tech.notes || ''
      });
    } else {
      setEditingTech(null);
      const nextNum = technicians.length + 1;
      setFormData({
        name: '',
        code: `M-0${nextNum}`,
        email: '',
        phone: '+420 326 811 000',
        active: true,
        workDays: ['2026-11-10', '2026-11-11', '2026-11-12'],
        availableShifts: ['morning', 'afternoon'],
        morningStart: settings.morningShiftStart,
        morningEnd: settings.morningShiftEnd,
        afternoonStart: settings.afternoonShiftStart,
        afternoonEnd: settings.afternoonShiftEnd,
        breaks: [{ start: '10:30', end: '11:00', label: 'Obědová pauza' }],
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleAddBreak = () => {
    setFormData(prev => ({
      ...prev,
      breaks: [...prev.breaks, { start: '17:30', end: '18:00', label: 'Pauza' }]
    }));
  };

  const handleRemoveBreak = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      breaks: prev.breaks.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    const payload = {
      name: formData.name,
      code: formData.code,
      email: formData.email,
      phone: formData.phone,
      active: formData.active,
      workDays: formData.workDays,
      availableShifts: formData.availableShifts,
      shiftHours: {
        morning: { start: formData.morningStart, end: formData.morningEnd },
        afternoon: { start: formData.afternoonStart, end: formData.afternoonEnd }
      },
      breaks: formData.breaks,
      notes: formData.notes
    };

    if (editingTech) {
      updateTechnician(editingTech.id, payload);
    } else {
      addTechnician(payload);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Měřiči výjezdu – Jaromír Kolomazník & Ondřej Švébis
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Měření zraku zaměstnanců Škoda Auto zajišťuje přímo majitel firmy pan Jaromír Kolomazník a pan Ondřej Švébis
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 text-slate-500" />
          <span>Zavést dalšího měřiče</span>
        </button>
      </div>

      {/* Domain Context Notice */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <UserCheck2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>
            <strong>Volba měřičů pro výjezd:</strong> Na výjezd může jet buď pouze pan <strong>Jaromír Kolomazník</strong>, pouze pan <strong>Ondřej Švébis</strong>, nebo <strong>oba současně</strong>. Přepínačem u každého měřiče můžete určit, kdo je pro danou akci aktivní – plánovací algoritmus podle toho automaticky sestaví harmonogram.
          </span>
        </div>
        <span className="font-mono text-emerald-800 font-semibold shrink-0 bg-emerald-100 px-2 py-1 rounded">
          Aktivní pro výjezd: {technicians.filter(t => t.active).length} z {technicians.length}
        </span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {technicians.map(tech => (
          <div key={tech.id} className={`bg-white border rounded-xl p-5 shadow-xs space-y-4 ${tech.active ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-200 opacity-80'}`}>
            
            {/* Header info */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-800">
                    {tech.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateTechnician(tech.id, { active: !tech.active })}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      tech.active 
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Klikněte pro přepnutí aktivního zapojení do plánovacího algoritmu"
                  >
                    {tech.active ? '✓ Aktivní v plánu' : '○ Neaktivní (v záloze)'}
                  </button>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1.5">
                  {tech.name}
                </h3>
                {tech.title && (
                  <p className="text-[11px] text-emerald-800 font-medium">{tech.title}</p>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenModal(tech)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded"
                  title="Upravit měřiče"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteTechnician(tech.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  title="Odstranit"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Shifts & Hours */}
            <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Dostupné směny:</span>
                </span>
                <span className="font-semibold text-slate-800">
                  {tech.availableShifts.map(s => s === 'morning' ? 'Ranní' : 'Odpolední').join(' + ')}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pracovní dny:</span>
                </span>
                <span className="font-mono text-slate-800">
                  {tech.workDays.length} dnů v týdnu
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5 text-slate-400" />
                  <span>Přestávky:</span>
                </span>
                <span className="font-mono text-slate-800">
                  {tech.breaks.map(b => `${b.start}–${b.end}`).join(', ') || 'Žádné'}
                </span>
              </div>
            </div>

            {/* Notes / Specialization */}
            {tech.notes && (
              <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                {tech.notes}
              </div>
            )}

            {/* Contact */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              <span>{tech.email}</span>
              <span>{tech.phone}</span>
            </div>

          </div>
        ))}
      </div>

      {/* Modal for Add / Edit Technician */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingTech ? 'Upravit měřiče' : 'Přidat nového měřiče'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Jméno a příjmení *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Např. Ing. Jan Novák"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Interní označení *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="M-01"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">E-mail</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jan.novak@skoda-auto.cz"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Telefon</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+420 326 ..."
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Shifts checkboxes */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Dostupné směny měřiče</label>
                <div className="flex items-center gap-6 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={formData.availableShifts.includes('morning')}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...formData.availableShifts, 'morning']
                          : formData.availableShifts.filter(s => s !== 'morning');
                        setFormData({ ...formData, availableShifts: next as ShiftType[] });
                      }}
                    />
                    <span>Ranní směna</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={formData.availableShifts.includes('afternoon')}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...formData.availableShifts, 'afternoon']
                          : formData.availableShifts.filter(s => s !== 'afternoon');
                        setFormData({ ...formData, availableShifts: next as ShiftType[] });
                      }}
                    />
                    <span>Odpolední směna</span>
                  </label>
                </div>
              </div>

              {/* Work days */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Pracovní dny (datumy YYYY-MM-DD)</label>
                <input
                  type="text"
                  value={formData.workDays.join(', ')}
                  onChange={(e) => {
                    const split = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setFormData({ ...formData, workDays: split });
                  }}
                  placeholder="2026-11-10, 2026-11-11, 2026-11-12"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* Breaks */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">Přestávky a oběd</label>
                  <button
                    type="button"
                    onClick={handleAddBreak}
                    className="text-emerald-700 hover:underline font-semibold"
                  >
                    + Přidat přestávku
                  </button>
                </div>

                {formData.breaks.map((b, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={b.label}
                      onChange={(e) => {
                        const updated = [...formData.breaks];
                        updated[i].label = e.target.value;
                        setFormData({ ...formData, breaks: updated });
                      }}
                      placeholder="Název (např. Oběd)"
                      className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                    />
                    <input
                      type="text"
                      value={b.start}
                      onChange={(e) => {
                        const updated = [...formData.breaks];
                        updated[i].start = e.target.value;
                        setFormData({ ...formData, breaks: updated });
                      }}
                      placeholder="10:30"
                      className="w-16 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono"
                    />
                    <span className="text-slate-400">–</span>
                    <input
                      type="text"
                      value={b.end}
                      onChange={(e) => {
                        const updated = [...formData.breaks];
                        updated[i].end = e.target.value;
                        setFormData({ ...formData, breaks: updated });
                      }}
                      placeholder="11:00"
                      className="w-16 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveBreak(i)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Individuální omezení nebo specializace</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Např. Specializace na mikroklima, měření hluku..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm"
                >
                  {editingTech ? 'Uložit změny' : 'Přidat měřiče'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
