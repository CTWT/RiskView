from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Dict
from ocr.Server import process_file
from news_scraper.app.crawler.News_114 import News_114_Save
from news_scraper.app.crawler.News_Yeonhap import News_Yeonhap_Save
from news_scraper.app.crawler.News_Chosun import News_Chosun_Save
import uvicorn 
import sys, os


base_path = os.path.dirname(os.path.abspath(__file__))
if base_path not in sys.path:
    sys.path.insert(0, base_path)
    
    
app = FastAPI()

# 이벤트 상태 저장
event_flags : Dict[str, bool] = {
    "ocr" : False,      # ocr api 이벤트
    "news_114" : False,
    "news_yeonhap" : False,
    "news_chosun" : False,
}

class EventTrigger(BaseModel) :
    api_name : str

@app.post("/trigger") 
def trigger_event(event : EventTrigger) :
    if event.api_name not  in event_flags :
        raise HTTPException(status_code=404, detail="API이름이 잘못됨")
    event_flags[event.api_name] = True
    return {"message" : f"{event.api_name} 실행 준비 완료"}

@app.post("/ocr")
async def run_ocr(file : UploadFile = File(...)) :
    if not event_flags["ocr"] :
        raise HTTPException(status_code=403, detail="ocr실행 실패")
    event_flags["ocr"] = False
    return await process_file(file)  


@app.post("/news_114")
async def run_news_114() :
    if not event_flags["news_114"] :
        raise HTTPException(status_code=403, detail="뉴스 114 실행 실패")
    event_flags["news_114"] = False
    
    News_114_Save()
    
    result = {"message " : " 뉴스 114 데이터 수집 완료"}
    return result
    
@app.post("/news_yeonhap")
async def run_news_yeonhap() :
    if not event_flags["news_yeonhap"] :
        raise HTTPException(status_code=403, detail="연합 뉴스 실행 실패")
    event_flags["news_yeonhap"] = False
    
    News_Yeonhap_Save()
    
    result = {"message " : " 연합 뉴스 데이터 수집 완료"}
    return result
    
@app.post("/news_chosun")
async def run_new_chosun() :
    if not event_flags["news_chosun"] :
        raise HTTPException(status_code=403, detail="뉴스 조선 실행 실패")
    event_flags["news_chosun"] = False
    
    News_Chosun_Save()
    
    result = {"message " : " 뉴스 조선 데이터 수집 완료"}
    return result
    
if __name__ == "__main__" :
    uvicorn.run("Main:app", host="0.0.0.0", port=8000, reload=True)