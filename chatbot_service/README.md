# Chatbot Service với PhoBERT và RAG

## Mô tả

Service Python sử dụng PhoBERT để tạo embeddings cho nội dung tiếng Việt và ChromaDB để lưu trữ vector database, phục vụ tìm kiếm ngữ nghĩa và RAG (Retrieval-Augmented Generation).

## Cài đặt

1. Cài đặt Python dependencies:
```bash
cd chatbot_service
pip install -r requirements.txt
```

2. Tạo file `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=qnu_farm
```

## Chạy service

```bash
python main.py
```

Service sẽ chạy tại `http://localhost:8000`

## API Endpoints

### 1. POST /chat
Gửi message và nhận response từ chatbot

**Request:**
```json
{
  "message": "Sản phẩm này giá bao nhiêu?",
  "user_id": "user123",
  "conversation_id": "conv456"
}
```

**Response:**
```json
{
  "response": "Sản phẩm này có giá 500.000 VNĐ...",
  "sources": [...],
  "conversation_id": "conv456"
}
```

### 2. POST /embed
Tạo embedding cho một đoạn text

**Request:**
```json
{
  "text": "Sản phẩm chất lượng cao"
}
```

### 3. POST /add-documents
Thêm documents vào vector database

### 4. POST /query
Tìm kiếm documents tương tự

### 5. GET /collection-info
Lấy thông tin về collection

## Generate Embeddings

Chạy script để generate embeddings từ database:

```bash
python generate_embeddings.py
```

Script này sẽ:
- Lấy tất cả products từ database
- Lấy tất cả reviews và comments
- Tạo FAQ documents
- Generate embeddings và lưu vào ChromaDB

## Kiến trúc

1. **PhoBERT Embeddings**: Sử dụng model `keepitreal/vietnamese-sbert` hoặc `vinai/phobert-base-v2` để tạo embeddings cho tiếng Việt
2. **ChromaDB**: Vector database để lưu trữ và tìm kiếm embeddings
3. **RAG Pipeline**: 
   - Query embedding → Tìm kiếm trong vector DB → Lấy context → Tạo response

