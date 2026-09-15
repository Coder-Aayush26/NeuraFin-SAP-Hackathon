# NeuraFin
## Simple User Guide

### What is NeuraFin?

NeuraFin is a finance and procurement control center. It helps a company review invoices, monitor suppliers, track spending, and understand which business decisions are handled automatically by AI.

Think of it as a dashboard for the finance team. Instead of checking many spreadsheets and systems, the team can see the most important information in one place.

---

## The main screen: Command Center

When you open NeuraFin, you see the Command Center. This is the overall health view of the business process.

It shows:

- **Decision Volume Automated**: the percentage of routine decisions handled automatically.
- **Invoice-to-Pay Cycle**: how long it usually takes to process an invoice and pay it.
- **Maverick Spend Rate**: spending that happens outside approved suppliers, catalogs, or agreements.
- **Reconciliation Close**: how long it takes to compare records and finish the accounting close.
- **Decision Volume Split**: how work is divided between fully automatic, AI-assisted, and human-only decisions.
- **Automation Adoption Trajectory**: whether the organization is becoming more automated over time.

The amber notice called **Standing Override Active** means that automatic decisions can still be recalled or reviewed when necessary. AI is assisting the finance team, not taking away human control.

---

## Intelligent AP and Invoicing

AP means **Accounts Payable**, the part of finance that handles bills from suppliers.

This screen shows the invoice processing queue. For each invoice, NeuraFin displays:

- the invoice number;
- the supplier name;
- the invoice amount;
- the AI confidence score;
- the reason for the AI decision; and
- the action required from a finance employee.

### How invoice checking works

NeuraFin uses a **three-way match**. It compares:

1. the purchase order, which says what was ordered;
2. the goods receipt, which says what was delivered; and
3. the invoice, which says what the supplier wants to be paid.

If all three agree, the invoice can be posted automatically. If there is a small difference, a person can approve it. If there is a serious problem, the invoice is sent for human investigation.

### The three decision tiers

- **Tier 1: Auto-Posting**: high-confidence invoices can be processed without manual work.
- **Tier 2: Assisted Review**: NeuraFin explains the issue and recommends an action, but a person must approve it.
- **Tier 3: Human Exception**: the invoice needs a person to investigate before anything is posted.

For example, an invoice that is 4% above a contract price may be shown as a Tier 2 recommendation. A missing goods receipt or a large amount over the purchase order may become a Tier 3 exception.

### Approving an invoice

1. Open **Intelligent AP** from the left menu.
2. Find an invoice marked **Assisted Review**.
3. Read the AI explanation and confidence score.
4. Select **Approve & Post** if the invoice is correct.
5. NeuraFin updates the invoice and records the action in the audit trail.

### Uploading invoice files

The **Upload Batch PDF** button accepts one or more `.pdf` files. In the current MVP, the files are added to the processing queue for demonstration, but invoice fields are not extracted from the PDF yet.

For future matching insight, each invoice should contain readable text with these fields:

- invoice number;
- supplier or vendor name;
- invoice date and currency;
- purchase order number;
- line-item description, quantity, unit price, and tax; and
- subtotal, total amount, and payment terms.

Use a text-based PDF rather than a password-protected or image-only scan. A batch may contain one invoice per PDF, or one PDF with one invoice per page once document extraction is enabled. The purchase order and goods receipt must also be available in the system for a complete three-way match.

---

## Joule AI Copilot

Joule is the chatbot in the bottom-right corner of the website. You can ask questions in normal language, such as:

- "Explain the variance on INV-4471."
- "What is our maverick spend rate?"
- "Check supplier risk for Rapid Logistics."
- "How does continuous reconciliation work?"

Joule sends the question to the NeuraFin backend. The backend sends it to Google Gemini, then returns the answer to the website.

The Gemini API key is kept on the server and is not placed in the browser. This is important because it prevents visitors from seeing the secret key.

If Gemini is temporarily unavailable, Joule can provide a built-in fallback answer for common finance questions instead of leaving the user with a blank chat window.

---

## Supplier Risk

The Supplier Risk screen helps the team understand whether suppliers are performing well.

It can show information such as:

- delivery performance;
- product or service quality;
- overall risk level; and
- whether the supplier is approved, being monitored, or flagged.

This helps the procurement team decide whether to continue using a supplier or investigate a problem.

---

## AI Governance and Audit Trail

The Governance screen is the control and accountability area.

It explains:

- which confidence levels allow automatic actions;
- how often people disagree with AI recommendations;
- how many decisions were made automatically; and
- which actions were recalled or reviewed.

The audit trail records important events such as invoice approvals, automatic postings, manual routing, and supplier risk alerts. This gives the finance team a history of what happened and why.

---

## Other menu items

Some areas are currently architecture previews or placeholders for future workflows:

- **Cash Application**: matching incoming payments to customer invoices.
- **Reconciliation**: comparing financial records and reducing the time needed to close the books.
- **Requisition to PO**: turning an employee request into an approved purchase order.
- **AI Sourcing**: helping choose suppliers based on price, delivery, and quality.

These screens explain the planned workflow and link back to the working AP experience.

---

## A simple example

Imagine a company receives an invoice for steel:

1. A purchase order says the company ordered 100 units.
2. The goods receipt confirms that 100 units arrived.
3. The invoice asks for payment for 100 units.
4. NeuraFin sees that the quantity matches.
5. The price is slightly above the contract, so NeuraFin marks it Tier 2.
6. A finance employee reads the explanation and selects **Approve & Post**.
7. NeuraFin records the approval in the audit trail.

The result is faster processing with a clear human checkpoint when something needs judgment.

---

## In one sentence

NeuraFin helps finance and procurement teams process routine work faster, identify exceptions earlier, and keep people in control of important financial decisions.

---

## Accessing the website

For local development:

```powershell
cd "C:\Users\AAYUSH PRAVEEN\OneDrive\Desktop\Neurafin\mvp"
npm run dev
```

For the deployed version, open the Render URL for the NeuraFin service.

To turn this guide into a PDF, open this file in VS Code or GitHub, choose **Print**, and select **Save as PDF**.
