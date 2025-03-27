from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pandasai.llm.openai import OpenAI
from pandasai import SmartDataframe

from dotenv import load_dotenv
import numpy as np
import pandas as pd
import os

app = FastAPI()

load_dotenv()
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")
llm = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app.add_middleware(
    CORSMiddleware,
    # allow_origins=["*"],
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR="uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.state.filename = []
app.state.prompt_history = []

class inputData(BaseModel):
    filename: str
    question: str

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
    
    df = read_fn(file_path)
    if df is None:
        return {"error": f"File {fileName} not found"}
    
    smart_df = SmartDataframe(df, name=fileName, config={"llm": llm})

    try:
        response = smart_df.chat(prompt)
        convo_entry = {"file": fileName, "question": prompt, "response": str(response)}
        app.state.prompt_history.append(convo_entry)
        return {"response": str(response)}
    except Exception as e:
        return {"error": str(e)}
