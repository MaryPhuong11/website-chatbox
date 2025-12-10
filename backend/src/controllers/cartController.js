const prisma = require('../lib/prisma');

exports.getCart = async (req, res) => {
  const { userId } = req.params;
  try {
    // Tìm cart theo userId
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    // Nếu chưa có cart thì tạo mới (tùy ý, có thể bỏ nếu không muốn tạo mới)
    if (!cart) {
      return res.json({ cartList: [] });
    }

    // Trả về danh sách sản phẩm trong cart
    res.json({ cartList: cart.items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addToCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;
  if (!userId || !productId || !quantity) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
  }

  try {
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId
        }
      }
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId
          }
        },
        data: {
          quantity: { increment: quantity }
        }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity
        }
      });
    }

    res.json({ message: 'Thêm sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.syncCart = async (req, res) => {
  const { userId, cartList } = req.body;
  if (!userId || !Array.isArray(cartList)) {
    return res.status(400).json({ error: 'Dữ liệu không hợp lệ để đồng bộ' });
  }

  try {
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    // Xoá toàn bộ cart cũ
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    // Thêm lại từng item mới
    for (const item of cartList) {
      if (!item.productId || !item.quantity) continue;

      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });
      if (!product) continue;

      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: item.productId,
          quantity: item.quantity
        }
      });
    }

    // Trả về giỏ hàng mới
    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    res.json({ cartList: updatedCart.items });
  } catch (err) {
    console.error("SYNC CART ERROR:", err);
    res.status(500).json({ message: "Đồng bộ giỏ hàng thất bại", error: err.message });
  }
};

exports.removeCartItem = async (req, res) => {
  const { userId, productId } = req.body;
  try {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });

    res.json({ message: "Removed item from cart" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
