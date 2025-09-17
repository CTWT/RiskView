import json
import pymysql
from datetime import datetime
from dotenv import load_dotenv
import os
import sys

# 상위 디렉토리에서 dbConnector 불러오기
sys.path.append(os.path.abspath(os.path.join(__file__, "../../../..")))
from dbConnector import get_db_connection

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 
#  작성일 : 25.09.17
#  수정일 : 
#  파일명 : sports_json_to_database.py
#  설명  : 공공체육시설 JSON 데이터를 MariaDB에 삽입
# ============================================

def create_table(cursor):
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS sports_facility_info (
        ft_idx INT PRIMARY KEY,
        ft_title VARCHAR(255),
        ft_kind_name VARCHAR(255),
        bk_cd_name VARCHAR(255),
        ar_cd_name VARCHAR(255),
        ft_addr VARCHAR(255),
        ft_addr_detail VARCHAR(255),
        ft_post VARCHAR(20),
        ft_phone VARCHAR(50),
        ft_homepage VARCHAR(255),
        ft_money TEXT,
        ft_wd_time VARCHAR(100),
        ft_we_time VARCHAR(100),
        ft_info_time VARCHAR(255),
        ft_operation_name VARCHAR(50),
        rt_cd_name VARCHAR(50),
        ft_org VARCHAR(255),
        ft_si TEXT,
        ft_size TEXT,
        ft_park TEXT,
        ft_bigo TEXT,
        latitude DOUBLE,
        longitude DOUBLE,
        location POINT NOT NULL,
        SPATIAL INDEX(location)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    """
    cursor.execute(create_table_sql)

def insert_data(cursor, facilities):
    insert_sql = """
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

    for facility in facilities:
        try:
            lat = facility.get("latitude")
            lon = facility.get("longitude")

            if lat is None or lon is None:
                print(f"❌ 위치 정보 없음 - {facility.get('ft_title', '이름없음')}")
                continue

            point_wkt = f"POINT({lon} {lat})"

            values = (
                facility.get("ft_idx"),
                facility.get("ft_title"),
                facility.get("ft_kind_name"),
                facility.get("bk_cd_name"),
                facility.get("ar_cd_name"),
                facility.get("ft_addr"),
                facility.get("ft_addr_detail"),
                facility.get("ft_post"),
                facility.get("ft_phone"),
                facility.get("ft_homepage"),
                facility.get("ft_money"),
                facility.get("ft_wd_time"),
                facility.get("ft_we_time"),
                facility.get("ft_info_time"),
                facility.get("ft_operation_name"),
                facility.get("rt_cd_name"),
                facility.get("ft_org"),
                facility.get("ft_si"),
                facility.get("ft_size"),
                facility.get("ft_park"),
                facility.get("ft_bigo"),
                lat,
                lon,
                point_wkt
            )

            cursor.execute(insert_sql, values)

        except Exception as e:
            print(f"❌ {facility.get('ft_title')} 삽입 실패: {e}")

def main():
    # JSON 파일 불러오기
    with open("서울시 공공체육시설 정보(위경도 포함).json", "r", encoding="utf-8") as f:
        json_data = json.load(f)

    facilities = json_data["DATA"] if "DATA" in json_data else json_data

    # DB 연결
    conn = get_db_connection()
    if not conn:
        print("❌ DB 연결 실패")
        return

    with conn.cursor() as cursor:
        create_table(cursor)
        insert_data(cursor, facilities)

    conn.commit()
    conn.close()
    print("✅ 모든 체육시설 정보가 성공적으로 저장되었습니다.")

if __name__ == "__main__":
    main()
