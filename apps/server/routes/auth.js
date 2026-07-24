require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
  const { fullName, phone, email, dobHash, password, ninHash, bioHash, wallet } = req.body;

  if (!fullName || !phone || !password || !ninHash || !dobHash || !bioHash || !wallet) {
    return res.status(400).json({ ok: false, msg: "All fields required" });
  }

  try {
    const exists = await prisma.user.findFirst({
      where: { OR: [{ ninHash }, { phone }] }
    });
    if (exists) return res.status(400).json({ ok: false, msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        phone,
        email,
        dobHash,
        password: hashedPassword,
        ninHash,
        bioHash,
        wallet
      }
    });

    res.json({ ok: true, msg: "Registered! Login now." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: "Server error" });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { ninHash, bioHash } = req.body;

  const user = await prisma.user.findFirst({
    where: { ninHash, bioHash }
  });

  if (!user) {
    return res.json({ ok: false, msg: 'Invalid NIN or biometric' });
  }

  res.json({
    ok: true,
    msg: 'Login success',
    fullName: user.fullName,
    wallet: user.wallet
  });
});

// GET WALLET (NEW)
router.get('/get-wallet', async (req, res) => {
  const { nin } = req.query;
  if (!nin) return res.status(400).json({ ok: false, msg: "NIN required" });

  try {
    const user = await prisma.user.findUnique({ where: { nin } });
    res.json({ ok: true, wallet: user?.wallet || null });
  } catch (error) {
    res.status(500).json({ ok: false, msg: "Server error" });
  }
});

// SAVE WALLET — ONLY ONCE
router.post('/save-wallet', async (req, res) => {
  const { nin, wallet } = req.body;
  if (!nin || !wallet) return res.status(400).json({ ok: false, msg: "NIN and wallet required" });

  try {
    const user = await prisma.user.findUnique({ where: { nin } });
    if (user.wallet) {
      return res.json({ ok: true, msg: "Wallet already exists", wallet: user.wallet });
    }

    await prisma.user.update({
      where: { nin },
      data: { wallet }
    });
    res.json({ ok: true, msg: "Wallet saved", wallet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: "Failed to save wallet" });
  }
});

module.exports = router;