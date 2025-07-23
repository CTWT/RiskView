from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time
import json
import re
from bs4 import BeautifulSoup
from datetime import datetime

#  이름 : 유연우
#  작성자 : 유연우
#  수정자 :
#  작성일 : 25.07.23
#  파일명 : news_yeonhap.py

# 연합뉴스 사이트 뉴스 제목, 본문, 날짜 크롤링 코드

# 크롬 드라이버 설정
options = Options()
options.add_argument("--headless")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument(
    "user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
)

driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()), options=options
)

# URL 설정
base_url = "https://www.yna.co.kr"
list_url = base_url + "/economy/real-estate"
driver.get(list_url)
time.sleep(5)

# 뉴스 목록 수집
news_items = driver.find_elements(By.CSS_SELECTOR, "a.tit-news")
print(f"📰 수집한 기사 링크 수: {len(news_items)}")

news_data = []

for idx, a_tag in enumerate(news_items):
    try:
        link = a_tag.get_attribute("href")
        title_text = a_tag.text.strip()

        if not link:
            print(f"⚠️ 링크 없음 - 제목: {title_text}")
            continue

        # 새 창으로 상세 페이지 열기
        driver.execute_script("window.open(arguments[0]);", link)
        driver.switch_to.window(driver.window_handles[-1])
        time.sleep(2)

        soup = BeautifulSoup(driver.page_source, "html.parser")

        # 제목
        title_elem = soup.select_one("h1.tit01")
        title = title_elem.text.strip() if title_elem else ""

        try:
            full_text = soup.get_text()
            match = re.search(r"\d{4}-\d{2}-\d{2} \d{2}:\d{2}", full_text)

            if match:
                date_str = match.group()
                parsed_date = datetime.strptime(date_str, "%Y-%m-%d %H:%M")
                formatted_date = parsed_date.strftime("%Y-%m-%d %H:%M")
            else:
                formatted_date = "날짜없음"
        except Exception as e:
            print("❌ 날짜 파싱 오류:", e)
            formatted_date = "날짜없음"

        print("📌 soup 안에서 찾은 날짜 엘리먼트:", soup.select_one("span.txt-time01"))

        # 본문 내용
        # 본문 내용
        content_div = soup.select_one("div.story-news.article")
        paragraphs = content_div.find_all("p") if content_div else []
        # <p> 태그들 텍스트를 이어붙이기
        content = (
            "\n".join(p.get_text(strip=True) for p in paragraphs) if paragraphs else ""
        )

        if title and content:
            news_data.append(
                {
                    "title": title,
                    "content": content,
                    "date": formatted_date,
                    "link": link,
                }
            )
            print(f"✅ [{idx+1}] 저장됨: {title[:25]}...")
        else:
            print("⏩ 스킵됨 (title 또는 content 없음)")

        driver.close()
        driver.switch_to.window(driver.window_handles[0])

    except Exception as e:
        print(f"❌ 에러 발생: {e}")
        if len(driver.window_handles) > 1:
            driver.close()
            driver.switch_to.window(driver.window_handles[0])
        continue

# JSON 저장
with open("yeonhap_news4.json", "w", encoding="utf-8") as f:
    json.dump(news_data, f, ensure_ascii=False, indent=2)

print(f"\n✅ 크롤링 완료, {len(news_data)}건 저장됨 → yeonhap_news.json")

driver.quit()
