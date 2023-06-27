from gpt_index import GPTSimpleVectorIndex
import openai
import os

from dotenv import load_dotenv
load_dotenv()

openai.api_key = os.environ.get('OPENAI_API_KEY')

def ask(input_text):
    index = GPTSimpleVectorIndex.load_from_disk('index.json')
    query = index.query(input_text, response_mode="compact")
    query.response = query.response[1:] # The first character for some reason is always a newline
    return query.response
