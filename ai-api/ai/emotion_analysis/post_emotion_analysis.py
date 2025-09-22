import mysql.connector
from openai import OpenAI
from dotenv import load_dotenv, find_dotenv
import json, os, re
import unicodedata  # 정규화

# 1) .env 로드 및 키 확인 - 현재 작업경로에 없는 경우, find_dotenv()로 경로 탐색
load_dotenv(find_dotenv())

if not os.getenv("OPENAI_API_KEY"):
    raise ValueError(
        "OPENAI_API_KEY 환경 변수가 설정되지 않았습니다. .env 파일을 확인하세요."
    )

# 환경 변수에서 OpenAI API 키 가져오기
api_key = os.getenv("OPENAI_API_KEY")
# 2) OpenAI 클라이언트 생성
client = OpenAI(api_key=api_key)

# 3) 분석 프롬프트 (출력은 반드시 JSON만)
BASE_PROMPT = """
너는 부동산 커뮤니티의 게시글 내용을 분석하는 AI 감성 분석가야.

사용자가 작성한 커뮤니티 글의 **텍스트 내용만을 기반으로** 감성분석을 수행하고, 다음 항목을 JSON 형식으로 출력해줘.
summary는 2문장을 반드시 채워줘.

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

"""


# MySQL 데이터베이스에 연결
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


# 유니코드 정규화
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


# 분석 프롬프트 생성
def create_prompt(title: str, content: str) -> str:
    return BASE_PROMPT + f'\n\n"""\n{title.strip()}\n{normalize(content)}\n"""'


# 감성 분석 실행
def analyze_sentiment(title: str, content: str):
    prompt = create_prompt(title, content)
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=700,
    )
    return json.loads(response.choices[0].message.content.strip())


# json 형식으로 반환
def analyze_all_posts_as_json():
    posts = fetch_posts()
    results = []
    for post in posts:
        try:
            result = analyze_sentiment(post["title"], post["content"])
            results.append({"post_code": post["post_code"], "analysis": result})
        except Exception as e:
            results.append({"post_code": post["post_code"], "error": str(e)})
    return results


# # 로컬 테스트용
# if __name__ == "__main__":
#     # posts 테이블 전체 감성분석 실행
#     results = analyze_all_posts_as_json()
#     import json

#     print(json.dumps(results, ensure_ascii=False, indent=2))
