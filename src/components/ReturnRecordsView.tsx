import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Calendar, 
  User as UserIcon, 
  MapPin, 
  FileText, 
  ExternalLink, 
  X, 
  CheckCircle, 
  Camera, 
  Trash2,
  Download,
  Eye
} from 'lucide-react';
import { ReturnRecord } from '../types';

interface ReturnRecordsViewProps {
  records: ReturnRecord[];
  onDeleteRecord?: (id: string) => void;
}

export const ReturnRecordsView: React.FC<ReturnRecordsViewProps> = ({
  records,
  onDeleteRecord
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRecord, setSelectedRecord] = useState<ReturnRecord | null>(null);
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);

  const categories = ['All', ...Array.from(new Set(records.map(r => r.itemCategory || 'Other')))];

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.itemDescription && record.itemDescription.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (record.ownerName && record.ownerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (record.ownerEmail && record.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (record.finderName && record.finderName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (record.finderEmail && record.finderEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (record.location && record.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || record.itemCategory === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl text-white shadow-lg border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <ShieldCheck className="h-3.5 w-3.5" /> Institutional Handover Ledger
          </div>
          <h2 className="text-xl font-black tracking-tight">Official Return Records</h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Verified proof-of-return photo logs and handover transaction records recorded by finders and verified by owners/admins.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
          <div className="text-center px-3 border-r border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Records</span>
            <p className="text-xl font-black text-white">{records.length}</p>
          </div>
          <div className="text-center px-3">
            <span className="text-[10px] font-bold text-emerald-400 uppercase">Audited Returns</span>
            <p className="text-xl font-black text-emerald-400">{records.length}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Record ID, item name, owner, finder, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm w-full sm:w-auto"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Records Grid */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Camera className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Return Records Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {records.length === 0 
              ? 'When a finder captures handover photo evidence and records a return, the verified return records will be archived here.'
              : 'No records matched your search filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
            >
              {/* Card Photo Header */}
              <div className="relative aspect-video bg-slate-900 overflow-hidden group">
                <img
                  src={record.photoUrl}
                  alt={`Proof of return for ${record.itemName}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Overlay Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm shadow">
                  <CheckCircle className="h-3 w-3" /> Returned
                </div>

                <div className="absolute top-2.5 right-2.5 bg-slate-950/80 text-slate-200 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm shadow">
                  {record.id}
                </div>

                {/* Click to Zoom Overlay */}
                <button
                  type="button"
                  onClick={() => setZoomedPhoto(record.photoUrl)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-xs font-bold"
                >
                  <Eye className="h-4 w-4" /> View Full Photo
                </button>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {record.itemCategory || 'General'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {new Date(record.returnedDate).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 line-clamp-1">
                    {record.itemName}
                  </h3>

                  {record.itemDescription && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {record.itemDescription}
                    </p>
                  )}
                </div>

                {/* Parties Details */}
                <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400">Owner:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[140px]" title={record.ownerName}>
                      {record.ownerName || 'Owner'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400">Finder:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[140px]" title={record.finderName}>
                      {record.finderName || 'Finder'}
                    </span>
                  </div>
                  {record.location && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-[11px] text-slate-400">Location:</span>
                      <span className="font-medium text-slate-700 truncate max-w-[140px]">
                        {record.location}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRecord(record)}
                    className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" /> View Full Record
                  </button>

                  {onDeleteRecord && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete return record ${record.id}?`)) {
                          onDeleteRecord(record.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Record Full Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 my-8">
            
            {/* Header */}
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight">Return Record Audit Proof</h2>
                  <p className="text-xs text-slate-400">Record ID: {selectedRecord.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              
              {/* Proof Photo High-Res */}
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 aspect-video relative group">
                <img
                  src={selectedRecord.photoUrl}
                  alt="Proof photo"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setZoomedPhoto(selectedRecord.photoUrl)}
                  className="absolute bottom-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-1.5 shadow"
                >
                  <Eye className="h-3.5 w-3.5" /> Full Size Photo
                </button>
              </div>

              {/* Item Info Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Item Details</h3>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500 font-medium">Item Name:</span>
                    <span className="col-span-2 font-bold text-slate-900">{selectedRecord.itemName}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500 font-medium">Category / Type:</span>
                    <span className="col-span-2 text-slate-800 font-semibold">{selectedRecord.itemCategory} {selectedRecord.itemType ? `(${selectedRecord.itemType})` : ''}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500 font-medium">Description:</span>
                    <span className="col-span-2 text-slate-700">{selectedRecord.itemDescription || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500 font-medium">Status:</span>
                    <span className="col-span-2 text-emerald-700 font-extrabold flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" /> RETURNED (AUDITED)
                    </span>
                  </div>
                </div>
              </div>

              {/* Handover & Parties Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Owner Card */}
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                    <UserIcon className="h-3 w-3" /> Registered Owner
                  </span>
                  <p className="text-sm font-extrabold text-slate-900">{selectedRecord.ownerName || 'Owner'}</p>
                  <p className="text-xs text-slate-600">{selectedRecord.ownerEmail || 'No email provided'}</p>
                  {selectedRecord.ownerPhone && (
                    <p className="text-xs text-slate-600">{selectedRecord.ownerPhone}</p>
                  )}
                  {selectedRecord.lostItemId && (
                    <p className="text-[11px] text-blue-600 font-mono pt-1">
                      Lost Post Ref: {selectedRecord.lostItemId}
                    </p>
                  )}
                </div>

                {/* Finder Card */}
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                    <UserIcon className="h-3 w-3" /> Finder / Returned By
                  </span>
                  <p className="text-sm font-extrabold text-slate-900">{selectedRecord.finderName || 'Finder'}</p>
                  <p className="text-xs text-slate-600">{selectedRecord.finderEmail || 'No email provided'}</p>
                  {selectedRecord.finderPhone && (
                    <p className="text-xs text-slate-600">{selectedRecord.finderPhone}</p>
                  )}
                  {selectedRecord.foundItemId && (
                    <p className="text-[11px] text-emerald-600 font-mono pt-1">
                      Found Post Ref: {selectedRecord.foundItemId}
                    </p>
                  )}
                </div>

              </div>

              {/* Handover Transaction Details */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-500 font-medium">Recorded Date & Time:</span>
                  <span className="col-span-2 font-bold text-slate-900">{new Date(selectedRecord.returnedDate).toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-500 font-medium">Handover Location:</span>
                  <span className="col-span-2 font-semibold text-slate-800">{selectedRecord.location || 'Campus Center'}</span>
                </div>
                {selectedRecord.notes && (
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500 font-medium">Handover Notes:</span>
                    <span className="col-span-2 text-slate-700">{selectedRecord.notes}</span>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Close
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* High-Res Photo Zoom Modal */}
      {zoomedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <button
            onClick={() => setZoomedPhoto(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={zoomedPhoto}
            alt="High-resolution proof"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl border border-white/10"
          />
        </div>
      )}

    </div>
  );
};
