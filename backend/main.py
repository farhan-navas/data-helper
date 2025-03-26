from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import numpy as np
import pandas as pd
import os

app = FastAPI()

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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

@app.post("/prompt-open-ai")
def open_ai_prompt(inputData: str = Form(...), fileName: str = Form(...)):
    file_path = os.path.join(UPLOAD_DIR, fileName)
    read_fn = get_pd_function(fileName)
    if read_fn is None:
        return {"error": "File format not supported"}
    
    df = read_fn(file_path)
    if df is None:
        return {"error": f"File {fileName} not found"}
    
    sample_rows = df.head(5).replace({np.nan: None}).to_dict(orient="records")
    system_prompt = f"""
    Imagine you are a data analytics expert. Here's some sample data from the dataset called
    {fileName}: {sample_rows}. Given the following data, answer the following question: {inputData}
    """
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": ""}
        ]
    )

    return {"response": completion.choices[0].message.content.strip()}


