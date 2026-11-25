import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Search, Building2, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const EmployeesView: React.FC = () => {
  const { requests, activities, halls } = useApp();
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // Extract unique employees
  interface EmployeeAggregate {
    name: string;
    employeeId: string;
    department: string;
    hallId: string;
    managerName: string;
    requestCount: number;
    scheduledCount: number;
    scheduledDates: string[];
    shifts: string[];
  }

  const employeeMap = new Map<string, EmployeeAggregate>();

  requests.forEach(r => {
    const key = `${r.employeeName.toLowerCase()}__${r.employeeId || ''}`;
    const scheduledActs = activities.filter(a => a.requestId === r.id);

    if (!employeeMap.has(key)) {
      employeeMap.set(key, {
        name: r.employeeName,
        employeeId: r.employeeId || '-',
        department: r.department,
        hallId: r.hallId,
        managerName: r.managerName,
        requestCount: 1,
        scheduledCount: scheduledActs.length,
        scheduledDates: scheduledActs.map(a => `${a.date} (${a.startTime})`),
        shifts: r.availableShifts.map(s => s === 'morning' ? 'Ranní' : 'Odpolední')
      });
    } else {
      const existing = employeeMap.get(key)!;
      existing.requestCount += 1;
      existing.scheduledCount += scheduledActs.length;
      scheduledActs.forEach(a => {
        const str = `${a.date} (${a.startTime})`;
        if (!existing.scheduledDates.includes(str)) existing.scheduledDates.push(str);
      });
    }
  });

  const employees = Array.from(employeeMap.values());
  const departments = Array.from(new Set(employees.map(e => e.department))).sort();

  const filteredEmployees = employees.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase());
    const matchDept = !selectedDept || e.department === selectedDept;
    return matchSearch && matchDept;
  });

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Přehled zaměstnanců k měření
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Agregovaný seznam pracovníků, jejich domovských hal a stavu provedení měření
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="relative min-w-[240px] flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hledat zaměstnance, os. číslo..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        >
          <option value="">Všechna oddělení</option>
          {departments.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <span className="text-xs text-slate-500 font-mono ml-auto">
          Celkem {filteredEmployees.length} zaměstnanců
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Jméno a příjmení</th>
                <th className="py-2.5 px-3">Osobní číslo</th>
                <th className="py-2.5 px-3">Oddělení / Tým</th>
                <th className="py-2.5 px-3">Domovská hala</th>
                <th className="py-2.5 px-3">Dostupné směny</th>
                <th className="py-2.5 px-3">Zodpovědný manažer</th>
                <th className="py-2.5 px-3">Stav plánu</th>
                <th className="py-2.5 px-3">Termín měření</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Nenalezen žádný zaměstnanec.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, i) => {
                  const hall = halls.find(h => h.id === emp.hallId);
                  const isScheduled = emp.scheduledCount > 0;

                  return (
                    <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {emp.name}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {emp.employeeId}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {emp.department}
                      </td>
                      <td className="py-2.5 px-3">
                        {hall ? (
                          <span className="font-mono font-bold text-slate-800">
                            {hall.code} <span className="font-normal text-slate-500">({hall.name})</span>
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-slate-700">{emp.shifts.join(', ')}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {emp.managerName}
                      </td>
                      <td className="py-2.5 px-3">
                        {isScheduled ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Naplánováno</span>
                          </span>
                        ) : (
                          <span className="text-amber-700 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>Čeká / Nezařazeno</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">
                        {emp.scheduledDates.length > 0 ? emp.scheduledDates.join(', ') : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
