from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pandasai.llm.openai import OpenAI
from pandasai.responses.response_parser import ResponseParser
from pandasai import Agent, SmartDataframe
import matplotlib
matplotlib.use("Agg")

import matplotlib.pyplot as plt
from dotenv import load_dotenv
import numpy as np
import pandas as pd
import os

app = FastAPI()

load_dotenv()
llm = OpenAI(api_key=os.getenv("OPENAI_API_KEY"), model="gpt-3.5-turbo")

app.add_middleware(
    CORSMiddleware,
    # allow_origins=["*"],
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

UPLOAD_DIR="uploaded_files"
CHARTS_DIR = "static"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(CHARTS_DIR, exist_ok=True)

app.state.filename = []
app.state.prompt_history = []

# class CustomResponseParser(ResponseParser):
#     def __init__(self, context):
#         super().__init__(context)

#     def format_plot(self, result):
#         return {"type": "plot", "value": result}

#     def format_string(self, result):
#         return {"type": "string", "value": result}
    
#     def format_dataframe(self, result):
#         return {"type": "dataframe", "value": result.to_dict(orient="records")}


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
    
    # handle NaN values in the df
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
    
    df = read_fn(file_path).replace({np.nan: None})
    if df is None:
        return {"error": f"File {fileName} not found"}

    # agent = Agent(df, config={
    #     "llm": llm, 
    #     "cache": True,
    #     "save_charts": True,
    #     "save_charts_path": CHARTS_DIR,
    #     # "response_parser": CustomResponseParser,
    #     },
    # )

    agent = SmartDataframe(df, config={
        "llm": llm, 
        "cache": True,
        "save_charts": True,
        "save_charts_path": CHARTS_DIR,
        # "response_parser": CustomResponseParser,
    })

    try:
        response = agent.chat(prompt) 

        if isinstance(response, dict) and "type" in response and "value" in response:
            res_type = response["type"]
            value = response["value"]

            if res_type == "plot":
                image_url = f"/static/{os.path.relpath(value, 'static')}"
                convo_entry = {
                    "file": fileName,
                    "question": prompt,
                    "type": "plot",
                    "response": image_url
                }
            elif res_type == "dataframe":
                convo_entry = {
                    "file": fileName,
                    "question": prompt,
                    "type": "dataframe",
                    "response": value
                }
            else:
                convo_entry = {
                    "file": fileName,
                    "question": prompt,
                    "type": res_type,
                    "response": value
                }

        else:
            # fallback: response is plain string or not typed
            convo_entry = {
                "file": fileName,
                "question": prompt,
                "type": "string",
                "response": str(response)
            }

        app.state.prompt_history.append(convo_entry)
        return convo_entry
            
    except Exception as e:
        return {"error": str(e)}
