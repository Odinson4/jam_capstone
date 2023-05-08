import os
import openai

os.environment["OPENAI_API_KEY"] = "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"
openai.api_key = os.environ["OPENAI_API_KEY"]

response = openai.Completion.create(
    engine="text-davinci-003",
    prompt="This is a test",
    temperature=0.5,
    max_tokens=100,
    top_p=1.0,
    frequency_penalty=0.0,
    presence_penalty=0.0,
    stop=["\n"]
)


print(response)
