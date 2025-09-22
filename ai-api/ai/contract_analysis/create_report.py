# create_report.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from openai import OpenAI
import os, json, re

# -----------------------------
# Pydantic 모델 정의
# -----------------------------
class AnomalyDetectResult(BaseModel):
    userContractPrice: float
    totalRiskScore: float
    averagePrice: float
    isAnomaly: bool
    deviationPercent: float
    riskLevel: str
    riskComment: str
    zScore: Optional[float] = None
    label: Optional[str] = None

class ContractClauseDTO(BaseModel):
    clauseType: str
    clauseTitle: str
    clauseValue: str
    isRisky: bool
    riskReason: str

class AiRiskAnalysisRequest(BaseModel):
    contractClauseDTO: ContractClauseDTO
    anomalyDetectResult: AnomalyDetectResult

class AnalysisReportsDTO(BaseModel):
    summary: str
    riskLevel: str
    sentimentSummary: str
    sentimentScore: int
    sentimentCategory: str
    sentimentEmoji: str

# -----------------------------
# OpenAI 클라이언트
# -----------------------------
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# -----------------------------
# 분석 함수
# -----------------------------
def analyze_with_openai(anomaly: AnomalyDetectResult, clause: ContractClauseDTO) -> AnalysisReportsDTO:
    prompt = f"""
    당신은 법률 계약 위험 분석 전문가입니다.
    아래 데이터를 기반으로 계약의 위험도를 분석하고, 
    반드시 JSON 형식으로 AnalysisReportsDTO 형태로 응답하세요. 
    JSON 외의 텍스트는 절대 포함하지 마세요.

    === 입력 데이터 ===
    [AnomalyDetectResult]
    {json.dumps(anomaly.dict(), ensure_ascii=False, indent=2)}

    [ContractClauseDTO]
    {json.dumps(clause.dict(), ensure_ascii=False, indent=2)}

    === 출력 형식 ===
    {{
      "summary": "위험분석 요약",
      "riskLevel": "HIGH|MEDIUM|LOW",
      "sentimentSummary": "감성 분석 요약",
      "sentimentScore": 0~100,
      "sentimentCategory": "긍정|중립|부정",
      "sentimentEmoji": "😀|😐|⚠️"
    }}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an AI risk analysis assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.0  # deterministic하게
    )

    content = response.choices[0].message.content.strip()

    # -----------------------------
    # JSON 안전 추출
    # -----------------------------
    try:
        # JSON 객체만 추출
        match = re.search(r'\{.*\}', content, re.DOTALL)
        if not match:
            raise ValueError(f"OpenAI 응답에서 JSON을 찾을 수 없습니다: {content}")
        data = json.loads(match.group())
    except Exception as e:
        raise ValueError(f"JSON 파싱 실패: {str(e)} | 원본 응답: {content}")

    # -----------------------------
    # Pydantic 검증
    # -----------------------------
    return AnalysisReportsDTO(**data)