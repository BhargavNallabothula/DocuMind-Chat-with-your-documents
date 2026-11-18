from langchain_openai import OpenAIEmbeddings
from services.embed_service import get_embed_function
from langchain_chroma import Chroma

CHROMA_DB_PATH="chromadb"
COLLECTION_NAME="chat_with_files_db"

def get_vector_db():
    embeddings=get_embed_function()
    vector_db=Chroma(collection_name=COLLECTION_NAME,persist_directory=CHROMA_DB_PATH,embedding_function=embeddings)
    return vector_db
