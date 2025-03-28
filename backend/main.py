from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pandasai.llm.openai import OpenAI
from pandasai import SmartDataframe, Agent
import matplotlib
matplotlib.use("Agg")

import matplotlib.pyplot as plt
import os
from pandasai.responses.response_serializer import ResponseSerializer

original_serialize = ResponseSerializer.serialize

def custom_serialize(result):
    if result.get("type") == "plot":
        filepath = result.get("value")
        # If the file doesn't exist, force-save the current figure to that location.
        if not os.path.exists(filepath):
            fig = plt.gcf()
            # Optional: print a debug message.
            print(f"File {filepath} not found. Saving current figure to that path.")
            fig.savefig(filepath)
    return original_serialize(result)

ResponseSerializer.serialize = custom_serialize

from dotenv import load_dotenv
import numpy as np
import pandas as pd
import os

app = FastAPI()

load_dotenv()
llm = OpenAI(api_key=os.getenv("OPENAI_API_KEY"), model="gpt-3.5-turbo")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)
# Use the desired charts directory (here: exports/charts)
CHARTS_DIR = "exports/charts"
os.makedirs(CHARTS_DIR, exist_ok=True)

app.state.filename = []
app.state.prompt_history = []

def get_pd_function(filename: str):
    ext = filename.split(".")[-1]
    if ext == "csv":
        return pd.read_csv
    elif ext in ["xlsx", "xls"]:
        return pd.read_excel
    else:
        return None

@app.post("/upload")
async def upload_file(file: UploadFile):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())
    read_fn = get_pd_function(file.filename)
    if read_fn is None:
        return {"error": "File format not supported"}
    df = read_fn(file_path)
    app.state.filename.append(file.filename)
    return {"filename": file.filename, "shape": df.shape, "columns": df.columns.tolist()}

@app.get("/get-files")
def get_filenames():
    return app.state.filename

@app.post("/query-n-rows")
def get_top_rows(query: int = Form(...), fileName: str = Form(...)):
    file_path = os.path.join(UPLOAD_DIR, fileName)
    read_fn = get_pd_function(fileName)
    if read_fn is None:
        return {"error": "File format not supported"}
    df = read_fn(file_path)
    if df is None:
        return {"error": f"File {fileName} not found"}
    cleaned = df.head(int(query)).replace({np.nan: None})
    return cleaned.to_dict(orient="records")

@app.get("/get-prompt-history")
def get_prompt_history():
    return app.state.prompt_history

@app.delete("/delete-prompt-history")
def delete_prompt_history():
    app.state.prompt_history = []
    return {"response": "Prompt history deleted"}

@app.post("/prompt-open-ai")
def open_ai_prompt(prompt: str = Form(...), fileName: str = Form(...)):
    file_path = os.path.join(UPLOAD_DIR, fileName)
    read_fn = get_pd_function(fileName)
    if read_fn is None:
        return {"error": "File format not supported"}
    df = read_fn(file_path)
    if df is None:
        return {"error": f"File {fileName} not found"}
    
    chart_path = os.path.join(os.getcwd(), CHARTS_DIR)
    df_copy = df.copy()

    # smart_df = SmartDataframe(df_copy, name=fileName, config={
    #     "llm": llm,
    #     "cache": True,
    #     "save_charts": True,           
    #     "save_charts_path": chart_path
    # })

    smart_df = Agent(df_copy, config={
        "llm": llm,
        "cache": True,
        "save_charts": True,           
        "save_charts_path": chart_path
    })

    try:
        response = smart_df.chat(prompt)
        print(f"Response is: {response}")
        convo_entry = {"file": fileName, "question": prompt, "response": response}
        app.state.prompt_history.append(convo_entry)

        # if isinstance(response, dict):
        #     print(f"Response type: {response.get('type')}")
        #     response_type = response.get("type")
        #     value = response.get("value")
        #     if response_type == "plot":
        #         currname = os.path.basename(value)
        #         return {
        #             "type": "plot",
        #             "image_url": f"/exports/charts/{currname}"
        #         }
        #     elif response_type == "dataframe":
        #         return {
        #             "type": "dataframe",
        #             "value": value.to_dict(orient="records")
        #         }
        #     else:
        #         return {
        #             "type": response_type,
        #             "value": value
        #         }
        
        print("in here")
        return {
            "type": "string",
            "value": str(response)
        }
    except Exception as e:
        return {"error": str(e)}
