import json

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 
#  작성일 : 25.09.17
#  수정일 : 
#  파일명 : filter_parks_in_seoul.py
#  설명  : 전국 공원 JSON 데이터에서 서울 공원만 필터링하여 새 JSON 파일로 저장
# ============================================

# 원본 JSON 파일 열기
with open("전국도시공원정보표준데이터.json", "r") as f:
    data = json.load(f)

# "제공기관명"에 '서울'이 포함된 record만 추출
filtered_records = [
    record for record in data.get("records", [])
    if "서울" in record.get("제공기관명", "")
]

# 새로운 JSON 구조 생성
filtered_data = {
    "fields": data.get("fields", []),
    "records": filtered_records
}

# 필터링된 데이터를 새 파일로 저장
with open("서울공원정보표준데이터.json", "w", encoding="utf-8") as f:
    json.dump(filtered_data, f, ensure_ascii=False, indent=4)

print("✅ 제공기관명에 '서울'이 포함된 공원 정보가 '서울공원정보표준데이터.json' 파일로 저장되었습니다.")