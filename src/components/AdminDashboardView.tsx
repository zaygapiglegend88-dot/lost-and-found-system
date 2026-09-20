import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle, Clock, 
  Trash2, Mail, Phone, Calendar, MapPin, Tag, Eye,
  Shield, Users, Check, X, ClipboardList, Info, CheckCircle2,
  PieChart as PieChartIcon, Filter, CalendarDays, Search,
  ChevronLeft, ChevronRight, ArrowUpDown, UserCheck, UserX, Ban, ShieldAlert, Camera
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Item, User, ReturnRecord } from '../types';
import { ReturnRecordsView } from './ReturnRecordsView';

interface AdminDashboardViewProps {
  items: Item[];
  users: User[];
  returnRecords?: ReturnRecord[];
  onDeleteItem: (itemId: string) => void;
  onChangeItemStatus: (itemId: string, status: 'pending' | 'returned') => void;
  onViewItemDetails: (item: Item) => void;
  onToggleUserStatus?: (userId: string, targetStatus: 'active' | 'suspended') => void;
  onDeleteReturnRecord?: (recordId: string) => void;
}

type DateFilterType = 'all' | 'today' | '7days' | 'custom';

export default function AdminDashboardView({
  items,
  users,
  returnRecords = [],
  onDeleteItem,
  onChangeItemStatus,
  onViewItemDetails,
  onToggleUserStatus,
  onDeleteReturnRecord,
}: AdminDashboardViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'items' | 'users' | 'records'>('items');

  // Chart Date Filter State
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [customFromDate, setCustomFromDate] = useState<string>('');
  const [customToDate, setCustomToDate] = useState<string>('');

  // Audit Date Filter State
  const [auditDateFilter, setAuditDateFilter] = useState<DateFilterType>('all');
  const [auditFromDate, setAuditFromDate] = useState<string>('');
  const [auditToDate, setAuditToDate] = useState<string>('');

  // Members List Search & Pagination States
  const [memberSearch, setMemberSearch] = useState('');
  const [memberPage, setMemberPage] = useState(1);
  const MEMBERS_PER_PAGE = 8;

  const MAIN_ADMIN_EMAIL = 'zaygapiglegend@gmail.com';
  const FAKE_USER_EMAILS = ['alex.rivera@university.edu', 'emily.chen@university.edu'];

  // Pinned System Administrator account (always fixed at top)
  const pinnedAdmin: User = users.find(u => u.email.toLowerCase() === MAIN_ADMIN_EMAIL) || {
    id: 'usr-admin-main',
    name: 'Main System Admin',
    email: MAIN_ADMIN_EMAIL,
    role: 'admin',
    studentId: 'ADM-0001',
    phone: '+1 (555) 019-2831',
    status: 'active',
    createdAt: '2026-08-01T00:00:00.000Z'
  };

  // Legitimate registered members (excluding pinned admin and fake demo users)
  const realRegisteredMembers = users.filter(u => 
    u.email.toLowerCase() !== MAIN_ADMIN_EMAIL &&
    !FAKE_USER_EMAILS.includes(u.email.toLowerCase())
  );

  // Search filter applied ONLY to registered members below the pinned admin
  const filteredRegisteredMembers = realRegisteredMembers.filter((u) => {
    if (!memberSearch.trim()) return true;
    const q = memberSearch.trim().toLowerCase();
    const nameMatch = (u.name || '').toLowerCase().includes(q);
    const emailMatch = (u.email || '').toLowerCase().includes(q);
    const idMatch = u.studentId ? u.studentId.toLowerCase().includes(q) : false;
    const phoneMatch = u.phone ? u.phone.toLowerCase().includes(q) : false;
    return nameMatch || emailMatch || idMatch || phoneMatch;
  });

  // Paginated registered members
  const memberTotalPages = Math.ceil(filteredRegisteredMembers.length / MEMBERS_PER_PAGE) || 1;
  const currentMemberPage = Math.min(memberPage, memberTotalPages);
  const paginatedRegisteredMembers = filteredRegisteredMembers.slice(
    (currentMemberPage - 1) * MEMBERS_PER_PAGE,
    currentMemberPage * MEMBERS_PER_PAGE
  );

  // Metrics
  const totalItemsCount = items.length;
  const pendingItemsCount = items.filter(i => i.status === 'pending').length;
  const returnedItemsCount = items.filter(i => i.status === 'returned').length;
  const userConfirmedReceivedCount = items.filter(i => i.userConfirmedReceived && i.status !== 'returned').length;

  // Date Calculation Helpers
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const get7DaysAgoStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Filtered items based on selected date filter
  const filteredChartItems = items.filter((item) => {
    if (!item.date) return true;
    const todayStr = getTodayStr();
    const sevenDaysAgoStr = get7DaysAgoStr();

    if (dateFilter === 'today') {
      return item.date === todayStr;
    }
    if (dateFilter === '7days') {
      return item.date >= sevenDaysAgoStr && item.date <= todayStr;
    }
    if (dateFilter === 'custom') {
      if (customFromDate && item.date < customFromDate) return false;
      if (customToDate && item.date > customToDate) return false;
      return true;
    }
    return true; // 'all'
  });

  // Filtered items for Listing Audit
  const auditFilteredItems = items.filter((item) => {
    if (!item.date) return true;
    const todayStr = getTodayStr();
    const sevenDaysAgoStr = get7DaysAgoStr();

    if (auditDateFilter === 'today') {
      return item.date === todayStr;
    }
    if (auditDateFilter === '7days') {
      return item.date >= sevenDaysAgoStr && item.date <= todayStr;
    }
    if (auditDateFilter === 'custom') {
      if (auditFromDate && item.date < auditFromDate) return false;
      if (auditToDate && item.date > auditToDate) return false;
      return true;
    }
    return true; // 'all'
  });

  const filteredPendingCount = filteredChartItems.filter(i => i.status === 'pending').length;
  const filteredReturnedCount = filteredChartItems.filter(i => i.status === 'returned').length;
  const filteredTotalCount = filteredChartItems.length;
  const resolutionRate = filteredTotalCount > 0 
    ? Math.round((filteredReturnedCount / filteredTotalCount) * 100) 
    : 0;

  const chartData = [
    { name: 'Pending', value: filteredPendingCount, color: '#f59e0b' },
    { name: 'Returned', value: filteredReturnedCount, color: '#10b981' }
  ];

  return (
    <div id="admin-dashboard-root" className="space-y-8 text-left animate-fade-in">
      
      {/* Dashboard Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <Shield className="h-7 w-7 text-blue-600 mr-2.5" />
            Admin Control Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">Central administration console for campus lost & found audits and member management.</p>
        </div>
        <span className="mt-2 md:mt-0 inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-amber-400">
          <ShieldCheck className="h-4 w-4 mr-1.5" />
          SECURE ADMINISTRATIVE CONSOLE
        </span>
      </div>

      {/* Metrics Grid */}
      <div id="admin-metrics-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Reports */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-xl bg-blue-50 text-blue-600 p-3 h-12 w-12 flex items-center justify-center">
            <ClipboardList className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Reports</p>
            <p className="text-2xl font-extrabold text-slate-900">{totalItemsCount}</p>
          </div>
        </div>

        {/* Metric 2: Pending Listings */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-xl bg-amber-50 text-amber-600 p-3 h-12 w-12 flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Listings</p>
            <p className="text-2xl font-extrabold text-slate-900">{pendingItemsCount}</p>
          </div>
        </div>

        {/* Metric 3: Returned / Resolved */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-xl bg-emerald-50 text-emerald-600 p-3 h-12 w-12 flex items-center justify-center">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Returned</p>
            <p className="text-2xl font-extrabold text-slate-900">{returnedItemsCount}</p>
          </div>
        </div>

        {/* Metric 4: Received Confirmations */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className={`rounded-xl p-3 h-12 w-12 flex items-center justify-center ${
            userConfirmedReceivedCount > 0 ? 'bg-indigo-100 text-indigo-700 animate-pulse' : 'bg-slate-100 text-slate-400'
          }`}>
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">User Confirmed Received</p>
            <p className="text-2xl font-extrabold text-slate-900">{userConfirmedReceivedCount}</p>
          </div>
        </div>

      </div>

      {/* Data Visualization Section: Recharts Status Distribution Pie Chart */}
      <div id="admin-analytics-section" className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
        
        {/* Analytics Card Header & Date Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-blue-600" />
              Item Status Distribution Analytics
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Visual breakdown of pending versus returned items across selected timeframe.
            </p>
          </div>

          {/* Filter Pills: All Time, Today, 7 Days, Custom */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
            <span className="text-[11px] font-bold text-slate-400 px-2 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Filter:
            </span>
            
            <button
              id="filter-all-time"
              type="button"
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                dateFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              All Time
            </button>

            <button
              id="filter-today"
              type="button"
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                dateFilter === 'today'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Today
            </button>

            <button
              id="filter-7days"
              type="button"
              onClick={() => setDateFilter('7days')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                dateFilter === '7days'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Last 7 Days
            </button>

            <button
              id="filter-custom"
              type="button"
              onClick={() => setDateFilter('custom')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                dateFilter === 'custom'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Custom Range
            </button>
          </div>
        </div>

        {/* Custom Date Inputs when 'custom' is active */}
        {dateFilter === 'custom' && (
          <div id="custom-date-filter-bar" className="flex flex-wrap items-center gap-3 bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 text-xs">
            <span className="font-bold text-blue-900 flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-blue-600" />
              Select Date Range:
            </span>
            
            <div className="flex items-center space-x-1.5">
              <label className="text-slate-600 font-medium text-[11px]">From:</label>
              <input
                id="custom-from-date"
                type="date"
                value={customFromDate}
                onChange={(e) => setCustomFromDate(e.target.value)}
                className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-1.5">
              <label className="text-slate-600 font-medium text-[11px]">To:</label>
              <input
                id="custom-to-date"
                type="date"
                value={customToDate}
                onChange={(e) => setCustomToDate(e.target.value)}
                className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {(customFromDate || customToDate) && (
              <button
                type="button"
                onClick={() => { setCustomFromDate(''); setCustomToDate(''); }}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline ml-auto"
              >
                Clear Date Filter
              </button>
            )}
          </div>
        )}

        {/* Main Chart Body & Summary Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          {/* Recharts Pie Chart Container (Spans 2 columns on lg) */}
          <div className="lg:col-span-2 min-h-[260px] flex items-center justify-center border border-slate-100 rounded-xl bg-slate-50/50 p-4">
            {filteredTotalCount === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Info className="h-8 w-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No Item Data Available</p>
                <p className="text-xs text-slate-500">No lost or found items match the selected timeframe filter.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => (percent && percent > 0) ? `${name} (${(percent * 100).toFixed(0)}%)` : ''}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [`${val} Item(s)`, 'Total']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '0.75rem',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      padding: '8px 12px'
                    }}
                    itemStyle={{ color: '#ffffff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Breakdown Stats Sidebar */}
          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filtered Items Count</span>
              <p className="text-2xl font-extrabold text-slate-900">{filteredTotalCount}</p>
              <p className="text-[11px] text-slate-500">Total reports in selected filter</p>
            </div>

            <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Pending Status
                </span>
                <p className="text-xl font-extrabold text-amber-950 mt-0.5">{filteredPendingCount}</p>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
                {filteredTotalCount > 0 ? Math.round((filteredPendingCount / filteredTotalCount) * 100) : 0}%
              </span>
            </div>

            <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Returned Status
                </span>
                <p className="text-xl font-extrabold text-emerald-950 mt-0.5">{filteredReturnedCount}</p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                {filteredTotalCount > 0 ? Math.round((filteredReturnedCount / filteredTotalCount) * 100) : 0}%
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/70 text-center space-y-0.5">
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Overall Resolution Rate</span>
              <p className="text-2xl font-black text-blue-700">{resolutionRate}%</p>
            </div>
          </div>

        </div>

      </div>

      {/* Control Tabs Navigation */}
      <div className="flex border-b border-slate-100 space-x-1 bg-slate-100 p-1 rounded-xl max-w-md">
        <button
          onClick={() => setActiveSubTab('items')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-3 text-xs font-bold rounded-lg transition-all ${
            activeSubTab === 'items'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          <span>Listing Audit ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-3 text-xs font-bold rounded-lg transition-all ${
            activeSubTab === 'users'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Members List ({users.length})</span>
        </button>

        <button
          id="admin-return-records-tab"
          onClick={() => setActiveSubTab('records')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-3 text-xs font-bold rounded-lg transition-all ${
            activeSubTab === 'records'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Return Records ({returnRecords.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: Listing Audit (Status code restricted to Pending / Returned) */}
      {activeSubTab === 'items' && (
        <div id="admin-listing-audit" className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-2 gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Listing Audit</h2>
              <p className="text-xs text-slate-500">Manage item statuses (Pending / Returned) or remove listings.</p>
            </div>

            {/* Filter Pills for Listing Audit */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
              <span className="text-[11px] font-bold text-slate-400 px-2 flex items-center gap-1">
                <Filter className="h-3 w-3" /> Date Filter:
              </span>
              
              <button
                id="audit-filter-all"
                type="button"
                onClick={() => setAuditDateFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  auditDateFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                All Time
              </button>

              <button
                id="audit-filter-today"
                type="button"
                onClick={() => setAuditDateFilter('today')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  auditDateFilter === 'today'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Today
              </button>

              <button
                id="audit-filter-7days"
                type="button"
                onClick={() => setAuditDateFilter('7days')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  auditDateFilter === '7days'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Last 7 Days
              </button>

              <button
                id="audit-filter-custom"
                type="button"
                onClick={() => setAuditDateFilter('custom')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  auditDateFilter === 'custom'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Custom Range
              </button>
            </div>
          </div>

          {/* Custom Date Inputs when 'custom' is active for Audit */}
          {auditDateFilter === 'custom' && (
            <div id="audit-custom-date-filter-bar" className="flex flex-wrap items-center gap-3 bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 text-xs">
              <span className="font-bold text-blue-900 flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-blue-600" />
                Select Custom Audit Date Range:
              </span>
              
              <div className="flex items-center space-x-1.5">
                <label className="text-slate-600 font-medium text-[11px]">From:</label>
                <input
                  id="audit-custom-from-date"
                  type="date"
                  value={auditFromDate}
                  onChange={(e) => setAuditFromDate(e.target.value)}
                  className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-1.5">
                <label className="text-slate-600 font-medium text-[11px]">To:</label>
                <input
                  id="audit-custom-to-date"
                  type="date"
                  value={auditToDate}
                  onChange={(e) => setAuditToDate(e.target.value)}
                  className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {(auditFromDate || auditToDate) && (
                <button
                  type="button"
                  onClick={() => { setAuditFromDate(''); setAuditToDate(''); }}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline ml-auto"
                >
                  Clear Date Filter
                </button>
              )}
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/55 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-4">Item Details</th>
                  <th className="p-4">Status Code</th>
                  <th className="p-4">User Confirmation</th>
                  <th className="p-4">Location & Date</th>
                  <th className="p-4">Reporter Contact</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {auditFilteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      <div className="space-y-1">
                        <p className="font-bold text-sm text-slate-700">No items found</p>
                        <p className="text-xs text-slate-400">No registered items match the selected date filter criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  auditFilteredItems.map((item) => {
                  const isLost = item.type === 'lost';
                  return (
                    <tr id={`audit-row-${item.id}`} key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      
                      {/* Name and Image */}
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            referrerPolicy="no-referrer"
                            className="h-10 w-10 rounded-lg object-cover border border-slate-100 bg-slate-100"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{item.name}</p>
                            <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold ${
                              isLost ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {isLost ? 'LOST' : 'FOUND'}
                            </span>
                            <span className="text-[10px] font-medium text-slate-600 ml-2">Type: {item.itemType}</span>
                          </div>
                        </div>
                      </td>

                      {/* Requirement 5: Status Code Dropdown strictly "Pending" & "Returned" */}
                      <td className="p-4">
                        <select
                          value={item.status === 'returned' ? 'returned' : 'pending'}
                          onChange={(e) => onChangeItemStatus(item.id, e.target.value as 'pending' | 'returned')}
                          className={`rounded-lg border px-2.5 py-1.5 font-bold bg-white cursor-pointer focus:outline-none ${
                            item.status === 'returned' 
                              ? 'text-blue-700 border-blue-200 bg-blue-50/50' 
                              : 'text-amber-700 border-amber-200 bg-amber-50/50'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="returned">Returned</option>
                        </select>
                      </td>

                      {/* Requirement 6: Received Confirmation Badge */}
                      <td className="p-4">
                        {item.userConfirmedReceived ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            User Confirmed Received
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No confirmation yet</span>
                        )}
                      </td>

                      {/* Location and Date */}
                      <td className="p-4 space-y-1">
                        <p className="flex items-center text-slate-700">
                          <MapPin className="h-3 w-3 mr-1 text-slate-400" />
                          {item.location}
                        </p>
                        <p className="flex items-center text-slate-500">
                          <Calendar className="h-3 w-3 mr-1 text-slate-400" />
                          {item.date}
                        </p>
                      </td>

                      {/* Reporter */}
                      <td className="p-4">
                        {(() => {
                          const repUser = users.find(u => u.id === item.reporterId || (u.email && item.reporterEmail && u.email.toLowerCase() === item.reporterEmail.toLowerCase()));
                          const rName = repUser?.name || item.reporterName;
                          const rEmail = repUser?.email || item.reporterEmail;
                          const rPhone = repUser?.phone || item.reporterPhone;
                          return (
                            <>
                              <p className="font-semibold text-slate-800">{rName}</p>
                              <p className="text-[10px] text-slate-500">{rEmail}</p>
                              {rPhone && (
                                <p className="text-[10px] text-blue-600 font-mono">{rPhone}</p>
                              )}
                            </>
                          );
                        })()}
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => onViewItemDetails(item)}
                            title="Inspect Item Details"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => onDeleteItem(item.id)}
                            title="Delete Report"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Members List (Displays only real registered users) */}
      {activeSubTab === 'users' && (
        <div id="admin-users-list" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Members List</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage registered accounts, view details, and quickly toggle account permissions ({1 + filteredRegisteredMembers.length} accounts found).
              </p>
            </div>

            {/* Quick Status Metric Badges */}
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200">
                <Users className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                <span>Total: {1 + realRegisteredMembers.length}</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>Active: {1 + realRegisteredMembers.filter(u => u.status !== 'suspended').length}</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800/60 text-xs font-bold text-rose-800 dark:text-rose-300">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                <span>Suspended: {realRegisteredMembers.filter(u => u.status === 'suspended').length}</span>
              </div>
            </div>
          </div>

          {/* High-Contrast Search Bar (All Filters Removed) */}
          <div className="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-300 pointer-events-none" />
              <input
                id="member-search-input"
                type="text"
                value={memberSearch}
                onChange={(e) => { setMemberSearch(e.target.value); setMemberPage(1); }}
                placeholder="Search by name, email, student ID, phone..."
                className="w-full pl-10 pr-9 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:border-blue-600 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all"
              />
              {memberSearch && (
                <button
                  type="button"
                  onClick={() => { setMemberSearch(''); setMemberPage(1); }}
                  className="absolute right-3 top-2.5 p-0.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  <th className="p-4">Member Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Student/Staff ID</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4">Registration Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {/* 1. PERMANENTLY PINNED SYSTEM ADMINISTRATOR (Always Row 1) */}
                <tr id={`user-row-${pinnedAdmin.id}`} key={pinnedAdmin.id} className="bg-amber-50/40 dark:bg-amber-950/20 font-medium hover:bg-amber-50/60 dark:hover:bg-amber-950/30 transition-colors border-b-2 border-amber-200/60 dark:border-amber-800/40">
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-7 w-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {pinnedAdmin.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{pinnedAdmin.name}</span>
                        <span className="ml-2 inline-block rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-[9px] font-extrabold px-1.5 py-0.5 uppercase tracking-wide border border-amber-200 dark:border-amber-700">
                          Pinned System Admin
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                    <span className="flex items-center">
                      <Mail className="h-3 w-3 mr-1 text-slate-400 dark:text-slate-500" />
                      {pinnedAdmin.email}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300 font-mono font-bold">{pinnedAdmin.studentId || 'ADM-0001'}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    {pinnedAdmin.phone ? (
                      <span className="flex items-center">
                        <Phone className="h-3 w-3 mr-1 text-slate-400 dark:text-slate-500" />
                        {pinnedAdmin.phone}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
                      Admin
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 text-[10px] font-extrabold uppercase border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <UserCheck className="h-3 w-3" />
                      Active
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1 text-slate-400 dark:text-slate-500" />
                      System Root
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider bg-amber-100/80 dark:bg-amber-900/40 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-800">
                      Protected Admin
                    </span>
                  </td>
                </tr>

                {/* 2. LEGITIMATE REGISTERED MEMBERS BELOW PINNED ADMIN */}
                {paginatedRegisteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-slate-500 dark:text-slate-400 bg-slate-50/40 dark:bg-slate-800/20">
                      <div className="mx-auto max-w-md space-y-2">
                        <Users className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                          {memberSearch ? 'No matching registered members found' : 'No registered members found'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {memberSearch
                            ? `No registered members match "${memberSearch}".`
                            : 'No user accounts have completed official registration yet.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedRegisteredMembers.map((u) => {
                    const isSuspended = u.status === 'suspended';
                    const registeredDateStr = u.createdAt 
                      ? new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                      : 'Registered User';

                    return (
                      <tr id={`user-row-${u.id}`} key={u.id} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${isSuspended ? 'bg-rose-50/20 dark:bg-rose-950/20' : ''}`}>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
                              isSuspended ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300' : 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                            }`}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-slate-100">{u.name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                          <span className="flex items-center">
                            <Mail className="h-3 w-3 mr-1 text-slate-400 dark:text-slate-500" />
                            {u.email}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 font-mono font-bold">{u.studentId || 'N/A'}</td>
                        <td className="p-4 text-slate-500 dark:text-slate-400">
                          {u.phone ? (
                            <span className="flex items-center">
                              <Phone className="h-3 w-3 mr-1 text-slate-400 dark:text-slate-500" />
                              {u.phone}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            u.role === 'admin' 
                              ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300' 
                              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                          }`}>
                            {u.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="p-4">
                          {isSuspended ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-2.5 py-1 text-[10px] font-extrabold uppercase border border-rose-200 dark:border-rose-800/60 shadow-2xs">
                              <span className="relative flex h-2 w-2">
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                              </span>
                              <UserX className="h-3 w-3" />
                              Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 text-[10px] font-extrabold uppercase border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                              <UserCheck className="h-3 w-3" />
                              Active
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-slate-500 dark:text-slate-400 font-medium">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-slate-400 dark:text-slate-500" />
                            {registeredDateStr}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            id={`toggle-user-status-${u.id}`}
                            onClick={() => onToggleUserStatus?.(u.id, isSuspended ? 'active' : 'suspended')}
                            title={isSuspended ? "Reactivate member account" : "Suspend member account"}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                              isSuspended
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100 dark:shadow-none'
                                : 'bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:border-rose-300'
                            }`}
                          >
                            {isSuspended ? (
                              <>
                                <UserCheck className="h-3.5 w-3.5" />
                                <span>Reactivate</span>
                              </>
                            ) : (
                              <>
                                <Ban className="h-3.5 w-3.5" />
                                <span>Suspend</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Members List Pagination */}
            {memberTotalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700 text-xs gap-3">
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  Showing <span className="font-bold text-slate-800 dark:text-slate-200">{(currentMemberPage - 1) * MEMBERS_PER_PAGE + 1}</span> to{' '}
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {Math.min(currentMemberPage * MEMBERS_PER_PAGE, filteredRegisteredMembers.length)}
                  </span>{' '}
                  of <span className="font-bold text-slate-800 dark:text-slate-200">{filteredRegisteredMembers.length}</span> registered members
                </p>

                <div className="flex items-center space-x-2">
                  <button
                    id="member-pagination-prev"
                    type="button"
                    disabled={currentMemberPage <= 1}
                    onClick={() => setMemberPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center space-x-1"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Previous</span>
                  </button>

                  <span className="font-bold text-slate-600 dark:text-slate-300 px-2">
                    Page {currentMemberPage} of {memberTotalPages}
                  </span>

                  <button
                    id="member-pagination-next"
                    type="button"
                    disabled={currentMemberPage >= memberTotalPages}
                    onClick={() => setMemberPage((p) => Math.min(memberTotalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center space-x-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Return Records (Proof of Return Logs) */}
      {activeSubTab === 'records' && (
        <div id="admin-return-records-section" className="space-y-4">
          <ReturnRecordsView
            records={returnRecords}
            onDeleteRecord={onDeleteReturnRecord}
          />
        </div>
      )}

    </div>
  );
}
