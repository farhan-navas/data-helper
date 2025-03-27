from pandasai.llm.openai import OpenAI
from pandasai import SmartDataframe
import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()

df = pd.DataFrame({
    "Name": ["Alice", "Bob", "Charlie"],
    "Age": [25, 30, 35],
})

llm = OpenAI(api_key=os.getenv("OPENAI_API_KEY"), model="gpt-3.5-turbo")
smart_df = SmartDataframe(df, config={"llm": llm, "cache": False})

response = smart_df.chat("What is the average age?")
print(response)
