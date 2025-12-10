# Hướng dẫn sử dụng Chatbox với PhoBERT và RAG

## Tổng quan hệ thống

Hệ thống chatbox được xây dựng với 3 thành phần chính:

1. **Frontend (React)**: Giao diện chatbox đẹp mắt, thân thiện
2. **Backend (Node.js/Express)**: API xử lý requests và lưu trữ chat logs
3. **Python Service (FastAPI)**: Xử lý embeddings với PhoBERT và RAG

## Cách hoạt động

### 1. PhoBERT Embeddings

**PhoBERT** là một mô hình ngôn ngữ được huấn luyện đặc biệt cho tiếng Việt. Nó chuyển đổi văn bản thành các vector số (embeddings) để máy tính có thể hiểu và so sánh.

**Ví dụ:**
- Câu hỏi: "Sản phẩm này giá bao nhiêu?" 
- → Embedding: Một mảng số [0.123, -0.456, 0.789, ...] (768 số)
- → Vector này đại diện cho ý nghĩa của câu hỏi

### 2. Vector Database (ChromaDB)

**ChromaDB** lưu trữ tất cả các embeddings từ:
- Mô tả sản phẩm
- Đánh giá khách hàng
- Câu hỏi thường gặp (FAQ)
- Bình luận

Khi có câu hỏi mới, hệ thống:
1. Tạo embedding cho câu hỏi
2. So sánh với tất cả embeddings trong database
3. Tìm các nội dung tương tự nhất (top 3-5)

### 3. RAG (Retrieval-Augmented Generation)

**RAG** là quy trình:
1. **Retrieval (Tìm kiếm)**: Tìm thông tin liên quan từ vector database
2. **Augmented (Bổ sung)**: Kết hợp thông tin tìm được thành context
3. **Generation (Tạo câu trả lời)**: Tạo câu trả lời dựa trên context

**Ví dụ cụ thể:**

```
Bước 1: User hỏi "iPhone 15 giá bao nhiêu?"
  ↓
Bước 2: Tạo embedding cho câu hỏi
  ↓
Bước 3: Tìm kiếm trong vector DB → Tìm thấy:
  - "Sản phẩm: iPhone 15 | Giá: 25.000.000 VNĐ" (độ tương đồng: 95%)
  - "iPhone 15 Pro Max có giá 35.000.000 VNĐ" (độ tương đồng: 87%)
  ↓
Bước 4: Kết hợp thành context:
  "Thông tin liên quan:
   - Sản phẩm: iPhone 15 | Giá: 25.000.000 VNĐ
   - iPhone 15 Pro Max có giá 35.000.000 VNĐ"
  ↓
Bước 5: Tạo câu trả lời:
  "Sản phẩm iPhone 15 có giá 25.000.000 VNĐ. Bạn có muốn đặt hàng không?"
```

## Cài đặt từng bước

### Bước 1: Cài đặt Backend

```bash
cd backend
npm install
```

### Bước 2: Cài đặt Python Service

```bash
cd chatbot_service
pip install -r requirements.txt
```

Tạo file `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=qnu_farm
```

### Bước 3: Cập nhật Database

```bash
cd backend
npx prisma migrate dev --name add_chat_messages
npx prisma generate
```

### Bước 4: Generate Embeddings

Chạy script để tạo embeddings từ dữ liệu hiện có:

```bash
cd chatbot_service
python generate_embeddings.py
```

Script này sẽ:
- Kết nối MySQL database
- Lấy tất cả products, reviews, comments
- Tạo FAQ mẫu
- Generate embeddings bằng PhoBERT
- Lưu vào ChromaDB

**Lưu ý:** Lần đầu chạy sẽ mất vài phút để download model PhoBERT.

### Bước 5: Chạy các services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Python Service:**
```bash
cd chatbot_service
python main.py
```

**Terminal 3 - Frontend:**
```bash
npm start
```

## Sử dụng Chatbox

1. Mở website tại `http://localhost:3000`
2. Click vào icon chat ở góc dưới bên phải
3. Nhập câu hỏi và nhấn Enter
4. Chatbot sẽ trả lời dựa trên thông tin trong database

## Các loại câu hỏi có thể hỏi

- **Về sản phẩm**: "Sản phẩm này giá bao nhiêu?", "Mô tả sản phẩm này"
- **Về đánh giá**: "Khách hàng đánh giá sản phẩm này như thế nào?"
- **Về đặt hàng**: "Làm thế nào để đặt hàng?"
- **Về giao hàng**: "Thời gian giao hàng là bao lâu?"
- **Về đổi trả**: "Có hỗ trợ đổi trả không?"

## Cấu trúc thư mục

```
IT-QNU-farm-main/
├── backend/
│   ├── src/
│   │   └── routes/
│   │       └── chat.routes.js      # API endpoints cho chat
│   └── prisma/
│       └── schema.prisma           # Database schema (đã thêm ChatMessage)
│
├── chatbot_service/
│   ├── main.py                     # Python FastAPI service
│   ├── generate_embeddings.py      # Script generate embeddings
│   ├── requirements.txt            # Python dependencies
│   └── chroma_db/                  # Vector database (tự động tạo)
│
└── src/
    └── components/
        └── Chatbox/
            ├── Chatbox.jsx         # React component
            └── Chatbox.css         # Styles
```

## Troubleshooting

### Lỗi: "Cannot connect to chatbot service"
- Kiểm tra Python service đang chạy tại port 8000
- Kiểm tra biến môi trường `CHATBOT_SERVICE_URL` trong backend

### Lỗi: "Collection chưa được khởi tạo"
- Chạy `python generate_embeddings.py` để tạo embeddings

### Lỗi: "Model not found"
- Model sẽ tự động download khi chạy lần đầu
- Kiểm tra kết nối internet
- Có thể mất 5-10 phút để download model

### Chatbot trả lời không chính xác
- Chạy lại `generate_embeddings.py` để cập nhật dữ liệu
- Kiểm tra xem database có đủ dữ liệu không

## Cải tiến trong tương lai

1. **Tích hợp LLM**: Sử dụng GPT-4 hoặc Claude để tạo câu trả lời tự nhiên hơn
2. **Học từ lịch sử chat**: Cải thiện độ chính xác dựa trên feedback
3. **Hỗ trợ đa ngôn ngữ**: Mở rộng sang tiếng Anh, tiếng Trung
4. **Sentiment Analysis**: Phân tích cảm xúc trong câu hỏi
5. **Admin Dashboard**: Quản lý FAQs và training data

## Tài liệu tham khảo

- [PhoBERT Paper](https://arxiv.org/abs/2003.00744)
- [ChromaDB Docs](https://docs.trychroma.com/)
- [RAG Paper](https://arxiv.org/abs/2005.11401)

