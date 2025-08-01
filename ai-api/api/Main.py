from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Dict
from ocr.Server import process_file
import uvicorn 
import sys, os


base_path = os.path.dirname(os.path.abspath(__file__))
if base_path not in sys.path:
    sys.path.insert(0, base_path)
    
    
app = FastAPI()

# 이벤트 상태 저장
event_flags : Dict[str, bool] = {
    "ocr" : False,      # ocr api 이벤트
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

if __name__ == "__main__" :
    uvicorn.run("Main:app", host="0.0.0.0", port=8000, reload=True)