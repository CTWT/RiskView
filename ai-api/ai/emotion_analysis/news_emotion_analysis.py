import mysql.connector
from openai import OpenAI
from dotenv import load_dotenv, find_dotenv
import json, os, re
import unicodedata  # 정규화

#  수업명 : 가비아 2회차
#  이름 : 유연우
#  작성자 : 유연우
#  수정자 :
#  작성일 : 25.09.10
#  파일명 : emotion_analysis_gpt4o.py
#

#  설명 : GPT-4o 모델을 활용한 뉴스 기사 감정 분석 및 DB 저장


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
- 위 과정을 충분히 추론한 뒤, 전체적인 감정이 "긍정(Positive)", "부정(Negative)", "중립(Neutral)" 중 어떤 것인지를 결정하세요.
- 최종 결과는 다음 3개 필드를 가진 JSON 객체여야 합니다.
    1. summary: 기사에서 추론한 근거와 요약 (객관적, 분석 중심)
    2. sentiment_category: "긍정(Positive)", "부정(Negative)", "중립(Neutral)" 중 하나
    3. sentiment_emoji: "긍정(Positive)" -> "😊", "부정(Negative)" -> "😞", "중립(Neutral)" -> "😐"
    4. emotional_comment: 기사 내용에 대해 사람처럼 느끼는 감정과 생각을 이모지와 함께 짧게 작성
       - 문체: 사람 대화체, 감정표현 이모지 포함
       - 1~2문장 내외, 조언·우려·격려 등 짧게 첨언 가능
       - 예: "정부의 정책으로 전세 가격이 오르니 걱정이 되네요 🥺 주거 취약 계층이 힘들어질까 우려됩니다. 😭"
    5. sentimental_score: 0~100 사이 확신도 (정수 형태, % 단위)
    6. key_words: 감정 판단에 영향을 준 근거 단어 리스트 (최대 3개)

# 출력 형식 예시

## 입력:
뉴스기사 예시:
"정부의 정책으로 인해 전세 가격이 소폭 상승하고 있다."

## 출력:
{
  "summary": "정부의 정책이 전세 시장에 영향을 주어 가격이 상승하고 있으며, 이는 서민층과 주거 취약계층에 부담을 줄 수 있다는 분석이다.",
  "sentiment_category": "부정(Negative)",
  "emotional_comment": "전세 가격이 올라 걱정이 되네요 🥺 이럴 땐 주택 거래를 조금 미루는 것도 좋을 것 같아요 😅"
}

