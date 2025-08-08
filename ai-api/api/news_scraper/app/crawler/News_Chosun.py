from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
from datetime import datetime
import time, json, re, os
import mysql.connector

from dotenv import load_dotenv

#  이름 : 임해균
#  작성자 : 임해균
#  수정자 : 유연우
#  수정일 : 25.08.08
#  작성일 : 2025-07-28
#  파일명 : News_Chosun.py

# riskview 데이터베이스에 맞게 테이블명, 컬럼명 변경
# 연합뉴스 사이트 뉴스 사이트, 뉴스 제목, 본문, 날짜 크롤링하여 JSON 파일로 변환 (json 폴더에 저장됨)
# Main.py에서 동작할 수 있도록 설정

load_dotenv()
host = os.getenv("DB_HOST")
user = os.getenv("DB_USER")
password = os.getenv("PASSWORD")
database = os.getenv("DB_NAME")


def crawl_news():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()), options=options
    )
    url = "https://biz.chosun.com/real_estate/real_estate_general/"
    driver.get(url)

    WebDriverWait(driver, 15).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "a.story-card__headline"))
    )

    # 스크롤 (기사 더 불러오기)
    for _ in range(3):
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(1.5)

    news_cards = driver.find_elements(
        By.CSS_SELECTOR,
        "a.story-card__headline[href*='/real_estate/real_estate_general/']",
    )
    print(f"뉴스 개수: {len(news_cards)}")

    articles = []
    count = 0

    while count < len(news_cards):
        try:
            driver.get(url)
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located(
                    (By.CSS_SELECTOR, "a.story-card__headline")
                )
            )
            time.sleep(1.5)

            news_cards = driver.find_elements(
                By.CSS_SELECTOR,
                "a.story-card__headline[href*='/real_estate/real_estate_general/']",
            )
            card = news_cards[count]
            title = card.text.strip()
            href = card.get_attribute("href")
            full_url = (
                href if href.startswith("http") else "https://biz.chosun.com" + href
            )

            driver.get(full_url)
            time.sleep(2)

            soup = BeautifulSoup(driver.page_source, "html.parser")
            content_tags = soup.select("p.article-body__content")
            content = "\n".join([p.get_text(strip=True) for p in content_tags])

            # 날짜 추출
            date_text = soup.get_text()
            date_match = re.search(r"(\d{4}[.\-]\d{2}[.\-]\d{2})", date_text)
            if date_match:
                date_str = date_match.group(1).replace(".", "-")
                try:
                    parsed_date = datetime.strptime(date_str, "%Y-%m-%d")
                    formatted_date = parsed_date.strftime("%Y-%m-%d")
                except:
                    formatted_date = datetime.now().strftime("%Y-%m-%d")
            else:
                formatted_date = datetime.now().strftime("%Y-%m-%d")

            if title and content:
                articles.append(
                    {
                        "article_code": "조선비즈",
                        "title": title,
                        "content": content,
                        "published_at": formatted_date,
                    }
                )
                print(f"✅ {title} 저장 준비 완료")
            else:
                print(f"⏩ 스킵됨 (title 또는 content 없음): {full_url}")

            count += 1

        except Exception as e:
            print(f"[에러] {count+1}번째 기사 파싱 실패: {e}")
            break

    driver.quit()
    return articles


def save_to_json(news_list, folder="app/json"):
    os.makedirs(folder, exist_ok=True)

    # News_Chosun_번호.json 파일명 규칙 적용
    existing_files = [
        f
        for f in os.listdir(folder)
        if f.startswith("News_Chosun_") and f.endswith(".json")
    ]
    file_num = len(existing_files) + 1
    filename = f"News_Chosun_{file_num}.json"

    filepath = os.path.join(folder, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(news_list, f, ensure_ascii=False, indent=2)
    print(f"✅ JSON 파일 저장 완료 ({filepath})")


def save_to_db(news_list):
    conn = mysql.connector.connect(
        host=host, user=user, password=password, database=database
    )
    cursor = conn.cursor()

    query = "INSERT INTO news_articles (article_code, title, content, published_at) VALUES (%s, %s, %s, %s)"
    check_query = "SELECT COUNT(*) FROM news_articles WHERE title = %s"
    inserted_count = 0

    for item in news_list:
        title = item.get("title", "").strip()

        cursor.execute(check_query, (title,))
        count = cursor.fetchone()[0]
        if count == 0:
            cursor.execute(
                query,
                (
                    item.get("article_code", "").strip(),
                    title,
                    item.get("content", "").strip(),
                    item.get("published_at", "").strip(),
                ),
            )
            inserted_count += 1
        else:
            print(f"⏩ 중복으로 건너뜀: {title}")

    conn.commit()
    cursor.close()
    conn.close()
    print(f"✅ DB 저장 완료! 총 {inserted_count}건 입력됨.")


def News_Chosun_Save():
    news = crawl_news()
    save_to_json(news)
    save_to_db(news)
