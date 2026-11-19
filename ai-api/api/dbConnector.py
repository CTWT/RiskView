import pymysql
import os
from dotenv import load_dotenv

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 박윤성
#  작성일 : 25.09.16
#  수정일 : 
#  파일명 : dbConnector.py
#  설명  : 데이터베이스 연결을 위한 파일
# ============================================

# .env 파일에서 환경 변수 로드
load_dotenv()

def get_db_connection():
    """
    데이터베이스 연결을 생성하고 반환합니다.
    .env 파일에서 DB 접속 정보를 읽어옵니다.
    """
    try:
        connection = pymysql.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME'),
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        return connection
    except pymysql.MySQLError as e:
        print(f"데이터베이스 연결 오류: {e}")
        return None

if __name__ == '__main__':
    # 연결 테스트
    conn = get_db_connection()
    if conn:
        print("데이터베이스 연결 성공")
        conn.close()
    else:
        print("데이터베이스 연결 실패")