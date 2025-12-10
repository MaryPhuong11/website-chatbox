const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const { district, ward } = req.query;
  try {
    const stores = await prisma.store.findMany({
      where: {
        city: "Bình Định",
        ...(district && { district }),
        ...(ward && { ward })
      }
    });
    res.json(stores);
  } catch (err) {
    res.status(500).json({ error: "Lỗi lấy danh sách cửa hàng" });
  }
});


router.get('/:id', async (req, res) => {
  const storeId = parseInt(req.params.id);
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return res.status(404).json({ error: 'Không tìm thấy cửa hàng' });
    }

    res.json(store);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

module.exports = router; 