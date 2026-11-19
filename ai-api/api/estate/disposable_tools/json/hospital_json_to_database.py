import json
import pymysql
from datetime import datetime
from dotenv import load_dotenv
import os
import json
import sys
sys.path.append(os.path.abspath(os.path.join(__file__, "../../../..")))
from dbConnector import get_db_connection

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 
#  작성일 : 25.09.17
#  수정일 : 
#  파일명 : hospital_json_to_database.py
#  설명  : 병의원 JSON 데이터를 MariaDB 데이터베이스에 삽입
# ============================================

def create_table(cursor):
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS hospital_info (
        hpid VARCHAR(20) PRIMARY KEY,
        dutyname VARCHAR(100),
        dutyaddr VARCHAR(255),
        dutydiv VARCHAR(10),
        dutydivnam VARCHAR(100),
        dutytel1 VARCHAR(20),
        dutytel3 VARCHAR(20),
        dutyemcls VARCHAR(20),
        dutyemclsname VARCHAR(100),
        dutyinf TEXT,
        dutyetc TEXT,
        work_dttm BIGINT,
        postcdn1 VARCHAR(10),
        postcdn2 VARCHAR(10),
        dutytime1s VARCHAR(10),
        dutytime1c VARCHAR(10),
        dutytime2s VARCHAR(10),
        dutytime2c VARCHAR(10),
        dutytime3s VARCHAR(10),
        dutytime3c VARCHAR(10),
        dutytime4s VARCHAR(10),
        dutytime4c VARCHAR(10),
        dutytime5s VARCHAR(10),
        dutytime5c VARCHAR(10),
        dutytime6s VARCHAR(10),
        dutytime6c VARCHAR(10),
        dutytime7s VARCHAR(10),
        dutytime7c VARCHAR(10),
        dutytime8s VARCHAR(10),
        dutytime8c VARCHAR(10),
        dutyeryn VARCHAR(5),
        dutymapimg VARCHAR(255),
        location POINT NOT NULL,
        SPATIAL INDEX(location)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    cursor.execute(create_table_sql)

def insert_data(cursor, hospitals):
    insert_sql = """
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
    )
    """

    for h in hospitals:
        try:
            lat = float(h['wgs84lat'])
            lon = float(h['wgs84lon'])
            point_wkt = f"POINT({lon} {lat})"

            hpid = h.get('hpid')
            if not hpid:
                print(f"❌ {h.get('dutyname')}의 hpid가 없어 삽입할 수 없습니다.")
                continue

            values = (
                hpid,
                h.get('dutyname'),
                h.get('dutyaddr'),
                h.get('dutydiv'),
                h.get('dutydivnam'),
                h.get('dutytel1'),
                h.get('dutytel3'),
                h.get('dutyemcls'),
                h.get('dutyemclsname'),
                h.get('dutyinf'),
                h.get('dutyetc'),
                h.get('work_dttm'),
                h.get('postcdn1'),
                h.get('postcdn2'),
                h.get('dutytime1s'),
                h.get('dutytime1c'),
                h.get('dutytime2s'),
                h.get('dutytime2c'),
                h.get('dutytime3s'),
                h.get('dutytime3c'),
                h.get('dutytime4s'),
                h.get('dutytime4c'),
                h.get('dutytime5s'),
                h.get('dutytime5c'),
                h.get('dutytime6s'),
                h.get('dutytime6c'),
                h.get('dutytime7s'),
                h.get('dutytime7c'),
                h.get('dutytime8s'),
                h.get('dutytime8c'),
                h.get('dutyeryn'),
                h.get('dutymapimg'),
                point_wkt
            )

            cursor.execute(insert_sql, values)

        except Exception as e:
            print(f"❌ {h.get('dutyname')} 삽입 실패: {e}")

def main():
    with open('서울시 병의원 위치 정보.json', 'r', encoding='utf-8') as f:
        json_data = json.load(f)

    hospitals = json_data['DATA']

    conn = get_db_connection()
    if not conn:
        print("❌ DB 연결 실패")
        return

    with conn.cursor() as cursor:
        create_table(cursor)
        insert_data(cursor, hospitals)

    conn.commit()
    conn.close()
    print("✅ 모든 병원 정보가 성공적으로 저장되었습니다.")

if __name__ == '__main__':
    main()