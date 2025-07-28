from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import json

# 외부 함수 임포트
from function.PDFFunction import convertPDFtoJPG
from function.OCRFunction import runOCR , ocrMapping
from function.APIFunction import convertToJSON

app = FastAPI()

# CORS 허용 (필요 시 프론트 연결을 위해 사용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프론트 URL로 제한 가능
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 파일업로드 요청을 받는 post 함수
@app.post("/ocr")
async def process_file(file: UploadFile = File(...)):
    CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(CURRENT_DIR , "output")

    output_path = os.path.join(output_dir, file.filename)
    output_path = os.path.abspath(output_path)

    # 업로드된 파일 저장
    with open(output_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    image_path = "None"

    # PDF인 경우: JPG로 변환
    if file.content_type == "application/pdf":
        image_path = output_path.replace(".pdf", ".jpg")
        convertPDFtoJPG(output_path, image_path)

    # 이미지(jpg, png 등)인 경우: 그대로 사용
    elif file.content_type in ["image/jpeg", "image/jpg", "image/png"]:
        image_path = output_path

    else:
        raise HTTPException(status_code=400, detail="지원하지 않는 파일 형식입니다.")

    # OCR 실행
    ocr_list = runOCR(image_path)
    outputContract = ocrMapping(ocr_list)
    json_str = convertToJSON(outputContract)

    return JSONResponse(content=json.loads(json_str))
