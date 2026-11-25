import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings, 
  Clock, 
  Footprints, 
  Building, 
  RotateCcw, 
  Check, 
  AlertTriangle,
  Save,
  Database,
  Download,
  Upload,
  Archive,
  FolderArchive,
  CalendarPlus,
  Trash2,
  Calendar,
  History,
  Sparkles,
  Info
} from 'lucide-react';
import { CampaignArchive } from '../types';

export const SettingsView: React.FC = () => {
  const { 
    settings, 
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
    deleteArchivedCampaign,
    planningPeriod,
    requests,
    activities,
    technicians
  } = useApp();
  const [form, setForm] = useState(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Campaign management modals
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveFormName, setArchiveFormName] = useState(campaignName);
  const [archiveFormNote, setArchiveFormNote] = useState('');
  const [archiveSuccessMsg, setArchiveSuccessMsg] = useState<string | null>(null);

  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('Výjezd Škoda Auto 2027');
  const [newCampaignStart, setNewCampaignStart] = useState('2027-11-08');
  const [newCampaignEnd, setNewCampaignEnd] = useState('2027-11-12');
  const [autoArchiveCurrent, setAutoArchiveCurrent] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm('Opravdu si přejete obnovit všechna data aplikace do výchozího stavu demonstračního areálu Škoda Auto? Veškeré vytvořené požadavky a ruční úpravy budou nahrazeny.')) {
      resetAllDataToDefaults();
      setForm(settings);
    }
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportFullBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `skoda_auto_optika_databaze_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const ok = importFullBackupJson(content);
        if (ok) {
          setImportSuccess(true);
          setTimeout(() => setImportSuccess(false), 4000);
        } else {
          setImportError('Neplatný formát souboru zálohy. Soubor musí být platný JSON vygenerovaný touto aplikací.');
        }
      } catch {
        setImportError('Chyba při čtení souboru zálohy.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleOpenArchiveModal = () => {
    setArchiveFormName(campaignName);
    setArchiveFormNote(`Výjezd ${planningPeriod.start} až ${planningPeriod.end} – ${requests.length} požadavků, ${activities.filter(a => a.type === 'measurement').length} naplánováno`);
    setShowArchiveModal(true);
  };

  const handleConfirmArchive = () => {
    closeAndArchiveCampaign(archiveFormName, archiveFormNote);
    setShowArchiveModal(false);
    setArchiveSuccessMsg(`Výjezd „${archiveFormName}“ byl úspěšně uzavřen a uložen do ročníkového archivu.`);
    setTimeout(() => setArchiveSuccessMsg(null), 4000);
  };

  const handleConfirmNewCampaign = () => {
    if (autoArchiveCurrent && (requests.length > 0 || activities.length > 0)) {
      closeAndArchiveCampaign(`${campaignName} (Předchozí)`, `Automaticky archivováno před zahájením ${newCampaignName}`);
    }
    startNewCampaign(newCampaignName, newCampaignStart, newCampaignEnd);
    setShowNewCampaignModal(false);
    setArchiveSuccessMsg(`Nový výjezd „${newCampaignName}“ byl úspěšně připraven! Všechny haly, mapa i měřiči zůstaly zachovány, fronta je připravena pro nové požadavky.`);
    setTimeout(() => setArchiveSuccessMsg(null), 4000);
  };

  const handleRestoreArchive = (archive: CampaignArchive) => {
    if (window.confirm(`Opravdu si přejete načíst archivovaný výjezd „${archive.name}“ z ${new Date(archive.archivedAt).toLocaleDateString('cs-CZ')}? Současný aktivní stav bude nahrazen daty z archivu.`)) {
      restoreArchivedCampaign(archive.id);
      setArchiveSuccessMsg(`Výjezd „${archive.name}“ byl úspěšně obnoven.`);
      setTimeout(() => setArchiveSuccessMsg(null), 4000);
    }
  };

  const handleDeleteArchive = (archiveId: string, archiveTitle: string) => {
    if (window.confirm(`Opravdu si přejete trvale smazat archiv „${archiveTitle}“?`)) {
      deleteArchivedCampaign(archiveId);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Nastavení parametrů & Správa výjezdů
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Globální časová okna, ročníkové archivace výjezdů a trvalost dat
          </p>
        </div>
      </div>

      {archiveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{archiveSuccessMsg}</span>
        </div>
      )}

      {/* SECTION: ANNUAL CAMPAIGN MANAGEMENT (Uzavření ročníku & nový výjezd za rok) */}
      <div className="bg-white border-2 border-emerald-600/30 rounded-xl p-5 shadow-xs space-y-4 max-w-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FolderArchive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Správa ročníků & Archivace výjezdu
              </h2>
              <p className="text-[11px] text-slate-500">
                Uzavření měření pro aktuální rok a příprava na nový výjezd za rok
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenArchiveModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
              title="Uzavřít aktuální výjezd a uložit jeho kompletní stav do archivu"
            >
              <Archive className="w-3.5 h-3.5 text-emerald-700" />
              <span>Uzavřít výjezd a archivovat</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const nextYear = new Date().getFullYear() + 1;
                setNewCampaignName(`Výjezd Škoda Auto ${nextYear}`);
                setShowNewCampaignModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
              title="Založit nový výjezd pro další rok se zachováním hal, mapy a měřičů"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>Založit nový výjezd (např. 2027)</span>
            </button>
          </div>
        </div>

        {/* Current Active Campaign Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-500">Aktivní výjezd:</span>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-mono focus:ring-1 focus:ring-emerald-600"
                title="Název aktuálního výjezdu můžete kdykoliv upravit"
              />
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-3">
              <span>Termín: <strong className="text-slate-800">{planningPeriod.start} až {planningPeriod.end}</strong></span>
              <span>•</span>
              <span>Požadavků: <strong className="text-slate-800">{requests.length}</strong></span>
              <span>•</span>
              <span>Naplánováno: <strong className="text-emerald-700">{activities.filter(a => a.type === 'measurement').length}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-white px-2.5 py-1.5 rounded border border-slate-200">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Při založení nového výjezdu zůstanou všechny haly, mapa areálu i měřiči uloženi.</span>
          </div>
        </div>

        {/* Archived Campaigns List */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>Historie archivovaných výjezdů ({campaignArchives.length})</span>
            </span>
          </div>

          {campaignArchives.length === 0 ? (
            <div className="p-4 border border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-500">
              Dosud nebyl archivován žádný minulý výjezd. Jakmile dokončíte týdenní měření, klikněte na tlačítko <strong>„Uzavřít výjezd a archivovat“</strong>.
            </div>
          ) : (
            <div className="space-y-2">
              {campaignArchives.map((arc) => (
                <div 
                  key={arc.id}
                  className="p-3 bg-white border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{arc.name}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                        {arc.startDate} – {arc.endDate}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Archivováno: {new Date(arc.archivedAt).toLocaleDateString('cs-CZ')} v {new Date(arc.archivedAt).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                      {' · '}
                      <span className="text-emerald-700 font-semibold">{arc.scheduledCount} naplánovaných měření</span>
                      {arc.note && ` · Pozn.: ${arc.note}`}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRestoreArchive(arc)}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                      title="Načíst tento archiv zpět do aktivního zobrazení"
                    >
                      Obnovit / Zobrazit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteArchive(arc.id, arc.name)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Smazat z archivu"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Uzavřít a archivovat výjezd */}
      {showArchiveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4 border border-slate-200">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Archive className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-sm text-slate-900">
                Uzavřít a archivovat aktuální výjezd
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Kompletní stav výjezdu (všechny požadavky od manažerů, vytvořený harmonogram, trasy a statistiky) se uloží do historie. K těmto datům se budete moci kdykoliv vrátit.
            </p>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Název archivu / ročníku</label>
                <input
                  type="text"
                  value={archiveFormName}
                  onChange={(e) => setArchiveFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium focus:ring-1 focus:ring-emerald-600"
                  placeholder="např. Výjezd Škoda Auto 2026 – Hotovo"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Poznámka k výjezdu (volitelné)</label>
                <textarea
                  rows={2}
                  value={archiveFormNote}
                  onChange={(e) => setArchiveFormNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-emerald-600"
                  placeholder="např. Měření na halách H31, H32, M1 proběhlo bez zdržení..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowArchiveModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Zrušit
              </button>
              <button
                type="button"
                onClick={handleConfirmArchive}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
              >
                Potvrdit a archivovat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Založit nový výjezd (např. ročník 2027) */}
      {showNewCampaignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4 border border-slate-200">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <CalendarPlus className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-sm text-slate-900">
                Založit nový výjezd (např. ročník 2027)
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Založením nového výjezdu se vyčistí stará fronta požadavků a vygenerovaný plán. 
              <strong> Všechna kmenová data – haly, mapa Mladá Boleslav, matice přesunů a optometristé (Jaromír & Ondřej) – zůstanou plně zachována!</strong>
            </p>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Název nového výjezdu</label>
                <input
                  type="text"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Datum zahájení</label>
                  <input
                    type="date"
                    value={newCampaignStart}
                    onChange={(e) => setNewCampaignStart(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Datum ukončení</label>
                  <input
                    type="date"
                    value={newCampaignEnd}
                    onChange={(e) => setNewCampaignEnd(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoArchiveCurrent}
                  onChange={(e) => setAutoArchiveCurrent(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-semibold text-emerald-950">
                  Nejprve automaticky archivovat stávající výjezd ({requests.length} požadavků)
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowNewCampaignModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Zrušit
              </button>
              <button
                type="button"
                onClick={handleConfirmNewCampaign}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
              >
                Založit nový výjezd
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        
        {/* Shifts Configuration Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Časové vymezení výrobních směn
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            {/* Morning Shift */}
            <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-semibold text-slate-800 block">Ranní směna</span>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-600">Začátek</label>
                  <input
                    type="time"
                    value={form.morningShiftStart}
                    onChange={(e) => setForm({ ...form, morningShiftStart: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600">Konec</label>
                  <input
                    type="time"
                    value={form.morningShiftEnd}
                    onChange={(e) => setForm({ ...form, morningShiftEnd: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Afternoon Shift */}
            <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-semibold text-slate-800 block">Odpolední směna</span>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-600">Začátek</label>
                  <input
                    type="time"
                    value={form.afternoonShiftStart}
                    onChange={(e) => setForm({ ...form, afternoonShiftStart: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600">Konec</label>
                  <input
                    type="time"
                    value={form.afternoonShiftEnd}
                    onChange={(e) => setForm({ ...form, afternoonShiftEnd: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Durations & Speed Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Footprints className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Parametry měření a přesunů
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Výchozí délka měření (min)</label>
              <input
                type="number"
                min={10}
                max={120}
                value={form.defaultMeasurementMinutes}
                onChange={(e) => setForm({ ...form, defaultMeasurementMinutes: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Výchozí rezerva mezi bloky (min)</label>
              <input
                type="number"
                min={0}
                max={30}
                value={form.defaultBufferMinutes}
                onChange={(e) => setForm({ ...form, defaultBufferMinutes: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Rychlost pěšího přesunu (km/h)</label>
              <input
                type="number"
                step="0.1"
                min={2}
                max={8}
                value={form.walkingSpeedKmh}
                onChange={(e) => setForm({ ...form, walkingSpeedKmh: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
              />
            </div>

          </div>

          <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
            <label className="font-semibold text-slate-700">Režim přesunu mezi halami</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="transitMode"
                  checked={form.transitMode === 'walking'}
                  onChange={() => setForm({ ...form, transitMode: 'walking' })}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-800">Pěší chůze ({form.walkingSpeedKmh} km/h)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="transitMode"
                  checked={form.transitMode === 'bicycle'}
                  onChange={() => setForm({ ...form, transitMode: 'bicycle' })}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-800">Firemní jízdní kolo / e-bike ({form.bicycleSpeedKmh} km/h)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Site Name & Identity */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Identifikace provozu
            </h2>
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="font-semibold text-slate-700">Název areálu / závodu</label>
            <input
              type="text"
              value={form.siteName}
              onChange={(e) => setForm({ ...form, siteName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
            />
          </div>
        </div>

        {/* Persistence & Data Backup for Local / Vercel Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-700" />
              <h2 className="text-sm font-bold text-slate-900">
                Trvalost dat & zálohování (Lokální běh / Vercel)
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              LocalStorage aktivní (trvalé úložiště)
            </span>
          </div>

          <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-lg text-xs text-slate-700 space-y-2 leading-relaxed">
            <p className="font-semibold text-emerald-950 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>Bude mi aplikace držet data, když ji otevřu za 2 dny?</span>
            </p>
            <p>
              <strong>ANO, 100% spolehlivě.</strong> Každá provedená změna (zadaný zaměstnanec, upravený harmonogram, změřené dioptrie i status výroby brýlí) se ihned ukládá do trvalého úložiště prohlížeče (<code>localStorage</code>). Data nezmizí po zavření záložky, restartu počítače ani po víkendu.
            </p>
            <p className="text-slate-600">
              Aplikace je plně samostatná – funguje lokálně na Vašem počítači (<code>npm run dev</code>) i nasazená na <strong>Vercelu</strong> přes připravený <code>index.html</code> a <code>vercel.json</code>.
            </p>
          </div>

          {/* Backup & Restore Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            
            {/* Export JSON */}
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 transition-all hover:border-slate-400 group"
            >
              <Download className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform" />
              <span>Stáhnout kompletní zálohu (.json)</span>
            </button>

            {/* Import JSON */}
            <label className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 cursor-pointer transition-all hover:border-slate-400 group">
              <Upload className="w-4 h-4 text-blue-700 group-hover:scale-110 transition-transform" />
              <span>Nahrát zálohu / přenést data (.json)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>

          </div>

          {importSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Záloha byla úspěšně načtena! Všechna data byla obnovena.</span>
            </div>
          )}

          {importError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{importError}</span>
            </div>
          )}
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Obnovit výchozí data Škoda</span>
          </button>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>Nastavení bylo uloženo!</span>
              </span>
            )}

            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Uložit nastavení</span>
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};
