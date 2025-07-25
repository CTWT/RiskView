# 이름 : 임해균
# 작성자 : 임해균 
# 수정자 : 
# 작성일 : 2025-07-20
# 파일명 : chosun.py

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import time

def get_chosun_news():
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')  # 창 안 띄움 (서버에서도 작동 가능)
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    url = "https://biz.chosun.com/real_estate/real_estate_general/"
    driver.get(url)

    try:
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "a.story-card__headline"))
        )
    except:
        driver.quit()
        return []

    for _ in range(3):
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(1.5)

    news_cards = driver.find_elements(By.CSS_SELECTOR, "a.story-card__headline[href*='/real_estate/real_estate_general/']")
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

            if title and content:
                articles.append({"title": title, "content": content})

            count += 1

        except Exception as e:
            print(f"[에러] {count+1}번째 기사 파싱 실패: {e}")
            break

    driver.quit()
    return articles
