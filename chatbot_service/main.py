"""
Chatbot Service với PhoBERT Embeddings và RAG
Sử dụng PhoBERT để tạo embeddings và ChromaDB để lưu trữ vector
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import chromadb
import torch
from transformers import AutoModel, AutoTokenizer
import numpy as np
from sentence_transformers import SentenceTransformer
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Chatbot Service with PhoBERT")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Khởi tạo PhoBERT model
print("Đang tải PhoBERT model...")
try:
    # Sử dụng sentence-transformers với model PhoBERT
    # Model: vinai/phobert-base-v2 hoặc keepitreal/vietnamese-sbert
    model_name = "keepitreal/vietnamese-sbert"  # Model đã được fine-tune cho sentence embeddings
    embedding_model = SentenceTransformer(model_name)
    print(f"Đã tải model: {model_name}")
except Exception as e:
    print(f"Lỗi khi tải model: {e}")
    print("Đang thử dùng model dự phòng...")
    # Fallback: sử dụng PhoBERT base và tự tạo embeddings
    try:
        tokenizer = AutoTokenizer.from_pretrained("vinai/phobert-base-v2")
        phobert_model = AutoModel.from_pretrained("vinai/phobert-base-v2")
        embedding_model = None
        print("Đã tải PhoBERT base model")
    except Exception as e2:
        print(f"Lỗi khi tải model dự phòng: {e2}")
        raise

# Khởi tạo ChromaDB với cấu hình mới
chroma_client = chromadb.PersistentClient(path="./chroma_db")

# Tạo collection cho embeddings
collection_name = "ecommerce_knowledge"
try:
    collection = chroma_client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"}
    )
    print(f"Đã kết nối với collection: {collection_name}")
except Exception as e:
    print(f"Lỗi khi tạo collection: {e}")
    collection = None

# Request/Response models
class EmbeddingRequest(BaseModel):
    text: str

class EmbeddingResponse(BaseModel):
    embedding: List[float]

class AddDocumentRequest(BaseModel):
    documents: List[str]
    metadatas: Optional[List[dict]] = None
    ids: Optional[List[str]] = None

class QueryRequest(BaseModel):
    query: str
    n_results: int = 5

class QueryResponse(BaseModel):
    results: List[dict]
    query_embedding: Optional[List[float]] = None

class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    sources: List[dict]
    conversation_id: str

def get_embedding(text: str) -> List[float]:
    """Tạo embedding từ text sử dụng PhoBERT"""
    if embedding_model:
        # Sử dụng sentence-transformers
        embedding = embedding_model.encode(text, convert_to_numpy=True)
        return embedding.tolist()
    else:
        # Sử dụng PhoBERT base model
        inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=256)
        with torch.no_grad():
            outputs = phobert_model(**inputs)
        # Lấy embedding từ [CLS] token (mean pooling)
        embedding = outputs.last_hidden_state.mean(dim=1).squeeze().numpy()
        return embedding.tolist()

@app.get("/")
def root():
    return {"message": "Chatbot Service với PhoBERT đang chạy", "status": "ok"}

@app.post("/embed", response_model=EmbeddingResponse)
def create_embedding(request: EmbeddingRequest):
    """Tạo embedding cho một đoạn text"""
    try:
        embedding = get_embedding(request.text)
        return EmbeddingResponse(embedding=embedding)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/add-documents")
def add_documents(request: AddDocumentRequest):
    """Thêm documents vào vector database"""
    if not collection:
        raise HTTPException(status_code=500, detail="Collection chưa được khởi tạo")
    
    try:
        # Tạo embeddings cho tất cả documents
        embeddings = [get_embedding(doc) for doc in request.documents]
        
        # Tạo IDs nếu chưa có
        ids = request.ids or [f"doc_{i}" for i in range(len(request.documents))]
        
        # Thêm vào collection
        collection.add(
            embeddings=embeddings,
            documents=request.documents,
            metadatas=request.metadatas or [{}] * len(request.documents),
            ids=ids
        )
        
        return {"message": f"Đã thêm {len(request.documents)} documents", "count": len(request.documents)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query", response_model=QueryResponse)
def query_documents(request: QueryRequest):
    """Tìm kiếm documents tương tự"""
    if not collection:
        raise HTTPException(status_code=500, detail="Collection chưa được khởi tạo")
    
    try:
        query_embedding = get_embedding(request.query)
        
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=request.n_results
        )
        
        # Format kết quả
        formatted_results = []
        if results['documents'] and len(results['documents'][0]) > 0:
            for i in range(len(results['documents'][0])):
                formatted_results.append({
                    "document": results['documents'][0][i],
                    "metadata": results['metadatas'][0][i] if results['metadatas'] else {},
                    "distance": results['distances'][0][i] if results['distances'] else None,
                    "id": results['ids'][0][i] if results['ids'] else None
                })
        
        return QueryResponse(
            results=formatted_results,
            query_embedding=query_embedding
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """Chat với RAG - Retrieval Augmented Generation"""
    if not collection:
        raise HTTPException(status_code=500, detail="Collection chưa được khởi tạo")
    
    try:
        # Tìm kiếm documents liên quan
        query_embedding = get_embedding(request.message)
        
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=3
        )
        
        # Lấy context từ kết quả tìm kiếm
        context_docs = []
        if results['documents'] and len(results['documents'][0]) > 0:
            for i, doc in enumerate(results['documents'][0]):
                context_docs.append({
                    "text": doc,
                    "metadata": results['metadatas'][0][i] if results['metadatas'] else {},
                    "relevance": 1 - results['distances'][0][i] if results['distances'] else 0
                })
        
        # Tạo response dựa trên context
        if context_docs:
            # Kết hợp context để tạo response
            context_text = "\n".join([f"- {doc['text']}" for doc in context_docs[:3]])
            
            # Tạo prompt cho RAG
            prompt = f"""Dựa trên thông tin sau, hãy trả lời câu hỏi của khách hàng một cách thân thiện và hữu ích.

