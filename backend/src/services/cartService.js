const prisma = require('../lib/prisma');

// Lấy danh sách sản phẩm trong giỏ hàng theo userId
async function getCartByUser(userId) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  return cart?.items || [];
}

// Thêm mới hoặc cập nhật số lượng sản phẩm trong giỏ
async function addOrUpdateCartItem(userId, productId, quantity) {
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  const existing = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: { cartId: cart.id, productId },
    },
  });

  if (existing) {
    return prisma.cartItem.update({
      where: {
        cartId_productId: { cartId: cart.id, productId },
      },
      data: {
        quantity: existing.quantity + quantity,
      },
    });
  }

  return prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      quantity,
    },
  });
}

// Cập nhật số lượng sản phẩm cụ thể
async function updateCartItemQuantity(userId, productId, quantity) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw new Error('Không tìm thấy giỏ hàng');

  return prisma.cartItem.update({
    where: {
      cartId_productId: { cartId: cart.id, productId },
    },
    data: { quantity },
  });
}

// Xoá sản phẩm khỏi giỏ hàng
async function removeCartItem(userId, productId) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw new Error('Không tìm thấy giỏ hàng');

  return prisma.cartItem.delete({
    where: {
      cartId_productId: { cartId: cart.id, productId },
    },
  });
}

// Xoá toàn bộ sản phẩm trong giỏ hàng
async function clearCart(userId) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;

  return prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });
}

module.exports = {
  getCartByUser,
  addOrUpdateCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};
