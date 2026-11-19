from wordcloud import WordCloud
from fastapi import APIRouter, HTTPException, Response
from fastapi.concurrency import run_in_threadpool
from collections import Counter
from konlpy.tag import Okt
import jpype
import numpy as np
from PIL import Image
from pydantic import BaseModel, Field
from typing import List
import io
import os

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 
#  작성일 : 25.09.10
#  수정일 : 
#  파일명 : wordcloud_main.py
#  설명  : WordCloud를 사용한 워드클라우드 이미지 생성
#  - Fast API 사용
# ============================================

router = APIRouter()

# 경로 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) # 현재 파일의 경로
MASK_PATH = os.path.join(BASE_DIR, "home_mask.png") # 마스크 이미지 경로
FONT_PATH = os.path.join(BASE_DIR, "NotoSansKR-Bold.ttf") # 폰트 경로

print(f"[INIT] BASE_DIR: {BASE_DIR}")
print(f"[INIT] MASK_PATH: {MASK_PATH}")
print(f"[INIT] FONT_PATH: {FONT_PATH}")

# Okt 객체 생성
# okt 객체 선언은 하되, 바로 초기화하지 않습니다.
okt: Okt | None = None

# @router.on_event("startup") 데코레이터 아래에 모든 초기화 로직을 넣습니다.
@router.on_event("startup")
def init_okt():
    global okt
    print("[INIT] JVM 시작 및 Okt 객체 생성 시작")
    if not jpype.isJVMStarted():
        try:
            # 명시적인 JVM 경로를 사용해 JVM 시작
            jvm_path = r"C:\Program Files\Java\jdk-17\bin\server\jvm.dll"
            jpype.startJVM(jvm_path, "-Xmx512m")
            print("[INIT] JVM 시작 완료")
        except Exception as e:
            print(f"[ERROR] JVM 시작 실패: {e}")
            # JVM 시작 실패 시 애플리케이션 종료
            raise RuntimeError("JVM을 시작할 수 없습니다.")
    
    # JVM이 시작된 후에 Okt 객체를 생성합니다.
    okt = Okt()
    print("[INIT] Okt 객체 생성 완료")

# 요청 바디 모델 정의
class WordCloudRequest(BaseModel):
    texts: List[str] = Field(..., description="분석할 텍스트 목록")

# 워드클라우드 이미지 생성 메서드
def generate_wordcloud_image(text_data: str) -> bytes:
    try:
        print("[WORDCLOUD] 텍스트에서 명사 추출 시작")
        nouns = [noun for noun in okt.nouns(text_data) if len(noun) > 1]
        print(f"[WORDCLOUD] 명사 추출 완료: {len(nouns)}개")

        word_counts = Counter(nouns)
        print(f"[WORDCLOUD] 단어 빈도 수 계산 완료: {len(word_counts)}개 단어")

        print(f"[WORDCLOUD] 마스크 이미지 로드 시도: {MASK_PATH}")
        mask_image = Image.open(MASK_PATH).convert("L")
        mask = np.array(mask_image)
        
        # --- 마스크 이미지 이진화(Binarization) 처리 ---
        # 임계값(128)을 기준으로 픽셀 값을 0(검정) 또는 255(흰색)으로 변환
        mask = np.where(mask > 128, 255, 0).astype('uint8')
        print("[WORDCLOUD] 마스크 이미지 로드 성공")

        print(f"[WORDCLOUD] WordCloud 객체 생성 시도: 폰트={FONT_PATH}")
        wc = WordCloud(
            width=mask.shape[1], # 마스크 이미지의 너비
            height=mask.shape[0], # 마스크 이미지의 높이
            font_path=FONT_PATH, # 폰트 경로
            background_color=None, # 배경을 투명하게 설정
            mode="RGBA", # RGBA 모드로 변경하여 투명도 지원
            mask=mask, # 마스크 이미지
            max_words=2000, # 최대 단어 수
            max_font_size=150, # 최대 폰트 크기
            prefer_horizontal=0.9, # 수평 단어의 선호도
            colormap="cool"
        )

        print("[WORDCLOUD] 워드클라우드 생성 시작")
        wc.generate_from_frequencies(word_counts)
        print("[WORDCLOUD] 워드클라우드 생성 완료")

        # --- 이미지 후처리: 마스크를 적용하여 원 바깥 영역을 잘라냄 ---
        print("[WORDCLOUD] 이미지 후처리 중")
        # 마스크의 흰색(255)이 아닌 부분은 투명하게 처리
        alpha_channel = np.where(mask == 255, 255, 0).astype('uint8')
        wc.to_image().putalpha(Image.fromarray(alpha_channel))

        # 흰색 배경의 새 이미지를 만들고 그 위에 워드클라우드를 합성
        final_image = Image.new("RGBA", (mask.shape[1], mask.shape[0]), (255, 255, 255, 255))
        final_image.paste(wc.to_image(), (0, 0), wc.to_image())

        buffer = io.BytesIO()
        final_image.convert("RGB").save(buffer, format="PNG") # 최종 이미지를 RGB로 변환하여 저장
        buffer.seek(0)

        print("[WORDCLOUD] 이미지 PNG 버퍼 저장 완료")
        return buffer.getvalue()

    except Exception as e:
        print(f"[ERROR] 워드클라우드 생성 중 오류 발생: {e}")
        raise

# 워드클라우드 이미지 생성 API
@router.post("/generate-wordcloud", summary="원 모양 워드클라우드 시각화(PNG) 반환", response_class=Response)
async def generate_wordcloud(request: WordCloudRequest):
    print("[API] /generate-wordcloud 요청 수신")
    if not request.texts:
        print("[API] 오류: 입력 텍스트가 비어 있음")
        raise HTTPException(status_code=400, detail="분석할 텍스트가 없습니다.")

    all_content = " ".join(request.texts)
    print(f"[API] 텍스트 합치기 완료, 총 길이: {len(all_content)}")

    try:
        image_bytes = await run_in_threadpool(generate_wordcloud_image, all_content)
        print("[API] 워드클라우드 이미지 생성 성공")
    except Exception as e:
        print(f"[ERROR] 워드클라우드 생성 실패: {e}")
        raise HTTPException(status_code=500, detail="워드클라우드 생성 중 오류 발생")

    return Response(content=image_bytes, media_type="image/png")
