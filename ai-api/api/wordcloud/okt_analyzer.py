from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from konlpy.tag import Okt
from typing import List

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 
#  작성일 : 25.09.10
#  수정일 : 
#  파일명 : okt_analyzer.py
#  설명  : Okt를 사용한 형태소 분석
#  - Fast API 사용
# ============================================

router = APIRouter()

# Okt 객체 생성
okt = Okt()

# 요청 바디 모델 정의
class TextRequest(BaseModel):
    text: str

# API 엔드포인트 정의
@router.post("/analyze", summary="입력된 텍스트에서 명사 추출")
async def analyze_text(
    request: TextRequest, # 요청 바디
    min_length: int = Query(2, description="추출할 명사의 최소 길이") # 쿼리 파라미터
):
    print("[API] /analyze 요청 수신")
    print(f"[INFO] 입력된 텍스트 길이: {len(request.text)}")
    print(f"[INFO] 최소 명사 길이: {min_length}")

    if not request.text.strip():
        print("[ERROR] 입력 텍스트가 비어 있음")
        raise HTTPException(status_code=400, detail="입력 텍스트가 비어 있습니다.")

    try:
        print("[INFO] Okt 명사 추출 시작")
        nouns = [noun for noun in okt.nouns(request.text) if len(noun) >= min_length]
        print(f"[INFO] 명사 추출 완료: 총 {len(nouns)}개")
    except Exception as e:
        print(f"[ERROR] 형태소 분석 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail="형태소 분석 중 오류 발생")

    return {"nouns": nouns}
