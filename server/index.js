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

app.post('/api/invoices/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    await db.run('UPDATE Invoices SET status = ? WHERE id = ?', ['approved', id]);

    // Record immutable audit entry
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    await db.run(
      'INSERT INTO AuditLogs (action, time, score, module) VALUES (?, ?, ?, ?)',
      [`Manual Approval & Auto-Post: ${id}`, time, 94, 'AP Automation']
    );

    res.json({ success: true, message: `Invoice ${id} approved and posted successfully.` });
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
