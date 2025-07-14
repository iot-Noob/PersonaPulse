from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

texts = ["LangChain is great!", "ChromaDB stores vectors locally."]

embedding = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

db = Chroma.from_texts(texts, embedding=embedding, persist_directory="./chroma_db")

results = db.similarity_search("What is LangChain?", k=1)
print(results[0].page_content)
