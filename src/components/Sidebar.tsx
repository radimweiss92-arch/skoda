import React from 'react';
import { useApp, ActiveNavTab } from '../context/AppContext';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  UserCheck2,
  CalendarRange,
  Clock,
  MapPin,
  Route,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  Building,
  Glasses
} from 'lucide-react';

interface NavItem {
  id: ActiveNavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, requests, unassigned } = useApp();

  const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;
  const unassignedCount = unassigned.length;

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'requests',
      label: 'Požadavky na měření',
      icon: ClipboardList,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined
    },
    {
      id: 'employees',
      label: 'Zaměstnanci',
      icon: Users
    },
    {
      id: 'technicians',
      label: 'Měřiči (Kolomazník / Švébis)',
      icon: UserCheck2
    },
    {
      id: 'planning',
      label: 'Plánování výjezdu',
      icon: CalendarRange,
      badge: unassignedCount > 0 ? unassignedCount : undefined
    },
    {
      id: 'schedule',
      label: 'Harmonogram výjezdu',
      icon: Clock
    },
    {
      id: 'map',
      label: 'Mapa a haly',
      icon: MapPin
    },
    {
      id: 'transfers',
      label: 'Přesuny mezi halami',
      icon: Route
    },
    {
      id: 'exports',
      label: 'Exporty',
      icon: FileSpreadsheet
    },
    {
      id: 'settings',
      label: 'Nastavení',
      icon: Settings
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between min-h-[calc(100vh-61px)]">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Správa vyšetření & brýlí
        </div>

        <nav className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono font-semibold ${
                      isActive ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70">
        <div className="flex items-start gap-2.5">
          <Glasses className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
          <div className="text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Pracovní dioptrické brýle</p>
            <p className="text-slate-500 text-[11px] mt-0.5 leading-tight">
              Měření zraku na halách a výroba certifikovaných brýlí Škoda Auto.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
