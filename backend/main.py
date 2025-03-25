from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import os

app = FastAPI()

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

class inputData(BaseModel):
    filename: str
    question: str

@app.post("/upload")
async def upload_file(file: UploadFile):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())
    ext = file.filename.split(".")[-1]
    if ext == "csv":
        df = pd.read_csv(file_path)
    elif ext in ["xlsx", "xls"]:
        df = pd.read_excel(file_path)
    else:
        return {"error": "File format not supported"}

    return {"filename": file.filename, "shape": df.shape, "columns": df.columns.tolist()}

@app.post("/query-top-rows")
def get_top_rows(filename: str, n: int):
    file_path = os.path.join(UPLOAD_DIR, filename)
    df = pd.read_csv(file_path)
    if df is None:
        return {"error": f"File {filename} not found"}
    return df.head(n).to_dict(orient="records")

