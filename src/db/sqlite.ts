import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'database.sqlite');
let db: Database | null = null;

export interface SqliteUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user';
  studentId?: string;
  phone?: string;
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface SqliteItem {
  id: string;
  name: string;
  category: string;
  type: 'lost' | 'found';
  itemType?: string;
  description: string;
  location: string;
  date: string;
  time?: string;
  imageUrl?: string;
  status: 'pending' | 'returned';
  reporterId?: string;
  reporterName?: string;
  reporterEmail?: string;
  reporterPhone?: string;
  matchedItemId?: string;
  returnRecordId?: string;
  userConfirmedReceived?: boolean;
  createdAt: string;
}

export interface SqliteReturnRecord {
  id: string;
  photoUrl: string;
  itemName: string;
  itemDescription?: string;
  itemCategory?: string;
  itemType?: string;
  lostItemId?: string;
  lostItemName?: string;
  foundItemId?: string;
  foundItemName?: string;
  finderId?: string;
  finderName?: string;
  finderEmail?: string;
  finderPhone?: string;
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  returnedDate: string;
  status: 'returned';
  notes?: string;
  location?: string;
  createdAt: string;
}

export function saveDatabase() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('[SQLite] Error persisting database file:', err);
  }
}

export async function initSQLite(): Promise<Database> {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      db = new SQL.Database(fileBuffer);
      console.log(`[SQLite DB] Successfully connected to existing SQLite database: ${DB_FILE}`);
    } catch (e) {
      console.warn('[SQLite DB] Existing database file corrupted, initializing fresh DB.', e);
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
    console.log(`[SQLite DB] Created new SQLite database file at: ${DB_FILE}`);
  }

  // Define database schema
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      student_id TEXT,
      phone TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      item_type TEXT,
      description TEXT,
      location TEXT,
      date TEXT,
      time TEXT,
      image_url TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      reporter_id TEXT,
      reporter_name TEXT,
      reporter_email TEXT,
      reporter_phone TEXT,
      matched_item_id TEXT,
      return_record_id TEXT,
      user_confirmed_received INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS return_records (
      id TEXT PRIMARY KEY,
      photo_url TEXT NOT NULL,
      item_name TEXT NOT NULL,
      item_description TEXT,
      item_category TEXT,
      item_type TEXT,
      lost_item_id TEXT,
      lost_item_name TEXT,
      found_item_id TEXT,
      found_item_name TEXT,
      finder_id TEXT,
      finder_name TEXT,
      finder_email TEXT,
      finder_phone TEXT,
      owner_id TEXT,
      owner_name TEXT,
      owner_email TEXT,
      owner_phone TEXT,
      returned_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'returned',
      notes TEXT,
      location TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS otp_tokens (
      email TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    );
  `);

  // Column migration for items if return_record_id doesn't exist
  try {
    db.run("ALTER TABLE items ADD COLUMN return_record_id TEXT");
  } catch (_) {
    // Column already exists, safe to ignore
  }

  saveDatabase();
  return db;
}

export function getDb(): Database {
  if (!db) {
    throw new Error('SQLite database is not initialized yet.');
  }
  return db;
}

export function sqliteDeleteUserByEmail(email: string): void {
  const database = getDb();
  database.run("DELETE FROM users WHERE LOWER(email) = LOWER(:email)", { ':email': email.trim() });
  saveDatabase();
}

// User CRUD Helpers
export function sqliteGetUserByEmail(email: string): SqliteUser | null {
  const database = getDb();
  const stmt = database.prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(:email)");
  stmt.bind({ ':email': email.trim() });
  
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return {
      id: String(row.id),
      name: String(row.name),
      email: String(row.email),
      passwordHash: String(row.password_hash),
      role: row.role === 'admin' ? 'admin' : 'user',
      studentId: row.student_id ? String(row.student_id) : undefined,
      phone: row.phone ? String(row.phone) : undefined,
      status: row.status === 'suspended' ? 'suspended' : 'active',
      createdAt: String(row.created_at)
    };
  }
  stmt.free();
  return null;
}

export function sqliteGetAllUsers(): SqliteUser[] {
  const database = getDb();
  const res = database.exec("SELECT * FROM users ORDER BY created_at DESC");
  if (!res.length) return [];
  const columns = res[0].columns;
  const values = res[0].values;
  
  return values.map((row) => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return {
      id: String(obj.id),
      name: String(obj.name),
      email: String(obj.email),
      passwordHash: String(obj.password_hash),
      role: obj.role === 'admin' ? 'admin' : 'user',
      studentId: obj.student_id ? String(obj.student_id) : undefined,
      phone: obj.phone ? String(obj.phone) : undefined,
      status: obj.status === 'suspended' ? 'suspended' : 'active',
      createdAt: String(obj.created_at)
    };
  });
}

export function sqliteSaveUser(user: SqliteUser): void {
  const database = getDb();
  const existing = sqliteGetUserByEmail(user.email);
  if (existing) {
    database.run(
      `UPDATE users SET name = :name, password_hash = :password_hash, role = :role, student_id = :student_id, phone = :phone, status = :status WHERE LOWER(email) = LOWER(:email)`,
      {
        ':name': user.name,
        ':password_hash': user.passwordHash,
        ':role': user.role,
        ':student_id': user.studentId || '',
        ':phone': user.phone || '',
        ':status': user.status,
        ':email': user.email.trim()
      }
    );
  } else {
    database.run(
      `INSERT INTO users (id, name, email, password_hash, role, student_id, phone, status, created_at)
       VALUES (:id, :name, :email, :password_hash, :role, :student_id, :phone, :status, :created_at)`,
      {
        ':id': user.id,
        ':name': user.name,
        ':email': user.email.trim(),
        ':password_hash': user.passwordHash,
        ':role': user.role,
        ':student_id': user.studentId || '',
        ':phone': user.phone || '',
        ':status': user.status,
        ':created_at': user.createdAt
      }
    );
  }
  saveDatabase();
}

// Items CRUD Helpers
export function sqliteGetAllItems(): SqliteItem[] {
  const database = getDb();
  const res = database.exec("SELECT * FROM items ORDER BY created_at DESC");
  if (!res.length) return [];
  const columns = res[0].columns;
  const values = res[0].values;

  return values.map((row) => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return {
      id: String(obj.id),
      name: String(obj.name),
      category: String(obj.category),
      type: obj.type === 'found' ? 'found' : 'lost',
      itemType: obj.item_type ? String(obj.item_type) : undefined,
      description: String(obj.description || ''),
      location: String(obj.location || ''),
      date: String(obj.date || ''),
      time: obj.time ? String(obj.time) : undefined,
      imageUrl: obj.image_url ? String(obj.image_url) : undefined,
      status: obj.status === 'returned' ? 'returned' : 'pending',
      reporterId: obj.reporter_id ? String(obj.reporter_id) : undefined,
      reporterName: obj.reporter_name ? String(obj.reporter_name) : undefined,
      reporterEmail: obj.reporter_email ? String(obj.reporter_email) : undefined,
      reporterPhone: obj.reporter_phone ? String(obj.reporter_phone) : undefined,
      matchedItemId: obj.matched_item_id ? String(obj.matched_item_id) : undefined,
      returnRecordId: obj.return_record_id ? String(obj.return_record_id) : undefined,
      userConfirmedReceived: Boolean(obj.user_confirmed_received),
      createdAt: String(obj.created_at)
    };
  });
}

export function sqliteSaveItem(item: SqliteItem): void {
  const database = getDb();
  const stmt = database.prepare("SELECT id FROM items WHERE id = :id");
  stmt.bind({ ':id': item.id });
  const exists = stmt.step();
  stmt.free();

  if (exists) {
    database.run(
      `UPDATE items SET
        name = :name,
        category = :category,
        type = :type,
        item_type = :item_type,
        description = :description,
        location = :location,
        date = :date,
        time = :time,
        image_url = :image_url,
        status = :status,
        reporter_id = :reporter_id,
        reporter_name = :reporter_name,
        reporter_email = :reporter_email,
        reporter_phone = :reporter_phone,
        matched_item_id = :matched_item_id,
        return_record_id = :return_record_id,
        user_confirmed_received = :user_confirmed_received
      WHERE id = :id`,
      {
        ':id': item.id,
        ':name': item.name,
        ':category': item.category,
        ':type': item.type,
        ':item_type': item.itemType || '',
        ':description': item.description,
        ':location': item.location,
        ':date': item.date,
        ':time': item.time || '',
        ':image_url': item.imageUrl || '',
        ':status': item.status,
        ':reporter_id': item.reporterId || '',
        ':reporter_name': item.reporterName || '',
        ':reporter_email': item.reporterEmail || '',
        ':reporter_phone': item.reporterPhone || '',
        ':matched_item_id': item.matchedItemId || '',
        ':return_record_id': item.returnRecordId || '',
        ':user_confirmed_received': item.userConfirmedReceived ? 1 : 0
      }
    );
  } else {
    database.run(
      `INSERT INTO items (
        id, name, category, type, item_type, description, location, date, time, image_url, status, reporter_id, reporter_name, reporter_email, reporter_phone, matched_item_id, return_record_id, user_confirmed_received, created_at
      ) VALUES (
        :id, :name, :category, :type, :item_type, :description, :location, :date, :time, :image_url, :status, :reporter_id, :reporter_name, :reporter_email, :reporter_phone, :matched_item_id, :return_record_id, :user_confirmed_received, :created_at
      )`,
      {
        ':id': item.id,
        ':name': item.name,
        ':category': item.category,
        ':type': item.type,
        ':item_type': item.itemType || '',
        ':description': item.description,
        ':location': item.location,
        ':date': item.date,
        ':time': item.time || '',
        ':image_url': item.imageUrl || '',
        ':status': item.status,
        ':reporter_id': item.reporterId || '',
        ':reporter_name': item.reporterName || '',
        ':reporter_email': item.reporterEmail || '',
        ':reporter_phone': item.reporterPhone || '',
        ':matched_item_id': item.matchedItemId || '',
        ':return_record_id': item.returnRecordId || '',
        ':user_confirmed_received': item.userConfirmedReceived ? 1 : 0,
        ':created_at': item.createdAt
      }
    );
  }
  saveDatabase();
}

export function sqliteDeleteItem(id: string): void {
  const database = getDb();
  database.run("DELETE FROM items WHERE id = :id", { ':id': id });
  saveDatabase();
}

// Return Records CRUD Helpers
export function sqliteGetAllReturnRecords(): SqliteReturnRecord[] {
  const database = getDb();
  const res = database.exec("SELECT * FROM return_records ORDER BY created_at DESC");
  if (!res.length) return [];
  const columns = res[0].columns;
  const values = res[0].values;

  return values.map((row) => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return {
      id: String(obj.id),
      photoUrl: String(obj.photo_url),
      itemName: String(obj.item_name),
      itemDescription: obj.item_description ? String(obj.item_description) : '',
      itemCategory: obj.item_category ? String(obj.item_category) : 'Other',
      itemType: obj.item_type ? String(obj.item_type) : undefined,
      lostItemId: obj.lost_item_id ? String(obj.lost_item_id) : undefined,
      lostItemName: obj.lost_item_name ? String(obj.lost_item_name) : undefined,
      foundItemId: obj.found_item_id ? String(obj.found_item_id) : undefined,
      foundItemName: obj.found_item_name ? String(obj.found_item_name) : undefined,
      finderId: obj.finder_id ? String(obj.finder_id) : undefined,
      finderName: obj.finder_name ? String(obj.finder_name) : undefined,
      finderEmail: obj.finder_email ? String(obj.finder_email) : undefined,
      finderPhone: obj.finder_phone ? String(obj.finder_phone) : undefined,
      ownerId: obj.owner_id ? String(obj.owner_id) : undefined,
      ownerName: obj.owner_name ? String(obj.owner_name) : undefined,
      ownerEmail: obj.owner_email ? String(obj.owner_email) : undefined,
      ownerPhone: obj.owner_phone ? String(obj.owner_phone) : undefined,
      returnedDate: String(obj.returned_date),
      status: 'returned',
      notes: obj.notes ? String(obj.notes) : undefined,
      location: obj.location ? String(obj.location) : undefined,
      createdAt: String(obj.created_at)
    };
  });
}

export function sqliteSaveReturnRecord(record: SqliteReturnRecord): void {
  const database = getDb();
  const stmt = database.prepare("SELECT id FROM return_records WHERE id = :id");
  stmt.bind({ ':id': record.id });
  const exists = stmt.step();
  stmt.free();

  if (exists) {
    database.run(
      `UPDATE return_records SET
        photo_url = :photo_url,
        item_name = :item_name,
        item_description = :item_description,
        item_category = :item_category,
        item_type = :item_type,
        lost_item_id = :lost_item_id,
        lost_item_name = :lost_item_name,
        found_item_id = :found_item_id,
        found_item_name = :found_item_name,
        finder_id = :finder_id,
        finder_name = :finder_name,
        finder_email = :finder_email,
        finder_phone = :finder_phone,
        owner_id = :owner_id,
        owner_name = :owner_name,
        owner_email = :owner_email,
        owner_phone = :owner_phone,
        returned_date = :returned_date,
        status = :status,
        notes = :notes,
        location = :location
      WHERE id = :id`,
      {
        ':id': record.id,
        ':photo_url': record.photoUrl,
        ':item_name': record.itemName,
        ':item_description': record.itemDescription || '',
        ':item_category': record.itemCategory || 'Other',
        ':item_type': record.itemType || '',
        ':lost_item_id': record.lostItemId || '',
        ':lost_item_name': record.lostItemName || '',
        ':found_item_id': record.foundItemId || '',
        ':found_item_name': record.foundItemName || '',
        ':finder_id': record.finderId || '',
        ':finder_name': record.finderName || '',
        ':finder_email': record.finderEmail || '',
        ':finder_phone': record.finderPhone || '',
        ':owner_id': record.ownerId || '',
        ':owner_name': record.ownerName || '',
        ':owner_email': record.ownerEmail || '',
        ':owner_phone': record.ownerPhone || '',
        ':returned_date': record.returnedDate,
        ':status': record.status || 'returned',
        ':notes': record.notes || '',
        ':location': record.location || ''
      }
    );
  } else {
    database.run(
      `INSERT INTO return_records (
        id, photo_url, item_name, item_description, item_category, item_type,
        lost_item_id, lost_item_name, found_item_id, found_item_name,
        finder_id, finder_name, finder_email, finder_phone,
        owner_id, owner_name, owner_email, owner_phone,
        returned_date, status, notes, location, created_at
      ) VALUES (
        :id, :photo_url, :item_name, :item_description, :item_category, :item_type,
        :lost_item_id, :lost_item_name, :found_item_id, :found_item_name,
        :finder_id, :finder_name, :finder_email, :finder_phone,
        :owner_id, :owner_name, :owner_email, :owner_phone,
        :returned_date, :status, :notes, :location, :created_at
      )`,
      {
        ':id': record.id,
        ':photo_url': record.photoUrl,
        ':item_name': record.itemName,
        ':item_description': record.itemDescription || '',
        ':item_category': record.itemCategory || 'Other',
        ':item_type': record.itemType || '',
        ':lost_item_id': record.lostItemId || '',
        ':lost_item_name': record.lostItemName || '',
        ':found_item_id': record.foundItemId || '',
        ':found_item_name': record.foundItemName || '',
        ':finder_id': record.finderId || '',
        ':finder_name': record.finderName || '',
        ':finder_email': record.finderEmail || '',
        ':finder_phone': record.finderPhone || '',
        ':owner_id': record.ownerId || '',
        ':owner_name': record.ownerName || '',
        ':owner_email': record.ownerEmail || '',
        ':owner_phone': record.ownerPhone || '',
        ':returned_date': record.returnedDate,
        ':status': record.status || 'returned',
        ':notes': record.notes || '',
        ':location': record.location || '',
        ':created_at': record.createdAt
      }
    );
  }
  saveDatabase();
}

export function sqliteDeleteReturnRecord(id: string): void {
  const database = getDb();
  database.run("DELETE FROM return_records WHERE id = :id", { ':id': id });
  saveDatabase();
}

export function sqliteGetStats() {
  const database = getDb();
  let userCount = 0;
  let itemCount = 0;
  let returnRecordCount = 0;

  try {
    const resU = database.exec("SELECT COUNT(*) as count FROM users");
    if (resU.length && resU[0].values.length) {
      userCount = Number(resU[0].values[0][0]);
    }
    const resI = database.exec("SELECT COUNT(*) as count FROM items");
    if (resI.length && resI[0].values.length) {
      itemCount = Number(resI[0].values[0][0]);
    }
    const resR = database.exec("SELECT COUNT(*) as count FROM return_records");
    if (resR.length && resR[0].values.length) {
      returnRecordCount = Number(resR[0].values[0][0]);
    }
  } catch (err) {
    console.error('[SQLite Stats] Error getting stats:', err);
  }

  let dbSize = 0;
  if (fs.existsSync(DB_FILE)) {
    dbSize = fs.statSync(DB_FILE).size;
  }

  return {
    engine: 'SQLite 3 (WASM / Persistent File)',
    dbFile: DB_FILE,
    fileSizeBytes: dbSize,
    fileSizeKB: (dbSize / 1024).toFixed(2) + ' KB',
    userCount,
    itemCount,
    returnRecordCount,
    status: 'connected'
  };
}
