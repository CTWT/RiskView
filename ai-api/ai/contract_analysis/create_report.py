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
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an AI risk analysis assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.0  # deterministic하게
        )

        content = response.choices[0].message.content.strip()

        # JSON 객체만 추출
        match = re.search(r'\{.*\}', content, re.DOTALL)
        if not match:
            raise ValueError(f"OpenAI 응답에서 JSON을 찾을 수 없습니다: {content}")
        data = json.loads(match.group())
        return AnalysisReportsDTO(**data)
    except Exception as e:
        print(f"AI 리포트 생성 중 오류 발생 (OpenAI API 호출 또는 JSON 파싱 실패): {e}")
        # API 호출 실패 시, 안전한 기본값으로 구성된 응답을 반환합니다.
        return AnalysisReportsDTO(
            summary="AI 종합 리포트 생성 중 오류가 발생했습니다. 거래 이상 탐지 및 특약 분석 결과는 개별적으로 확인해주세요.",
            riskLevel="UNKNOWN",
            sentimentSummary="감성 분석을 수행할 수 없습니다.",
            sentimentScore=50,
            sentimentCategory="중립",
            sentimentEmoji="🤔"
        )