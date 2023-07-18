from utils import ServiceContextWrapper
from llama_index import (
    SimpleDirectoryReader,
    VectorStoreIndex,
)
from llama_index.node_parser import SimpleNodeParser
import yaml
import openai
import os


from dotenv import load_dotenv
load_dotenv()

openai.api_key = os.environ.get('OPENAI_API_KEY')

def read_yaml(file_path):
    with open(file_path, 'r') as f:
        return yaml.safe_load(f)

config = read_yaml('config.yaml')

def construct_index():
    service_context_wrapper = ServiceContextWrapper()
    service_context_wrapper.load_service_context()

    documents = SimpleDirectoryReader('docs/investigacion').load_data()
    parser = SimpleNodeParser()
    nodes = parser.get_nodes_from_documents(documents)

    # build index
    index = VectorStoreIndex.from_documents(documents)

    print(service_context_wrapper.get_token_usage())
    service_context_wrapper.reset_token_counts()

    index.storage_context.persist(persist_dir="storage")

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