# 엣지 케이스 및 주의사항
- 여러 감정이 혼재된 경우, 기사에서 중점적으로 다룬 주제를 기준으로 가장 우세한 감정을 선택하세요.
- 모든 출력은 반드시 JSON 객체여야 하며, 코드 블록(예: ```)으로 감싸지 마세요.
- key_words 필드는 감정 판단에 영향을 준 기사 내 단어를 최대 3개까지 리스트로 포함하세요.
"""


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


def _strip_code_fences(s: str) -> str:
    s = s.strip()
    if s.startswith("```"):
        # 첫 줄의 ```xxx 제거
        first_newline = s.find("\n")
        if first_newline != -1:
            s = s[first_newline + 1 :]
        # 마지막 ``` 제거
        if s.endswith("```"):
            s = s[:-3]
    return s.strip()


def parse_model_json(text: str) -> dict:
    try:
        cleaned = _strip_code_fences(text)
        return json.loads(cleaned)
    except Exception:
        return {}


def normalize_category(raw: str) -> str:
    if not raw:
        return None
    raw = raw.strip()
    for key in ["긍정", "부정", "중립"]:
        if key in raw:
            return key
    # 영문만 온 경우
    lower = raw.lower()
    if "positive" in lower:
        return "긍정"
    if "negative" in lower:
        return "부정"
    if "neutral" in lower:
        return "중립"
    return None


def extract_first_emoji(text_value: str) -> str:
    if not text_value:
        return ""
    m = re.search(
        r"[\U0001F300-\U0001FAFF\U00002600-\U000026FF\U00002700-\U000027BF]", text_value
    )
    return m.group(0) if m else ""


def fetch_article_content(article_id: int = 1) -> dict:
    connection = connect_db()
    if not connection:
        return {"error": "데이터베이스 연결 실패"}

    try:
        cursor = connection.cursor()
        cursor.execute(
            "SELECT content, article_code, site_name FROM news_articles WHERE article_id = %s",
            (article_id,),
        )
        row = cursor.fetchone()
        if not row:
            return {"error": "해당 ID의 기사가 없습니다."}
        return {"content": row[0], "article_code": row[1], "site_name": row[2]}
    except mysql.connector.Error as err:
        return {"error": f"데이터베이스 오류: {err}"}
    finally:
        try:
            cursor.close()
        except Exception:
            pass
        connection.close()


def fetch_all_articles() -> list:
    connection = connect_db()
    results = []
    if not connection:
        print("❌ DB 연결 실패 (fetch_all_articles)")
        return results
    try:
        cursor = connection.cursor()
        cursor.execute(
            "SELECT article_id, article_code, site_name, content FROM news_articles ORDER BY article_id ASC"
        )
        rows = cursor.fetchall()
        for r in rows:
            results.append(
                {
                    "article_id": r[0],
                    "article_code": r[1],
                    "site_name": r[2],
                    "content": r[3],
                }
            )
    except mysql.connector.Error as err:
        print(f"❌ DB 조회 오류(fetch_all_articles): {err}")
    finally:
        try:
            cursor.close()
        except Exception:
            pass
        connection.close()
    return results


def run_sentiment_analysis(article_id: int = 1):
    article = fetch_article_content(article_id)
    if "error" in article:
        return f"오류: {article['error']}", None

    content = article["content"]
    # 감성분석 호출 (JSON 문자열)
    model_out = analyze_article(content)
    analysis_dict = parse_model_json(model_out)

    if not analysis_dict:
        return "오류: 모델 출력 파싱 실패", None

    return analysis_dict, article


def generate_analysis_code(article_code: str) -> str:
    return f"AN_{article_code}"


def save_analysis_to_db(article_code: str, analysis_json: dict, created_by: str = None):
    conn = connect_db()
    if not conn:
        print("❌ DB 연결 실패")
        return

    try:
        cur = conn.cursor()

        # 요구사항에 맞춘 고유코드 생성
        analysis_code = generate_analysis_code(article_code)

        # 이미 존재하는지 확인
        cur.execute(
            "SELECT 1 FROM news_sentiment_analysis WHERE analysis_code=%s LIMIT 1",
            (analysis_code,),
        )
        if cur.fetchone():
            print(f"⏭️ 이미 존재: {analysis_code} -> 건너뜀")
            return

        # 프롬프트 스키마 매핑
        summary = analysis_json.get("summary")
        sentiment_category = normalize_category(analysis_json.get("sentiment_category"))
        # 점수: 모델이 0~100 정수(문자)로 보낸다고 가정. 없으면 None
        raw_score = analysis_json.get("sentimental_score")
        try:
            sentiment_score = float(raw_score) if raw_score is not None else None
        except Exception:
            sentiment_score = None

        emotional_comment = analysis_json.get("emotional_comment", "")
        sentiment_emoji = analysis_json.get("sentiment_emoji") or extract_first_emoji(
            emotional_comment
        )

        # key_words: 최대 3개 리스트 가정 -> 문자열로 저장(쉼표 구분)
        key_words_value = analysis_json.get("key_words")
        if isinstance(key_words_value, list):
            key_words_str = ", ".join(map(str, key_words_value[:3]))
        elif isinstance(key_words_value, str):
            key_words_str = key_words_value
        else:
            key_words_str = None

        cur.execute(
            """
            INSERT INTO news_sentiment_analysis 
            (analysis_code, article_code, sentiment_score, sentiment_category, sentiment_emoji, summary, key_words, created_by, analyzed_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
            """,
            (
                analysis_code,
                article_code,
                sentiment_score,
                sentiment_category,
                sentiment_emoji,
                summary,
                key_words_str,
                created_by,
            ),
        )
        conn.commit()
        print(f"✅ DB 저장 완료: {analysis_code}")
    except mysql.connector.Error as err:
        print(f"❌ DB 저장 오류: {err}")
    finally:
        try:
            cur.close()
        except Exception:
            pass
        conn.close()


# json 저장
def save_analysis_to_json(article_id, analysis_json):
    file_name = f"analysis_result_{article_id}.json"
    with open(file_name, "w", encoding="utf-8") as f:
        json.dump(analysis_json, f, ensure_ascii=False, indent=4)
    print(f"JSON 저장 완료 : {file_name}")


def analyze_and_save(article_id: int, created_by: str = None):
    analysis_dict, article_meta = run_sentiment_analysis(article_id)
    if isinstance(analysis_dict, str) and analysis_dict.startswith("오류"):
        print(analysis_dict)
        return
    # article_code 기반으로 analysis_code 구성
    article_code = article_meta["article_code"]
    save_analysis_to_db(article_code, analysis_dict, created_by=created_by)


def analyze_all_and_save(created_by: str = None, limit: int = None):
    articles = fetch_all_articles()
    if limit is not None:
        articles = articles[:limit]

    total = len(articles)
    success = 0
    fail = 0

    for idx, art in enumerate(articles, 1):
        try:
            content = art["content"]
            model_out = analyze_article(content)
            analysis_dict = parse_model_json(model_out)
            if not analysis_dict:
                print(
                    f"[{idx}/{total}] ❌ 파싱 실패 article_code={art['article_code']}"
                )
                fail += 1
                continue

            save_analysis_to_db(
                art["article_code"], analysis_dict, created_by=created_by
            )
            success += 1
            print(f"[{idx}/{total}] ✅ 저장 완료 article_code={art['article_code']}")
        except Exception as e:
            print(
                f"[{idx}/{total}] ❌ 예외 발생 article_code={art.get('article_code')}: {e}"
            )
            fail += 1

    print(f"=== 완료: total={total}, success={success}, fail={fail} ===")


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


# 실행
if __name__ == "__main__":
    # 전체 기사 일괄 분석/저장
    analyze_all_and_save(created_by="yeonwoo")  # 필요 시 limit=100 등으로 제한 가능
