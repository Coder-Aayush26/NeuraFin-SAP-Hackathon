import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './database.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini LLM (optional key with smart fallback)
const apiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY'
  ? process.env.GEMINI_API_KEY
  : null;
const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

let genAI = null;
let model = null;
if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: modelName });
  } catch (err) {
    console.warn("Could not initialize Gemini model:", err.message);
  }
}

let db;

// API Routes
app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await db.all('SELECT * FROM Invoices');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const { id, vendor, amount, tier, score, reasoning, status = 'pending' } = req.body;
    if (!id || !vendor || !amount || !Number.isInteger(Number(tier)) || !Number.isFinite(Number(score)) || !reasoning) {
      return res.status(400).json({ error: 'Invoice id, vendor, amount, tier, score, and reasoning are required' });
    }

    await db.run(
      `INSERT INTO Invoices (id, vendor, amount, tier, score, reasoning, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET vendor = excluded.vendor, amount = excluded.amount,
       tier = excluded.tier, score = excluded.score, reasoning = excluded.reasoning,
       status = excluded.status`,
      [id, vendor, amount, Number(tier), Number(score), reasoning, status]
    );
    res.status(201).json(await db.get('SELECT * FROM Invoices WHERE id = ?', [id]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/invoices/match', async (req, res) => {
  try {
    const {
      invoiceNumber,
      vendor,
      total,
      quantity,
      unitPrice,
      purchaseOrder,
      goodsReceipt
    } = req.body;
    const invoiceTotal = Number(total);
    const invoiceQuantity = Number(quantity);
    const invoiceUnitPrice = Number(unitPrice);

    if (!invoiceNumber || !vendor || !purchaseOrder || !goodsReceipt || !Number.isFinite(invoiceTotal) || !Number.isFinite(invoiceQuantity) || !Number.isFinite(invoiceUnitPrice)) {
      return res.status(400).json({ error: 'Invoice number, vendor, total, quantity, unit price, PO, and GRN are required' });
    }

    const po = await db.get('SELECT * FROM PurchaseOrders WHERE po_number = ?', [purchaseOrder]);
    const grn = await db.get('SELECT * FROM GoodsReceipts WHERE grn_number = ?', [goodsReceipt]);
    const vendorMatches = po && po.vendor.toLowerCase() === vendor.toLowerCase();
    const poQuantityMatches = po && invoiceQuantity === po.ordered_quantity;
    const receiptMatches = grn && grn.po_number === purchaseOrder && grn.status === 'received' && invoiceQuantity === grn.received_quantity;
    const priceVariance = po ? Math.abs(invoiceUnitPrice - po.unit_price) / po.unit_price * 100 : 100;
    const priceMatches = priceVariance <= 1;
    const exactThreeWayMatch = Boolean(po && grn && vendorMatches && poQuantityMatches && receiptMatches && priceMatches);
    const assistedMatch = Boolean(po && grn && vendorMatches && poQuantityMatches && receiptMatches && priceVariance <= 5);
    const tier = exactThreeWayMatch ? 1 : assistedMatch ? 2 : 3;
    const score = exactThreeWayMatch ? 98 : assistedMatch ? Math.max(70, Math.round(100 - priceVariance * 4)) : 45;
    const reasoning = exactThreeWayMatch
      ? `Exact three-way match: invoice quantity ${invoiceQuantity}, PO quantity ${po.ordered_quantity}, and GRN quantity ${grn.received_quantity} agree. Unit price is within tolerance.`
      : assistedMatch
        ? `Quantity matches the PO (${po.ordered_quantity}) and GRN (${grn.received_quantity}). Unit price is ${priceVariance.toFixed(1)}% above the PO contract rate — within assisted-review tolerance.`
        : `Three-way match failed. ${!po ? `PO ${purchaseOrder} was not found. ` : ''}${!grn ? `GRN ${goodsReceipt} was not found. ` : ''}${po && !poQuantityMatches ? 'Invoice quantity does not match the PO. ' : ''}${grn && !receiptMatches ? 'Received quantity or PO linkage does not match. ' : ''}${po && !vendorMatches ? 'Vendor does not match the PO. ' : ''}${po && priceVariance > 5 ? `Unit price variance is ${priceVariance.toFixed(1)}%.` : ''}`.trim();

    res.json({ invoiceNumber, tier, score, reasoning, match: { purchaseOrder: po || null, goodsReceipt: grn || null, priceVariance: Number(priceVariance.toFixed(2)), vendorMatches, poQuantityMatches, receiptMatches } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/invoices/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await db.get('SELECT * FROM Invoices WHERE id = ?', [id]);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    await db.run('UPDATE Invoices SET status = ? WHERE id = ?', ['approved', id]);

    // Record immutable audit entry
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    await db.run(
      'INSERT INTO AuditLogs (action, time, score, module) VALUES (?, ?, ?, ?)',
      [`Manual Approval & Auto-Post: ${id}`, time, 94, 'AP Automation']
    );

    res.json({ ...invoice, status: 'approved', success: true, message: `Invoice ${id} approved and posted successfully.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/invoices/:id/recall', async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await db.get('SELECT * FROM Invoices WHERE id = ?', [id]);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    if (invoice.tier !== 1 || invoice.status !== 'approved') {
      return res.status(409).json({ error: 'Only approved Tier 1 invoices can be recalled' });
    }

    const reasoning = 'Tier 1 auto-post recalled under Standing Override and routed to Human Review.';
    await db.run('UPDATE Invoices SET status = ?, reasoning = ? WHERE id = ?', ['recalled', reasoning, id]);
    await db.run(
      'INSERT INTO AuditLogs (action, time, score, module) VALUES (?, ?, ?, ?)',
      [`Recalled Tier 1 transaction: ${id}`, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), invoice.score, 'AI Governance']
    );

    res.json({ ...invoice, status: 'recalled', reasoning });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/invoices/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await db.get('SELECT * FROM Invoices WHERE id = ?', [id]);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    await db.run('UPDATE Invoices SET status = ?, reasoning = ? WHERE id = ?', ['review', 'Routed to Senior Review for human investigation.', id]);
    await db.run('INSERT INTO AuditLogs (action, time, score, module) VALUES (?, ?, ?, ?)', [`Routed ${id} to Senior Review`, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), invoice.score, 'AP Automation']);
    res.json({ ...invoice, status: 'review', reasoning: 'Routed to Senior Review for human investigation.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/dashboard', async (req, res) => {
  try {
    const [invoices, audit, vendors, cash, reconciliations] = await Promise.all([
      db.all('SELECT tier, status FROM Invoices'),
      db.all('SELECT * FROM AuditLogs ORDER BY id DESC LIMIT 5'),
      db.all('SELECT * FROM Vendors'),
      db.all('SELECT status FROM CashApplications'),
      db.all('SELECT status FROM Reconciliations')
    ]);
    const tierCounts = [1, 2, 3].map(tier => invoices.filter(invoice => invoice.tier === tier).length);
    const automatedCount = invoices.filter(invoice => invoice.tier === 1 || invoice.tier === 2).length;
    res.json({
      invoiceCount: invoices.length,
      automatedPercent: invoices.length ? Math.round(automatedCount / invoices.length * 100) : 0,
      tierCounts,
      pendingInvoices: invoices.filter(invoice => invoice.status === 'pending').length,
      matchedCash: cash.filter(item => item.status === 'matched').length,
      openReconciliations: reconciliations.filter(item => item.status !== 'reconciled').length,
      vendorCount: vendors.length,
      audit
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/audit', async (req, res) => {
  try {
    const logs = await db.all('SELECT * FROM AuditLogs ORDER BY id DESC LIMIT 15');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/vendors', async (req, res) => {
  try {
    const vendors = await db.all('SELECT * FROM Vendors');
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/cash', async (req, res) => {
  try {
    res.json(await db.all('SELECT * FROM CashApplications ORDER BY id'));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cash/:id/match', async (req, res) => {
  try {
    const { id } = req.params;
    const application = await db.get('SELECT * FROM CashApplications WHERE id = ?', [id]);
    if (!application) return res.status(404).json({ error: 'Cash application not found' });
    await db.run('UPDATE CashApplications SET status = ?, confidence = ? WHERE id = ?', ['matched', Math.max(application.confidence, 92), id]);
    await db.run('INSERT INTO AuditLogs (action, time, score, module) VALUES (?, ?, ?, ?)', [`Matched receipt ${id}: ${application.customer}`, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 92, 'Cash Application']);
    res.json({ ...application, status: 'matched', confidence: Math.max(application.confidence, 92) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reconciliation', async (req, res) => {
  try {
    res.json(await db.all('SELECT * FROM Reconciliations ORDER BY id'));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reconciliation/:id/reconcile', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.get('SELECT * FROM Reconciliations WHERE id = ?', [id]);
    if (!item) return res.status(404).json({ error: 'Reconciliation item not found' });
    await db.run('UPDATE Reconciliations SET status = ?, variance = ? WHERE id = ?', ['reconciled', 0, id]);
    await db.run('INSERT INTO AuditLogs (action, time, score, module) VALUES (?, ?, ?, ?)', [`Reconciled ${id}: ${item.account}`, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 96, 'Reconciliation']);
    res.json({ ...item, status: 'reconciled', variance: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/requisitions', async (req, res) => {
  try {
    res.json(await db.all('SELECT * FROM Requisitions ORDER BY id'));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/requisitions', async (req, res) => {
  try {
    const { requester, description, category, amount, vendor } = req.body;
    if (!requester || !description || !category || !Number.isFinite(Number(amount))) {
      return res.status(400).json({ error: 'Requester, description, category, and amount are required' });
    }
    const id = `REQ-${Date.now().toString().slice(-6)}`;
    const selectedVendor = vendor || (await db.get('SELECT name FROM Vendors WHERE status = ? ORDER BY delivery DESC LIMIT 1', ['Approved']))?.name || 'Pending sourcing';
    const requisition = { id, requester, description, category, amount: Number(amount), vendor: selectedVendor, status: 'review' };
    await db.run('INSERT INTO Requisitions (id, requester, description, category, amount, vendor, status) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, requester, description, category, Number(amount), selectedVendor, 'review']);
    res.status(201).json(requisition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/requisitions/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const requisition = await db.get('SELECT * FROM Requisitions WHERE id = ?', [id]);
    if (!requisition) return res.status(404).json({ error: 'Requisition not found' });
    await db.run('UPDATE Requisitions SET status = ? WHERE id = ?', ['approved', id]);
    await db.run('INSERT INTO AuditLogs (action, time, score, module) VALUES (?, ?, ?, ?)', [`Approved ${id}: converted to PO`, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 92, 'Procurement']);
    res.json({ ...requisition, status: 'approved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sourcing', async (req, res) => {
  try {
    const requests = await db.all('SELECT * FROM SourcingRequests ORDER BY id');
    const vendors = await db.all('SELECT *, ROUND((delivery + quality) / 2.0) as score FROM Vendors ORDER BY score DESC');
    res.json({ requests, vendors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sourcing/run', async (req, res) => {
  try {
    const { item, category, budget } = req.body;
    if (!item || !category || !Number.isFinite(Number(budget))) {
      return res.status(400).json({ error: 'Item, category, and budget are required' });
    }
    const vendor = await db.get('SELECT *, ROUND((delivery + quality) / 2.0) as score FROM Vendors ORDER BY CASE WHEN category = ? THEN 0 ELSE 1 END, score DESC LIMIT 1', [category]);
    const id = `SRC-${Date.now().toString().slice(-6)}`;
    const request = { id, item, category, budget: Number(budget), recommended_vendor: vendor?.name || 'No eligible vendor', status: vendor ? 'recommended' : 'exception' };
    await db.run('INSERT INTO SourcingRequests (id, item, category, budget, recommended_vendor, status) VALUES (?, ?, ?, ?, ?, ?)', [id, item, category, Number(budget), request.recommended_vendor, request.status]);
    res.status(201).json({ request, vendor: vendor || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Joule Chatbot endpoint with intelligent fallback responses
app.post('/api/chat', async (req, res) => { console.log('🗨️ Chat request received:', req.body);
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // If Gemini key is configured, attempt live LLM with fallback
    if (model) {
      try {
        const systemPrompt = `You are Joule, the Autonomous Enterprise Copilot for NeuraFin (Finance & Procurement).
You assist with 3-way invoice matching, variance tolerance checks, cash application, maverick spend mitigation, and supplier risk.
Respond concisely, authoritatively, and professionally.
User Query: ${message}`;
        const result = await model.generateContent(systemPrompt);
        return res.json({ response: result.response.text() });
      } catch (geminiErr) {
        console.warn(`Gemini call failed for ${modelName}, using simulated response:`, geminiErr.message);
        // continue to simulated response
      }
    }

    // Built-in intelligent simulation responses if no Gemini API key is provided or Gemini call fails
    const lower = message.toLowerCase();
    let simulatedResponse = "";

    if (lower.includes('invoice') || lower.includes('match') || lower.includes('inv')) {
      simulatedResponse = "I've analyzed the current queue: 145 invoices matched automatically (Tier 1). INV-4471 has a 4% unit price variance against Contract PO-8821 and is awaiting Tier 2 one-click approval.";
    } else if (lower.includes('risk') || lower.includes('supplier') || lower.includes('vendor')) {
      simulatedResponse = "Supplier Risk Scan: Acme Steel Co. is in high standing (98% delivery, 99% quality). Rapid Logistics has been flagged due to a 15% shipment delay trend over the past 30 days.";
    } else if (lower.includes('spend') || lower.includes('maverick') || lower.includes('budget')) {
      simulatedResponse = "Maverick spend is currently contained at 7.8% (down from 18% benchmark). 92% of new requisitions were automatically mapped to pre-negotiated preferred catalog items.";
    } else if (lower.includes('reconcil') || lower.includes('close') || lower.includes('cash')) {
      simulatedResponse = "Continuous reconciliation cycle is tracking at 1.2 days to close. 98.4% of incoming bank receipts were matched against open accounts receivable automatically today.";
    } else {
      simulatedResponse = `I'm Joule, your NeuraFin Autonomous Finance & Procurement Copilot. I'm actively monitoring your 3-way matching, maverick spend guardrails, and supplier risks. (Tip: You can add a GEMINI_API_KEY in .env for custom freeform AI answers!)`;
    }

    return res.json({ response: simulatedResponse });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));

  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }

    next();
  });
}

const PORT = process.env.PORT || 3001;

initDb().then(database => {
  db = database;
  app.listen(PORT, () => {
    console.log(`NeuraFin backend running on http://localhost:${PORT}`);
  });
}).catch(console.error);
