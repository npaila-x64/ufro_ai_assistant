from llama_index import StorageContext, load_index_from_storage
from llama_index import LLMPredictor, ServiceContext
from langchain.chat_models import ChatOpenAI
from ai_models import dummyai, openai
from pydantic import BaseModel
from fastapi import FastAPI

IS_AI_DUMMY = True # Change between the dummy ai model and the actual openai API

index = any
if not IS_AI_DUMMY:
    print('Loading index...')
    max_tokens = 512

    # define LLM
    llm_predictor = LLMPredictor(llm=ChatOpenAI(temperature=0.5, model_name="gpt-3.5-turbo", max_tokens=max_tokens))

    # rebuild storage context
    storage_context = StorageContext.from_defaults(persist_dir="persist")

    # configure service context
    service_context = ServiceContext.from_defaults(llm_predictor=llm_predictor)

    # load index
    index = load_index_from_storage(
        storage_context=storage_context,
        service_context=service_context
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
