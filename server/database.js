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

    CREATE TABLE IF NOT EXISTS PurchaseOrders (
      po_number TEXT PRIMARY KEY,
      vendor TEXT,
      item_description TEXT,
      ordered_quantity REAL,
      unit_price REAL,
      currency TEXT
    );

    CREATE TABLE IF NOT EXISTS GoodsReceipts (
      grn_number TEXT PRIMARY KEY,
      po_number TEXT,
      received_quantity REAL,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS CashApplications (
      id TEXT PRIMARY KEY,
      customer TEXT,
      amount TEXT,
      reference TEXT,
      confidence INTEGER,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS Reconciliations (
      id TEXT PRIMARY KEY,
      account TEXT,
      subledger_amount REAL,
      gl_amount REAL,
      variance REAL,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS Requisitions (
      id TEXT PRIMARY KEY,
      requester TEXT,
      description TEXT,
      category TEXT,
      amount REAL,
      vendor TEXT,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS SourcingRequests (
      id TEXT PRIMARY KEY,
      item TEXT,
      category TEXT,
      budget REAL,
      recommended_vendor TEXT,
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

  const purchaseOrderCount = await db.get('SELECT COUNT(*) as count FROM PurchaseOrders');
  if (purchaseOrderCount.count === 0) {
    await db.run(
      'INSERT INTO PurchaseOrders (po_number, vendor, item_description, ordered_quantity, unit_price, currency) VALUES (?, ?, ?, ?, ?, ?)',
      ['PO-8821', 'Acme Steel Co.', 'Cold Rolled Steel Sheet', 100, 4634.62, 'INR']
    );
  }

  const goodsReceiptCount = await db.get('SELECT COUNT(*) as count FROM GoodsReceipts');
  if (goodsReceiptCount.count === 0) {
    await db.run(
      'INSERT INTO GoodsReceipts (grn_number, po_number, received_quantity, status) VALUES (?, ?, ?, ?)',
      ['GRN-8821', 'PO-8821', 100, 'received']
    );
  }

  const cashApplicationCount = await db.get('SELECT COUNT(*) as count FROM CashApplications');
  if (cashApplicationCount.count === 0) {
    const cashApplications = [
      ['CA-1001', 'Acme Retail', '₹2,50,000', 'REM-7744', 97, 'matched'],
      ['CA-1002', 'Global Tech Supplies', '₹1,20,000', 'REM-7751', 72, 'pending'],
      ['CA-1003', 'Rapid Logistics', '₹95,000', 'UNIDENTIFIED', 44, 'exception']
    ];
    for (const application of cashApplications) {
      await db.run('INSERT INTO CashApplications (id, customer, amount, reference, confidence, status) VALUES (?, ?, ?, ?, ?, ?)', application);
    }
  }

  const reconciliationCount = await db.get('SELECT COUNT(*) as count FROM Reconciliations');
  if (reconciliationCount.count === 0) {
    const reconciliations = [
      ['REC-1001', 'Accounts Payable', 568760, 568760, 0, 'reconciled'],
      ['REC-1002', 'Inventory Clearing', 125000, 127450, 2450, 'pending'],
      ['REC-1003', 'Bank Clearing', 420000, 419200, -800, 'pending']
    ];
    for (const reconciliation of reconciliations) {
      await db.run('INSERT INTO Reconciliations (id, account, subledger_amount, gl_amount, variance, status) VALUES (?, ?, ?, ?, ?, ?)', reconciliation);
    }
  }

  const requisitionCount = await db.get('SELECT COUNT(*) as count FROM Requisitions');
  if (requisitionCount.count === 0) {
    const requisitions = [
      ['REQ-991', 'Aayush P.', 'Cold Rolled Steel Sheet', 'Raw Materials', 482000, 'Acme Steel Co.', 'draft'],
      ['REQ-992', 'Finance Operations', 'Laptop docking stations', 'IT Hardware', 120000, 'Global Tech Supplies', 'approved'],
      ['REQ-993', 'Warehouse Team', 'Regional freight service', 'Transport', 95000, 'Rapid Logistics', 'review']
    ];
    for (const requisition of requisitions) {
      await db.run('INSERT INTO Requisitions (id, requester, description, category, amount, vendor, status) VALUES (?, ?, ?, ?, ?, ?, ?)', requisition);
    }
  }

  const sourcingRequestCount = await db.get('SELECT COUNT(*) as count FROM SourcingRequests');
  if (sourcingRequestCount.count === 0) {
    await db.run(
      'INSERT INTO SourcingRequests (id, item, category, budget, recommended_vendor, status) VALUES (?, ?, ?, ?, ?, ?)',
      ['SRC-1001', 'Cold Rolled Steel Sheet', 'Raw Materials', 500000, 'Acme Steel Co.', 'recommended']
    );
  }

  return db;
}
