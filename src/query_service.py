from fastapi import FastAPI
from pydantic import BaseModel
import src.dummy_ai
import src.chatgpt

from gpt_index import GPTSimpleVectorIndex
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
    response = src.chatgpt.ask(query.message, index)
    return {"data": response}

# TODO log each interaction 
