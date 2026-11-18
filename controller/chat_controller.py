from fastapi import APIRouter
from models.chat_request import chatRequest
from models.chat_response import chatResponse
from services.chat_service import chatService

chat_router=APIRouter(prefix="/chat")

chat_service=chatService()

@chat_router.post("")
def chat_with_documents(request:chatRequest):
    response=chat_service.chat(request)
    return response
    #return chatResponse(ai_response="uploaded file was scanned successfully"+request.user_message)