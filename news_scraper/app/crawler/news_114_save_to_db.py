import json
import mysql.connector

#  이름 : 유연우
#  작성자 : 유연우
#  수정자 : 
#  작성일 : 25.07.23
#  파일명 : news_114_save_to_db.py

# 부동산 114 크롤링 내용 db 저장

# JSON 파일 경로
json_file = "부동산114_뉴스_9.json"

# DB 연결
conn = mysql.connector.connect(
    host="localhost", user="root", password="12345", database="newsdb"
)
cursor = conn.cursor()

# INSERT 쿼리 (title, content, date 추가)
query = "INSERT INTO news_114 (title, content, date) VALUES (%s, %s, %s)"

# JSON 파일 열기 및 저장
with open(json_file, "r", encoding="utf-8") as f:
    data = json.load(f)
    inserted_count = 0  # 실제 저장된 건 수 카운트

    for item in data:
        title = item.get("title", "").strip()
        content = item.get("content", "").strip()
        date = item.get("date", "").strip()

        if title and content and date:
            cursor.execute(query, (title, content, date))
            inserted_count += 1

# 커밋 및 종료
conn.commit()
print(f"✅ 총 {inserted_count}건 저장 완료!")

cursor.close()
conn.close()
