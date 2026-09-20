import React, { useState, useEffect, useRef } from 'react';
import { X, ClipboardEdit, AlertCircle, Sparkles, Upload, Image as ImageIcon, MapPin, Calendar, Check, Trash2 } from 'lucide-react';
import { Item, ItemCategory } from '../types';

interface ReportFormModalProps {
  initialType: 'lost' | 'found';
  editingItem?: Item | null;
  onClose: () => void;
  onSubmitReport: (reportData: Omit<Item, 'id' | 'status' | 'reporterId' | 'reporterName' | 'reporterEmail' | 'reporterPhone'>) => void;
  onUpdateItem?: (updatedItem: Item) => void;
}

export default function ReportFormModal({
  initialType,
  editingItem,
  onClose,
  onSubmitReport,
  onUpdateItem,
}: ReportFormModalProps) {
  const [reportType, setReportType] = useState<'lost' | 'found'>(editingItem ? editingItem.type : initialType);
  const [itemName, setItemName] = useState(editingItem ? editingItem.name : '');
  const [itemType, setItemType] = useState(editingItem ? editingItem.itemType : '');
  const [category, setCategory] = useState<ItemCategory>(editingItem ? editingItem.category : 'Electronics');
  const [customCategory, setCustomCategory] = useState(editingItem ? (editingItem.customCategory || '') : '');
  const [date, setDate] = useState(editingItem ? editingItem.date : new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState(editingItem ? editingItem.location : '');
  const [description, setDescription] = useState(editingItem ? editingItem.description : '');
  
  // Image handling
  const [imageUrl, setImageUrl] = useState(editingItem ? editingItem.imageUrl : '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setImageUrl(compressedDataUrl);
        setIsUploading(false);
      };
      img.onerror = () => {
        setImageUrl(dataUrl);
        setIsUploading(false);
      };
      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemName.trim() || !itemType.trim() || !date || !location.trim() || !description.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    if (category === 'Other' && !customCategory.trim()) {
      alert('Please specify the category for "Other".');
      return;
    }

    const defaultImage = reportType === 'lost' 
      ? 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&q=80&w=600'
      : 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600';

    const finalImageUrl = imageUrl.trim() || defaultImage;

    if (editingItem && onUpdateItem) {
      onUpdateItem({
        ...editingItem,
        type: reportType,
        name: itemName.trim(),
        itemType: itemType.trim(),
        category,
        customCategory: category === 'Other' ? customCategory.trim() : undefined,
        date,
        location: location.trim(),
        description: description.trim(),
        imageUrl: finalImageUrl,
      });
    } else {
      onSubmitReport({
        type: reportType,
        name: itemName.trim(),
        itemType: itemType.trim(),
        category,
        customCategory: category === 'Other' ? customCategory.trim() : undefined,
        date,
        location: location.trim(),
        description: description.trim(),
        imageUrl: finalImageUrl,
      });
    }

    onClose();
  };

  const categories: ItemCategory[] = ['Electronics', 'Documents', 'Keys', 'Clothing', 'Other'];

  return (
    <div id="report-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        id="report-modal-content"
        className="relative w-full max-w-xl rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl my-8 animate-scale-up"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-slate-100 dark:bg-slate-800 p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-slate-100 dark:border-slate-800 p-6 text-left">
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <ClipboardEdit className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {editingItem ? 'Edit Item Post' : 'Report Campus Item'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {editingItem ? 'Update details for your reported item' : 'Provide accurate details to register your item on SafeReturn.'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-left max-h-[70vh] overflow-y-auto">
          
          {/* Toggle Type Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Report Classification</label>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              <button
                type="button"
                onClick={() => setReportType('lost')}
                className={`py-2 text-sm font-bold rounded-lg transition-all ${
                  reportType === 'lost'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Lost Item
              </button>
              <button
                type="button"
                onClick={() => setReportType('found')}
                className={`py-2 text-sm font-bold rounded-lg transition-all ${
                  reportType === 'found'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Found Item
              </button>
            </div>
          </div>

          {/* Item Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Item Name *</label>
            <input
              type="text"
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g., Space Grey iPad Air, Ring with keys, Blue Fleece..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3.5 py-2.5 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Item Type (Model / Specific Type) - Requirement 10 */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Type *</label>
            <input
              type="text"
              required
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              placeholder="e.g., Samsung S21, iPhone 14 Pro, HP EliteBook 840 G8"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3.5 py-2.5 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Specify the model or specific type of the item.</p>
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ItemCategory)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Requirement 11: Category = Other -> Specify Category */}
          {category === 'Other' && (
            <div className="space-y-1.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/40 p-3.5 animate-fade-in">
              <label className="block text-xs font-bold text-amber-900 dark:text-amber-300">Specify Category *</label>
              <input
                type="text"
                required
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g., Musical Instrument, Sports Equipment, Umbrella..."
                className="w-full rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          )}

          {/* Grid: Date & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {reportType === 'lost' ? 'Date Lost *' : 'Date Found *'}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {reportType === 'lost' ? 'Last Known Location *' : 'Location Found *'}
              </label>
              <div className="relative">
                <MapPin className="absolute top-3.5 left-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Science Library Desk, Gym Bleachers..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 py-2.5 pr-3.5 pl-9 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Item Description *</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Provide a thorough description (color, distinguishing marks, brand, condition)..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3.5 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Requirement 12: Fixed Image Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Item Image</label>
            
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              
              {/* File Upload Trigger Card */}
              <div className="flex-1 w-full border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-xl p-4 text-center bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
                {isUploading ? (
                  <div className="py-4 space-y-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mx-auto" />
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400">Processing & compressing image...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="mx-auto h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                      >
                        Click to upload an image from your device
                      </button>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Supports PNG, JPG, GIF, WebP</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Live Preview Box */}
              {imageUrl ? (
                <div className="relative h-28 w-28 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 group">
                  <img
                    src={imageUrl}
                    alt="Uploaded preview"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    title="Remove image"
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="h-28 w-28 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 flex-shrink-0">
                  <ImageIcon className="h-6 w-6" />
                  <span className="text-[10px] font-medium mt-1">No Image</span>
                </div>
              )}

            </div>

          </div>

          {/* Action Footer */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-5 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 rounded-xl border border-slate-200 dark:border-slate-700 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 flex items-center justify-center space-x-1.5 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-100 dark:shadow-none transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span>{editingItem ? 'Save Changes' : 'Submit Report'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
