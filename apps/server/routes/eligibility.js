require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/eligibility
router.get('/', async (req, res) => {
  const { ninHash } = req.query;

  if (!ninHash) {
    return res.status(400).json({ ok: false, msg: 'ninHash required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { ninHash } });
    if (!user) {
      return res.status(404).json({ ok: false, msg: 'User not found' });
    }

    // Simple eligibility logic (expand later)
    const eligible = user.eligible !== false;  // Default to true if not set

    res.json({ ok: true, eligible, msg: eligible ? 'Eligible to vote' : 'Not eligible' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Server error' });
  }
});

module.exports = router;
