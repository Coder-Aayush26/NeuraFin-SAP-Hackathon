import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDb() {
  const db = await open({
    filename: path.join(__dirname, 'neurafin.db'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Invoices (
      id TEXT PRIMARY KEY,
      vendor TEXT,
      amount TEXT,
      tier INTEGER,
      score INTEGER,
      reasoning TEXT,
      status TEXT
    );
    
    CREATE TABLE IF NOT EXISTS AuditLogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT,
      time TEXT,
      score INTEGER,
      module TEXT
    );
    
    CREATE TABLE IF NOT EXISTS Vendors (
      name TEXT PRIMARY KEY,
      category TEXT,
      delivery INTEGER,
      quality INTEGER,
      risk TEXT,
      status TEXT
    );
  `);

  // Seed Data
  const invoiceCount = await db.get('SELECT COUNT(*) as count FROM Invoices');
  if (invoiceCount.count === 0) {
    const invoices = [
      { id: 'INV-4471', vendor: 'Acme Steel Co.', amount: '₹4,82,000', tier: 2, score: 84, reasoning: 'Quantity matches PO. Unit price is 4% above contract rate — within tolerance. Recommend: Approve.', status: 'pending' },
      { id: 'INV-9902', vendor: 'Global Tech Supplies', amount: '₹1,20,000', tier: 1, score: 98, reasoning: 'Exact 3-way match confirmed. No variances detected. Auto-posting approved.', status: 'approved' },
      { id: 'INV-1004', vendor: 'Rapid Logistics', amount: '₹95,000', tier: 3, score: 45, reasoning: 'Goods Receipt not found. Invoice amount exceeds PO limit by 15%. Requires manual review.', status: 'pending' }
    ];
    for (const inv of invoices) {
      await db.run('INSERT INTO Invoices (id, vendor, amount, tier, score, reasoning, status) VALUES (?, ?, ?, ?, ?, ?, ?)', 
        [inv.id, inv.vendor, inv.amount, inv.tier, inv.score, inv.reasoning, inv.status]);
    }
  }

  const auditCount = await db.get('SELECT COUNT(*) as count FROM AuditLogs');
  if (auditCount.count === 0) {
    const logs = [
      { action: 'Auto-posted INV-3392', time: '09:12 AM', score: 96, module: 'AP' },
      { action: 'Converted REQ-991 to PO', time: '09:05 AM', score: 92, module: 'Procurement' },
      { action: 'Routed INV-2210 to Manual', time: '08:45 AM', score: 52, module: 'AP' },
      { action: 'Flagged Supplier Risk: TechCorp', time: '08:30 AM', score: 88, module: 'Risk' },
      { action: 'Auto-matched payment $45k', time: '08:15 AM', score: 99, module: 'Cash App' }
    ];
    for (const log of logs) {
      await db.run('INSERT INTO AuditLogs (action, time, score, module) VALUES (?, ?, ?, ?)',
        [log.action, log.time, log.score, log.module]);
    }
  }

  const vendorCount = await db.get('SELECT COUNT(*) as count FROM Vendors');
  if (vendorCount.count === 0) {
    const vendors = [
      { name: 'Acme Steel Co.', category: 'Raw Materials', delivery: 98, quality: 99, risk: 'Low', status: 'Approved' },
      { name: 'Global Tech Supplies', category: 'IT Hardware', delivery: 85, quality: 90, risk: 'Medium', status: 'Monitor' },
      { name: 'Rapid Logistics', category: 'Transport', delivery: 65, quality: 70, risk: 'High', status: 'Flagged' }
    ];
    for (const v of vendors) {
      await db.run('INSERT INTO Vendors (name, category, delivery, quality, risk, status) VALUES (?, ?, ?, ?, ?, ?)',
        [v.name, v.category, v.delivery, v.quality, v.risk, v.status]);
    }
  }

  return db;
}
