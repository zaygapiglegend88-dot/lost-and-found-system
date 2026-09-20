export type ItemCategory = 'Electronics' | 'Documents' | 'Keys' | 'Clothing' | 'Other';

export interface Item {
  id: string;
  type: 'lost' | 'found'; // report classification
  name: string;
  itemType: string; // Specific model or type (e.g. Samsung S21, iPhone 14 Pro, HP EliteBook)
  category: ItemCategory;
  customCategory?: string; // Specified when category is 'Other'
  date: string; // YYYY-MM-DD
  location: string;
  description: string;
  imageUrl: string;
  status: 'pending' | 'returned';
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone?: string;
  matchedItemId?: string;
  returnRecordId?: string;
  userConfirmedReceived?: boolean;
  adminNotification?: string;
  createdAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  studentId?: string;
  phone?: string;
  status?: 'active' | 'suspended';
  createdAt?: string;
}

export interface ReturnRecord {
  id: string; // Unique Record ID, e.g. REC-2026-XXXXX
  photoUrl: string; // Return proof photo
  itemName: string; // Item name/title
  itemDescription: string; // Item description/details
  itemCategory: string;
  itemType?: string;
  lostItemId?: string; // Lost Item Post reference
  lostItemName?: string;
  foundItemId?: string; // Found Item Post reference
  foundItemName?: string;
  finderId: string; // Finder reference
  finderName: string;
  finderEmail: string;
  finderPhone?: string;
  ownerId: string; // Owner reference
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  returnedDate: string; // Date and time the proof was recorded
  status: 'returned'; // Return status
  notes?: string;
  location?: string;
  createdAt: string;
}

