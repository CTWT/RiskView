import json
import mysql.connector

#  이름 : 유연우
#  작성자 : 유연우
#  수정자 : 
#  작성일 : 25.07.23
#  파일명 : yeonhap_save_to_db.py

# 연합뉴스 크롤링 내용 db 저장

# JSON 파일에서 뉴스 데이터 불러오기
with open("연합뉴스/yeonhap_news4.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# MySQL 데이터베이스 연결
try:
    conn = mysql.connector.connect(
        host="localhost", user="root", password="12345", database="newsdb"
    )
    print("✅ DB 연결 성공!")
except mysql.connector.Error as err:
    print("❌ DB 연결 실패:", err)
    exit(1)

cursor = conn.cursor()

# 뉴스 데이터 삽입
for article in data:
    title = article["title"]
    content = article["content"]
    date = article["date"]

    query = "INSERT INTO yeonhap (title, content, date) VALUES (%s, %s, %s)"

    try:
        cursor.execute(query, (title, content, date))
        print(f"✅ 저장됨: {title}")
    except mysql.connector.IntegrityError:
        print(f"❌ 중복 건너뜀: {title}")

# 변경사항 저장
conn.commit()

# 연결 종료
cursor.close()
conn.close()
