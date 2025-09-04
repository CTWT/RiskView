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
뉴스 기사의 감정 분석을 수행하세요. 제공된 뉴스 기사 텍스트의 감정적 톤, 맥락, 그리고 관련 단서를 차근차근 분석하여 전체적인 감정(긍정, 부정, 중립)을 도출하세요. 마지막 결과는 반드시 JSON 형식으로 출력해야 하며, 코드 블록 없이 결과만 작성하세요.

- 뉴스 기사의 내용·공백·줄바꿈을 항상 동일하게 유지하세요.
- 기사에 나타난 감정적 톤, 단어 선택, 주제, 그리고 내포된 혹은 명시된 감정 등을 단계별로 추론하세요. 기사 맥락과 애매모호한 부분도 고려해 판단합니다.
- 위 과정을 충분히 추론한 뒤, 전체적인 감정이 "긍정", "부정", "중립" 중 어떤 것인지를 결정하세요.
- 최종 결과는 다음 3개 필드를 가진 JSON 객체여야 합니다.
    1. reasoning: 기사에서 추론한 근거와 요약 (객관적, 분석 중심)
    2. sentiment: 반드시 "긍정", "부정", "중립" 중 하나만 출력 (ENUM 값에 맞춰야 함)
    3. emotional_comment: 기사 내용에 대해 사람처럼 느끼는 감정과 생각을 이모지와 함께 짧게 작성
       - 문체: 사람 대화체, 감정표현 이모지 포함
       - 1~2문장 내외, 조언·우려·격려 등 짧게 첨언 가능
       - 예: "정부의 정책으로 전세 가격이 오르니 걱정이 되네요 🥺 주거 취약 계층이 힘들어질까 우려됩니다."
    4. confidence: 0~100 사이 확신도 (정수 형태, % 단위)
    5. key_drivers: 감정 판단에 영향을 준 근거 문구 리스트 (최대 3개)

# 출력 형식 예시

## 입력:
뉴스기사 예시:
"정부의 정책으로 인해 전세 가격이 소폭 상승하고 있다."

## 출력:
{
  "reasoning": "정부의 정책이 전세 시장에 영향을 주어 가격이 상승하고 있으며, 이는 서민층과 주거 취약계층에 부담을 줄 수 있다는 분석이다.",
  "sentiment": "부정",
  "emotional_comment": "전세 가격이 올라 걱정이 되네요 🥺 이럴 땐 주택 거래를 조금 미루는 것도 좋을 것 같아요 🌈"
}

