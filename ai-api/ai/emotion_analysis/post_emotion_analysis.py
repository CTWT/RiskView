import mysql.connector
from openai import OpenAI
from dotenv import load_dotenv, find_dotenv
import json, os, re
import unicodedata  # 정규화
from bs4 import BeautifulSoup  # HTML 태그 제거


#  수업명 : 가비아 2회차
#  이름 : 유연우
#  작성자 : 유연우
#  수정자 :
#  작성일 : 25.09.23
#  파일명 : post_emotion_analysis.py
#

#  설명 : posts 테이블의 게시글을 대상으로 GPT-4o 모델을 활용한 감성 분석 수행 및 결과 저장


# .env 로드 및 키 확인
load_dotenv(find_dotenv())

if not os.getenv("OPENAI_API_KEY"):
    raise ValueError(
        "OPENAI_API_KEY 환경 변수가 설정되지 않았습니다. .env 파일을 확인하세요."
    )

api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

BASE_PROMPT = """
너는 부동산 커뮤니티의 게시글 내용을 분석하는 AI 감성 분석가야.

사용자가 작성한 커뮤니티 글의 **텍스트 내용만을 기반으로** 감성분석을 수행하고, 다음 항목을 JSON 형식으로 출력해줘.
summary는 4문장을 반드시 채워줘.

출력 형식(JSON):
{
  "sentiment_score": 숫자(0~100 사이 정수),
  "sentiment_category": "긍정" 또는 "부정" 또는 "중립",
  "sentiment_emoji": "😄" 또는 "😐" 또는 "😠" 등 적절한 이모지,
  "summary": "글의 감성 분석 결과를 한 문장으로 요약",
}

조건:
- **분석은 글의 텍스트 내용만 보고 판단**해야 하며, 글쓴이의 의도나 외부 정보는 고려하지 않는다.
- 점수는 0~100 사이로, 소수점 없이 **정수로 표현**
- summary는 **분석적이고 감성적인 표현 사용**
- 감정 점수와 감정 분류는 **서로 일관성 있게 판단**
- 이모지는 **사용자 감정의 직관적 표현**에 맞게 선택

- 출력은 **반드시 JSON 형식**으로만 제공, 다른 설명이나 부가 정보는 포함하지 않음
- JSON 형식이 깨지지 않도록 주의

출력 예시:
{
  "sentiment_score": 85,
  "sentiment_category": "긍정",
  "sentiment_emoji": "😄",
  "summary": "이 글은 부동산 시장의 긍정적인 전망을 잘 설명하고 있습니다. 첫 주택 매매 경험을 공유하며 희망적인 메시지를 전달합니다. 🌈 첫 주택 매매를 축하합니다!"
}

- 모든 출력은 반드시 JSON 객체여야 하며, 코드 블록(예: ```)으로 감싸지 마세요.
- summary 기제시 반드시 어울리는 이모지를 추가하세요.
- summary 기재시 반드시 게시물에 대한 감성분석을 한 줄 이상 기재하세요.
- summary 감성 분석 멘트 후 매우 감성적인 코멘트를 한 줄 이상 추가하세요.

"""

_MD_IMG_PATTERN = re.compile(r"!\[[^\]]*\]\([^)]*\)")  # 이미지 제거용


def extract_visible_text(html_or_md: str) -> str:
    """HTML/Markdown 문자열에서 이미지/스크립트 등을 제외하고 텍스트만 추출."""
    if not html_or_md:
        return ""

    # 이미지 패턴 제거
    s = _MD_IMG_PATTERN.sub("", html_or_md)

    # HTML 파싱
    soup = BeautifulSoup(s, "html.parser")

    # 보이지 않는/불필요한 태그 제거
    for tag in soup(["script", "style", "noscript", "svg", "canvas"]):
        tag.decompose()

    # 이미지 태그 제거
    for img in soup.find_all("img"):
        img.decompose()

    # 텍스트 추출
    text = soup.get_text(separator=" ", strip=True)
    text = " ".join(text.split())
    return text


def connect_db():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME"),
            connect_timeout=10,
        )
        return connection

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None


# 게시글 목록 불러오기
def fetch_posts():
    conn = connect_db()
    if not conn:
        return []
    try:
        with conn.cursor(dictionary=True) as cur:
            cur.execute("SELECT post_code, title, content FROM posts")
            return cur.fetchall()
    finally:
        conn.close()


# 정규화
def normalize(text: str) -> str:
    if not text:
        return ""
    text = unicodedata.normalize("NFC", text)
    text = (
        text.replace("\u00a0", " ")
        .replace("\u200b", "")
        .replace("\u200c", "")
        .replace("\ufeff", "")
    )
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    lines = [" ".join(line.split()) for line in text.split("\n")]
    return "\n".join([line for line in lines if line]).strip()


# 텍스트 판별
def is_valid_text(text: str) -> bool:
    if not text:
        return False
    text = extract_visible_text(text).strip()

    # 최소 길이 체크
    if len(text) < 10:
        return False
    # HTML 태그 제거
    text = re.sub(r"<[^>]+>", "", text)
    # 특수문자, 이모지, 공백만 있는 경우
    if re.fullmatch(r"[\s\W\d_]+", text):
        return False
    # 광고성 키워드만 있는 경우 (옵션)
    if any(word in text.lower() for word in ["광고", "클릭", "http", "www"]):
        return False
    return True


# 프롬프트 생성
def create_prompt(title: str, content: str) -> str:
    clean_content = extract_visible_text(content)
    return BASE_PROMPT + f'\n\n"""\n{title.strip()}\n{normalize(clean_content)}\n"""'


# 감성 분석 실행
def analyze_sentiment(title: str, content: str):
    prompt = create_prompt(title, content)
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=700,
    )
    return json.loads(response.choices[0].message.content.strip())


# 분석 결과 저장
def save_analysis(post_code: str, result: dict):
    conn = connect_db()
    if not conn:
        return
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO post_sentiment_analysis (
                    analysis_code, post_code, sentiment_score, sentiment_category,
                    sentiment_emoji, summary, analyzed_at
                ) VALUES (%s, %s, %s, %s, %s, %s, NOW())
            """,
                (
                    f"PA{post_code[-5:]}",  # 예: post_code=POST00001 → PA00001
                    post_code,
                    result["sentiment_score"],
                    result["sentiment_category"],
                    result["sentiment_emoji"],
                    result["summary"],
                ),
            )
            conn.commit()
    finally:
        conn.close()


# json 형식으로 반환
def analyze_all_posts_as_json():
    posts = fetch_posts()
    results = []
    for post in posts:
        title = post["title"]
        content = post["content"]

        try:
            result = analyze_sentiment(title, content)
            results.append({"post_code": post["post_code"], "analysis": result})
            save_analysis(post["post_code"], result)

        except Exception as e:
            results.append({"post_code": post["post_code"], "error": str(e)})
    return results


# post_code


if __name__ == "__main__":
    # posts 테이블 전체 감성분석 실행
    results = analyze_all_posts_as_json()
    import json

    print(json.dumps(results, ensure_ascii=False, indent=2))
