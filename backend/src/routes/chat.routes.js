const express = require('express');
const router = express.Router();
const axios = require('axios');
const prisma = require('../lib/prisma');

// URL của Python chatbot service
const CHATBOT_SERVICE_URL = process.env.CHATBOT_SERVICE_URL || 'http://localhost:8000';

/**
 * POST /api/chat
 * Gửi message đến chatbot và nhận response
 */
router.post('/', async (req, res) => {
  try {
    const { message, userId, conversationId } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message không được để trống' });
    }

    // Gọi Python chatbot service
    let chatbotResponse;
    try {
      const response = await axios.post(`${CHATBOT_SERVICE_URL}/chat`, {
        message: message.trim(),
        user_id: userId || null,
        conversation_id: conversationId || null
      });

      chatbotResponse = response.data;
    } catch (error) {
      console.error('Lỗi khi gọi chatbot service:', error.message);
      // Fallback response nếu service không khả dụng
      chatbotResponse = {
        response: 'Xin lỗi, hệ thống chatbot đang tạm thời không khả dụng. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ.',
        sources: [],
        conversation_id: conversationId || 'default'
      };
    }

    // Lưu chat log vào database nếu có userId
    if (userId) {
      try {
        await prisma.chatMessage.create({
          data: {
            userId: userId,
            message: message.trim(),
            response: chatbotResponse.response,
            sources: chatbotResponse.sources ? JSON.stringify(chatbotResponse.sources) : null,
            conversationId: chatbotResponse.conversation_id
          }
        });
      } catch (dbError) {
        console.error('Lỗi khi lưu chat log:', dbError);
        // Không throw error, chỉ log vì đây không phải lỗi nghiêm trọng
      }
    }

    res.json({
      response: chatbotResponse.response,
      sources: chatbotResponse.sources || [],
      conversationId: chatbotResponse.conversation_id
    });
  } catch (error) {
    console.error('Lỗi trong chat route:', error);
    res.status(500).json({ error: 'Lỗi server khi xử lý chat' });
  }
});

/**
 * GET /api/chat/history
 * Lấy lịch sử chat của user
 */
router.get('/history', async (req, res) => {
  try {
    const { userId, conversationId, limit = 50 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId là bắt buộc' });
    }

    const where = { userId };
    if (conversationId) {
      where.conversationId = conversationId;
    }

    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      select: {
        id: true,
        message: true,
        response: true,
        conversationId: true,
        createdAt: true
      }
    });

    res.json(messages.reverse()); // Reverse để hiển thị từ cũ đến mới
  } catch (error) {
    console.error('Lỗi khi lấy lịch sử chat:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy lịch sử chat' });
  }
});

/**
 * GET /api/chat/conversations
 * Lấy danh sách các cuộc hội thoại của user
 */
router.get('/conversations', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId là bắt buộc' });
    }

    // Lấy các conversationId duy nhất
    const conversations = await prisma.chatMessage.groupBy({
      by: ['conversationId'],
      where: { userId },
      _count: { id: true },
      _max: { createdAt: true }
    });

    const result = conversations.map(conv => ({
      conversationId: conv.conversationId,
      messageCount: conv._count.id,
      lastMessageAt: conv._max.createdAt
    }));

    res.json(result);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách conversations:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách conversations' });
  }
});

/**
 * POST /api/chat/generate-embeddings
 * Trigger việc generate embeddings từ database (admin only)
 */
router.post('/generate-embeddings', async (req, res) => {
  try {
    // Có thể thêm authentication check ở đây
    const response = await axios.post(`${CHATBOT_SERVICE_URL}/generate-embeddings`);
    res.json({ message: 'Đang generate embeddings...', status: 'processing' });
  } catch (error) {
    console.error('Lỗi khi generate embeddings:', error);
    res.status(500).json({ error: 'Lỗi khi generate embeddings' });
  }
});

module.exports = router;

