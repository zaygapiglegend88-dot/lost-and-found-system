import { Item, User } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-main',
    name: 'Main System Admin',
    email: 'zaygapiglegend@gmail.com',
    role: 'admin',
    studentId: 'ADM-0001',
    phone: '+1 (555) 019-2831',
    status: 'active',
    createdAt: '2026-08-01T00:00:00.000Z'
  }
];

export const INITIAL_ITEMS: Item[] = [
  {
    id: 'itm-1',
    type: 'found',
    name: 'iPhone 14 Pro',
    itemType: 'iPhone 14 Pro 128GB Space Black',
    category: 'Electronics',
    date: '2026-07-15',
    location: 'Science Library, 2nd Floor study desk',
    description: 'Space Black iPhone 14 Pro with a clear silicone phone case and a sticker of a cartoon cat on the back. Screen is locked.',
    imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=600',
    status: 'pending',
    reporterId: 'usr-admin-main',
    reporterName: 'Campus Service Desk',
    reporterEmail: 'zaygapiglegend@gmail.com',
    reporterPhone: '+1 (555) 019-2831'
  },
  {
    id: 'itm-2',
    type: 'found',
    name: 'Leather Wallet',
    itemType: 'Fossil Genuine Leather Bifold',
    category: 'Documents',
    date: '2026-07-16',
    location: 'Student Union Dining Hall',
    description: 'Genuine leather bifold wallet. Contains a university student ID card. No cash was found inside, just some coupons and receipts.',
    imageUrl: 'https://images.unsplash.com/photo-1627124424074-765a6c6c9b66?auto=format&fit=crop&q=80&w=600',
    status: 'pending',
    reporterId: 'usr-admin-main',
    reporterName: 'Campus Service Desk',
    reporterEmail: 'zaygapiglegend@gmail.com',
    reporterPhone: '+1 (555) 019-2831'
  },
  {
    id: 'itm-3',
    type: 'lost',
    name: 'Brass Key Ring with 3 Keys',
    itemType: 'Standard House Keys with Blue Tag',
    category: 'Keys',
    date: '2026-07-18',
    location: 'Gymnasium Locker Room Bench',
    description: 'Brass ring containing three house keys and a blue plastic key tag labeled "Room 302". Dropped after workout.',
    imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=600',
    status: 'pending',
    reporterId: 'usr-admin-main',
    reporterName: 'Campus Service Desk',
    reporterEmail: 'zaygapiglegend@gmail.com',
    reporterPhone: '+1 (555) 019-2831'
  },
  {
    id: 'itm-4',
    type: 'lost',
    name: 'Sony Noise-Cancelling Headphones',
    itemType: 'Sony WH-1000XM4 Black',
    category: 'Electronics',
    date: '2026-07-17',
    location: 'Engineering Hall Room 102',
    description: 'Black Sony WH-1000XM4 headphones inside a grey zipped hard carrying case. Left on one of the desk chairs.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
    status: 'pending',
    reporterId: 'usr-admin-main',
    reporterName: 'Campus Service Desk',
    reporterEmail: 'zaygapiglegend@gmail.com',
    reporterPhone: '+1 (555) 019-2831'
  },
  {
    id: 'itm-5',
    type: 'found',
    name: 'Patagonia Fleece Jacket',
    itemType: 'Patagonia Synchilla Snap-T Medium',
    category: 'Clothing',
    date: '2026-07-14',
    location: 'Quad bench near the fountain',
    description: 'Patagonia zip-up fleece jacket, navy blue color, size Medium. Left on a bench during the afternoon.',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600',
    status: 'returned',
    reporterId: 'usr-admin-main',
    reporterName: 'Campus Service Desk',
    reporterEmail: 'zaygapiglegend@gmail.com',
    reporterPhone: '+1 (555) 019-2831'
  },
  {
    id: 'itm-6',
    type: 'lost',
    name: 'Organic Chemistry Textbook',
    itemType: 'Wade & Simek 10th Edition Hardcover',
    category: 'Documents',
    date: '2026-07-18',
    location: 'Campus Bookstore Café',
    description: '10th Edition Organic Chemistry textbook. The cover has a slight water stain on the bottom right and "STU-8821" written in pencil inside.',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
    status: 'pending',
    reporterId: 'usr-admin-main',
    reporterName: 'Campus Service Desk',
    reporterEmail: 'zaygapiglegend@gmail.com',
    reporterPhone: '+1 (555) 019-2831'
  },
  {
    id: 'itm-7',
    type: 'found',
    name: 'Red Hydro Flask Water Bottle',
    itemType: 'Hydro Flask 32oz Wide Mouth',
    category: 'Other',
    customCategory: 'Water Bottle & Drinkware',
    date: '2026-07-13',
    location: 'Recreation Center Basketball Court',
    description: 'Red Hydro Flask water bottle, 32oz wide-mouth, with a black cap. Contains several stickers.',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600',
    status: 'pending',
    reporterId: 'usr-admin-main',
    reporterName: 'Campus Service Desk',
    reporterEmail: 'zaygapiglegend@gmail.com',
    reporterPhone: '+1 (555) 019-2831'
  },
  {
    id: 'itm-8',
    type: 'lost',
    name: 'Grey Fitbit Smart Watch',
    itemType: 'Fitbit Inspire 3 Activity Tracker',
    category: 'Electronics',
    date: '2026-07-19',
    location: 'Track Field Bleachers',
    description: 'Grey Fitbit Inspire 3 tracker with a black silicone buckle band. Dropped during evening running session.',
    imageUrl: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&q=80&w=600',
    status: 'pending',
    reporterId: 'usr-admin-main',
    reporterName: 'Campus Service Desk',
    reporterEmail: 'zaygapiglegend@gmail.com',
    reporterPhone: '+1 (555) 019-2831'
  }
];

export const HERO_IMAGE_PATH = '/src/assets/images/campus_lost_and_found_hero_1784479425650.jpg';
