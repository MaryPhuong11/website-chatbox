const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');
const prisma = new PrismaClient();
const { createPaymentUrl, processPaymentResponse } = require('./vnpay-service');

const config = {
    VnPay: {
        Version: '2.1.0',
        Command: 'pay',
        TmnCode: 'OZJC5X8T',
        HashSecret:'9WCQITQ936WNK7Z3HQ6XRSJA3HZX362F',
        CurrCode: 'VND',
        Locale: 'vn',
        ReturnUrl: 'http://localhost:3000/vnpay-return',
        BaseUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
        TimeZoneId: 'SE Asia Standard Time'
    }
};

// Create VNPay payment
router.post('/vnpay', async (req, res) => {
    const { orderId, amount } = req.body;

    try {
        // Kiểm tra đơn hàng tồn tại
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Đơn hàng không tồn tại'
            });
        }

        function toVNDateTimeString(date) {
            const vnTime = new Date(date.getTime() + 7 * 60 * 60 * 1000); // +7 giờ
            return vnTime.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
        }

        const model = {
            amount: (amount || order.totalAmount) , // Chuyển thành VND xu
            createdDate: toVNDateTimeString(new Date()),
            orderCode: order.id
        };

        // Tạo URL thanh toán
        const url = createPaymentUrl(req, model, config);

        // Cập nhật đơn hàng
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'pending'
            }
        });

        res.json({
            success: true,
            paymentUrl: url,
            orderId: order.id,
            amount: model.amount
        });
    } catch (error) {
        console.error('Error creating VNPay payment:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo thanh toán VNPay: ' + error.message
        });
    }
});

router.get('/vnpay-return', async (req, res) => {
    const result = processPaymentResponse(req.query, config);

    if (result.success) {
        try {
            // Cập nhật trạng thái đơn hàng
            await prisma.order.update({
                where: { id: result.orderCode },
                data: {
                    status: 'processing',
                    paymentMethod: 'vnpay',
                    createdAt: new Date()
                }
            });

            // Redirect về trang cảm ơn
            // res.redirect(`/thank-you?orderId=${result.orderCode}`);
        } catch (error) {
            console.error('Error updating order status:', error);
            res.status(500).json({
                success: false,
                message: 'Thanh toán thành công nhưng có lỗi khi cập nhật đơn hàng'
            });
        }
    } else {
        // Xử lý khi thanh toán thất bại
        // res.redirect(`/payment-failed?orderId=${result.orderCode}`);
    }
});

// Get user addresses
router.get('/addresses/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const addresses = await prisma.address.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(addresses);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách địa chỉ' });
    }
});

// Apply voucher
router.post('/voucher/apply', async (req, res) => {
    try {
        const { code, totalAmount } = req.body;

        const voucher = await prisma.voucher.findUnique({
            where: { code }
        });

        if (!voucher) {
            return res.json({
                valid: false,
                message: 'Mã giảm giá không tồn tại'
            });
        }

        if (!voucher.isActive) {
            return res.json({
                valid: false,
                message: 'Mã giảm giá đã bị vô hiệu hóa'
            });
        }

        if (voucher.expirationDate < new Date()) {
            return res.json({
                valid: false,
                message: 'Mã giảm giá đã hết hạn'
            });
        }

        if (voucher.minAmount && totalAmount < voucher.minAmount) {
            return res.json({
                valid: false,
                message: `Đơn hàng tối thiểu ${voucher.minAmount.toLocaleString('vi-VN')}đ`
            });
        }

        const discountAmount = voucher.discountType === 'percentage'
            ? (totalAmount * voucher.value) / 100
            : voucher.value;

        res.json({
            valid: true,
            discountAmount,
            voucher
        });
    } catch (error) {
        console.error('Error applying voucher:', error);
        res.status(500).json({ message: 'Lỗi khi áp dụng mã giảm giá' });
    }
});

