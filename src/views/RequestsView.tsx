import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Upload, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  X,
  Calendar,
  Building,
  User,
  Clock
} from 'lucide-react';
import { MeasurementRequest, ShiftType, EyeCorrectionType } from '../types';
import { parseEmployeeFile, ImportPreviewItem } from '../services/excelService';

export const RequestsView: React.FC = () => {
  const { 
    requests, 
    addRequest, 
    updateRequest, 
    deleteRequest, 
    bulkAddRequests, 
    halls, 
    currentManagerName, 
    settings
  } = useApp();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHallFilter, setSelectedHallFilter] = useState('');
  const [selectedShiftFilter, setSelectedShiftFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');

  // Modals state
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<MeasurementRequest | null>(null);

  // Single Form State
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    department: '',
    managerName: currentManagerName,
    hallId: halls[0]?.id || '',
    requestedDates: ['2026-11-10'],
    availableShifts: ['morning'] as ShiftType[],
    durationMinutes: 25,
    currentGlassesUser: false,
    preferredCorrection: 'safety_general' as EyeCorrectionType,
    workplaceVisualHazard: '',
    notes: ''
  });

  // Bulk Grid State
  const [bulkRows, setBulkRows] = useState<Array<{
    employeeName: string;
    employeeId: string;
    department: string;
    hallId: string;
    requestedDates: string[];
    availableShifts: ShiftType[];
    durationMinutes: number;
    notes: string;
  }>>([
    {
      employeeName: '',
      employeeId: '',
      department: 'Výroba Octavia',
      hallId: halls[0]?.id || '',
      requestedDates: ['2026-11-10'],
      availableShifts: ['morning'],
      durationMinutes: 30,
      notes: ''
    }
  ]);

  // Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<ImportPreviewItem[]>([]);
  const [importSummary, setImportSummary] = useState<{ validCount: number; errorCount: number; duplicateCount: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Filtered Requests
  const filteredRequests = requests.filter(req => {
    const matchSearch = 
      req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.employeeId && req.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      req.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.managerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchHall = !selectedHallFilter || req.hallId === selectedHallFilter;
    const matchShift = !selectedShiftFilter || req.availableShifts.includes(selectedShiftFilter as ShiftType);
    const matchStatus = !selectedStatusFilter || req.status === selectedStatusFilter;

    return matchSearch && matchHall && matchShift && matchStatus;
  });

  // Open single modal
  const handleOpenSingle = (reqToEdit?: MeasurementRequest) => {
    if (reqToEdit) {
      setEditingRequest(reqToEdit);
      setFormData({
        employeeName: reqToEdit.employeeName,
        employeeId: reqToEdit.employeeId || '',
        department: reqToEdit.department,
        managerName: reqToEdit.managerName,
        hallId: reqToEdit.hallId,
        requestedDates: reqToEdit.requestedDates,
        availableShifts: reqToEdit.availableShifts,
        durationMinutes: reqToEdit.durationMinutes,
        currentGlassesUser: reqToEdit.currentGlassesUser,
        preferredCorrection: reqToEdit.preferredCorrection,
        workplaceVisualHazard: reqToEdit.workplaceVisualHazard || '',
        notes: reqToEdit.notes || ''
      });
    } else {
      setEditingRequest(null);
      setFormData({
        employeeName: '',
        employeeId: '',
        department: 'Výroba Octavia',
        managerName: currentManagerName,
        hallId: halls[0]?.id || '',
        requestedDates: ['2026-11-10'],
        availableShifts: ['morning'],
        durationMinutes: settings.defaultMeasurementMinutes,
        currentGlassesUser: false,
        preferredCorrection: 'safety_general',
        workplaceVisualHazard: 'Mechanické riziko – montáž',
        notes: ''
      });
    }
    setIsSingleModalOpen(true);
  };

  // Submit Single Form
  const handleSubmitSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeName.trim()) return;

    if (editingRequest) {
      updateRequest(editingRequest.id, {
        employeeName: formData.employeeName,
        employeeId: formData.employeeId || undefined,
        department: formData.department,
        managerName: formData.managerName,
        hallId: formData.hallId,
        requestedDates: formData.requestedDates,
        availableShifts: formData.availableShifts,
        durationMinutes: Number(formData.durationMinutes),
        currentGlassesUser: formData.currentGlassesUser,
        preferredCorrection: formData.preferredCorrection,
        workplaceVisualHazard: formData.workplaceVisualHazard,
        notes: formData.notes || undefined
      });
    } else {
      addRequest({
        employeeName: formData.employeeName,
        employeeId: formData.employeeId || undefined,
        department: formData.department,
        managerName: formData.managerName,
        hallId: formData.hallId,
        requestedDates: formData.requestedDates,
        availableShifts: formData.availableShifts,
        durationMinutes: Number(formData.durationMinutes),
        currentGlassesUser: formData.currentGlassesUser,
        preferredCorrection: formData.preferredCorrection,
        workplaceVisualHazard: formData.workplaceVisualHazard,
        glassesStatus: 'pending_screening',
        notes: formData.notes || undefined
      });
    }
    setIsSingleModalOpen(false);
  };

  // Bulk actions
  const handleAddBulkRow = () => {
    const last = bulkRows[bulkRows.length - 1];
    setBulkRows(prev => [
      ...prev,
      {
        employeeName: '',
        employeeId: '',
        department: last ? last.department : 'Výroba',
        hallId: last ? last.hallId : (halls[0]?.id || ''),
        requestedDates: last ? [...last.requestedDates] : ['2026-11-10'],
        availableShifts: last ? [...last.availableShifts] : ['morning'],
        durationMinutes: last ? last.durationMinutes : 30,
        notes: ''
      }
    ]);
  };

  const handleDuplicateBulkRow = (index: number) => {
    const row = bulkRows[index];
    setBulkRows(prev => [
      ...prev.slice(0, index + 1),
      { ...row, employeeName: `${row.employeeName} (kopie)` },
      ...prev.slice(index + 1)
    ]);
  };

  const handleRemoveBulkRow = (index: number) => {
    if (bulkRows.length === 1) return;
    setBulkRows(prev => prev.filter((_, i) => i !== index));
  };

  const handleBulkSubmit = () => {
    const valid = bulkRows.filter(r => r.employeeName.trim().length > 0);
    if (valid.length === 0) return;

    bulkAddRequests(valid.map(r => ({
      ...r,
      managerName: currentManagerName,
      status: 'pending'
    })));

    setIsBulkModalOpen(false);
    setBulkRows([
      {
        employeeName: '',
        employeeId: '',
        department: 'Výroba',
        hallId: halls[0]?.id || '',
        requestedDates: ['2026-11-10'],
        availableShifts: ['morning'],
        durationMinutes: 30,
        notes: ''
      }
    ]);
  };

  // Import handler
  const handleFileProcess = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (buffer) {
        const { preview, validCount, errorCount, duplicateCount } = parseEmployeeFile(buffer, halls);
        setImportPreview(preview);
        setImportSummary({ validCount, errorCount, duplicateCount });
        setIsImportModalOpen(true);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmImport = () => {
    const validItems = importPreview.filter(p => p.valid).map(p => p.data);
    if (validItems.length > 0) {
      bulkAddRequests(validItems);
    }
    setIsImportModalOpen(false);
    setImportPreview([]);
    setImportSummary(null);
  };

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Požadavky na měření zaměstnanců
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Evidence požadavků od mistrů a manažerů provozu · Celkem {requests.length} požadavků
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (fileInputRef.current) fileInputRef.current.click();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Importovat Excel / CSV</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileProcess(file);
            }}
          />

          <button
            type="button"
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Copy className="w-3.5 h-3.5 text-slate-600" />
            <span>Hromadné zadání</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenSingle()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nový požadavek</span>
          </button>
        </div>
      </div>

      {/* Email Excel Import Banner */}
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFileProcess(file);
        }}
        className={`p-4 border rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
          isDragging 
            ? 'bg-emerald-100 border-emerald-500 ring-2 ring-emerald-400' 
            : 'bg-emerald-50/70 border-emerald-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>Import seznamů zaměstnanců zaslaných e-mailem</span>
              <span className="text-[10px] font-semibold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                Bez nutnosti přístupu vedoucích
              </span>
            </h3>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Vedoucí provozu a mistři posílají soubory v Excelu e-mailem. Zde stačí soubor (.xlsx / .csv) nahrát nebo přetáhnout myší – aplikace automaticky rozpozná sloupce (jméno, hala, směna, oddělení) a vytvoří požadavky.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (fileInputRef.current) fileInputRef.current.click();
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Nahrát Excel z e-mailu</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Search */}
        <div className="relative min-w-[240px] flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Hledat zaměstnance, os. číslo, oddělení..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Hall Filter */}
          <select
            value={selectedHallFilter}
            onChange={(e) => setSelectedHallFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="">Všechny haly</option>
            {halls.map(h => (
              <option key={h.id} value={h.id}>{h.code} – {h.name}</option>
            ))}
          </select>

          {/* Shift Filter */}
          <select
            value={selectedShiftFilter}
            onChange={(e) => setSelectedShiftFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="">Všechny směny</option>
            <option value="morning">Ranní směna</option>
            <option value="afternoon">Odpolední směna</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="">Všechny stavy</option>
            <option value="pending">Čeká na naplánování</option>
            <option value="scheduled">Naplánováno v harmonogramu</option>
            <option value="unassigned">Nezařazeno (kolize / limit)</option>
          </select>

          {(searchTerm || selectedHallFilter || selectedShiftFilter || selectedStatusFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedHallFilter('');
                setSelectedShiftFilter('');
                setSelectedStatusFilter('');
              }}
              className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 font-medium"
            >
              Reset filtrů
            </button>
          )}
        </div>

      </div>

      {/* Requests Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Zaměstnanec</th>
                <th className="py-2.5 px-3">Os. číslo</th>
                <th className="py-2.5 px-3">Oddělení / Tým</th>
                <th className="py-2.5 px-3">Hala</th>
                <th className="py-2.5 px-3">Dostupná data</th>
                <th className="py-2.5 px-3">Směny</th>
                <th className="py-2.5 px-3">Délka</th>
                <th className="py-2.5 px-3">Zadal manažer</th>
                <th className="py-2.5 px-3">Stav</th>
                <th className="py-2.5 px-3 text-right">Akce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    Nebyly nalezeny žádné požadavky odpovídající zadaným filtrům.
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => {
                  const hall = halls.find(h => h.id === req.hallId);

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      
                      {/* Name */}
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {req.employeeName}
                        {req.notes && (
                          <span className="block text-[11px] font-normal text-slate-500 truncate max-w-[180px]" title={req.notes}>
                            {req.notes}
                          </span>
                        )}
                      </td>

                      {/* ID */}
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {req.employeeId || '-'}
                      </td>

                      {/* Department */}
                      <td className="py-2.5 px-3 text-slate-700">
                        {req.department}
                      </td>

                      {/* Hall */}
                      <td className="py-2.5 px-3">
                        {hall ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-800">{hall.code}</span>
                            <span className="text-[11px] text-slate-500 truncate max-w-[120px]">{hall.name}</span>
                          </div>
                        ) : '-'}
                      </td>

                      {/* Dates */}
                      <td className="py-2.5 px-3 font-mono text-slate-700">
                        {req.requestedDates.join(', ')}
                      </td>

                      {/* Shifts */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1">
                          {req.availableShifts.includes('morning') && (
                            <span className="text-[11px] text-emerald-800 font-medium">
                              Ranní
                            </span>
                          )}
                          {req.availableShifts.includes('morning') && req.availableShifts.includes('afternoon') && (
                            <span className="text-slate-400">/</span>
                          )}
                          {req.availableShifts.includes('afternoon') && (
                            <span className="text-[11px] text-sky-800 font-medium">
                              Odpolední
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-700">
                        {req.durationMinutes} min
                      </td>

                      {/* Manager */}
                      <td className="py-2.5 px-3 text-slate-600">
                        {req.managerName}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        {req.status === 'scheduled' ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Naplánováno</span>
                          </span>
                        ) : req.status === 'unassigned' ? (
                          <span className="text-amber-700 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>Nezařazeno</span>
                          </span>
                        ) : (
                          <span className="text-slate-600 font-medium">
                            Čeká na plán
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenSingle(req)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                            title="Upravit požadavek"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteRequest(req.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Smazat požadavek"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* MODAL 1: Single Request Form */}
      {isSingleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingRequest ? 'Upravit požadavek na měření' : 'Zadat nový požadavek na měření'}
              </h3>
              <button 
                onClick={() => setIsSingleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitSingle} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Jméno a příjmení zaměstnance *</label>
                  <input
                    type="text"
                    required
                    value={formData.employeeName}
                    onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                    placeholder="Např. Jan Dvořák"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Osobní / ID číslo</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="Např. SK-44910"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Oddělení nebo tým *</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Např. Výroba Octavia - Takt 3"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Výrobní hala *</label>
                  <select
                    value={formData.hallId}
                    onChange={(e) => setFormData({ ...formData, hallId: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    {halls.map(h => (
                      <option key={h.id} value={h.id}>
                        {h.code} – {h.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Shift Selection: Morning vs Afternoon */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">
                  Dostupnost zaměstnance na směnách *
                </label>
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
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Ranní směna ({settings.morningShiftStart}–{settings.morningShiftEnd})</span>
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
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Odpolední směna ({settings.afternoonShiftStart}–{settings.afternoonShiftEnd})</span>
                  </label>
                </div>
                {formData.availableShifts.length === 0 && (
                  <p className="text-[11px] text-rose-600">Vyberte alespoň jednu směnu.</p>
                )}
              </div>

              {/* Dates & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Dostupná data (čárkou oddělená)</label>
                  <input
                    type="text"
                    value={formData.requestedDates.join(', ')}
                    onChange={(e) => {
                      const split = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setFormData({ ...formData, requestedDates: split });
                    }}
                    placeholder="2026-11-10, 2026-11-11"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Délka měření (minuty)</label>
                  <input
                    type="number"
                    min={10}
                    max={180}
                    step={5}
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Eye Screening & Glasses Requirements */}
              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-3">
                <div className="font-semibold text-emerald-950 flex items-center justify-between">
                  <span>Specifikace pracovních dioptrických brýlí</span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-normal">
                    <input
                      type="checkbox"
                      checked={formData.currentGlassesUser}
                      onChange={(e) => setFormData({ ...formData, currentGlassesUser: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Zaměstnanec již v současnosti nosí brýle</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium">Požadovaný typ dioptrické korekce</label>
                    <select
                      value={formData.preferredCorrection}
                      onChange={(e) => setFormData({ ...formData, preferredCorrection: e.target.value as any })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    >
                      <option value="safety_general">Základní ochranné dioptrické brýle</option>
                      <option value="distance">Na dálku (VZV, sklad, dispečink)</option>
                      <option value="near_work">Na blízko / montáž (linka, jemné díly)</option>
                      <option value="bifocal">Bifokální (střídání blízko / dálka)</option>
                      <option value="progressive">Multifokální / progresivní (univerzální)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium">Rizika pro zrak na pracovišti</label>
                    <input
                      type="text"
                      value={formData.workplaceVisualHazard}
                      onChange={(e) => setFormData({ ...formData, workplaceVisualHazard: e.target.value })}
                      placeholder="Např. odlétající špony, jiskry, prach, LED odlesky..."
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Poznámka pro optometristu nebo omezení</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Např. zrakové obtíže při čtení výkresů, požadována antistatická nebo dielektrická obruba..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSingleModalOpen(false)}
                  className="px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  disabled={formData.availableShifts.length === 0}
                  className="px-4 py-1.5 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg shadow-sm"
                >
                  {editingRequest ? 'Uložit změny' : 'Přidat požadavek'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Bulk Entry Grid */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-4xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Hromadné zadávání požadavků
                </h3>
                <p className="text-xs text-slate-500">
                  Přidejte více zaměstnanců najednou nebo duplikujte řádky pro zrychlení práce.
                </p>
              </div>
              <button 
                onClick={() => setIsBulkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Rows list */}
            <div className="overflow-y-auto space-y-3 flex-1 pr-1 text-xs">
              {bulkRows.map((row, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Řádek #{idx + 1}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicateBulkRow(idx)}
                        className="p-1 text-slate-500 hover:text-slate-800 rounded"
                        title="Zkopírovat řádek"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {bulkRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBulkRow(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Odstranit řádek"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Jméno a příjmení *"
                      value={row.employeeName}
                      onChange={(e) => {
                        const updated = [...bulkRows];
                        updated[idx].employeeName = e.target.value;
                        setBulkRows(updated);
                      }}
                      className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Osobní číslo"
                      value={row.employeeId}
                      onChange={(e) => {
                        const updated = [...bulkRows];
                        updated[idx].employeeId = e.target.value;
                        setBulkRows(updated);
                      }}
                      className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Oddělení / linka"
                      value={row.department}
                      onChange={(e) => {
                        const updated = [...bulkRows];
                        updated[idx].department = e.target.value;
                        setBulkRows(updated);
                      }}
                      className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs"
                    />
                    <select
                      value={row.hallId}
                      onChange={(e) => {
                        const updated = [...bulkRows];
                        updated[idx].hallId = e.target.value;
                        setBulkRows(updated);
                      }}
                      className="bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                    >
                      {halls.map(h => (
                        <option key={h.id} value={h.id}>{h.code} – {h.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={row.availableShifts.includes('morning')}
                          onChange={(e) => {
                            const updated = [...bulkRows];
                            const current = updated[idx].availableShifts;
                            updated[idx].availableShifts = e.target.checked
                              ? [...current, 'morning']
                              : current.filter(s => s !== 'morning');
                            setBulkRows(updated);
                          }}
                        />
                        <span>Ranní</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={row.availableShifts.includes('afternoon')}
                          onChange={(e) => {
                            const updated = [...bulkRows];
                            const current = updated[idx].availableShifts;
                            updated[idx].availableShifts = e.target.checked
                              ? [...current, 'afternoon']
                              : current.filter(s => s !== 'afternoon');
                            setBulkRows(updated);
                          }}
                        />
                        <span>Odpolední</span>
                      </label>
                    </div>

                    <input
                      type="text"
                      placeholder="Dny (např. 2026-11-10)"
                      value={row.requestedDates.join(', ')}
                      onChange={(e) => {
                        const updated = [...bulkRows];
                        updated[idx].requestedDates = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setBulkRows(updated);
                      }}
                      className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-mono"
                    />

                    <input
                      type="text"
                      placeholder="Poznámka / omezení"
                      value={row.notes}
                      onChange={(e) => {
                        const updated = [...bulkRows];
                        updated[idx].notes = e.target.value;
                        setBulkRows(updated);
                      }}
                      className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddBulkRow}
                className="w-full py-2 border-2 border-dashed border-slate-300 text-slate-600 hover:border-emerald-600 hover:text-emerald-700 rounded-lg flex items-center justify-center gap-1.5 font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Přidat další řádek</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 shrink-0">
              <span className="text-xs text-slate-500 font-mono">
                {bulkRows.filter(r => r.employeeName.trim().length > 0).length} platných řádků
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 rounded-lg text-xs"
                >
                  Zrušit
                </button>
                <button
                  type="button"
                  onClick={handleBulkSubmit}
                  className="px-4 py-1.5 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg text-xs shadow-sm"
                >
                  Uložit všechny požadavky
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: Import Preview & Confirmation */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-4xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Náhled importu z Excelu / CSV
                </h3>
                <p className="text-xs text-slate-500">
                  Automatická kontrola sloupců, povinných údajů a duplicit před importem do systému.
                </p>
              </div>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Summary counters */}
            {importSummary && (
              <div className="grid grid-cols-3 gap-3 shrink-0 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="font-semibold text-emerald-800">Správné řádky k importu</div>
                  <div className="text-lg font-bold text-emerald-900 font-mono">{importSummary.validCount}</div>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="font-semibold text-amber-800">Duplicity</div>
                  <div className="text-lg font-bold text-amber-900 font-mono">{importSummary.duplicateCount}</div>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                  <div className="font-semibold text-rose-800">Chybné řádky (budou přeskočeny)</div>
                  <div className="text-lg font-bold text-rose-900 font-mono">{importSummary.errorCount}</div>
                </div>
              </div>
            )}

            {/* Preview table */}
            <div className="overflow-y-auto flex-1 border border-slate-200 rounded-lg text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 font-semibold text-slate-600">
                  <tr>
                    <th className="p-2">Stav</th>
                    <th className="p-2">Zaměstnanec</th>
                    <th className="p-2">Os. číslo</th>
                    <th className="p-2">Oddělení</th>
                    <th className="p-2">Hala</th>
                    <th className="p-2">Dny</th>
                    <th className="p-2">Směny</th>
                    <th className="p-2">Chyby / upozornění</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {importPreview.map((item, idx) => {
                    const hall = halls.find(h => h.id === item.data.hallId);

                    return (
                      <tr key={idx} className={item.valid ? 'hover:bg-slate-50' : 'bg-rose-50/40 text-rose-900'}>
                        <td className="p-2">
                          {item.valid ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>OK</span>
                            </span>
                          ) : (
                            <span className="text-rose-700 font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Chyba</span>
                            </span>
                          )}
                        </td>
                        <td className="p-2 font-semibold">{item.data.employeeName || '-'}</td>
                        <td className="p-2 font-mono">{item.data.employeeId || '-'}</td>
                        <td className="p-2">{item.data.department || '-'}</td>
                        <td className="p-2 font-mono font-bold">{hall ? hall.code : '-'}</td>
                        <td className="p-2 font-mono">{item.data.requestedDates?.join(', ') || '-'}</td>
                        <td className="p-2">{item.data.availableShifts?.map(s => s === 'morning' ? 'Ranní' : 'Odpolední').join(', ') || '-'}</td>
                        <td className="p-2 text-rose-700">
                          {item.errors.join('; ')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 shrink-0">
              <span className="text-xs text-slate-500">
                Pouze platné řádky budou uloženy do databáze.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 rounded-lg text-xs"
                >
                  Zrušit
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={!importSummary || importSummary.validCount === 0}
                  className="px-4 py-1.5 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg text-xs shadow-sm"
                >
                  Potvrdit import ({importSummary?.validCount || 0} zaměstnanců)
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
