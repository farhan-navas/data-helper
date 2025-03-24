from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR="uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

DATA = {}

class inputData(BaseModel):
    filename: str
    question: str

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())
    df = pd.read_csv(file_path)
    DATA[file.filename] = df
    return {"filename": file.filename, "shape": df.shape, "columns": df.columns.tolist()}

@app.post("/query-top-rows")
def get_top_rows(filename: str, n: int):
    df = DATA.get(filename)
    if df is None:
        return {"error": f"File {filename} not found"}
    return df.head(n).to_dict(orient="records")

