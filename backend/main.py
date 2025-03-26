from fastapi import FastAPI, UploadFile, Form
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

app.state.filename = []

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

@app.get("/get-filename")
def get_filenames():
    return app.state.filename

@app.post("/query-n-rows")
def get_top_rows(query: int = Form(...)):
    filename = app.state.filename[0]
    print(app.state.filename, filename)
    print(f"filename: {filename}")
    if filename is None:
        return {"error": "No file uploaded"}
    file_path = os.path.join(UPLOAD_DIR, filename)
    read_fn = get_pd_function(filename)
    if read_fn is None:
        return {"error": "File format not supported"}
    df = read_fn(file_path)
    if df is None:
        return {"error": f"File {filename} not found"}
    return df.head(int(query)).to_dict(orient="records")

