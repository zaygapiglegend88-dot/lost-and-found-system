import React, { useState, useEffect } from 'react';
import { 
  Search, PlusCircle, Filter, Calendar, MapPin, Tag, 
  ChevronRight, ArrowRight, ShieldAlert, CheckCircle2, 
  HelpCircle, Sparkles, RefreshCw, X, ShieldCheck
} from 'lucide-react';

// Types & Data
import { Item, User, ItemCategory, ReturnRecord } from './types';
import { INITIAL_USERS, INITIAL_ITEMS } from './data/mockData';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import ItemGrid from './components/ItemGrid';
import ItemDetailsModal from './components/ItemDetailsModal';
import ReportFormModal from './components/ReportFormModal';
import AuthModal from './components/AuthModal';
import AdminDashboardView from './components/AdminDashboardView';
import UserDashboardView from './components/UserDashboardView';
import ReturnCameraModal from './components/ReturnCameraModal';

export default function App() {
  // Global States synchronized to LocalStorage & Backend
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [returnRecords, setReturnRecords] = useState<ReturnRecord[]>([]);
  
  // Current session user
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Active Navigation Tab
  const [currentTab, setCurrentTab] = useState<'home' | 'browse' | 'dashboard' | 'admin'>('home');

  // Dark & Light Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('campus_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('campus_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Filter state for Browse Page
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterType, setFilterType] = useState<'all' | 'lost' | 'found'>('all');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'returned'>('all');

  // Action / Modal states
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportModalType, setReportModalType] = useState<'lost' | 'found'>('lost');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [returnCameraTarget, setReturnCameraTarget] = useState<{ foundItem: Item; lostItem?: Item } | null>(null);

  const FAKE_EMAILS = ['alex.rivera@university.edu', 'emily.chen@university.edu'];

  const fetchBackendUsers = async () => {
    try {
      // First, sync any cached users from localStorage to backend
      const cachedUsersStr = localStorage.getItem('campus_users');
      if (cachedUsersStr) {
        try {
          const cachedList = JSON.parse(cachedUsersStr);
          if (Array.isArray(cachedList) && cachedList.length > 0) {
            const cleanCached = cachedList.filter(u => u && u.email && !FAKE_EMAILS.includes(u.email.toLowerCase()));
            await fetch('/api/users/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ users: cleanCached })
            });
          }
        } catch {
          // Ignore json parse error
        }
      }

      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          const realUsers: User[] = data.users.filter(u => u && u.email && !FAKE_EMAILS.includes(u.email.toLowerCase()));
          setUsers(prevUsers => {
            const map = new Map<string, User>();
            INITIAL_USERS.forEach(u => map.set(u.email.toLowerCase(), u));
            prevUsers.forEach(u => {
              if (!FAKE_EMAILS.includes(u.email.toLowerCase())) map.set(u.email.toLowerCase(), u);
            });
            realUsers.forEach(u => map.set(u.email.toLowerCase(), u));
            const merged = Array.from(map.values());
            localStorage.setItem('campus_users', JSON.stringify(merged));
            return merged;
          });
          return realUsers;
        }
      }
    } catch (err) {
      console.error('Failed to sync users from backend:', err);
    }
    return null;
  };

  const fetchReturnRecords = async () => {
    try {
      const res = await fetch('/api/return-records');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.records)) {
          setReturnRecords(data.records);
          return data.records;
        }
      }
    } catch (err) {
      console.error('Failed to fetch return records:', err);
    }
    return [];
  };

  const fetchBackendItems = async () => {
    try {
      const res = await fetch('/api/items');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          if (data.items.length > 0) {
            setItems(data.items);
            localStorage.setItem('campus_items', JSON.stringify(data.items));
            return data.items;
          } else {
            // Seed clean initial items into SQLite database if empty
            INITIAL_ITEMS.forEach(item => {
              fetch('/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
              }).catch(() => {});
            });
            setItems(INITIAL_ITEMS);
            localStorage.setItem('campus_items', JSON.stringify(INITIAL_ITEMS));
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch items from SQLite backend:', err);
    }
    return null;
  };

  // Initial Sync from Storage & Session Management
  useEffect(() => {
    const cachedItems = localStorage.getItem('campus_items');
    const cachedUsers = localStorage.getItem('campus_users');

    let loadedUsers = INITIAL_USERS;
    if (cachedUsers) {
      try {
        const parsed = JSON.parse(cachedUsers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const clean = parsed.filter(u => u && u.email && !FAKE_EMAILS.includes(u.email.toLowerCase()));
          loadedUsers = clean.length > 0 ? clean : INITIAL_USERS;
        }
        setUsers(loadedUsers);
        localStorage.setItem('campus_users', JSON.stringify(loadedUsers));
      } catch {
        setUsers(loadedUsers);
        localStorage.setItem('campus_users', JSON.stringify(loadedUsers));
      }
    } else {
      setUsers(loadedUsers);
      localStorage.setItem('campus_users', JSON.stringify(loadedUsers));
    }

    // Fetch live users, items, and return records from backend
    fetchBackendUsers();
    fetchBackendItems();
    fetchReturnRecords();

    // Always clear legacy shared localStorage key to prevent cross-tab state leakage
    localStorage.removeItem('campus_current_user');

    // Retrieve per-tab session from sessionStorage
    const tabSessionRaw = sessionStorage.getItem('campus_tab_session');
    if (tabSessionRaw) {
      try {
        const sessionData = JSON.parse(tabSessionRaw);
        if (sessionData && sessionData.sessionId && sessionData.user && sessionData.user.email) {
          setCurrentUser(sessionData.user);
        } else {
          sessionStorage.removeItem('campus_tab_session');
          setCurrentUser(null);
        }
      } catch {
        sessionStorage.removeItem('campus_tab_session');
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    if (currentTab === 'admin') {
      fetchBackendUsers();
      fetchReturnRecords();
    }
  }, [currentTab]);

  // Save changes helpers
  const updateItemsAndSync = (newItems: Item[]) => {
    setItems(newItems);
    localStorage.setItem('campus_items', JSON.stringify(newItems));
    // Persist each item to SQLite database
    newItems.forEach(item => {
      fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      }).catch(err => console.error('Error syncing item to SQLite:', err));
    });
  };

  const updateUsersAndSync = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem('campus_users', JSON.stringify(newUsers));
    fetch('/api/users/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users: newUsers })
    }).catch(err => console.error('Error syncing users:', err));
  };

  const updateCurrentUserAndSync = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      const sessionId =
        typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID
          ? window.crypto.randomUUID()
          : `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const sessionData = {
        sessionId,
        user,
        createdAt: Date.now(),
      };

      sessionStorage.setItem('campus_tab_session', JSON.stringify(sessionData));
      localStorage.removeItem('campus_current_user');

      // Update users state and sync with backend
      setUsers(prev => {
        const map = new Map<string, User>();
        prev.forEach(u => map.set(u.email.toLowerCase(), u));
        map.set(user.email.toLowerCase(), user);
        const merged = Array.from(map.values());
        localStorage.setItem('campus_users', JSON.stringify(merged));
        return merged;
      });

      fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: [user] })
      }).catch(err => console.error('Error syncing current user:', err));
    } else {
      sessionStorage.removeItem('campus_tab_session');
      localStorage.removeItem('campus_current_user');
    }
  };

  const handleLogout = () => {
    updateCurrentUserAndSync(null);
    setCurrentTab('home');
  };

  const handleToggleUserStatus = (userId: string, targetStatus: 'active' | 'suspended') => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, status: targetStatus };
      }
      return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem('campus_users', JSON.stringify(updatedUsers));

    const targetUser = users.find(u => u.id === userId);
    if (targetUser && targetUser.email) {
      fetch('/api/users/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetUser.email, status: targetStatus })
      }).catch(err => console.error('Failed to toggle user status:', err));
    }
  };

  // Handle Quick Search in Hero
  const handleHeroSearch = (query: string, category: string) => {
    setSearchQuery(query);
    setFilterCategory(category);
    setFilterType('all');
    setCurrentTab('browse');
  };

  // Requirement 2: Authentication Required for Reporting
  const handleOpenReport = (type: 'lost' | 'found') => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    setEditingItem(null);
    setReportModalType(type);
    setShowReportModal(true);
  };

  // Requirement 9: Edit own post
  const handleEditItem = (item: Item) => {
    if (!currentUser) return;
    if (currentUser.role !== 'admin' && currentUser.id !== item.reporterId) return;
    setEditingItem(item);
    setReportModalType(item.type);
    setShowReportModal(true);
  };

  // Handle Item report submission
  const handleReportSubmit = (newReport: Omit<Item, 'id' | 'status' | 'reporterId' | 'reporterName' | 'reporterEmail' | 'reporterPhone'>) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    const newItem: Item = {
      ...newReport,
      id: 'itm-' + Date.now(),
      status: 'pending',
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterEmail: currentUser.email,
      reporterPhone: currentUser.phone || '',
    };

    const updated = [newItem, ...items];
    updateItemsAndSync(updated);

    // Automatically check for potential matches with existing items and trigger email alerts
    checkAndTriggerMatchNotifications(newItem, items);

    // Switch view to browse to inspect results
    setFilterType(newReport.type === 'lost' ? 'lost' : 'found');
    setSearchQuery('');
    setFilterCategory('All');
    setFilterDate('');
    setFilterStatus('all');
    setCurrentTab('browse');
  };

  // Helper: Automated Match Detection and Email Notification Engine
  const checkAndTriggerMatchNotifications = (targetItem: Item, currentItemsList: Item[]) => {
    if (targetItem.status === 'returned') return;

    const isMatch = (lost: Item, found: Item): boolean => {
      if (lost.status === 'returned' || found.status === 'returned') return false;
      if (lost.type !== 'lost' || found.type !== 'found') return false;

      const catMatch = lost.category.toLowerCase() === found.category.toLowerCase();

      const typeL = (lost.itemType || '').trim().toLowerCase();
      const typeF = (found.itemType || '').trim().toLowerCase();
      const typeMatch = typeL.length > 0 && typeF.length > 0 && (typeL === typeF || typeL.includes(typeF) || typeF.includes(typeL));

      const nameL = (lost.name || '').trim().toLowerCase();
      const nameF = (found.name || '').trim().toLowerCase();
      const nameMatch = nameL.length > 0 && nameF.length > 0 && (nameL.includes(nameF) || nameF.includes(nameL));

      return catMatch || typeMatch || nameMatch;
    };

    if (targetItem.type === 'lost') {
      const matchedFoundItems = currentItemsList.filter(i => i.type === 'found' && isMatch(targetItem, i));
      matchedFoundItems.forEach(foundItem => {
        fetch('/api/notify-match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lostItem: targetItem,
            foundItem: foundItem
          })
        }).then(res => res.json())
          .then(data => console.log('[Match Notification Engine] Match alert response:', data))
          .catch(err => console.error('[Match Notification Engine] Exception:', err));
      });
    } else if (targetItem.type === 'found') {
      const matchedLostItems = currentItemsList.filter(i => i.type === 'lost' && isMatch(i, targetItem));
      matchedLostItems.forEach(lostItem => {
        fetch('/api/notify-match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lostItem: lostItem,
            foundItem: targetItem
          })
        }).then(res => res.json())
          .then(data => console.log('[Match Notification Engine] Match alert response:', data))
          .catch(err => console.error('[Match Notification Engine] Exception:', err));
      });
    }
  };

  // Update existing item (Requirement 9)
  const handleUpdateItem = (updatedItem: Item) => {
    const updated = items.map(i => i.id === updatedItem.id ? updatedItem : i);
    updateItemsAndSync(updated);
    checkAndTriggerMatchNotifications(updatedItem, items.filter(i => i.id !== updatedItem.id));
    setEditingItem(null);
  };

  // Requirement 6: Dual-post Received Confirmation Workflow with SMTP Notification & SQLite Persistence
  const handleConfirmReceived = async (itemId: string) => {
    const targetItem = items.find(i => i.id === itemId);
    if (!targetItem) return;

    try {
      const res = await fetch('/api/items/confirm-return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          matchedItemId: targetItem.matchedItemId,
          confirmedBy: currentUser?.name || targetItem.reporterName || 'Item Owner'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          updateItemsAndSync(data.items);
          fetchReturnRecords();
        } else {
          await fetchBackendItems();
        }
      } else {
        // Fallback local state update
        const updatedItem = { ...targetItem, status: 'returned' as const, userConfirmedReceived: true };
        const updated = items.map(i => i.id === itemId ? updatedItem : i);
        updateItemsAndSync(updated);
      }
    } catch (err) {
      console.error('Error confirming receipt:', err);
      const updatedItem = { ...targetItem, status: 'returned' as const, userConfirmedReceived: true };
      const updated = items.map(i => i.id === itemId ? updatedItem : i);
      updateItemsAndSync(updated);
    }
  };

  // Admin: Delete Listings - Permanently removes post from system immediately
  const handleDeleteItem = (itemId: string) => {
    const filteredItems = items.filter(i => i.id !== itemId);
    updateItemsAndSync(filteredItems);
    fetch(`/api/items/${itemId}`, { method: 'DELETE' }).catch(err => console.error('Error deleting item on server:', err));
  };

  // Admin: Change Status (Requirement 5: Limited to pending or returned) with Dual-Post Sync & SMTP Notification
  const handleChangeItemStatus = async (itemId: string, status: 'pending' | 'returned') => {
    const targetItem = items.find(i => i.id === itemId);
    if (!targetItem) return;

    if (status === 'returned') {
      try {
        const res = await fetch('/api/items/confirm-return', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId,
            matchedItemId: targetItem.matchedItemId,
            confirmedBy: currentUser?.name || 'Campus Administrator'
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.items)) {
            updateItemsAndSync(data.items);
            fetchReturnRecords();
            return;
          }
        }
      } catch (err) {
        console.error('Error dual-updating status to returned:', err);
      }
    }

    const updatedItem = { ...targetItem, status };
    const updated = items.map(i => i.id === itemId ? updatedItem : i);
    updateItemsAndSync(updated);
  };

  // Proof-of-Return Record creation handler (with real-time camera photo)
  const handleSaveReturnRecord = async (recordData: any) => {
    try {
      const res = await fetch('/api/return-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Re-fetch all items and records to ensure complete synchronization
        await fetchBackendItems();
        await fetchReturnRecords();
        return data.record;
      } else {
        alert(data.error || 'Failed to save official return record.');
        return null;
      }
    } catch (err) {
      console.error('Error saving return record:', err);
      alert('Network error while saving return record. Please try again.');
      return null;
    }
  };

  const handleDeleteReturnRecord = async (recordId: string) => {
    try {
      const res = await fetch(`/api/return-records/${recordId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setReturnRecords(prev => prev.filter(r => r.id !== recordId));
      }
    } catch (err) {
      console.error('Failed to delete return record:', err);
    }
  };

  // Reset Filters on Browse tab
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterCategory('All');
    setFilterType('all');
    setFilterDate('');
    setFilterStatus('all');
  };

  // Filtering Logic for Browse view
  const filteredBrowseItems = items.filter(item => {
    // Search query filter
    const matchesSearch = searchQuery.trim() === '' || 
      (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.itemType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location || '').toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;

    // Item Type (Lost vs Found)
    const matchesType = filterType === 'all' || item.type === filterType;

    // Date picker filter
    const matchesDate = filterDate === '' || item.date === filterDate;

    // Status filter
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;

    return matchesSearch && matchesCategory && matchesType && matchesDate && matchesStatus;
  });

  // Home Page Splitting Grids
  const homeLostItems = items.filter(i => i.type === 'lost' && i.status === 'pending').slice(0, 4);
  const homeFoundItems = items.filter(i => i.type === 'found' && i.status === 'pending').slice(0, 4);

  return (
    <div id="application-layout" className="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 transition-colors duration-200">
      
      {/* Dynamic Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onOpenReport={handleOpenReport}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Content Stage */}
      <main className="flex-grow">
        
        {/* VIEW A: HOME PAGE LANDING */}
        {currentTab === 'home' && (
          <div id="home-view" className="space-y-12 pb-16">
            
            {/* Hero Banner Component */}
            <HeroSection
              onOpenReport={handleOpenReport}
              onSearch={handleHeroSearch}
              totalActiveItemsCount={items.filter(i => i.status === 'pending').length}
            />

            {/* Main Listing Grids */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
              
              {/* Lost Items Grid */}
              <ItemGrid
                items={homeLostItems}
                onItemClick={(item) => setSelectedItem(item)}
                title="Recently LOST Items"
                description="Have you spotted any of these campus belongings? Help a fellow student out!"
                emptyMessage="No recently lost items. Good news for campus!"
                currentUser={currentUser}
                onOpenReturnCamera={(found, lost) => setReturnCameraTarget({ foundItem: found, lostItem: lost })}
              />

              {/* Found Items Grid */}
              <ItemGrid
                items={homeFoundItems}
                onItemClick={(item) => setSelectedItem(item)}
                title="Recently Found Items"
                description="These items were found on campus recently. Inspect reporter contact details to reconcile."
                emptyMessage="No recently found items turned in."
                currentUser={currentUser}
                onOpenReturnCamera={(found, lost) => setReturnCameraTarget({ foundItem: found, lostItem: lost })}
              />

              {/* Browse CTA footer strip */}
              <div className="rounded-2xl border border-blue-100 bg-white p-6 text-center space-y-4 shadow-sm max-w-3xl mx-auto">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-950">Looking for a different item?</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Our portal maintains a complete directory of lost phones, laptops, clothing, keys, and documents. View all listings to customize filters.
                </p>
                <button
                  onClick={() => setCurrentTab('browse')}
                  className="inline-flex items-center space-x-1 text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <span>Explore full catalog</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* VIEW B: BROWSE AND FILTER PAGE */}
        {currentTab === 'browse' && (
          <div id="browse-catalog-view" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-left space-y-6">
            
            {/* Page Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Campus Catalog Archive</h1>
              <p className="text-sm text-slate-500 mt-1">Filter, look-up, and search registered lost or found valuables across the campus directory.</p>
            </div>

            {/* Interactive Filters Grid panel */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
              
              {/* Row 1: Item Type toggler */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Classification filter</span>
                  <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setFilterType('all')}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                        filterType === 'all'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All Listings
                    </button>
                    <button
                      onClick={() => setFilterType('lost')}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                        filterType === 'lost'
                          ? 'bg-rose-500 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Lost Items
                    </button>
                    <button
                      onClick={() => setFilterType('found')}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                        filterType === 'found'
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Found Items
                    </button>
                  </div>
                </div>

                {/* Direct Action buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenReport('lost')}
                    className="rounded-xl border border-rose-200 hover:border-rose-300 text-rose-700 bg-rose-50/20 px-4 py-2 text-xs font-bold transition-colors"
                  >
                    Report My Lost Item
                  </button>
                  <button
                    onClick={() => handleOpenReport('found')}
                    className="rounded-xl border border-emerald-200 hover:border-emerald-300 text-emerald-700 bg-emerald-50/20 px-4 py-2 text-xs font-bold transition-colors"
                  >
                    Register Found Item
                  </button>
                </div>
              </div>

              {/* Row 2: Text search, Category, Date, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-50">
                
                {/* Search Term input */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Search Keywords</label>
                  <div className="relative">
                    <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g., iPhone, keychain, jacket..."
                      className="w-full rounded-xl border border-slate-200 py-2.5 pr-3 pl-9.5 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Category Select */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="All">All Categories</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Documents">Documents</option>
                    <option value="Keys">Keys</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Date Input picker */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date Logged</label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Status Toggler */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="returned">Returned</option>
                  </select>
                </div>

              </div>

              {/* Reset trigger */}
              {(searchQuery || filterCategory !== 'All' || filterType !== 'all' || filterDate || filterStatus !== 'all') && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Reset search filters</span>
                  </button>
                </div>
              )}

            </div>

            {/* Results Grid block */}
            <div className="pt-6">
              <ItemGrid
                items={filteredBrowseItems}
                onItemClick={(item) => setSelectedItem(item)}
                title={
                  filterType === 'all' 
                    ? 'All Catalog Items' 
                    : filterType === 'lost' 
                    ? 'Lost Items Registered' 
                    : 'Found Items Registered'
                }
                emptyMessage="We couldn't find any listings matching your customized filter criteria. Try searching other words or resetting filters."
                currentUser={currentUser}
                onOpenReturnCamera={(found, lost) => setReturnCameraTarget({ foundItem: found, lostItem: lost })}
              />
            </div>

          </div>
        )}

        {/* VIEW C: PERSONAL USER DASHBOARD */}
        {currentTab === 'dashboard' && (
          <div id="student-dashboard-container" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            {currentUser ? (
              <UserDashboardView
                currentUser={currentUser}
                items={items}
                onViewItemDetails={(item) => setSelectedItem(item)}
                onEditItem={handleEditItem}
                onConfirmReceived={handleConfirmReceived}
                onOpenReturnCamera={(found, lost) => setReturnCameraTarget({ foundItem: found, lostItem: lost })}
              />
            ) : (
              /* If not logged in, show login prompt */
              <div className="max-w-md mx-auto rounded-2xl border border-slate-100 bg-white p-8 text-center space-y-6 shadow-md my-12 text-left">
                <div className="mx-auto h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="space-y-2 text-center">
                  <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
                  <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                    To manage your posts or track reported lost and found items, please sign in.
                  </p>
                </div>
                
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full py-3 rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-100"
                >
                  Go to Secure Sign In
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW D: ADMIN CONSOLE CONTROL PANEL */}
        {currentTab === 'admin' && (
          <div id="admin-dashboard-container" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            {currentUser?.role === 'admin' ? (
              <AdminDashboardView
                items={items}
                users={users}
                returnRecords={returnRecords}
                onDeleteItem={handleDeleteItem}
                onChangeItemStatus={handleChangeItemStatus}
                onViewItemDetails={(item) => setSelectedItem(item)}
                onToggleUserStatus={handleToggleUserStatus}
                onDeleteReturnRecord={handleDeleteReturnRecord}
              />
            ) : (
              <div className="max-w-md mx-auto rounded-2xl border border-red-100 bg-red-50/20 p-8 text-center space-y-6 shadow-md my-12">
                <div className="mx-auto h-12 w-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-rose-950">Administrative Access Denied</h2>
                  <p className="text-xs text-rose-700 leading-relaxed max-w-xs mx-auto">
                    This section is restricted exclusively to the Primary System Administrator (<strong>zaygapiglegend@gmail.com</strong>).
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(true)}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700 p-2.5 text-xs font-bold rounded-xl shadow-sm transition-colors text-center"
                  >
                    Sign In as Administrator
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* MODAL 1: ITEM DETAILS POPUP */}
      {selectedItem && (
        <ItemDetailsModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          currentUser={currentUser}
          onOpenAuth={() => setShowAuthModal(true)}
          onEditItem={handleEditItem}
          onConfirmReceived={handleConfirmReceived}
          onOpenReturnCamera={(found, lost) => {
            setSelectedItem(null);
            setReturnCameraTarget({ foundItem: found, lostItem: lost });
          }}
          allItems={items}
          users={users}
        />
      )}

      {/* MODAL 2: ITEM REGISTRATION / EDIT REPORT FORM */}
      {showReportModal && (
        <ReportFormModal
          initialType={reportModalType}
          editingItem={editingItem}
          onClose={() => {
            setShowReportModal(false);
            setEditingItem(null);
          }}
          onSubmitReport={handleReportSubmit}
          onUpdateItem={handleUpdateItem}
        />
      )}

      {/* MODAL 3: SECURE AUTHENTICATION DIALOG */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(user) => {
            updateCurrentUserAndSync(user);
            fetchBackendUsers();
            if (user.role === 'admin') {
              setCurrentTab('admin');
            } else {
              setCurrentTab('dashboard');
            }
          }}
        />
      )}

      {/* MODAL 4: RETURN PROOF CAMERA MODAL */}
      {returnCameraTarget && (
        <ReturnCameraModal
          foundItem={returnCameraTarget.foundItem}
          lostItem={returnCameraTarget.lostItem}
          currentUser={currentUser}
          onClose={() => setReturnCameraTarget(null)}
          onSaveRecord={handleSaveReturnRecord}
        />
      )}

    </div>
  );
}
