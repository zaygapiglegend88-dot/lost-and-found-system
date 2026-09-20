import React from 'react';
import { Calendar, MapPin, Tag, ArrowRight, CheckCircle2, Clock, Camera } from 'lucide-react';
import { Item, User } from '../types';

interface ItemGridProps {
  items: Item[];
  onItemClick: (item: Item) => void;
  title: string;
  description?: string;
  emptyMessage?: string;
  currentUser?: User | null;
  onOpenReturnCamera?: (foundItem: Item, lostItem?: Item) => void;
}

export default function ItemGrid({
  items,
  onItemClick,
  title,
  description,
  emptyMessage = "No items reported in this category yet.",
  currentUser,
  onOpenReturnCamera,
}: ItemGridProps) {
  
  // Category badge helper
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'Electronics':
        return 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/50';
      case 'Documents':
        return 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900/50';
      case 'Keys':
        return 'bg-orange-50 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-900/50';
      case 'Clothing':
        return 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/50';
      default:
        return 'bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-150 dark:border-slate-700';
    }
  };

  return (
    <div id={`item-grid-${title.replace(/\s+/g, '-').toLowerCase()}`} className="space-y-6 text-left">
      
      {/* Grid Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h2>
          {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
        </div>
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-2 md:mt-0">
          Showing {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-slate-50/50 dark:bg-slate-900/40">
          <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3 text-slate-400 dark:text-slate-500">
            <Tag className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">No items listed</h3>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-sm">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const isLost = item.type === 'lost';
            return (
              <div
                id={`item-card-${item.id}`}
                key={item.id}
                onClick={() => onItemClick(item)}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/60 cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
              >
                
                {/* Image display */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={item.imageUrl || `https://picsum.photos/seed/${item.id}/400/300`}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Item type badge (LOST/FOUND) */}
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${
                      isLost 
                        ? 'bg-rose-500 text-white' 
                        : 'bg-emerald-500 text-white'
                    }`}>
                      {isLost ? 'LOST' : 'FOUND'}
                    </span>
                  </div>

                  {/* Status badge (green for returned, amber for pending) */}
                  <div className="absolute top-3 right-3">
                    {item.status === 'returned' ? (
                      <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-md border border-emerald-500">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Returned</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-md border border-amber-400">
                        <Clock className="h-3 w-3" />
                        <span>Pending</span>
                      </span>
                    )}
                  </div>

                  {/* Status overlay if returned */}
                  {item.status === 'returned' && (
                    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px] flex items-center justify-center p-3 text-center">
                      <div className="rounded-xl bg-white/95 dark:bg-slate-900/95 px-4 py-2 border border-slate-100 dark:border-slate-800 shadow-xl">
                        <p className="text-xs font-extrabold flex items-center justify-center space-x-1.5 text-blue-600 dark:text-blue-400">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span>RETURNED</span>
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Item reconciled</p>
                      </div>
                    </div>
                  )}

                  {/* Category overlay */}
                  <div className="absolute bottom-3 right-3">
                    <span className={`rounded-lg border px-2 py-0.5 text-[11px] font-bold shadow-sm backdrop-blur-md ${getCategoryStyles(item.category)}`}>
                      {item.category === 'Other' && item.customCategory ? item.customCategory : item.category}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col p-4 text-left">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.name}
                      </h3>
                      <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider flex-shrink-0 ${
                        item.status === 'returned' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900' 
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                      }`}>
                        {item.status === 'returned' ? 'Returned' : 'Pending'}
                      </span>
                    </div>

                    {item.itemType && (
                      <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50/70 dark:bg-blue-950/60 px-2 py-0.5 rounded inline-block">
                        {item.itemType}
                      </p>
                    )}
                    
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2rem]">
                      {item.description}
                    </p>
                  </div>

                  {/* Card Metadata Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 mr-1.5 flex-shrink-0" />
                      <span className="line-clamp-1 font-medium text-slate-700 dark:text-slate-300">{item.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 mr-1.5 flex-shrink-0" />
                        <span className="font-medium text-slate-600 dark:text-slate-400">
                          {isLost ? 'Lost on: ' : 'Found on: '}
                          <span className="text-slate-800 dark:text-slate-200">{item.date}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Requirement 1 & 2: RETURNED Button for Found Item Creator */}
                  {!isLost && item.status !== 'returned' && currentUser && (currentUser.id === item.reporterId || currentUser.email === item.reporterEmail) && onOpenReturnCamera ? (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenReturnCamera(item);
                        }}
                        className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98 border border-emerald-500"
                        title="I have returned the item I found to its rightful owner."
                      >
                        <Camera className="h-3.5 w-3.5" />
                        <span>RETURNED</span>
                      </button>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 hover:text-blue-600 transition-colors">
                        <span>View full post</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  ) : item.status === 'pending' ? (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                      <span>View details</span>
                      <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  ) : null}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
