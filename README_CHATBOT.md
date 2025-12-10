# Hệ thống Chatbox với PhoBERT và RAG

## Tổng quan

Hệ thống chatbox thông minh cho website bán hàng sử dụng:
- **PhoBERT**: Model ngôn ngữ tiếng Việt để tạo embeddings
- **ChromaDB**: Vector database để lưu trữ và tìm kiếm embeddings
- **RAG (Retrieval-Augmented Generation)**: Kỹ thuật tìm kiếm ngữ nghĩa và tạo câu trả lời dựa trên context

## Kiến trúc hệ thống

```
┌─────────────┐
│   React     │  ← Frontend (Chatbox Component)
│  Frontend   │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────┐
│   Node.js   │  ← Backend API (Express)
│   Backend   │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────┐
│   Python    │  ← Chatbot Service (FastAPI)
│   Service   │
└──────┬──────┘
       │
       ├──► PhoBERT Model (Embeddings)
       │
       └──► ChromaDB (Vector Database)
```

## Cài đặt và Chạy

### 1. Backend (Node.js)

```bash
cd backend
npm install
npm run dev
```

Backend chạy tại `http://localhost:5000`

### 2. Python Chatbot Service

```bash
cd chatbot_service
pip install -r requirements.txt

# Tạo file .env với thông tin database
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=qnu_farm

python main.py
```

Service chạy tại `http://localhost:8000`

### 3. Frontend (React)

```bash
npm install
npm start
```

Frontend chạy tại `http://localhost:3000`

### 4. Database Migration

Cập nhật Prisma schema và chạy migration:

```bash
cd backend
npx prisma migrate dev --name add_chat_messages
npx prisma generate
```

### 5. Generate Embeddings

Sau khi cài đặt xong, chạy script để generate embeddings từ database:

```bash
cd chatbot_service
python generate_embeddings.py
```

Script này sẽ:
- Lấy tất cả products, reviews, comments từ MySQL
- Tạo FAQ documents
- Generate embeddings bằng PhoBERT
- Lưu vào ChromaDB

## Giải thích chi tiết

### 1. PhoBERT Embeddings

**PhoBERT** là một pre-trained language model cho tiếng Việt, được phát triển bởi VinAI Research. Nó được sử dụng để:

- **Tạo embeddings**: Chuyển đổi text tiếng Việt thành vector số (embedding)
- **Tìm kiếm ngữ nghĩa**: So sánh độ tương đồng giữa các câu hỏi và nội dung

**Ví dụ:**
```python
# Câu hỏi: "Sản phẩm này giá bao nhiêu?"
# Embedding: [0.123, -0.456, 0.789, ...] (vector 768 chiều)

# Mô tả sản phẩm: "Giá sản phẩm là 500.000 VNĐ"
# Embedding: [0.125, -0.458, 0.791, ...]

# So sánh cosine similarity → Tìm thấy nội dung liên quan!
```

### 2. Vector Database (ChromaDB)

**ChromaDB** là một vector database mã nguồn mở, được thiết kế để:

- **Lưu trữ embeddings**: Lưu các vector embeddings cùng với metadata
- **Tìm kiếm nhanh**: Sử dụng cosine similarity để tìm các documents tương tự
- **Scalable**: Có thể mở rộng với hàng triệu documents

**Cấu trúc dữ liệu:**
```
Collection: "ecommerce_knowledge"
├── Document: "Sản phẩm: iPhone 15 | Giá: 25.000.000 VNĐ"
├── Embedding: [0.123, -0.456, ...]
└── Metadata: {type: "product", product_id: 1, price: "25000000"}
```

### 3. RAG (Retrieval-Augmented Generation)

**RAG** là kỹ thuật kết hợp:
- **Retrieval**: Tìm kiếm thông tin liên quan từ vector database
- **Augmented**: Bổ sung context vào prompt
- **Generation**: Tạo câu trả lời dựa trên context

**Quy trình:**

1. **User hỏi**: "Sản phẩm này giá bao nhiêu?"
2. **Tạo query embedding**: Chuyển câu hỏi thành vector
3. **Tìm kiếm trong vector DB**: Tìm top 3-5 documents tương tự nhất
4. **Lấy context**: Kết hợp các documents tìm được
5. **Tạo response**: Trả lời dựa trên context (có thể tích hợp LLM như GPT)

**Ví dụ flow:**
```
User: "iPhone 15 giá bao nhiêu?"
  ↓
Query Embedding: [0.123, -0.456, ...]
  ↓
Vector Search → Tìm thấy:
  - "Sản phẩm: iPhone 15 | Giá: 25.000.000 VNĐ" (similarity: 0.95)
  - "iPhone 15 Pro Max có giá 35.000.000 VNĐ" (similarity: 0.87)
  ↓
Context: "iPhone 15 có giá 25.000.000 VNĐ..."
  ↓
Response: "Sản phẩm iPhone 15 có giá 25.000.000 VNĐ. Bạn có muốn đặt hàng không?"
```

### 4. Nguồn dữ liệu

Hệ thống sử dụng các nguồn dữ liệu sau để tạo knowledge base:

1. **Products**: Tên sản phẩm, mô tả, giá
2. **Reviews**: Đánh giá của khách hàng
3. **Comments**: Bình luận về sản phẩm
4. **FAQs**: Câu hỏi thường gặp

Tất cả được chuyển đổi thành embeddings và lưu vào ChromaDB.

## API Endpoints

### Backend API (`/api/chat`)

#### POST `/api/chat`
Gửi message đến chatbot

**Request:**
```json
{
  "message": "Sản phẩm này giá bao nhiêu?",
  "userId": "user123",
  "conversationId": "conv456"
}
```

**Response:**
```json
{
  "response": "Sản phẩm này có giá 500.000 VNĐ...",
  "sources": [
    {
      "text": "Sản phẩm: Áo thun | Giá: 500.000 VNĐ",
      "metadata": {"type": "product", "product_id": 1},
      "relevance": 0.95
    }
  ],
  "conversationId": "conv456"
}
```

#### GET `/api/chat/history`
Lấy lịch sử chat của user

**Query params:**
- `userId`: ID của user
- `conversationId`: ID của conversation (optional)
- `limit`: Số lượng messages (default: 50)

#### GET `/api/chat/conversations`
Lấy danh sách các cuộc hội thoại

## Tính năng

✅ Chatbox UI đẹp mắt với animation  
✅ Tìm kiếm ngữ nghĩa bằng PhoBERT  
✅ Lưu trữ chat logs vào database  
✅ Hỗ trợ nhiều cuộc hội thoại  
✅ Responsive design  
✅ Tự động scroll và typing indicator  

## Cải tiến trong tương lai

- [ ] Tích hợp LLM (GPT-4, Claude) để tạo response tự nhiên hơn
- [ ] Hỗ trợ đa ngôn ngữ
- [ ] Sentiment analysis cho reviews
- [ ] Analytics và reporting
- [ ] Admin dashboard để quản lý FAQs
- [ ] Tích hợp với hệ thống đặt hàng

## Troubleshooting

### Lỗi: "Collection chưa được khởi tạo"
→ Chạy `python generate_embeddings.py` để tạo embeddings

### Lỗi: "Cannot connect to chatbot service"
→ Kiểm tra Python service đang chạy tại port 8000

### Lỗi: "Model not found"
→ Model sẽ tự động download khi chạy lần đầu (có thể mất vài phút)

## Tài liệu tham khảo

- [PhoBERT Paper](https://arxiv.org/abs/2003.00744)
- [ChromaDB Documentation](https://docs.trychroma.com/)
- [RAG Paper](https://arxiv.org/abs/2005.11401)

