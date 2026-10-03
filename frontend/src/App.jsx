import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building2, ChevronLeft, ChevronRight, DollarSign, Pencil,
  RefreshCw, Search, Users, X
} from 'lucide-react';
import { apiService, formatMoney } from './services/api';

const DEPARTMENTS = [
  'Engineering', 'Product', 'Design', 'Human Resources', 'Sales',
  'Marketing', 'Finance', 'Legal', 'Operations', 'Security'
];
const COUNTRIES = ['United States', 'India', 'United Kingdom', 'Germany', 'Singapore'];
const STATUSES = ['Active', 'Suspended', 'Terminated'];

function statusClass(status) {
  if (status === 'Active') return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (status === 'Suspended') return 'bg-amber-50 text-amber-700 ring-amber-200';
  return 'bg-slate-100 text-slate-600 ring-slate-200';
}

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState({ current_page: 1, total_pages: 1, total_count: 0 });

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState(null);
  const [baseSalary, setBaseSalary] = useState('');
  const [allowances, setAllowances] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const loadDirectory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const directory = await apiService.getEmployees({
        page, search, country, department, status
      });
      setEmployees(directory.employees);
      setMeta(directory.meta);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load the employee directory.');
    } finally {
      setLoading(false);
    }
  }, [page, search, country, department, status]);

  const loadAnalytics = useCallback(async () => {
    try {
      setAnalytics(await apiService.getAnalytics());
    } catch {
      // Directory can still function if analytics fails.
    }
  }, []);

  useEffect(() => { loadDirectory(); }, [loadDirectory]);
  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  const maxDept = useMemo(() => {
    const values = Object.values(analytics?.department_distribution || {});
    return Math.max(1, ...values);
  }, [analytics]);

  const openEditor = async (emp) => {
    try {
      const detail = await apiService.getEmployeeDetails(emp.id);
      setSelected(detail);
      setBaseSalary(detail.base_salary);
      setAllowances(detail.allowances);
      setReason('');
    } catch {
      setError('Could not load that employee.');
    }
  };

  const saveCompensation = async (e) => {
    e.preventDefault();
    if (reason.trim().length < 3) {
      setError('A change reason of at least 3 characters is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await apiService.updateSalary(selected.id, {
        baseSalary, allowances, changeReason: reason.trim()
      });
      setSelected(null);
      await Promise.all([loadDirectory(), loadAnalytics()]);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save the compensation change.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-600 p-2 text-white">
              <Building2 size={20} />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-slate-900">ACME PayDesk</h1>
              <p className="text-xs text-slate-500">HR salary desk · {meta.total_count.toLocaleString()} people in this view</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { loadDirectory(); loadAnalytics(); }}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        )}

        {analytics && (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <article className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between text-slate-500">
                <span className="text-sm">Headcount</span>
                <Users size={16} />
              </div>
              <p className="text-2xl font-semibold tabular-nums">{analytics.headcount.toLocaleString()}</p>
              <p className="mt-1 text-xs text-slate-500">Active, suspended, and terminated</p>
            </article>
            {(analytics.global_payroll_summary || []).slice(0, 3).map((row) => (
              <article key={row.currency} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-2 flex items-center justify-between text-slate-500">
                  <span className="text-sm">Payroll · {row.currency}</span>
                  <DollarSign size={16} />
                </div>
                <p className="text-xl font-semibold tabular-nums">{formatMoney(row.total_spend, row.currency)}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {row.employee_count.toLocaleString()} people · avg base {formatMoney(row.average_salary, row.currency)}
                </p>
              </article>
            ))}
          </section>
        )}

        {analytics?.department_distribution && (
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-medium text-slate-700">Headcount by department</h2>
            <div className="grid gap-2 md:grid-cols-2">
              {Object.entries(analytics.department_distribution).sort((a, b) => b[1] - a[1]).map(([name, count]) => (
                <div key={name} className="flex items-center gap-3 text-sm">
                  <span className="w-36 shrink-0 text-slate-600">{name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(count / maxDept) * 100}%` }} />
                  </div>
                  <span className="w-10 text-right tabular-nums text-slate-500">{count}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 md:flex-row md:items-center">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name or email"
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-400"
            />
          </label>
          <select value={country} onChange={(e) => { setCountry(e.target.value); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="">All countries</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={department} onChange={(e) => { setDepartment(e.target.value); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="">All departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Country</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 text-right font-medium">Base</th>
                  <th className="px-4 py-3 text-right font-medium">Allowances</th>
                  <th className="px-4 py-3 text-center font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="px-4 py-12 text-center text-slate-500">Loading directory…</td></tr>
                ) : employees.length === 0 ? (
                  <tr><td colSpan="7" className="px-4 py-12 text-center text-slate-500">No employees match these filters.</td></tr>
                ) : employees.map((emp) => (
                  <tr key={emp.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{emp.name}</div>
                      <div className="text-xs text-slate-500">{emp.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{emp.country}</td>
                    <td className="px-4 py-3 text-slate-600">{emp.department}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatMoney(emp.base_salary, emp.currency)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatMoney(emp.allowances, emp.currency)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ring-1 ${statusClass(emp.status)}`}>{emp.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => openEditor(emp)} className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800">
                        <Pencil size={14} /> Adjust
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
            <span>Page {meta.current_page} of {meta.total_pages}</span>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-slate-200 p-1 disabled:opacity-40">
                <ChevronLeft size={16} />
              </button>
              <button type="button" disabled={page >= meta.total_pages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-200 p-1 disabled:opacity-40">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-slate-900/40">
          <aside className="flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">{selected.name}</h2>
                <p className="text-xs text-slate-500">{selected.email} · {selected.country} · {selected.currency}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={saveCompensation} className="space-y-4 overflow-y-auto px-5 py-5">
              <label className="block text-sm">
                <span className="text-slate-600">Base salary ({selected.currency})</span>
                <input type="number" min="0" step="0.01" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" />
              </label>
              <label className="block text-sm">
                <span className="text-slate-600">Allowances ({selected.currency})</span>
                <input type="number" min="0" step="0.01" value={allowances} onChange={(e) => setAllowances(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" />
              </label>
              <label className="block text-sm">
                <span className="text-slate-600">Change reason (required)</span>
                <textarea required minLength={3} value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="e.g. Annual appraisal 2026" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" />
              </label>
              <button type="submit" disabled={saving} className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                {saving ? 'Saving…' : 'Save compensation change'}
              </button>
              <div>
                <h3 className="mb-2 text-sm font-medium text-slate-700">Audit trail</h3>
                {(selected.salary_logs || []).length === 0 ? (
                  <p className="text-sm text-slate-500">No previous adjustments.</p>
                ) : (
                  <ul className="space-y-2">
                    {selected.salary_logs.map((log) => (
                      <li key={log.id} className="rounded-lg border border-slate-200 p-3 text-xs text-slate-600">
                        <div className="font-medium text-slate-800">{log.change_reason}</div>
                        <div className="mt-1 tabular-nums">
                          Base {formatMoney(log.old_salary, selected.currency)} → {formatMoney(log.new_salary, selected.currency)}
                        </div>
                        <div className="text-slate-400">{new Date(log.created_at).toLocaleDateString()}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}
