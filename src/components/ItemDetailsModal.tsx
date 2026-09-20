import React from 'react';
import { X, Calendar, MapPin, Tag, User, Phone, Mail, Edit, CheckCircle2, Camera, ShieldCheck, CheckCircle } from 'lucide-react';
import { Item, User as UserType } from '../types';

interface ItemDetailsModalProps {
  item: Item;
  onClose: () => void;
  currentUser: UserType | null;
  onOpenAuth: () => void;
  onEditItem?: (item: Item) => void;
  onConfirmReceived?: (itemId: string) => void;
  onOpenReturnCamera?: (foundItem: Item, lostItem?: Item) => void;
  allItems?: Item[];
  users?: UserType[];
}

export default function ItemDetailsModal({
  item,
  onClose,
  currentUser,
  onOpenAuth,
  onEditItem,
  onConfirmReceived,
  onOpenReturnCamera,
  allItems = [],
  users = [],
}: ItemDetailsModalProps) {
  const isLost = item.type === 'lost';

  // Find matched found item when viewing a lost item
  const matchedFoundItem = isLost && allItems.length > 0
    ? allItems.find(
        i => i.type === 'found' &&
        ((i.category && item.category && i.category === item.category) ||
         (i.itemType && item.itemType && i.itemType.toLowerCase() === item.itemType.toLowerCase()) ||
         (i.name && item.name && (i.name.toLowerCase().includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(i.name.toLowerCase())))) &&
        i.reporterId !== item.reporterId
      ) || allItems.find(i => i.type === 'found' && i.category === item.category && i.reporterId !== item.reporterId)
    : null;

  // Authorization check: Strictly restrict editing to original creator/owner (Administrators do NOT have permission to edit user-created posts)
  const isOwner = Boolean(currentUser && currentUser.id === item.reporterId);
  const canEdit = Boolean(currentUser && isOwner);

  // Determine actual creator/reporter contact information:
  // Look up the exact account in the registered users list to get live, up-to-date details
  const reportCreator = users.find(
    u => u.id === item.reporterId || ((u.email || '').toLowerCase() === (item.reporterEmail || '').toLowerCase() && (item.reporterEmail || '') !== '')
  );

  const contactName = reportCreator?.name || item.reporterName || 'N/A';
  const contactEmail = reportCreator?.email || item.reporterEmail || 'N/A';
  const contactPhone = reportCreator?.phone || item.reporterPhone || 'N/A';

  return (
    <div id="item-details-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        id="item-details-modal-content"
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-scale-up"
      >
        {/* Modal Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-slate-100 dark:bg-slate-800 p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
          
          {/* Left: Thumbnail Image */}
          <div className="md:w-5/12 bg-slate-50 dark:bg-slate-800/50">
            <div className="relative h-48 md:h-full w-full">
              <img
                src={item.imageUrl || `https://picsum.photos/seed/${item.id}/500/500`}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold shadow-md ${
                  isLost ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                }`}>
                  {isLost ? 'LOST' : 'FOUND'}
                </span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-sm ${
                  item.status === 'returned' ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {item.status === 'returned' ? 'RETURNED' : 'PENDING'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Detailed Content */}
          <div className="md:w-7/12 p-6 flex flex-col justify-between">
            
            <div className="space-y-4 text-left">
              
              {/* Category & Type Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-lg bg-blue-50 dark:bg-blue-900/40 border border-blue-100 dark:border-blue-800 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                  <Tag className="h-3.5 w-3.5 mr-1" />
                  {item.category === 'Other' && item.customCategory 
                    ? `Other (${item.customCategory})` 
                    : item.category}
                </span>

                {item.itemType && (
                  <span className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                    Type: <strong className="ml-1 font-semibold text-slate-900 dark:text-slate-100">{item.itemType}</strong>
                  </span>
                )}
              </div>

              {/* Name */}
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">{item.name}</h2>

              {/* Metadata block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {isLost ? 'Last Known Location' : 'Location Found'}
                  </span>
                  <span className="flex items-center font-semibold text-slate-800 dark:text-slate-200">
                    <MapPin className="h-4 w-4 text-blue-500 mr-1.5 flex-shrink-0" />
                    {item.location}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {isLost ? 'Date Lost' : 'Date Found'}
                  </span>
                  <span className="flex items-center font-semibold text-slate-800 dark:text-slate-200">
                    <Calendar className="h-4 w-4 text-blue-500 mr-1.5 flex-shrink-0" />
                    {item.date}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Item Description</span>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-xl">
                  {item.description}
                </p>
              </div>

              {/* Reporter / Finder Contact Information (Always shows the report creator) */}
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {isLost ? "Reporter Contact Information (Owner Who Lost Item)" : "Finder Contact Information (Person Who Found Item)"}
                </span>
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center text-slate-800 dark:text-slate-200 font-semibold">
                    <User className="h-4 w-4 text-slate-400 mr-2" />
                    <span>{contactName}</span>
                  </div>
                  {contactPhone && contactPhone !== 'N/A' && (
                    <div className="flex items-center text-slate-600 dark:text-slate-400">
                      <Phone className="h-3.5 w-3.5 text-blue-500 mr-2" />
                      <span>Phone: <strong className="text-slate-900 dark:text-slate-200">{contactPhone}</strong></span>
                    </div>
                  )}
                  {contactEmail && contactEmail !== 'N/A' && (
                    <div className="flex items-center text-slate-600 dark:text-slate-400">
                      <Mail className="h-3.5 w-3.5 text-blue-500 mr-2" />
                      <span>Email: <strong className="text-slate-900 dark:text-slate-200">{contactEmail}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional: Matched Found Item Finder Info */}
              {isLost && matchedFoundItem && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  <span className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Potential Matched Found Item
                  </span>
                  <div className="bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/50 space-y-1 text-[11px]">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{matchedFoundItem.name}</p>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">Location: {matchedFoundItem.location}</p>
                    <div className="pt-1.5 flex flex-col gap-1 border-t border-emerald-200/50 dark:border-emerald-900/40 mt-1.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Finder Contact: {matchedFoundItem.reporterName}</span>
                      {matchedFoundItem.reporterEmail && (
                        <span className="text-slate-600 dark:text-slate-400">Email: <strong className="text-slate-900 dark:text-slate-200">{matchedFoundItem.reporterEmail}</strong></span>
                      )}
                      {matchedFoundItem.reporterPhone && (
                        <span className="text-slate-600 dark:text-slate-400">Phone: <strong className="text-slate-900 dark:text-slate-200">{matchedFoundItem.reporterPhone}</strong></span>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              
              {/* Requirement 1 & 2: RETURNED Button for User's Own Found Item Post (Only available to creator) */}
              {!isLost && isOwner && item.status !== 'returned' && onOpenReturnCamera && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    // Look for matched lost item
                    const matchedLost = allItems.find(i => 
                      i.type === 'lost' && 
                      (i.id === item.matchedItemId || 
                       (i.category === item.category && ((i.itemType && item.itemType && i.itemType.toLowerCase() === item.itemType.toLowerCase()) || i.name.toLowerCase().includes(item.name.toLowerCase()))))
                    );
                    onOpenReturnCamera(item, matchedLost);
                  }}
                  className="w-full flex flex-col items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 px-4 text-white transition-all shadow-md active:scale-98 border border-emerald-500"
                  title="I have returned the item I found to its rightful owner."
                >
                  <div className="flex items-center space-x-2 font-black text-sm tracking-wider">
                    <Camera className="h-4 w-4" />
                    <span>RETURNED</span>
                  </div>
                  <span className="text-[10px] text-emerald-100 font-medium mt-0.5">
                    I have returned the item I found to its rightful owner
                  </span>
                </button>
              )}

              {/* Edit Report - Strictly permitted for creator/owner only */}
              {canEdit && onEditItem && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEditItem(item);
                  }}
                  className="w-full flex items-center justify-center space-x-2 rounded-xl bg-slate-900 dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit My Post</span>
                </button>
              )}

              {/* Requirement 6: Received Button for User's Own Lost Post */}
              {isOwner && isLost && item.status !== 'returned' && onConfirmReceived && (
                <button
                  type="button"
                  onClick={() => {
                    onConfirmReceived(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-center space-x-2 rounded-xl py-2.5 text-xs font-bold transition-colors ${
                    item.userConfirmedReceived 
                      ? 'bg-emerald-100 text-emerald-800 cursor-default' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                  }`}
                  disabled={item.userConfirmedReceived}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    {item.userConfirmedReceived 
                      ? 'Received Confirmed' 
                      : 'I Received My Item'}
                  </span>
                </button>
              )}

              {/* Returned Status Banner if already returned */}
              {item.status === 'returned' && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    Item Successfully Returned
                  </span>
                  {item.returnRecordId && (
                    <span className="font-mono text-[10px] bg-emerald-200/80 dark:bg-emerald-900 px-2 py-0.5 rounded text-emerald-950 dark:text-emerald-100">
                      Proof: {item.returnRecordId}
                    </span>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
