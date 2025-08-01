from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os, sys
import shutil
import json
import re
from dataclasses import dataclass, asdict



# 외부 함수 정상 import
from ocr.function.PDFFunction import convertPDFBytesToImageBytes
from ocr.function.OCRFunction import runOCR, ocrMapping
from ocr.function.MapFunction import getMapInfo


#  수업명 : 가비아 2회차
#  이름 : 김관호
#  작성자 : 김관호
#  수정자 : 
#  작성일 : 25.07.21
#  파일명 : Server.py

# FastAPI 서버 가동 파일

# app = FastAPI()

# CORS 허용 (필요 시 프론트 연결을 위해 사용)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # 프론트 URL로 제한 가능
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# 파일업로드 요청을 받는 post 함수
# @app.post("/ocr")
async def process_file(file: UploadFile = File(...)):
    file_bytes = await file.read()

    # PDF 처리
    if file.content_type == "application/pdf":
        image_bytes = convertPDFBytesToImageBytes(file_bytes)
        ocr_list = runOCR(image_bytes)

    # 이미지 처리
    elif file.content_type in ["image/jpeg", "image/jpg", "image/png"]:
        ocr_list = runOCR(file_bytes)

    else:
        raise HTTPException(status_code=400, detail="지원하지 않는 파일 형식입니다.")
    
    # ocr결과물 leaseContract 인스턴스에 매핑
    outputContract = ocrMapping(ocr_list)

    # 네이버 맵 API 데이터 추출 후 mapInfo 인스턴스에 매핑
    mapInfo = getMapInfo(outputContract.location)

    # 인스턴스 -> 딕셔너리
    contract_dict = asdict(outputContract) if outputContract is not None else None
    mapinfo_dict = asdict(mapInfo) if mapInfo is not None else None

    response_dict = {
        "structuredContractDataDTO": contract_dict,
        "mapInfo": mapinfo_dict
    }

    response_json = json.dumps(response_dict, ensure_ascii=False, default=str)
    return JSONResponse(content=json.loads(response_json))
