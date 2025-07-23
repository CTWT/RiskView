from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time
import json
import re 
from datetime import datetime

#  이름 : 유연우
#  작성자 : 유연우
#  수정자 : 
#  작성일 : 25.07.23
#  파일명 : news_114.py

# 부동산 114 사이트에서 뉴스 제목, 본문, 날짜 크롤링 코드

# 크롬 브라우저 옵션 설정 (창 없이 실행)
options = webdriver.ChromeOptions()
options.add_argument('--headless') 
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

# 크롬 드라이버 생성
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

# 부동산114 뉴스 목록 페이지로 이동
url = "https://www.r114.com/?_c=Research&_m=ReportNews"
driver.get(url)
time.sleep(3) 

# 뉴스 리스트 가져오기 (li 태그들)
news_elements = driver.find_elements(By.CSS_SELECTOR, "#idList > li")
print(f"뉴스 개수: {len(news_elements)}")  # 전체 뉴스 개수

# 뉴스 정보 저장 리스트
news_list = []

# 뉴스 하나씩 반복
for elem in news_elements:
    try:
        # 각 뉴스의 <a> 태그에서 href 속성 추출
        a_tag = elem.find_element(By.TAG_NAME, "a")
        js_call = a_tag.get_attribute("href")  # e.g., "javascript:fnResearchDetail(52, '1', 4594)"

        # JavaScript 호출 문자열에서 bno, gno, num 추출
        match = re.search(r"fnResearchDetail\((\d+),\s*'(\d+)',\s*(\d+)\)", js_call)
        if not match:
            print("❌ javascript 파싱 실패:", js_call)
            continue  # 다음 뉴스로

        # 추출된 숫자 값
        bno, gno, num = match.groups()

        # 실제 상세 기사 페이지 URL 구성
        detail_url = f"https://www.r114.com/?_c=Research&_m=Detail&bno={bno}&gno={gno}&num={num}&pageNo=1&pageNm=reportnews"

        # 새 탭 열고 해당 뉴스 상세 페이지 접속
        driver.execute_script("window.open(arguments[0]);", detail_url)
        driver.switch_to.window(driver.window_handles[-1]) 
        time.sleep(2) 

        # 제목
        title = driver.find_element(By.CSS_SELECTOR, ".h4_type4").text.strip()

        # 본문
        paragraphs = driver.find_elements(By.CSS_SELECTOR, "#content")
        content = "\n".join(p.text.strip() for p in paragraphs if p.text.strip())  # 본문 텍스트 합치기
        
        # 날짜 텍스트 가져오기
        try:
            info_text = driver.find_element(By.CSS_SELECTOR, ".view_info.clearfix").text.strip()
            date_match = re.search(r"\d{4}\.\d{2}\.\d{2}", info_text)
            if date_match:
                date_str = date_match.group()
                parsed_date = datetime.strptime(date_str, "%Y.%m.%d")
                formatted_date = parsed_date.strftime("%Y-%m-%d")
            else:
                formatted_date = "날짜없음"
        except:
            formatted_date = "날짜없음"
            
        # 제목과 본문이 모두 존재하면 저장
        if title and content:
            news_list.append({
            "title": title,
            "content": content,
            "date": formatted_date
        })
            print(f"✅ {title} 저장 완료")
        else:
            print(f"⏩ 스킵됨 (title 또는 content 없음): {detail_url}")

        # 탭 닫고 원래 창으로 전환
        driver.close()
        driver.switch_to.window(driver.window_handles[0])

    except Exception as e:
        # 예외 발생 시 탭 정리하고 오류 출력
        print(f"❌ 오류 발생: {e}")
        if len(driver.window_handles) > 1:
            driver.close()
            driver.switch_to.window(driver.window_handles[0])
        continue  # 다음 뉴스로 넘어감

# 결과를 JSON 파일로 저장
with open("부동산114_뉴스_9.json", "w", encoding="utf-8") as f:
    json.dump(news_list, f, ensure_ascii=False, indent=2)

# 완료 메시지 출력
print(f"\n✅ 크롤링 완료! 총 {len(news_list)}개 기사 저장됨.")

# 브라우저 종료
driver.quit()