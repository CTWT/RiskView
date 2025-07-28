from dataclasses import dataclass, asdict
from data.LeaseContract import LeaseContract
import json
from properties import *
import requests
import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))) #상위폴더 서치

#  수업명 : 가비아 2회차
#  이름 : 김관호
#  작성자 : 김관호
#  수정자 : 
#  작성일 : 25.07.21
#  파일명 : APIFunction.py

# JSON 처리와 데이터를 POST하기위한 파일

# @Param contract 계약서 데이터
# LeaseContract를 JSON으로 바꿔줌
def convertToJSON(contract:LeaseContract)->str:
    return json.dumps(asdict(contract), ensure_ascii=False, default=str)

# Spring에 post요청을 보내는 함수
def sendDataToSpring(jsonString:str):
    try:
        data = json.loads(jsonString)  # JSON 문자열 → dict
        response = requests.post(request_path, json=data)  # JSON 전송
        print("서버 응답:", response.text)
    except json.JSONDecodeError as e:
        print("⚠️ JSON 파싱 오류:", e)
    except requests.exceptions.RequestException as e:
        print("⚠️ 요청 오류:", e)


# json_string을 jsonfile로 변환하는 함수
def exportJSONFile(json_string:str, outputPath:str = 'output.json'):
    # 문자열을 파이썬 딕셔너리로 변환
    data = json.loads(json_string)

    # JSON 파일로 저장
    with open(outputPath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

    print("JSON 파일 저장 완료!")