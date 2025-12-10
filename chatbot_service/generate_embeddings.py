"""
Script để generate embeddings từ database và lưu vào ChromaDB
Lấy dữ liệu từ: Products, Reviews, FAQs, Comments
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

import chromadb
import pymysql
from dotenv import load_dotenv
import json

# Import embedding function
from sentence_transformers import SentenceTransformer
import torch
from transformers import AutoModel, AutoTokenizer

load_dotenv()

# Khởi tạo embedding model
print("Đang tải model embedding...")
try:
    model_name = "keepitreal/vietnamese-sbert"
    embedding_model = SentenceTransformer(model_name)
    print(f"Đã tải model: {model_name}")
except Exception as e:
    print(f"Lỗi khi tải model: {e}")
    print("Đang thử dùng model dự phòng...")
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

collection_name = "ecommerce_knowledge"
collection = chroma_client.get_or_create_collection(
    name=collection_name,
    metadata={"hnsw:space": "cosine"}
)

def get_embedding(text: str):
    """Tạo embedding từ text sử dụng PhoBERT"""
    if embedding_model:
        embedding = embedding_model.encode(text, convert_to_numpy=True)
        return embedding.tolist()
    else:
        inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=256)
        with torch.no_grad():
            outputs = phobert_model(**inputs)
        embedding = outputs.last_hidden_state.mean(dim=1).squeeze().numpy()
        return embedding.tolist()

def get_db_connection():
    """Kết nối với MySQL database"""
    # Parse DATABASE_URL hoặc dùng các biến môi trường riêng
    db_url = os.getenv("DATABASE_URL", "")
    if db_url.startswith("mysql://"):
        # Parse connection string
        # Format: mysql://user:password@host:port/database
        pass
    
    # Hoặc dùng các biến môi trường riêng
    return pymysql.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "qnu_farm"),
        charset='utf8mb4'
    )

def fetch_products(conn):
    """Lấy tất cả products từ database"""
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute("""
        SELECT 
            id, 
            productName, 
            shortDesc, 
            description, 
            price,
            categoryId
        FROM products
    """)
    return cursor.fetchall()

def fetch_reviews(conn):
    """Lấy tất cả reviews từ database"""
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute("""
        SELECT 
            id, 
            productId, 
            text, 
            rating,
            userName
        FROM Review
    """)
    return cursor.fetchall()

def fetch_comments(conn):
    """Lấy tất cả comments từ database"""
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute("""
        SELECT 
            id, 
            productId, 
            text
        FROM Comment
    """)
    return cursor.fetchall()

def create_faq_documents():
    """Tạo FAQ documents mẫu"""
    faqs = [
        {
            "question": "Làm thế nào để đặt hàng?",
            "answer": "Bạn có thể đặt hàng bằng cách thêm sản phẩm vào giỏ hàng và tiến hành thanh toán. Chúng tôi hỗ trợ thanh toán COD và VNPay."
        },
        {
            "question": "Thời gian giao hàng là bao lâu?",
            "answer": "Thời gian giao hàng thường từ 3-5 ngày làm việc tùy thuộc vào địa chỉ của bạn."
        },
        {
            "question": "Có hỗ trợ đổi trả không?",
            "answer": "Có, chúng tôi hỗ trợ đổi trả trong vòng 7 ngày kể từ khi nhận hàng nếu sản phẩm còn nguyên vẹn."
        },
        {
            "question": "Làm sao để theo dõi đơn hàng?",
            "answer": "Bạn có thể theo dõi đơn hàng trong phần 'Đơn hàng' của tài khoản hoặc liên hệ hotline để được hỗ trợ."
        },
        {
            "question": "Có miễn phí vận chuyển không?",
            "answer": "Chúng tôi có chương trình miễn phí vận chuyển cho đơn hàng trên 500.000 VNĐ."
        }
    ]
    return faqs

def generate_embeddings():
    """Generate embeddings từ tất cả nguồn dữ liệu"""
    print("Đang kết nối database...")
    conn = get_db_connection()
    
    documents = []
    metadatas = []
    ids = []
    
    # 1. Products
    print("Đang lấy dữ liệu sản phẩm...")
    products = fetch_products(conn)
    for product in products:
        # Tạo text từ product info
        text_parts = [f"Sản phẩm: {product['productName']}"]
        if product['shortDesc']:
            text_parts.append(f"Mô tả ngắn: {product['shortDesc']}")
        if product['description']:
            text_parts.append(f"Mô tả chi tiết: {product['description']}")
        if product['price']:
            text_parts.append(f"Giá: {product['price']} VNĐ")
        
        text = " | ".join(text_parts)
        documents.append(text)
        metadatas.append({
            "type": "product",
            "product_id": product['id'],
            "product_name": product['productName'],
            "price": str(product['price']) if product['price'] else None,
            "category_id": product['categoryId']
        })
        ids.append(f"product_{product['id']}")
    
    # 2. Reviews
    print("Đang lấy dữ liệu đánh giá...")
    reviews = fetch_reviews(conn)
    for review in reviews:
        text = f"Đánh giá về sản phẩm: {review['text']} | Đánh giá: {review['rating']}/5 sao | Người đánh giá: {review['userName']}"
        documents.append(text)
        metadatas.append({
            "type": "review",
            "review_id": review['id'],
            "product_id": review['productId'],
            "rating": review['rating'],
            "user_name": review['userName']
        })
        ids.append(f"review_{review['id']}")
    
    # 3. Comments
    print("Đang lấy dữ liệu bình luận...")
    comments = fetch_comments(conn)
    for comment in comments:
        text = f"Bình luận: {comment['text']}"
        documents.append(text)
        metadatas.append({
            "type": "comment",
            "comment_id": comment['id'],
            "product_id": comment['productId']
        })
        ids.append(f"comment_{comment['id']}")
    
    # 4. FAQs
    print("Đang tạo FAQ...")
    faqs = create_faq_documents()
    for i, faq in enumerate(faqs):
        text = f"Câu hỏi: {faq['question']} | Trả lời: {faq['answer']}"
        documents.append(text)
        metadatas.append({
            "type": "faq",
            "question": faq['question']
        })
        ids.append(f"faq_{i}")
    
    conn.close()
    
    print(f"\nTổng số documents: {len(documents)}")
    print(f"- Products: {len(products)}")
    print(f"- Reviews: {len(reviews)}")
    print(f"- Comments: {len(comments)}")
    print(f"- FAQs: {len(faqs)}")
    
    # Generate embeddings và thêm vào ChromaDB
    print("\nĐang tạo embeddings...")
    
    # Chia nhỏ để tránh quá tải
    batch_size = 50
    for i in range(0, len(documents), batch_size):
        batch_docs = documents[i:i+batch_size]
        batch_metas = metadatas[i:i+batch_size]
        batch_ids = ids[i:i+batch_size]
        
        print(f"Đang xử lý batch {i//batch_size + 1}/{(len(documents)-1)//batch_size + 1}...")
        
        embeddings = []
        for doc in batch_docs:
            embedding = get_embedding(doc)
            embeddings.append(embedding)
        
        collection.add(
            embeddings=embeddings,
            documents=batch_docs,
            metadatas=batch_metas,
            ids=batch_ids
        )
    
    print(f"\n✅ Đã thêm {len(documents)} documents vào vector database!")
    print(f"Collection có tổng cộng {collection.count()} documents")

if __name__ == "__main__":
    generate_embeddings()

