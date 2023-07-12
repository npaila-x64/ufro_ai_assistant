import tiktoken
from llama_index import (
    SimpleDirectoryReader,
    VectorStoreIndex,
    ServiceContext,
    LLMPredictor,
    set_global_service_context
)
from llama_index.callbacks import (
    CallbackManager, 
    TokenCountingHandler
)
from llama_index.node_parser import SimpleNodeParser
from langchain.chat_models import ChatOpenAI
import openai
import os

from dotenv import load_dotenv
load_dotenv()

openai.api_key = os.environ.get('OPENAI_API_KEY')

def construct_index():
    max_tokens = 512

    documents = SimpleDirectoryReader('docs').load_data()

    parser = SimpleNodeParser()

    nodes = parser.get_nodes_from_documents(documents)

    # setup callback manager to monitor token usage
    token_counter = TokenCountingHandler(
        tokenizer=tiktoken.encoding_for_model("gpt-3.5-turbo").encode
    )
    callback_manager = CallbackManager([token_counter])

    # define LLM
    llm_predictor = LLMPredictor(llm=ChatOpenAI(temperature=0.5, model_name="gpt-3.5-turbo", max_tokens=max_tokens))

    # configure service context
    service_context = ServiceContext.from_defaults(
        llm_predictor=llm_predictor, 
        callback_manager=callback_manager
    )

    # set the current service as the global service
    # this will be the service used if not explicitly specified
    set_global_service_context(service_context)

    # build index
    index = VectorStoreIndex.from_documents(documents)

    print('Embedding Tokens: ', token_counter.total_embedding_token_count, '\n',
      'LLM Prompt Tokens: ', token_counter.prompt_llm_token_count, '\n',
      'LLM Completion Tokens: ', token_counter.completion_llm_token_count, '\n',
      'Total LLM Token Count: ', token_counter.total_llm_token_count, '\n')
    token_counter.reset_counts()

    index.storage_context.persist(persist_dir="persist")

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
