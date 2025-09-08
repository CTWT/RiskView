import requests
import xml.etree.ElementTree as ET
import json

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 
#  작성일 : 25.09.08
#  수정일 : 
#  파일명 : xml_to_json.py
#  설명  : XML을 JSON으로 변환
# ============================================

def xml_to_dict(element):
    """
    재귀적으로 XML Element를 파이썬 딕셔너리로 변환
    """
    result = {}
    # 자식 노드가 없으면 텍스트 값 반환
    if len(element) == 0:
        return element.text.strip() if element.text else ""
    
    for child in element:
        child_result = xml_to_dict(child)
        tag = child.tag

        # 같은 태그가 여러 번 나오면 리스트로 처리
        if tag in result:
            if isinstance(result[tag], list):
                result[tag].append(child_result)
            else:
                result[tag] = [result[tag], child_result]
        else:
            result[tag] = child_result

    return result


def get_xml_api_and_convert_to_json(api_url: str) -> dict:
    response = requests.get(api_url)
    response.encoding = 'utf-8'  # 한글 깨짐 방지

    if response.status_code == 200:
        root = ET.fromstring(response.text)
        return xml_to_dict(root)
    else:
        raise Exception(f"API 호출 실패: {response.status_code}")

# 예시 사용:
# xml_api_url = "https://api.example.com/xml-only-api"
# data_as_json = get_xml_api_and_convert_to_json(xml_api_url)
# print(json.dumps(data_as_json, indent=2, ensure_ascii=False))
