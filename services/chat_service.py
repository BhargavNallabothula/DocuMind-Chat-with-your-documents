from models.chat_request import chatRequest
from services.rag_service import get_vector_db
from services.prompt_service import get_final_prompt
from services.openai_clent import ask_openai
from langchain_chroma import Chroma

class chatService:

    def chat(self,request:chatRequest):

        vector_db=get_vector_db()  

        #vector_db=get_pinecone_store()

        relevant_docs=vector_db.similarity_search(query=request.user_message,k=3)

        if not  relevant_docs:
            return "no relevant data found in knowledge base"

        rag_data=[]
        for doc in relevant_docs:
            rag_data.append(doc.page_content)

        prompt=get_final_prompt(rag_data,request.user_message)

        response=ask_openai(prompt)
        return response.content


        





        