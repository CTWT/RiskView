#!/usr/bin/env python3
# encoding: utf-8
"""
clause_risk_analysis_detailed.py
- 임대인(집주인) 관점으로 임대차계약서 특약 조항을 분석하여
  다음 5개 필드를 가진 JSON을 반환합니다:
  clauseType, clauseTitle, clauseValue, isRisky, riskReason(상세)
"""
import os
import json
import re
import unicodedata
from dotenv import load_dotenv, find_dotenv
from openai import OpenAI

# -------------------------
# 환경 변수 로드 및 클라이언트 생성
# -------------------------
load_dotenv(find_dotenv())

# -------------------------
# 프롬프트 (상세 riskReason 요구사항 포함)
# -------------------------
BASE_PROMPT = """
너는 계약서 특약 분석 전문가이며, 항상 **임대인(집주인) 관점**으로만 판단해야 한다.
즉, '임대인에게 불리한지' 만을 기준으로 위험 여부(isRisky)를 결정한다.
- 임대인에게 불리하면 isRisky=true
- 임대인에게 불리하지 않거나 오히려 임대인에게 유리하면 isRisky=false

출력은 **반드시** JSON 객체 하나만(코드블록 없이) 작성하라. 
JSON의 키는 **정확히** 다음 5개만 허용한다:
- clauseType: "계약금" | "중도금" | "잔금" | "특약" | "기타"
- clauseTitle: 조항 제목 (없으면 "특약사항")
- clauseValue: 조항 원문(입력받은 값을 **그대로** 넣을 것)
- isRisky: true 또는 false (Boolean)
- riskReason: 임대인 관점에서의 상세 판단 근거(문자열)

**riskReason 작성 지침 (반드시 포함):**
riskReason 문자열 내부에 다음 소제목을 반드시 포함하고, 각 소제목 아래에 1~3문장 수준의 상세한 설명을 작성하라.
1) 요약:
2) 법적 리스크:
3) 재정적 영향:
4) 운영적 영향:
5) 권장 조치:

예시(형식):
"요약: ... 
법적 리스크: ...
재정적 영향: ...
운영적 영향: ...
권장 조치: ..."

**clauseType 결정 규칙(반드시 이 값들 중 하나만 선택):**
- 텍스트에 '계약금' 관련 언급이 명확하면 "계약금"
- '중도금' 관련이면 "중도금"
- '잔금' 관련이면 "잔금"
- 위 3가지에 해당하지 않고 계약서의 특별합의(권리·의무·제한 등)이라면 "특약"
- 분류가 모호하거나 위 범위에 해당하지 않으면 "기타"

**추가 제약**
- 출력에 다른 키(추가 필드)를 넣지 마라.
- Boolean 값은 반드시 true/false로 표기(문자열 아님).
- clauseValue는 입력 원문을 그대로 복사해서 넣어라.
- JSON 외 다른 텍스트(해설 등)를 출력하지 마라.
"""

# -------------------------
# 유틸리티
# -------------------------
def normalize_text(text: str) -> str:
    if not text:
        return ""
    normalized = unicodedata.normalize("NFC", text)
    normalized = (
        normalized.replace("\u00a0", " ")
        .replace("\u200b", "")
        .replace("\u200c", "")
        .replace("\ufeff", "")
    )
    normalized = normalized.replace("\r\n", "\n").replace("\r", "\n")
    lines = [" ".join(line.split()) for line in normalized.split("\n")]
    return "\n".join([line for line in lines if line]).strip()


def _strip_code_fences(s: str) -> str:
    s = s.strip()
    # remove surrounding ``` ... ``` if present
    if s.startswith("```"):
        first_nl = s.find("\n")
        if first_nl != -1:
            s = s[first_nl + 1 :]
        if s.endswith("```"):
            s = s[:-3]
    return s.strip()


