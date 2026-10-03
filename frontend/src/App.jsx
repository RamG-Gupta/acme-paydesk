import React, { useState, useEffect } from 'react';
import { apiService } from './services/api';
import { 
  Users, DollarSign, Building2, Search, Filter, 
  ChevronLeft, ChevronRight, Edit2, TrendingUp, RefreshCw 
} from 'lucide-react';

export default function App() {
  // State matrices for directory view grid
  const [employees, setEmployees] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ current_page: 1, total_pages: 1, total_count: 0 });

  // Query state parameters
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [page, setPage] = useState(1);

  // Focus targets for salary management modal updates
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [newBase, setNewBase] = useState('');
  const [newAllowances, setNewAllowances] = useState('');
  const [reason, setReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Shared structural configuration constants
  const DEPARTMENTS = ["Engineering", "Product", "Design", "Human Resources", "Sales", "Marketing", "Finance", "Legal", "Operations", "Security"];
  const COUNTRIES = ["United States", "India", "United Kingdom", "Germany", "Singapore"];

  // Fetch core application state values asynchronously
  const loadData = async () => {
    setLoading(true);
    try {
      const directoryData = await apiService.getEmployees({
        page,
        search,
        country: selectedCountry,
        department: selectedDept
      });
      setEmployees(directoryData.employees);
      setMeta(directoryData.meta);

      const analyticsData = await apiService.getAnalytics();
      setAnalytics(analyticsData);
    } catch (err) {
      console.error("Failed to load ecosystem metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, selectedCountry, selectedDept]);

  // Execute manual filter triggers
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  // Launch editing panel for specific targets
  const openEditModal = async (emp) => {
    try {
      const detail = await apiService.getEmployeeDetails(emp.id);
      setSelectedEmp(detail);
      setNewBase(detail.base_salary);
      setNewAllowances(detail.allowances);
      setReason('');
    } catch (err) {
      alert("Could not load employee details.");
    }
  };

  // Commit salary update adjustments to server
  const handleSalarySave = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return alert("Audit trail reason is required.");
    
    setIsUpdating(true);
    try {
      await apiService.updateSalary(selectedEmp.id, {
        baseSalary: newBase,
        allowances: newAllowances,
        changeReason: reason
      });
      setSelectedEmp(null);
      loadData();
    } catch (err) {
      alert("Error committing compensation change.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased">
      {/* Structural Header Grid bar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-600/20">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">ACME PayDesk</h1>
            <p className="text-xs text-slate-400">Enterprise Workforce Roster ({meta.total_count} Staff Profiles)</p>
          </div>
        </div>
        <button onClick={loadData} className="p-2 text-slate-400 hover:text-white transition-colors">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Analytics Infrastructure Row Section */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3 text-slate-400">
                <span className="text-sm font-medium">Global Headcount Matrix</span>
                <Users size={20} className="text-indigo-400" />
              </div>
              <div className="text-3xl font-bold text-white">{meta.total_count}</div>
              <p className="text-xs text-slate-400 mt-2">Active full-time roles across 5 sovereign regions</p>
            </div>

            {analytics.global_payroll_summary?.slice(0, 2).map((metric, idx) => (
              <div key={idx} className="bg-slate-800/50 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3 text-slate-400">
                  <span className="text-sm font-medium">Gross Annual Budget ({metric.currency})</span>
                  <DollarSign size={20} className="text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: metric.currency, maximumFractionDigits: 0 }).format(metric.total_spend)}
                </div>
                <p className="text-xs text-slate-400 mt-2">Avg Base Pay: {new Intl.NumberFormat('en-US', { style: 'currency', currency: metric.currency, maximumFractionDigits: 0 }).format(metric.average_salary)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Directory Controls Filter Desk Row */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 justify-between">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search employee names or emails..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </form>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-slate-300">
              <Filter size={16} className="text-slate-500" />
              <select 
                value={selectedCountry} 
                onChange={(e) => { setSelectedCountry(e.target.value); setPage(1); }}
                className="bg-transparent border-none focus:outline-none text-sm text-slate-200"
              >
                <option value="" className="bg-slate-900">All Countries</option>
                {COUNTRIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-slate-300">
              <Building2 size={16} className="text-slate-500" />
              <select 
                value={selectedDept} 
                onChange={(e) => { setSelectedDept(e.target.value); setPage(1); }}
                className="bg-transparent border-none focus:outline-none text-sm text-slate-200"
              >
                <option value="" className="bg-slate-900">All Departments</option>
                {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Scalable Enterprise Data Grid Table Frame */}
        <div className="bg-slate-800/30 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 font-medium border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Employee Identity</th>
                  <th className="px-6 py-4">Country</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4 text-right">Base Salary</th>
                  <th className="px-6 py-4 text-right">Allowances</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Action Desk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-transparent">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-slate-500 font-medium">Streaming ledger entries...</td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-slate-500">No organizational profile matches discovered.</td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{emp.name}</div>
                        <div className="text-xs text-slate-500">{emp.email}</div>
