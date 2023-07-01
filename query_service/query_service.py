from gpt_index import GPTSimpleVectorIndex
from .ai_models import dummyai, openai
from pydantic import BaseModel
from fastapi import FastAPI

IS_AI_DUMMY = False # Change between the dummy ai model and the actual openai API

index = any
if not IS_AI_DUMMY:
    print('Loading index...')
    index = GPTSimpleVectorIndex.load_from_disk('index.json')
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
async def query_ai_response(query: Query):
    response = (dummyai if IS_AI_DUMMY else openai).ask(query.message, index)
    return {"data": response}

# TODO log each interaction 
