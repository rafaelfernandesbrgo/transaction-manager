const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// In-memory store (no DB for this challenge)
const transactions = [];
let nextId = 1;

// Small helper for validation
function validateTransaction(body) {
  const amountRaw = body?.amount;
  const descriptionRaw = body?.description;

  const amount = Number(amountRaw);
  const description = typeof descriptionRaw === "string" ? descriptionRaw.trim() : "";

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Amount must be a number greater than 0." };
  }
  if (!description) {
    return { ok: false, error: "Description is required." };
  }
  if (description.length > 200) {
    return { ok: false, error: "Description must be at most 200 characters." };
  }

  return { ok: true, value: { amount, description } };
}

// POST /transactions - save a new transaction
app.post("/transactions", (req, res) => {
  const result = validateTransaction(req.body);
  if (!result.ok) return res.status(400).json({ message: result.error });

  const tx = {
    id: nextId++,
    amount: result.value.amount,
    description: result.value.description,
    createdAt: new Date().toISOString()
  };

  transactions.push(tx);
  return res.status(201).json(tx);
});

// GET /transactions - list all transactions
app.get("/transactions", (req, res) => {
  res.json(transactions);
});

// Basic 404 + error handler
app.use((req, res) => res.status(404).json({ message: "Not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

// Export for tests, and start only if run directly
const PORT = process.env.PORT || 4000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = { app, transactions };