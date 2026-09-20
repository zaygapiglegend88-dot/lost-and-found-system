import React, { useState } from 'react';
import { 
  ShieldCheck, AlertCircle, Clock, Calendar, MapPin, Tag, 
  User, CheckCircle, Eye, Edit, CheckCircle2, Camera
} from 'lucide-react';
import { Item, User as UserType } from '../types';

interface UserDashboardViewProps {
  currentUser: UserType;
  items: Item[];
  onViewItemDetails: (item: Item) => void;
  onEditItem: (item: Item) => void;
  onConfirmReceived: (itemId: string) => void;
  onOpenReturnCamera?: (foundItem: Item, lostItem?: Item) => void;
}

export default function UserDashboardView({
  currentUser,
  items,
  onViewItemDetails,
  onEditItem,
  onConfirmReceived,
  onOpenReturnCamera,
}: UserDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<'lost' | 'found'>('lost');

  // Filter lists based on current user
  const myLostItems = items.filter(i => i.reporterId === currentUser.id && i.type === 'lost');
  const myFoundItems = items.filter(i => i.reporterId === currentUser.id && i.type === 'found');

  return (
    <div id="user-dashboard-root" className="space-y-8 text-left animate-fade-in">
      
      {/* Student Profile Banner */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-lg shadow-blue-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-white font-black text-xl border border-white/20">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Campus Registered Member</p>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">{currentUser.name}</h1>
              <p className="text-xs text-blue-100 font-medium mt-0.5">{currentUser.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950/20 backdrop-blur-sm p-3 rounded-xl border border-white/10">
            <div>
              <p className="text-blue-200 font-semibold uppercase text-[9px] tracking-wider">Student/Staff ID</p>
              <p className="font-mono font-bold text-sm">{currentUser.studentId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-blue-200 font-semibold uppercase text-[9px] tracking-wider">Contact Phone</p>
              <p className="font-bold text-sm">{currentUser.phone || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 gap-4">
        
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm text-center sm:text-left">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">My Lost Items</p>
          <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{myLostItems.length}</p>
        </div>

        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm text-center sm:text-left">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">My Found Items</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{myFoundItems.length}</p>
        </div>

      </div>

      {/* Tabs Navigation */}
      <div className="flex border border-slate-200 dark:border-slate-800 space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl max-w-xs">
        <button
          onClick={() => setActiveTab('lost')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all text-center ${
            activeTab === 'lost'
              ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          My Lost Items ({myLostItems.length})
        </button>

        <button
          onClick={() => setActiveTab('found')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all text-center ${
            activeTab === 'found'
              ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          My Found Items ({myFoundItems.length})
        </button>
      </div>

      {/* TAB 1: My Reported Lost Items */}
      {activeTab === 'lost' && (
        <div id="dashboard-lost-panel" className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Items You Reported Lost</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage your lost item listings or mark them as received when returned.</p>
          </div>

          {myLostItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900 shadow-sm">
              <div className="rounded-full bg-slate-50 dark:bg-slate-800 p-3.5 text-slate-400 dark:text-slate-500">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">No lost items filed</h3>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                You haven't filed any personal lost items on this portal yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myLostItems.map((item) => {
                // Find matching found item reported by another user (the finder)
                const matchedFoundItem = items.find(
                  i => i.type === 'found' &&
                  ((i.category && item.category && i.category === item.category) ||
                   (i.itemType && item.itemType && i.itemType.toLowerCase() === item.itemType.toLowerCase()) ||
                   (i.name && item.name && (i.name.toLowerCase().includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(i.name.toLowerCase())))) &&
                  i.reporterId !== currentUser.id
                ) || items.find(i => i.type === 'found' && i.category === item.category && i.reporterId !== currentUser.id);

                return (
                  <div 
                    id={`my-lost-card-${item.id}`}
                    key={item.id} 
                    className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-col gap-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Left Block: Image & details */}
                      <div className="flex items-center space-x-4 text-left">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          referrerPolicy="no-referrer"
                          className="h-14 w-14 rounded-lg object-cover bg-slate-100 dark:bg-slate-800"
                        />
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.name}</h3>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            Type: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.itemType}</span> • Category: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.category}</span>
                          </p>
                          <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span className="flex items-center"><MapPin className="h-3.5 w-3.5 text-slate-400 mr-1" /> {item.location}</span>
                            <span className="flex items-center"><Calendar className="h-3.5 w-3.5 text-slate-400 mr-1" /> {item.date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Block: Actions */}
                      <div className="flex flex-wrap items-center space-x-2 w-full sm:w-auto justify-end gap-y-2">
                        
                        {/* View Details */}
                        <button
                          onClick={() => onViewItemDetails(item)}
                          className="p-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg flex items-center space-x-1 transition-all"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">Details</span>
                        </button>

                        {/* Edit button: Only permitted for the item owner */}
                        {item.reporterId === currentUser.id && (
                          <button
                            onClick={() => onEditItem(item)}
                            className="p-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center space-x-1 transition-all"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                        )}

                        {/* Received Confirmation Workflow */}
                        {item.status !== 'returned' ? (
                          <button
                            onClick={() => onConfirmReceived(item.id)}
                            disabled={item.userConfirmedReceived}
                            className={`px-3 py-2 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all ${
                              item.userConfirmedReceived 
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 cursor-default' 
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                            }`}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>
                              {item.userConfirmedReceived 
                                ? 'Received Confirmed' 
                                : 'Received'}
                            </span>
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center space-x-1 border border-blue-100 dark:border-blue-900/50">
                            <CheckCircle className="h-4 w-4" />
                            <span>Returned</span>
                          </span>
                        )}

                      </div>
                    </div>

                    {/* Matched Found Item & Finder Contact Information Box */}
                    {matchedFoundItem && (
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl p-3.5 text-xs text-left space-y-2 border border-emerald-100 dark:border-emerald-900/40">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-extrabold text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
                            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            Matched Found Item Report
                          </span>
                          <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                            Found: {matchedFoundItem.name}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-700 dark:text-slate-300 font-medium text-[11px] bg-white dark:bg-slate-800 p-3 rounded-lg border border-emerald-100/80 dark:border-emerald-900/50 shadow-2xs">
                          <div>
                            <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Finder's Full Name</span>
                            <span className="font-extrabold text-slate-900 dark:text-slate-100">{matchedFoundItem.reporterName}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Finder's Email Address</span>
                            <span className="font-extrabold text-slate-900 dark:text-slate-100">{matchedFoundItem.reporterEmail}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Finder's Phone Number</span>
                            <span className="font-extrabold text-slate-900 dark:text-slate-100">{matchedFoundItem.reporterPhone || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: My Reported Found Items */}
      {activeTab === 'found' && (
        <div id="dashboard-found-panel" className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Items You Found & Registered</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">List of items you found on campus and turned in for owner reconciliation.</p>
          </div>

          {myFoundItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900 shadow-sm">
              <div className="rounded-full bg-slate-50 dark:bg-slate-800 p-3.5 text-slate-400 dark:text-slate-500">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">No found items registered</h3>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                You haven't reported turning in any found valuables yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myFoundItems.map((item) => (
                <div 
                  id={`my-found-card-${item.id}`}
                  key={item.id} 
                  className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  
                  {/* Left Block */}
                  <div className="flex items-center space-x-4 text-left">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      referrerPolicy="no-referrer"
                      className="h-14 w-14 rounded-lg object-cover bg-slate-100 dark:bg-slate-800"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.name}</h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        Type: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.itemType}</span> • Category: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.category}</span>
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center"><MapPin className="h-3.5 w-3.5 text-slate-400 mr-1" /> {item.location}</span>
                        <span className="flex items-center"><Calendar className="h-3.5 w-3.5 text-slate-400 mr-1" /> {item.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Block */}
                  <div className="flex flex-wrap items-center space-x-2 w-full sm:w-auto justify-end gap-y-2">
                    <button
                      onClick={() => onViewItemDetails(item)}
                      className="p-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg flex items-center space-x-1 transition-all"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="hidden sm:inline">Inspect</span>
                    </button>
                    
                    {/* Requirement 9: Edit Own Posts */}
                    <button
                      onClick={() => onEditItem(item)}
                      className="p-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center space-x-1 transition-all"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>

                    {/* Requirement 1 & 2: RETURNED Button */}
                    {item.status !== 'returned' && onOpenReturnCamera && (
                      <button
                        type="button"
                        onClick={() => {
                          // Find any matched lost item if exists
                          const matchedLost = items.find(i => 
                            i.type === 'lost' && 
                            (i.id === item.matchedItemId || 
                             (i.category === item.category && ((i.itemType && item.itemType && i.itemType.toLowerCase() === item.itemType.toLowerCase()) || i.name.toLowerCase().includes(item.name.toLowerCase()))))
                          );
                          onOpenReturnCamera(item, matchedLost);
                        }}
                        className="px-3.5 py-2 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center space-x-1.5 transition-all shadow-md active:scale-98 border border-emerald-500"
                        title="I have returned the item I found to its rightful owner."
                      >
                        <Camera className="h-3.5 w-3.5" />
                        <span>RETURNED</span>
                      </button>
                    )}

                    {item.status === 'pending' ? (
                      <span className="px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 rounded-xl flex items-center space-x-1 border border-amber-100 dark:border-amber-900/50">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Pending</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center space-x-1 border border-blue-100 dark:border-blue-900/50">
                        <CheckCircle className="h-4 w-4" />
                        <span>Returned</span>
                      </span>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
