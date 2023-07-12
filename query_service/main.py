from utils import ServiceContextWrapper
from llama_index import (
    StorageContext,
    load_index_from_storage,
)
from ai_models import dummyai, openai
from pydantic import BaseModel
from fastapi import FastAPI

IS_AI_DUMMY = False # Change between the dummy ai model and the actual openai API

index = any
if not IS_AI_DUMMY:
    print('Loading index...')
    
    service_context_wrapper = ServiceContextWrapper()
    service_context_wrapper.load_service_context()

    # rebuild storage context
    storage_context = StorageContext.from_defaults(persist_dir="persist")

    # load index
    index = load_index_from_storage(
        storage_context=storage_context,
    )
    print('Index was loaded')

app = FastAPI()

# Could be used as dashboard
@app.get("/")
def read_root():
    return {"Hello": "World"}

# Dataclass for each user query
class Query(BaseModel):
    message: str

# Output an AI response
@app.post("/ai_output")
async def query_ai_response(response: Query):
    print("Input text: " + response.message)
    response = (dummyai if IS_AI_DUMMY else openai).ask(response.message, index)
    print("Response: " + str(response)) # TODO MUST log this response
    if not IS_AI_DUMMY:
        print(response.get_formatted_sources())
    return {"data": str(response)}
