import openai
import os

from dotenv import load_dotenv
load_dotenv()

openai.api_key = os.environ.get('OPENAI_API_KEY')

def ask(input_text, index):
    query_engine = index.as_query_engine()
    response = query_engine.query(input_text)
    return response