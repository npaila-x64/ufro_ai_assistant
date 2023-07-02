from llama_index import SimpleDirectoryReader, VectorStoreIndex, LLMPredictor, ServiceContext
from llama_index.node_parser import SimpleNodeParser
from langchain.chat_models import ChatOpenAI
import openai
import os

from dotenv import load_dotenv
load_dotenv()

openai.api_key = os.environ.get('OPENAI_API_KEY')

def construct_index():
    max_tokens = 512

    documents = SimpleDirectoryReader('query_service/docs').load_data()

    parser = SimpleNodeParser()

    nodes = parser.get_nodes_from_documents(documents)

    # define LLM
    llm_predictor = LLMPredictor(llm=ChatOpenAI(temperature=0.5, model_name="gpt-3.5-turbo", max_tokens=max_tokens))

    # configure service context
    service_context = ServiceContext.from_defaults(llm_predictor=llm_predictor)

    # build index
    index = VectorStoreIndex.from_documents(
        documents, service_context=service_context
    )

    index.storage_context.persist(persist_dir="query_service/persist")

    return index

if __name__ == '__main__':
    print('creating index...')
    index = construct_index()
    print('index created')
    query_engine = index.as_query_engine()
    query = 'Donde queda la universidad?'
    print("testing with query: " + query)
    response = query_engine.query(query)
    print(str(response))
