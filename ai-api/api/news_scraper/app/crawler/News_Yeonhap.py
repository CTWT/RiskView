from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import time, json, re
from datetime import datetime
import mysql.connector


#  이름 : 유연우
#  작성자 : 유연우
#  수정자 :
#  수정일 : 25.07.25
#  작성일 : 25.07.23
#  파일명 : News_yeonhap.py

# 연합뉴스 사이트 뉴스 사이트, 뉴스 제목, 본문, 날짜 크롤링하여 JSON 파일로 변환
# DB에 각 컬럼 저장 (추후에 DB 하나의 테이블에 저장되도록 테이블 변경)


def crawl_yeonhap_news():
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

    base_url = "https://www.yna.co.kr"
    list_url = base_url + "/economy/real-estate"
    driver.get(list_url)
    time.sleep(5)

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

            driver.execute_script("window.open(arguments[0]);", link)
            driver.switch_to.window(driver.window_handles[-1])
            time.sleep(2)

            soup = BeautifulSoup(driver.page_source, "html.parser")

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

            content_div = soup.select_one("div.story-news.article")
            paragraphs = content_div.find_all("p") if content_div else []
            content = (
                "\n".join(p.get_text(strip=True) for p in paragraphs)
                if paragraphs
                else ""
            )

            if title and content:
                news_data.append(
                    {
                        "news_title": "연합뉴스",
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

    driver.quit()
    return news_data


def save_to_json(news_list, filename="yeonhap_news_latest.json"):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(news_list, f, ensure_ascii=False, indent=2)
    print(f"✅ JSON 저장 완료: {filename}")


def save_to_db(news_list):
    try:
        conn = mysql.connector.connect(
            host="localhost", user="root", password="12345", database="newsdb"
        )
        print("✅ DB 연결 성공!")
    except mysql.connector.Error as err:
        print("❌ DB 연결 실패:", err)
        return

    cursor = conn.cursor()

    for article in news_list:
        news_title = "연합뉴스"
        title = article["title"]
        content = article["content"]
        date = article["date"]

        query = "INSERT INTO yeonhap (news_title, title, content, date) VALUES (%s, %s, %s, %s)"

        try:
            cursor.execute(query, (news_title, title, content, date))
            print(f"✅ 저장됨: {title}")
        except mysql.connector.IntegrityError:
            print(f"❌ 중복 건너뜀: {title}")

    conn.commit()
    cursor.close()
    conn.close()
    print("✅ DB 저장 완료!")


def News_Yeonhap_Save():
    news = crawl_yeonhap_news()
    save_to_json(news, path="app/json")
    save_to_db(news)