def try_load_json(text: str) -> dict:
    """
    모델 출력에서 JSON 객체를 안전하게 파싱하려고 여러 방법을 시도.
    1) 기본 json.loads
    2) 중괄호로 둘러싸인 첫번째 JSON substring 추출 후,
       Python-style booleans/None -> JSON 포맷으로 치환
    """
    cleaned = _strip_code_fences(text)
    # 1) 바로 시도
    try:
        return json.loads(cleaned)
    except Exception:
        pass

    # 2) 중괄호로 감싼 첫 JSON 블록 추출
    m = re.search(r"\{[\s\S]*\}", cleaned)
    if not m:
        raise ValueError("모델 출력에서 JSON 블록을 찾을 수 없습니다. 원문:\n" + cleaned[:1000])

    candidate = m.group(0)

    # 치환: Python 스타일 -> JSON 스타일
    candidate2 = candidate
    candidate2 = re.sub(r"\bTrue\b", "true", candidate2)
    candidate2 = re.sub(r"\bFalse\b", "false", candidate2)
    candidate2 = re.sub(r"\bNone\b", "null", candidate2)

    # 가끔 따옴표가 싱글쿼트인 경우 대비 (조심스럽게)
    # 단, 내부의 따옴표까지 무차별 변환하면 실패할 수 있으니
    # 필드 이름이 싱글쿼트로 된 경우에만 교체 시도
    if re.search(r"'\s*:\s*", candidate2):
        candidate2 = candidate2.replace("'", '"')

    # 마지막으로 파싱 시도
    try:
        return json.loads(candidate2)
    except Exception as e:
        # 오류 시 원본 - 디버깅 용도로 예외 발생
        raise ValueError(f"JSON 파싱 실패: {e}\n원문 일부:\n{cleaned[:1200]}")

# -------------------------
# 핵심: 조항 분석 호출 함수
# -------------------------
def analyze_clause(clause_text: str, clause_title: str = None):
    """
    clause_text: 조항 원문 (문자열)
    clause_title: 조항 제목(옵션). 없으면 "특약사항"으로 기본값 사용.
    반환: dict (clauseType, clauseTitle, clauseValue, isRisky, riskReason)
    """

    API_KEY = os.getenv("OPENAI_API_KEY")
    if not API_KEY:
        raise RuntimeError("OPENAI_API_KEY가 설정되어 있지 않습니다. .env 파일을 확인하세요.")

    client = OpenAI(api_key=API_KEY)

    if not clause_text:
        raise ValueError("clause_text는 비어있을 수 없습니다.")

    clause_text_norm = normalize_text(clause_text)
    if not clause_title:
        clause_title = "특약사항"

    user_prompt = BASE_PROMPT + "\n\n[조항 원문]\n" + clause_text_norm

    resp = client.chat.completions.create(
        model="gpt-4.1",
        messages=[
            {"role": "system", "content": "너는 계약서 특약 분석가다. 항상 임대인 관점으로 판단."},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.0,
        max_tokens=1000,  # riskReason 상세화를 위해 충분히 크게 설정
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0,
        seed=42,
    )

    raw = resp.choices[0].message.content
    try:
        parsed = try_load_json(raw)
    except Exception as e:
        # 파싱 실패시 원문 출력해서 디버깅하기 좋게 예외 발생
        raise RuntimeError(f"모델 출력 파싱 실패: {e}")

    # 기본 보장: 필요한 키들이 있는지 확인하고, 없으면 채움
    # clauseValue는 항상 입력 원문 그대로 보장
    parsed.setdefault("clauseType", "특약")
    parsed.setdefault("clauseTitle", clause_title)
    parsed["clauseValue"] = clause_text_norm
    # isRisky가 문자열로 온 경우 bool로 변환 시도
    if isinstance(parsed.get("isRisky"), str):
        parsed["isRisky"] = parsed["isRisky"].strip().lower() in ("true", "t", "yes", "1")
    # riskReason 기본값
    parsed.setdefault("riskReason", "상세 분석 결과가 제공되지 않았습니다.")

    try:
        print("분석 결과:")
        print(json.dumps(parsed, ensure_ascii=False, indent=4))
    except Exception as e:
        print("오류:", e)


    return parsed

# -------------------------
# 실행 예시 (여러 케이스)
# -------------------------
if __name__ == "__main__":
    sample ="임차인은 계약기간 중 언제든지 중도해지할 수 있다." \
        "임대인은 계약기간 중 별도의 공사 요청 시 비용 부담 없음."\
        "계약금은 총 금액의 10%로 하고, 계약 해지 시 계약금은 반환하지 않는다."\
        "임차인은 임의로 건물 외관을 변경할 수 없다. 단, 임대인의 서면 동의가 있을 경우 허용한다."\
        "임대인은 전대(서브리스)를 금지한다."
    
    try:
        out = analyze_clause(sample)
        print("분석 결과:")
        print(json.dumps(out, ensure_ascii=False, indent=4))
    except Exception as e:
        print("오류:", e)
