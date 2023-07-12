import tiktoken
from llama_index import (
    ServiceContext,
    LLMPredictor,
    set_global_service_context
)
from llama_index.callbacks import (
    CallbackManager, 
    TokenCountingHandler
)
from langchain.chat_models import ChatOpenAI
import yaml

def read_yaml(file_path):
    with open(file_path, 'r') as f:
        return yaml.safe_load(f)

config = read_yaml('config.yaml')

# Class used to load a ServiceContext instance with predefined configurations
class ServiceContextWrapper:
    def __init__(self) -> None:
        self.token_counter = TokenCountingHandler()
        self.service_context = ServiceContext.from_defaults()

    def load_service_context(self):
        # setup callback manager to monitor token usage
        self.token_counter = TokenCountingHandler(
            tokenizer=tiktoken.encoding_for_model(config['model_name']).encode
        )
        callback_manager = CallbackManager([self.token_counter])

        # define LLM
        llm_predictor = LLMPredictor(llm=ChatOpenAI(temperature=config['temperature'], model_name=config['model_name'], max_tokens=config['max_tokens']))

        # configure service context
        service_context = ServiceContext.from_defaults(
            llm_predictor=llm_predictor, 
            callback_manager=callback_manager
        )

        # set the current service as the global service
        # this will be the service used if not explicitly specified
        set_global_service_context(service_context)

    def get_service_context(self):
        return self.service_context

    def get_token_counter(self):
        return self.token_counter
    
    def get_token_usage(self):
        return ('Embedding Tokens: ', self.token_counter.total_embedding_token_count, '\n',
        'LLM Prompt Tokens: ', self.token_counter.prompt_llm_token_count, '\n',
        'LLM Completion Tokens: ', self.token_counter.completion_llm_token_count, '\n',
        'Total LLM Token Count: ', self.token_counter.total_llm_token_count, '\n')

    def reset_token_counts(self):
        self.token_counter.reset_counts()