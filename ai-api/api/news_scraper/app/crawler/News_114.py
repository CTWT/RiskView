from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time, json, re, os
from datetime import datetime
import mysql.connector

#  이름 : 유연우
#  작성자 : 유연우
#  수정자 :
#  수정일 : 25.07.28
#  작성일 : 25.07.23
#  파일명 : News_114.py

# 부동산 114 사이트 뉴스 사이트, 뉴스 제목, 본문, 날짜 크롤링하여 JSON 파일로 변환 (json 폴더에 저장됨)
# DB 저장까지는 save_to_db 함수 주석 처리 후 실행
# DB에 각 컬럼 저장 (추후에 DB 하나의 테이블에 저장되도록 테이블 변경)


def crawl_news():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()), options=options
    )

    url = "https://www.r114.com/?_c=Research&_m=ReportNews"
    driver.get(url)
    time.sleep(3)

    news_elements = driver.find_elements(By.CSS_SELECTOR, "#idList > li")
    print(f"뉴스 개수: {len(news_elements)}")

    news_list = []

    for elem in news_elements:
        try:
            a_tag = elem.find_element(By.TAG_NAME, "a")
            js_call = a_tag.get_attribute("href")

            match = re.search(r"fnResearchDetail\((\d+),\s*'(\d+)',\s*(\d+)\)", js_call)
            if not match:
                print("❌ javascript 파싱 실패:", js_call)
                continue

            bno, gno, num = match.groups()
            detail_url = f"https://www.r114.com/?_c=Research&_m=Detail&bno={bno}&gno={gno}&num={num}&pageNo=1&pageNm=reportnews"

            driver.execute_script("window.open(arguments[0]);", detail_url)
            driver.switch_to.window(driver.window_handles[-1])
            time.sleep(2)

            title = driver.find_element(By.CSS_SELECTOR, ".h4_type4").text.strip()

            paragraphs = driver.find_elements(By.CSS_SELECTOR, "#content")
            content = "\n".join(p.text.strip() for p in paragraphs if p.text.strip())

            try:
                info_text = driver.find_element(
                    By.CSS_SELECTOR, ".view_info.clearfix"
                ).text.strip()
                date_match = re.search(r"\d{4}\.\d{2}\.\d{2}", info_text)
                if date_match:
                    date_str = date_match.group()
                    parsed_date = datetime.strptime(date_str, "%Y.%m.%d")
                    formatted_date = parsed_date.strftime("%Y-%m-%d")
                else:
                    formatted_date = "날짜없음"
            except:
                formatted_date = "날짜없음"

            if title and content:
                news_list.append(
                    {
                        "news_title": "부동산 114",
                        "title": title,
                        "content": content,
                        "date": formatted_date,
                    }
                )
                print(f"✅ {title} 저장 완료")
            else:
                print(f"⏩ 스킵됨 (title 또는 content 없음): {detail_url}")

            driver.close()
            driver.switch_to.window(driver.window_handles[0])

        except Exception as e:
            print(f"❌ 오류 발생: {e}")
            if len(driver.window_handles) > 1:
                driver.close()
                driver.switch_to.window(driver.window_handles[0])
            continue

    driver.quit()
    return news_list


def save_to_json(
    news_list, directory="ai-api/api/news_scraper/app/json", filename_base="News_114"
):
    os.makedirs(directory, exist_ok=True)
    counter = 1
    while True:
        filename = f"{filename_base}_{counter:02}.json"
        filepath = os.path.join(directory, filename)
        if not os.path.exists(filename):
            break
        counter += 1
    try:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(news_list, f, ensure_ascii=False, indent=2)
        print(f"✅ JSON 파일 저장 완료 ({filepath})")
    except Exception as e:
        print(f"❌ JSON 저장 중 오류 발생: {e}")


def save_to_db(news_list):
    conn = mysql.connector.connect(
        host="localhost", user="root", password="12345", database="newsdb"
    )
    cursor = conn.cursor()

    query = "INSERT INTO news_114 (news_title, title, content, date) VALUES (%s, %s, %s, %s)"
    inserted_count = 0
    skipped_count = 0

    for item in news_list:
        news_title = item.get("news_title", "").strip()
        title = item.get("title", "").strip()
        content = item.get("content", "").strip()
        date = item.get("date", "").strip()

        if news_title and title and content and date:
            try:
                cursor.execute(query, (news_title, title, content, date))
                inserted_count += 1
                print(f"✅ 저장 완료: {news_title}")
            except mysql.connector.IntegrityError:
                skipped_count += 1
                print(f"⚠️ 중복 건너뜀: {news_title}")
            except Exception as e:
                print(f"❌ 기타 오류: {e} - {news_title}")

    conn.commit()
    cursor.close()
    conn.close()
    print(
        f"✅ DB 저장 완료! 총 {inserted_count}건 입력됨, {skipped_count}건 중복으로 건너뜀."
    )


def News_114_Save():
    news = crawl_news()
    save_to_json(news, directory="ai-api/api/news_scraper/app/json")
    save_to_db(news)
