
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

#  이름 : 임해균
#  작성자 : 임해균
#  수정자 :
#  작성일 : 2025-07-28
#  파일명 : chosun.py


def crawl_news():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    url = "https://biz.chosun.com/real_estate/real_estate_general/"
    driver.get(url)

    WebDriverWait(driver, 15).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "a.story-card__headline"))
    )

    # 스크롤 (기사 더 불러오기)
    for _ in range(3):
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(1.5)

    news_cards = driver.find_elements(By.CSS_SELECTOR, "a.story-card__headline[href*='/real_estate/real_estate_general/']")
    print(f"뉴스 개수: {len(news_cards)}")

    articles = []
    count = 0

    while count < len(news_cards):
        try:
            driver.get(url)
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "a.story-card__headline"))
            )
            time.sleep(1.5)

            news_cards = driver.find_elements(By.CSS_SELECTOR, "a.story-card__headline[href*='/real_estate/real_estate_general/']")
            card = news_cards[count]
            title = card.text.strip()
            href = card.get_attribute("href")
            full_url = href if href.startswith("http") else "https://biz.chosun.com" + href

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
                articles.append({
                    "news_title": "조선비즈",
                    "title": title,
                    "content": content,
                    "date": formatted_date
                })
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

    existing_files = [f for f in os.listdir(folder) if f.startswith("chosun_") and f.endswith(".json")]
    file_num = len(existing_files) + 1
    filename = f"chosun_{file_num}.json"

    filepath = os.path.join(folder, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(news_list, f, ensure_ascii=False, indent=2)
    print(f"✅ JSON 파일 저장 완료 ({filepath})")


def save_to_db(news_list):
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="12345",
        database="realestate_news"
    )
    cursor = conn.cursor()

    query = "INSERT INTO chosun_news_test (news_title, title, content, date) VALUES (%s, %s, %s, %s)"
    check_query = "SELECT COUNT(*) FROM chosun_news_test WHERE title = %s"
    inserted_count = 0

    for item in news_list:
        title = item.get("title", "").strip()

        cursor.execute(check_query, (title,))
        count = cursor.fetchone()[0]
        if count == 0:
            cursor.execute(query, (
                item.get("news_title", "").strip(),
                title,
                item.get("content", "").strip(),
                item.get("date", "").strip()
            ))
            inserted_count += 1
        else:
            print(f"⏩ 중복으로 건너뜀: {title}")

    conn.commit()
    cursor.close()
    conn.close()
    print(f"✅ DB 저장 완료! 총 {inserted_count}건 입력됨.")


def Chosun_Save():
    news = crawl_news()
    save_to_json(news)
    save_to_db(news)


if __name__ == "__main__":
    Chosun_Save()