Thông tin liên quan:
{context_text}

Câu hỏi: {request.message}

Trả lời:"""
            
            # Đơn giản hóa: trả lời dựa trên context (có thể tích hợp LLM sau)
            if any(keyword in request.message.lower() for keyword in ['giá', 'price', 'cost', 'bao nhiêu']):
                # Tìm thông tin về giá
                response = "Dựa trên thông tin sản phẩm, "
                for doc in context_docs:
                    if 'price' in doc['metadata'] or 'giá' in doc['text'].lower():
                        response += doc['text']
                        break
                if response == "Dựa trên thông tin sản phẩm, ":
                    response += "vui lòng xem chi tiết giá trên trang sản phẩm."
            elif any(keyword in request.message.lower() for keyword in ['mô tả', 'description', 'thông tin', 'info']):
                response = context_docs[0]['text'] if context_docs else "Xin lỗi, tôi chưa có thông tin về điều này."
            elif any(keyword in request.message.lower() for keyword in ['có', 'available', 'còn hàng', 'stock']):
                response = "Sản phẩm hiện đang có sẵn. Bạn có thể đặt hàng ngay bây giờ!"
            else:
                # Trả lời chung dựa trên context
                response = context_docs[0]['text'] if context_docs else "Xin lỗi, tôi chưa hiểu câu hỏi của bạn. Vui lòng hỏi lại."
        else:
            response = "Xin lỗi, tôi không tìm thấy thông tin liên quan đến câu hỏi của bạn. Vui lòng thử lại với câu hỏi khác hoặc liên hệ bộ phận hỗ trợ."
        
        return ChatResponse(
            response=response,
            sources=context_docs,
            conversation_id=request.conversation_id or "default"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/collection-info")
def get_collection_info():
    """Lấy thông tin về collection"""
    if not collection:
        return {"error": "Collection chưa được khởi tạo"}
    
    try:
        count = collection.count()
        return {
            "collection_name": collection_name,
            "document_count": count,
            "status": "active"
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

