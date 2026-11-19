import json

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 
#  작성일 : 25.09.25
#  수정일 : 
#  파일명 : sports_json_to_sql.py
#  설명  : 공공체육시설 JSON 데이터를 SQL 파일로 변환
# ============================================

# JSON 파일 로드
with open("서울시 공공체육시설 정보(위경도 포함).json", "r", encoding="utf-8") as f:
    data = json.load(f)

records = data["DATA"]

insert_query_template = """
INSERT INTO sports_facility_info (
    ft_idx, ft_title, ft_kind_name, bk_cd_name, ar_cd_name,
    ft_addr, ft_addr_detail, ft_post, ft_phone, ft_homepage,
    ft_money, ft_wd_time, ft_we_time, ft_info_time, ft_operation_name,
    rt_cd_name, ft_org, ft_si, ft_size, ft_park, ft_bigo,
    latitude, longitude, location
) VALUES (
    %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s,
    %s, %s, ST_GeomFromText(%s)
)
ON DUPLICATE KEY UPDATE
    ft_title = VALUES(ft_title),
    latitude = VALUES(latitude),
    longitude = VALUES(longitude),
    location = VALUES(location);
"""

def get_value(record, key):
    return record.get(key) if key in record else None

def escape_sql_string(val):
    """작은따옴표 SQL escape"""
    return str(val).replace("'", "\\'")

# 결과를 저장할 파일 열기
with open("서울시 공공체육시설 정보(위경도 포함).sql", "w", encoding="utf-8") as sql_file:
    for record in records:
        lat = record.get("latitude")
        lon = record.get("longitude")

        if lat is None or lon is None:
            continue  # 위경도 없으면 스킵

        location = f"POINT({lon} {lat})"

        values = (
            get_value(record, "ft_idx"),
            get_value(record, "ft_title"),
            get_value(record, "ft_kind_name"),
            get_value(record, "bk_cd_name"),
            get_value(record, "ar_cd_name"),
            get_value(record, "ft_addr"),
            get_value(record, "ft_addr_detail"),
            get_value(record, "ft_post"),
            get_value(record, "ft_phone"),
            get_value(record, "ft_homepage"),
            get_value(record, "ft_money"),
            get_value(record, "ft_wd_time"),
            get_value(record, "ft_we_time"),
            get_value(record, "ft_info_time"),
            get_value(record, "ft_operation_name"),
            get_value(record, "rt_cd_name"),
            get_value(record, "ft_org"),
            get_value(record, "ft_si"),
            get_value(record, "ft_size"),
            get_value(record, "ft_park"),
            get_value(record, "ft_bigo"),
            lat,
            lon,
            location
        )

        # 문자열 escape 및 NULL 처리
        safe_values = tuple(
            "'{}'".format(escape_sql_string(v)) if v is not None else "NULL"
            for v in values[:-1]
        ) + ("'{}'".format(location),)

        insert_sql = insert_query_template % safe_values
        sql_file.write(insert_sql + "\n")

print("✅ SQL 파일이 생성되었습니다: 서울시 공공체육시설 정보(위경도 포함).sql")