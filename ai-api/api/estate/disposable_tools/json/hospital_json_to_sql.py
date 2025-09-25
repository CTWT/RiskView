import json

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 
#  작성일 : 25.09.25
#  수정일 : 
#  파일명 : hospital_json_to_sql.py
#  설명  : 병의원 JSON 데이터를 SQL 파일로 변환
# ============================================

# JSON 파일 로드
with open("서울시 병의원 위치 정보.json", "r", encoding="utf-8") as f:
    data = json.load(f)

records = data["DATA"]

insert_query_template = """
INSERT INTO hospital_info (
    hpid, dutyname, dutyaddr, dutydiv, dutydivnam,
    dutytel1, dutytel3, dutyemcls, dutyemclsname,
    dutyinf, dutyetc, work_dttm, postcdn1, postcdn2,
    dutytime1s, dutytime1c, dutytime2s, dutytime2c,
    dutytime3s, dutytime3c, dutytime4s, dutytime4c,
    dutytime5s, dutytime5c, dutytime6s, dutytime6c,
    dutytime7s, dutytime7c, dutytime8s, dutytime8c,
    dutyeryn, dutymapimg, location
) VALUES (
    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
    ST_GeomFromText(%s)
);
"""

def get_value(record, key):
    return record.get(key) if key in record else None

# 결과를 저장할 파일 열기
with open("서울시 병의원 위치 정보.sql", "w", encoding="utf-8") as sql_file:
    for record in records:
        # 위경도 POINT 형식 생성
        lon = record.get("wgs84lon")
        lat = record.get("wgs84lat")
        if not lon or not lat:
            continue  # 위치 정보 없으면 스킵
        
        location = f"POINT({lon} {lat})"

        values = (
            get_value(record, "hpid"),
            get_value(record, "dutyname"),
            get_value(record, "dutyaddr"),
            get_value(record, "dutydiv"),
            get_value(record, "dutydivnam"),
            get_value(record, "dutytel1"),
            get_value(record, "dutytel3"),
            get_value(record, "dutyemcls"),
            get_value(record, "dutyemclsname"),
            get_value(record, "dutyinf"),
            get_value(record, "dutyetc"),
            get_value(record, "work_dttm"),
            get_value(record, "postcdn1"),
            get_value(record, "postcdn2"),
            get_value(record, "dutytime1s"),
            get_value(record, "dutytime1c"),
            get_value(record, "dutytime2s"),
            get_value(record, "dutytime2c"),
            get_value(record, "dutytime3s"),
            get_value(record, "dutytime3c"),
            get_value(record, "dutytime4s"),
            get_value(record, "dutytime4c"),
            get_value(record, "dutytime5s"),
            get_value(record, "dutytime5c"),
            get_value(record, "dutytime6s"),
            get_value(record, "dutytime6c"),
            get_value(record, "dutytime7s"),
            get_value(record, "dutytime7c"),
            get_value(record, "dutytime8s"),
            get_value(record, "dutytime8c"),
            get_value(record, "dutyeryn"),
            get_value(record, "dutymapimg"),
            location
        )

        # NULL 처리 및 문자열 escape
        safe_values = tuple(
            "'{}'".format(str(v).replace("'", "\\'")) if v is not None else "NULL"
            for v in values[:-1]
        ) + ("'{}'".format(values[-1]),)

        # INSERT 구문 완성
        insert_sql = insert_query_template % safe_values

        # 파일에 쓰기
        sql_file.write(insert_sql + "\n")

print("✅ SQL 파일이 생성되었습니다: 서울시 병의원 위치 정보.sql")