from fastapi import FastAPI
from pydantic import BaseModel
import src.dummy_ai
import src.chatgpt

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
    response = src.dummy_ai.ask(query.message)
    return {"data": response}

# TODO log each interaction 
