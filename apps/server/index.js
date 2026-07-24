require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const authRoutes = require('./routes/auth');
const PORT = process.env.PORT || 4000;
const eligibilityRouter = require('./routes/eligibility');


// Allow mobile/web to call API
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/eligibility', eligibilityRouter);

// POST /api/verify
app.post('/api/verify', async (req, res) => {
  const { nin, fingerprint } = req.body;

  if (!nin || !fingerprint) {
    return res.status(400).json({ ok: false, msg: "NIN and fingerprint required" });
  }

  try {
    const voter = await prisma.voter.findUnique({ where: { nin } });

    if (!voter) return res.status(404).json({ ok: false, msg: "NIN not found" });
    if (voter.fingerprint !== fingerprint) return res.status(403).json({ ok: false, msg: "Biometric mismatch" });
    if (!voter.eligible) return res.status(403).json({ ok: false, msg: "Not eligible to vote" });

    res.json({ ok: true, wallet: voter.wallet || null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: "Server error" });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`D-voX API running on http://localhost:${PORT}`);
  console.log(`Use this IP in mobile app`);
});

// const PORT = 4000;
// app.listen(PORT, () => {
//   console.log(`D-voX API running on http://localhost:${PORT}`);
// });
