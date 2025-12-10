const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all addresses for a user
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const addresses = await prisma.address.findMany({
      where: { userId},
    });
    res.json(addresses);
  } catch (error) {
    console.error(req.params);
    // console.error('Error fetching addresses:', error);
    res.status(500).json({ message: 'Lỗi khi lấy địa chỉ', params: req.params.userId });
  }
});

// Add new address
router.post('/', async (req, res) => {
  try {
    const { userId, fullName, phone, province, district, ward, detail } = req.body;

    // Validate required fields
    if (!userId || !fullName || !phone || !province || !district || !ward || !detail) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    // Validate phone number format (Vietnamese format)
    // const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    // if (!phoneRegex.test(phone)) {
    //   return res.status(400).json({ message: 'Số điện thoại không hợp lệ' });
    // }

    const address = await prisma.address.create({
      data: {
        userId,
        fullName,
        phone,
        province,
        district,
        ward,
        detail,
       // isDefault: false // New address is not default by default
      }
    });

    res.status(201).json(address);
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ message: 'Lỗi khi thêm địa chỉ mới' });
  }
});

// Update address
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, province, district, ward, detail } = req.body;

    // Validate required fields
    if (!fullName || !phone || !province || !district || !ward || !detail) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    // Validate phone number format
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Số điện thoại không hợp lệ' });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        fullName,
        phone,
        province,
        district,
        ward,
        detail
      }
    });

    res.json(address);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật địa chỉ' });
  }
});

// Delete address
router.delete('/:id', async (req, res) => {
  try {
    const id  = req.params.id;

    await prisma.address.delete({
      where: { id }
    });

    res.json({ message: 'Xóa địa chỉ thành công' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Lỗi khi xóa địa chỉ', params: req.params });
  }
});

// Set default address
router.put('/:id/default', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // First, set all addresses of the user to non-default
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false }
    });

    // Then set the selected address as default
    const address = await prisma.address.update({
      where: { id },
      data: { isDefault: true }
    });

    res.json(address);
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ message: 'Lỗi khi đặt địa chỉ mặc định' });
  }
});

module.exports = router; 