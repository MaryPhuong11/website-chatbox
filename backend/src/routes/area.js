const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/districts', async (req, res) => {
  const districts = await prisma.store.findMany({
    where: { city: "Bình Định" },
    select: { district: true },
    distinct: ['district']
  });
  res.json(districts.map(d => d.district));
});

router.get('/wards/:district', async (req, res) => {
  const wards = await prisma.store.findMany({
    where: {
      city: "Bình Định",
      district: req.params.district
    },
    select: { ward: true },
    distinct: ['ward']
  });
  res.json(wards.map(w => w.ward));
});

module.exports = router;