# 엣지 케이스 및 주의사항
- 여러 감정이 혼재된 경우, 기사에서 중점적으로 다룬 주제를 기준으로 가장 우세한 감정을 선택하세요.
- 모든 출력은 반드시 JSON 객체여야 하며, 코드 블록(예: ```)으로 감싸지 마세요.
"""

# 4) 테스트용 기사 (원하는 텍스트로 바꾸세요)
# article = """
# 국내 제조업이 3분기 연속 성장세를 이어가고 있다.
# 전문가들은 앞으로도 긍정적인 전망을 내놓고 있다.
# """


# 정규화
def normalize_article(text: str) -> str:
    if not text:
        return ""
    # 유니코드 정규화 (NFC) - 글자 모양 통일
    normalized_text = unicodedata.normalize("NFC", text)
    # 특수공백 삭제
    normalized_text = (
        normalized_text.replace("\u00a0", " ")  # NBSP -> 일반 공백
        .replace("\u200b", "")  # 제로 너비 공백 제거
        .replace("\u200c", "")  # 제로 너비 연결 문자 제거
        .replace("\ufeff", "")  # BOM 제거
    )
    # 줄바꿈 통일
    normalized_text = normalized_text.replace("\r\n", "\n").replace("\r", "\n")
    # 각 줄 내부 공백 여러개 -> 한 칸
    lines = [" ".join(line.split()) for line in normalized_text.split("\n")]
    # 빈 줄 제거
    return "\n".join([line for line in lines if line]).strip()


def analyze_article(article_text: str) -> str:
    """기사 텍스트를 받아 JSON 문자열(모델 출력)을 반환"""
    user_content = BASE_PROMPT + "\n\n[기사 텍스트]\n" + normalize_article(article_text)
    resp = client.chat.completions.create(
        model="gpt-4.1",
        messages=[
            {
                "role": "system",
                "content": "너는 감정 분석가다. 출력은 반드시 JSON 객체 한 개만, 코드블록 없이.",
            },
            {"role": "user", "content": user_content},
        ],
        temperature=0,  # 결정적 출력
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0,
        seed=42,
        max_tokens=400,
    )
    return resp.choices[0].message.content.strip()


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


# 데이터베이스에서 기사 갖고 오기
def fetch_article_content(article_id: int = 1) -> str:
    # 주어진 ID의 기사 내용을 데이터베이스에서 가져옴
    connection = connect_db()
    if not connection:
        return "데이터베이스 연결 실패"

    try:
        cursor = connection.cursor()
        # article_id = 1  # test로 사용할 ID
        cursor.execute(
            "SELECT content FROM news_articles WHERE article_id = %s", (article_id,)
        )
        row = (
            cursor.fetchone()
        )  # 쿼리 실행 결과에서 한 행만 가져올 때 사용 / 여러행 은 fetchall()
        return row[0] if row else "해당 ID의 기사가 없습니다."

    except mysql.connector.Error as err:
        return f"데이터베이스 오류: {err}"

    finally:
        cursor.close()
        connection.close()


# DB에서 가져온 기사 감성분석
def run_sentiment_analysis(article_id: int = 1):
    article_text = fetch_article_content(article_id)  # ID 1번 기사 내용 가져오기
    if (
        not article_text
        or article_text.startswith("데이터베이스")
        or article_text.startswith("해당 ID")
    ):
        return f"오류: {article_text}"

    # 감성분석 호출
    return analyze_article(article_text)


# 뉴스 감성분석 고유 코드 부여
def generate_analysis_code():
    conn = connect_db()
    cur = conn.cursor()
    cur.excute("select count(*) from news_sentiment_analysis")
    count = cur.fetchone()[0]
    cur.close()
    conn.close()
    return f"AN{count + 1:04d}"  # AN0001, AN0002 등으로 생성


# DB 저장
def save_analysis_to_db(article_code, analysis_json):
    conn = connect_db()
    cur = conn.cursor()

    analysis_code = generate_analysis_code()
    sentiment_score = analysis_json.get("confidence")
    sentiment_category = analysis_json.get("sentiment")
    comment = analysis_json.get("emotional_comment", "")
    emoji_match = re.findall(r"[\U00010000-\U0010ffff]", comment)
    sentiment_emoji = emoji_match[0] if emoji_match else None
    summary = analysis_json.get("reasoning")

    # db에 제대로 저장되는지 확인 데이터
    debug_data = {
        "analysis_code": analysis_code,
        "article_code": article_code,
        "sentiment_score": sentiment_score,
        "sentiment_category": sentiment_category,
        "sentiment_emoji": sentiment_emoji,
        "summary": summary,
    }

    print(
        "📄 DB 저장 예정 데이터:", json.dumps(debug_data, ensure_ascii=False, indent=2)
    )

    # cur.execute(
    #     """
    #     INSERT INTO news_sentiment_analysis
    #     (analysis_code, article_code, sentiment_score, sentiment_category, sentiment_emoji, summary, analyzed_at)
    #     VALUES (%s, %s, %s, %s, %s, %s, NOW())
    # """,
    #     (
    #         analysis_code,
    #         article_code,
    #         sentiment_score,
    #         sentiment_category,
    #         sentiment_emoji,
    #         summary,
    #     ),
    # )

    conn.commit()
    cur.close()
    conn.close()

    print(f"✅ DB 저장 완료: {analysis_code}")


# json 저장
def save_analysis_to_json(article_id, analysis_json):
    file_name = f"analysis_result_{article_id}.json"
    with open(file_name, "w", encoding="utf-8") as f:
        json.dump(analysis_json, f, ensure_ascii=False, indent=4)
    print(f"JSON 저장 완료 : {file_name}")


# 실행
if __name__ == "__main__":
    print(">>> 실행 시작")

    result = run_sentiment_analysis(article_id=1)
    print(">>> run_sentiment_analysis 결과 값:", result)

    print(">>> 실행 종료")
