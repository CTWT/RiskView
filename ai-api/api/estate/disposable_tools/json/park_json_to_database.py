import json
import pymysql
from datetime import datetime
import os
import sys

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 
#  작성일 : 25.09.17
#  수정일 : 
#  파일명 : park_json_to_database.py
#  설명  : 공원 JSON 데이터를 MariaDB 데이터베이스에 삽입
# ============================================

# 상위 디렉토리의 dbConnector import
sys.path.append(os.path.abspath(os.path.join(__file__, "../../../..")))
from dbConnector import get_db_connection

def create_table(cursor):
    # 관리번호(managing_id)는 중복되므로 부득이하게 park_id를 primary key로 설정(AutoIncrement)
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS park_info (
        park_id INT AUTO_INCREMENT PRIMARY KEY,
        managing_id VARCHAR(30),
        park_name VARCHAR(100),
        park_type VARCHAR(50),
        addr1 VARCHAR(255),
        addr2 VARCHAR(255),
        area DOUBLE,
        facility_sports TEXT,
        facility_play TEXT,
        facility_convenience TEXT,
        facility_culture TEXT,
        facility_etc TEXT,
        announced_at DATE,
        managing_org VARCHAR(100),
        tel VARCHAR(30),
        data_ref_date DATE,
        org_code VARCHAR(20),
        org_name VARCHAR(100),
        location POINT NOT NULL,
        SPATIAL INDEX(location)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    cursor.execute(create_table_sql)

def insert_data(cursor, parks):
    insert_sql = """
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
    )
    """

    for p in parks:
        try:
            lat = float(p.get("위도", 0))
            lon = float(p.get("경도", 0))
            point_wkt = f"POINT({lon} {lat})"

            managing_id = p.get("관리번호")
            if not managing_id:
                print(f"❌ 공원명 '{p.get('공원명')}' 의 관리번호 없음 → 건너뜀")
                continue

            # 날짜 형식 변환
            try:
                announced_at = datetime.strptime(p.get("지정고시일", ""), "%Y-%m-%d").date()
            except:
                announced_at = None

            try:
                data_ref_date = datetime.strptime(p.get("데이터기준일자", ""), "%Y-%m-%d").date()
            except:
                data_ref_date = None

            values = (
                managing_id,
                p.get("공원명"),
                p.get("공원구분"),
                p.get("소재지도로명주소"),
                p.get("소재지지번주소"),
                float(p.get("공원면적", 0)),
                p.get("공원보유시설(운동시설)"),
                p.get("공원보유시설(유희시설)"),
                p.get("공원보유시설(편익시설)"),
                p.get("공원보유시설(교양시설)"),
                p.get("공원보유시설(기타시설)"),
                announced_at,
                p.get("관리기관명"),
                p.get("전화번호"),
                data_ref_date,
                p.get("제공기관코드"),
                p.get("제공기관명"),
                point_wkt
            )

            cursor.execute(insert_sql, values)

        except Exception as e:
            print(f"❌ {p.get('공원명')} 삽입 실패: {e}")

def main():
    with open('서울공원정보표준데이터.json', 'r', encoding='utf-8') as f:
        json_data = json.load(f)

    parks = json_data.get("records", [])

    conn = get_db_connection()
    if not conn:
        print("❌ DB 연결 실패")
        return

    with conn.cursor() as cursor:
        create_table(cursor)
        insert_data(cursor, parks)

    conn.commit()
    conn.close()
    print("✅ 모든 공원 정보가 성공적으로 저장되었습니다.")

if __name__ == '__main__':
    main()