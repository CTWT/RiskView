from dataclasses import dataclass, asdict
from data.LeaseContract import LeaseContract
import json
import requests
import os
import sys
from dotenv import load_dotenv
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))) #상위폴더 서치

#  수업명 : 가비아 2회차
#  이름 : 김관호
#  작성자 : 김관호
#  수정자 : 
#  작성일 : 25.07.21
#  파일명 : APIFunction.py


dotenv_path = os.path.join(os.path.dirname(__file__), '..' , '.env')
load_dotenv(dotenv_path)
request_path = os.getenv('request_path')

# JSON 처리와 데이터를 POST하기위한 파일

# @Param contract 계약서 데이터
# LeaseContract를 JSON으로 바꿔줌
def convertToJSON(contract:LeaseContract)->str:
    return json.dumps(asdict(contract), ensure_ascii=False, default=str)
