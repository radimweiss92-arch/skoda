import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { RequestsView } from './views/RequestsView';
import { EmployeesView } from './views/EmployeesView';
import { TechniciansView } from './views/TechniciansView';
import { PlanningView } from './views/PlanningView';
import { ScheduleView } from './views/ScheduleView';
import { HallsMapView } from './views/HallsMapView';
import { TransferTimesView } from './views/TransferTimesView';
import { ExportsView } from './views/ExportsView';
import { SettingsView } from './views/SettingsView';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'requests':
        return <RequestsView />;
      case 'employees':
        return <EmployeesView />;
      case 'technicians':
        return <TechniciansView />;
      case 'planning':
        return <PlanningView />;
      case 'schedule':
        return <ScheduleView />;
      case 'map':
        return <HallsMapView />;
      case 'transfers':
        return <TransferTimesView />;
      case 'exports':
        return <ExportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex-1 min-w-0 p-6 max-w-7xl mx-auto w-full">
      {renderActiveView()}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <MainContent />
          </main>
        </div>
      </div>
    </AppProvider>
  );
}
