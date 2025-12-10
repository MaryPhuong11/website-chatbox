import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chatbox.css';
import { FaComments, FaTimes, FaPaperPlane, FaRobot } from 'react-icons/fa';

const Chatbox = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Load chat history khi mở chatbox
  useEffect(() => {
    if (isOpen && userId) {
      loadChatHistory();
    }
  }, [isOpen, userId]);

  // Auto scroll to bottom khi có message mới
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/chat/history`, {
        params: {
          userId: userId,
          conversationId: conversationId,
          limit: 20
        }
      });
      
      if (response.data && response.data.length > 0) {
        const formattedMessages = [];
        response.data.forEach(msg => {
          formattedMessages.push({
            type: 'user',
            text: msg.message,
            timestamp: msg.createdAt
          });
          formattedMessages.push({
            type: 'bot',
            text: msg.response,
            timestamp: msg.createdAt
          });
        });
        setMessages(formattedMessages);
        if (response.data[0]?.conversationId) {
          setConversationId(response.data[0].conversationId);
        }
      } else {
        // Welcome message nếu chưa có lịch sử
        setMessages([{
          type: 'bot',
          text: 'Xin chào! Tôi là trợ lý ảo của cửa hàng. Tôi có thể giúp bạn tìm hiểu về sản phẩm, đặt hàng, hoặc trả lời các câu hỏi thường gặp. Bạn cần hỗ trợ gì?',
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Lỗi khi load chat history:', error);
      setMessages([{
        type: 'bot',
        text: 'Xin chào! Tôi là trợ lý ảo của cửa hàng. Tôi có thể giúp bạn tìm hiểu về sản phẩm, đặt hàng, hoặc trả lời các câu hỏi thường gặp. Bạn cần hỗ trợ gì?',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Thêm user message vào UI ngay lập tức
    const newUserMessage = {
      type: 'user',
      text: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chat`, {
        message: userMessage,
        userId: userId || null,
        conversationId: conversationId
      });

      // Cập nhật conversationId nếu có
      if (response.data.conversationId) {
        setConversationId(response.data.conversationId);
      }

      // Thêm bot response
      const botMessage = {
        type: 'bot',
        text: response.data.response,
        sources: response.data.sources || [],
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Lỗi khi gửi message:', error);
      const errorMessage = {
        type: 'bot',
        text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button 
          className="chatbox-toggle-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Mở chatbox"
        >
          <FaComments className="chat-icon" />
          <span className="chat-notification-badge"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbox-container">
          <div className="chatbox-header">
            <div className="chatbox-header-content">
              <FaRobot className="chatbox-avatar" />
              <div>
                <h3>Trợ lý ảo</h3>
                <span className="chatbox-status">Đang hoạt động</span>
              </div>
            </div>
            <button 
              className="chatbox-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Đóng chatbox"
            >
              <FaTimes />
            </button>
          </div>

          <div className="chatbox-messages" ref={chatContainerRef}>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`chatbox-message ${msg.type === 'user' ? 'user-message' : 'bot-message'}`}
              >
                {msg.type === 'bot' && (
                  <div className="bot-avatar">
                    <FaRobot />
                  </div>
                )}
                <div className="message-content">
                  <p>{msg.text}</p>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="message-sources">
                      <small>Nguồn thông tin: {msg.sources.length} kết quả tìm kiếm</small>
                    </div>
                  )}
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chatbox-message bot-message">
                <div className="bot-avatar">
                  <FaRobot />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbox-input-form" onSubmit={sendMessage}>
            <input
              type="text"
              className="chatbox-input"
              placeholder="Nhập câu hỏi của bạn..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="chatbox-send-btn"
              disabled={!inputMessage.trim() || isLoading}
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbox;

