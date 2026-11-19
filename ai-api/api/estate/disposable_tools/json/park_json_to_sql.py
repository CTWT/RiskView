import json

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 
#  작성일 : 25.09.25
#  수정일 : 
#  파일명 : park_json_to_sql.py
#  설명  : 공원 JSON 데이터를 SQL 파일로 변환
# ============================================

# JSON 파일 로드
with open("서울공원정보표준데이터.json", "r", encoding="utf-8") as f:
    data = json.load(f)

records = data["records"]

insert_query_template = """
INSERT INTO park_info (
    managing_id, park_name, park_type, addr1, addr2, area,
    facility_sports, facility_play, facility_convenience,
    facility_culture, facility_etc, announced_at,
    managing_org, tel, data_ref_date,
    org_code, org_name, location
) VALUES (
    %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s,
    ST_GeomFromText(%s)
);
"""

def get_value(record, key):
    val = record.get(key)
    if val == "":
        return None
    return val

with open("서울공원정보표준데이터.sql", "w", encoding="utf-8") as sql_file:
    for record in records:
        lat = record.get("위도")
        lon = record.get("경도")
        if not lat or not lon:
            continue  # 위경도 없으면 패스

        # POINT 형식은 'POINT(lon lat)' (경도 위도)
        location = f"POINT({lon} {lat})"

        values = (
            get_value(record, "관리번호"),                      # managing_id
            get_value(record, "공원명"),                        # park_name
            get_value(record, "공원구분"),                      # park_type
            get_value(record, "소재지도로명주소"),               # addr1
            get_value(record, "소재지지번주소"),                 # addr2
            float(get_value(record, "공원면적")) if get_value(record, "공원면적") else None,  # area

            get_value(record, "공원보유시설(운동시설)"),          # facility_sports
            get_value(record, "공원보유시설(유희시설)"),          # facility_play
            get_value(record, "공원보유시설(편익시설)"),          # facility_convenience
            get_value(record, "공원보유시설(교양시설)"),          # facility_culture
            get_value(record, "공원보유시설(기타시설)"),          # facility_etc

            get_value(record, "지정고시일") if record.get("지정고시일") else None,  # announced_at (DATE)

            get_value(record, "관리기관명"),                      # managing_org
            get_value(record, "전화번호"),                        # tel

            get_value(record, "데이터기준일자") if record.get("데이터기준일자") else None,  # data_ref_date (DATE)

            get_value(record, "제공기관코드"),                    # org_code
            get_value(record, "제공기관명"),                      # org_name

            location
        )

        # 문자열에 ' ' 감싸기 + NULL 처리
        safe_values = []
        for v in values[:-1]:
            if v is None:
                safe_values.append("NULL")
            elif isinstance(v, (int, float)):
                safe_values.append(str(v))
            else:
                # 작은따옴표 escape 처리
                safe_values.append("'" + str(v).replace("'", "''") + "'")

        # 마지막은 location 문자열 (POINT), 이미 POINT(x y) 형태임
        safe_values.append(f"'{values[-1]}'")

        # SQL 완성
        insert_sql = insert_query_template % tuple(safe_values)
        sql_file.write(insert_sql + "\n")

print("✅ SQL 파일이 생성되었습니다: 서울공원정보표준데이터.sql")