// Create order
router.post('/order', async (req, res) => {
    const { userId, addressId, items, voucherCode, paymentMethod } = req.body;

    try {
        // Validate input
        if (!userId || !addressId || !items || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin đơn hàng'
            });
        }

        // Start transaction
        const result = await prisma.$transaction(async (prisma) => {
            // Calculate total amount
            const totalAmount = items.reduce(
                (total, item) => total + item.price * item.quantity,
                0
            );

            // Apply voucher if exists
            let discountAmount = 0;
            let voucher = null;
            if (voucherCode) {
                voucher = await prisma.voucher.findUnique({
                    where: { code: voucherCode }
                });

                if (voucher) {
                    discountAmount = voucher.discountType === 'percentage'
                        ? (totalAmount * voucher.value) / 100
                        : voucher.value;
                }
            }

            // Create order
            const order = await prisma.order.create({
                data: {
                    userId,
                    addressId,
                    status: paymentMethod === 'vnpay' ? 'pending' : 'processing',
                    totalAmount: totalAmount - discountAmount,
                    paymentMethod,
                    items: {
                        create: items.map((item) => ({
                            product: { connect: { id: item.productId } },
                            quantity: item.quantity,
                            price: item.price
                        }))
                    }
                },
                include: {
                    items: true
                }
            });

            return { order };
        });

        res.json({
            success: true,
            orderId: result.order.id,
            message: 'Tạo đơn hàng thành công'
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo đơn hàng: ' + error.message
        });
    }
});

router.get('/test-connection', (req, res) => {
    console.log('Test route hit!');
    res.json({ success: true });
});


// Get user orders
router.get('/orders/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                productName: true,
                                imgUrl: true
                            }
                        }
                    }
                },
                shippingAddress: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({
            success: true,
            orders: orders.map(order => ({
                id: order.id,
                createdAt: order.createdAt,
                status: order.status,
                totalAmount: order.totalAmount,
                paymentMethod: order.paymentMethod,
                items: order.items.map(item => ({
                    id: item.id,
                    productName: item.product.productName,
                    imgUrl: item.product.imgUrl,
                    quantity: item.quantity,
                    price: item.price,
                    subtotal: item.price * item.quantity
                })),
                shippingAddress: order.shippingAddress
            }))
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách đơn hàng'
        });
    }
});

// Get all orders for admin
router.get('/admin/orders', async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        // Build where clause
        const where = status ? { status } : {};

        // Get total count for pagination
        const total = await prisma.order.count({ where });

        const orders = await prisma.order.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                shippingAddress: true,
                items: {
                    include: {
                        product: {
                            select: {
                                productName: true,
                                imgUrl: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: parseInt(skip),
            take: parseInt(limit)
        });

        res.json({
            success: true,
            orders: orders.map(order => ({
                id: order.id,
                userName: order.user.name,
                userEmail: order.user.email,
                userPhone: order.user.phone,
                totalAmount: order.totalAmount,
                paymentMethod: order.paymentMethod,
                status: order.status,
                createdAt: order.createdAt,
                shippingAddress: order.shippingAddress,
                items: order.items.map(item => ({
                    id: item.id,
                    productName: item.product.productName,
                    imgUrl: item.product.imgUrl,
                    quantity: item.quantity,
                    price: item.price,
                    subtotal: item.price * item.quantity
                }))
            })),
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách đơn hàng'
        });
    }
});

// Get order details by ID
router.get('/admin/orders/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                shippingAddress: true,
                items: {
                    include: {
                        product: {
                            select: {
                                productName: true,
                                imgUrl: true
                            }
                        }
                    }
                }
            }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        res.json({
            success: true,
            order: {
                id: order.id,
                userName: order.user.name,
                userEmail: order.user.email,
                userPhone: order.user.phone,
                totalAmount: order.totalAmount,
                paymentMethod: order.paymentMethod,
                status: order.status,
                createdAt: order.createdAt,
                shippingAddress: order.shippingAddress,
                items: order.items.map(item => ({
                    id: item.id,
                    productName: item.product.productName,
                    imgUrl: item.product.imgUrl,
                    quantity: item.quantity,
                    price: item.price,
                    subtotal: item.price * item.quantity
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin đơn hàng'
        });
    }
});

module.exports = router;