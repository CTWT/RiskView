from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Dict

from api.ocr.Server import process_file
from api.ocr.Server import search_address
from api.news_scraper.app.crawler.News_114 import News_114_Save
from api.news_scraper.app.crawler.News_Yeonhap import News_Yeonhap_Save
from api.news_scraper.app.crawler.News_Chosun import News_Chosun_Save
from api.estate.estate_main import analyze_estate
from api.wordcloud import wordcloud_main as wordcloud_router
from api.wordcloud.okt_analyzer import router as okt_analyzer_router
from api.ocr.data.LeaseContract import LeaseContract
from api.estate.Estate import runEstate
from ai.contract_analysis.contract_clause import analyze_clause
import uvicorn 
import sys, os

base_path = os.path.dirname(os.path.abspath(__file__))
if base_path not in sys.path:
    sys.path.insert(0, base_path)
    
    
app = FastAPI()

# 라우터 등록
app.include_router(wordcloud_router.router, prefix="/wordcloud", tags=["wordcloud"])
app.include_router(okt_analyzer_router, prefix="/okt", tags=["okt_analyzer"])

# 이벤트 상태 저장
event_flags : Dict[str, bool] = {
    "ocr" : False,      # ocr api 이벤트
    "kakao_map":False,  # kakao_map api 이벤트
    "news_114" : False, # 뉴스 114
    "news_yeonhap" : False, # 연합뉴스
    "news_chosun" : False,  # 뉴스 조선
    "estate" : False,   # 전월세 실거래데이터
    "analyze_estate": False, # 부동산 종합 분석
    "analyze_clause": False, # 특약사항 위험 분석
}

class EventTrigger(BaseModel) :
    api_name : str

@app.post("/trigger") 
def trigger_event(event : EventTrigger) :
    if event.api_name not  in event_flags :
        raise HTTPException(status_code=404, detail="API이름이 잘못됨")
    event_flags[event.api_name] = True
    return {"message" : f"{event.api_name} 실행 준비 완료"}

# OCR호출
@app.post("/ocr")
async def run_ocr(file : UploadFile = File(...)) :
    if not event_flags["ocr"] :
        raise HTTPException(status_code=403, detail="ocr실행 실패")
    event_flags["ocr"] = False
    return await process_file(file)  

class AddressRequest(BaseModel):
    address: str

# kakao_map
@app.post("/kakao_map")
async def search_map(req:AddressRequest) :
    if not event_flags["kakao_map"] :
        raise HTTPException(status_code=403, detail="kakao_map 실패")
    event_flags["kakao_map"] = False
    return await search_address(req.address)  

# # 뉴스114 크롤링 호출
# @app.post("/news_114")
# async def run_news_114() :
#     if not event_flags["news_114"] :
#         raise HTTPException(status_code=403, detail="뉴스 114 실행 실패")
#     event_flags["news_114"] = False
    
#     News_114_Save()
    
#     result = {"message " : " 뉴스 114 데이터 수집 완료"}
#     return result
    
# # 연합뉴스 크롤링 호출
# @app.post("/news_yeonhap")
# async def run_news_yeonhap() :
#     if not event_flags["news_yeonhap"] :
#         raise HTTPException(status_code=403, detail="연합 뉴스 실행 실패")
#     event_flags["news_yeonhap"] = False
    
#     News_Yeonhap_Save()
    
#     result = {"message " : " 연합 뉴스 데이터 수집 완료"}
#     return result

# # 뉴스 조선 크롤링 호출
# @app.post("/news_chosun")
# async def run_new_chosun() :
#     if not event_flags["news_chosun"] :
#         raise HTTPException(status_code=403, detail="뉴스 조선 실행 실패")
#     event_flags["news_chosun"] = False
    
#     News_Chosun_Save()
    
#     result = {"message " : " 뉴스 조선 데이터 수집 완료"}
#     return result

# 실거래 데이터 호출
@app.post("/estate")
async def run_estate(end_index : str, cgg_nm : str, ctrt_day: str, bldg_usg : str) :
    if not event_flags["estate"] :
        raise HTTPException(status_code=403, detail="실거래 데이터 호출 실패")
    event_flags["estate"] = False

    data = runEstate(end_index, cgg_nm, ctrt_day, bldg_usg)
    result = {"message " : "실거래데이터 호출 성공"}
    return result

# 부동산 종합 분석
@app.post("/analyze_estate")
async def analyzeAnomaly(contract_data: LeaseContract):
    if not event_flags["analyze_estate"]:
        raise HTTPException(status_code=403, detail="부동산 종합 분석 실행이 허용되지 않았습니다.")
    event_flags["analyze_estate"] = False  # 사용 후 플래그 리셋

    analysis_result = analyze_estate(contract_data)
    return analysis_result


class ClauseRequest(BaseModel):
    contract_clause: str

@app.post("/analyze_clause")
async def analyzeClause(req: ClauseRequest):
    if not event_flags["analyze_clause"]:
        raise HTTPException(status_code=403, detail="특약사항 위험 분석 실행이 허용되지 않았습니다.")
    event_flags["analyze_clause"] = False

    analysis_result = analyze_clause(req.contract_clause)
    return analysis_result

if __name__ == "__main__" :
    uvicorn.run("Main:app", host="0.0.0.0", port=8000, reload=True)

