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
    당신은 법률 계약서 위험 분석 전문가입니다. 
    제공된 이상치 탐지 결과와 계약 특약사항을 종합적으로 분석하여 상세한 위험도 평가를 수행하세요.

    === 분석 데이터 ===

    【이상치 탐지 결과 상세 분석】
    - 사용자 계약 가격: {anomaly.userContractPrice:,.0f}원
    - 시장 평균 가격: {anomaly.averagePrice:,.0f}원  
    - 가격 편차율: {anomaly.deviationPercent:.1f}%
    - Z-Score: {anomaly.zScore if anomaly.zScore else 'N/A'}
    - 이상치 여부: {'예' if anomaly.isAnomaly else '아니오'}
    - 시스템 위험도: {anomaly.riskLevel}
    - 총 위험 점수: {anomaly.totalRiskScore}
    - 위험 코멘트: {anomaly.riskComment}
    - 분류 라벨: {anomaly.label if anomaly.label else 'N/A'}

    【계약 특약사항 세부 내용】  
    - 특약 유형: {clause.clauseType}
    - 특약 제목: {clause.clauseTitle}
    - 특약 내용: {clause.clauseValue}
    - 위험성 판정: {'위험' if clause.isRisky else '안전'}
    - 위험 사유: {clause.riskReason}

    === 분석 요구사항 ===

    1. **가격 이상치 분석**: 
    - 시장가 대비 편차율과 Z-Score를 고려한 가격 적정성 평가
    - 이상치가 발생한 원인과 시장 상황 추론
    - 가격 변동이 계약자에게 미치는 영향도 분석

    2. **특약사항 위험도 분석**:
    - 특약 내용의 법적 위험성과 불공정성 검토
    - 계약자에게 불리한 조건이나 애매한 표현 식별
    - 특약으로 인한 잠재적 분쟁 가능성 평가

    3. **종합 위험도 판정**:
    - 가격 이상치와 특약사항을 연관지어 통합적 위험도 산출
    - 단기/장기적 관점에서의 위험 요인 분류
    - 위험 완화를 위한 구체적 대응 방안 제시

    4. **감성 분석**:
    - 계약 조건들이 계약자에게 주는 심리적 부담감 평가
    - 계약서 언어의 친화성과 투명성 정도 측정
    - 신뢰도와 안정감에 미치는 영향 분석

    반드시 아래 JSON 형식으로만 응답하고, 다른 텍스트는 포함하지 마세요:

    {{
    "summary": "이상치 분석과 특약사항을 종합한 상세 위험도 분석 요약 (300자 이상)",
    "riskLevel": "HIGH|MEDIUM|LOW",
    "sentimentSummary": "계약 조건이 계약자에게 주는 감성적 영향과 심리적 부담 분석 (200자 이상)",
    "sentimentScore": 0~100,
    "sentimentCategory": "긍정|중립|부정", 
    "sentimentEmoji": "😀|😐|⚠️|😰|🚨"
    }}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a professional legal contract risk analyst with expertise in anomaly detection and clause analysis. Provide comprehensive analysis based on both quantitative anomaly data and qualitative contract terms."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.1,  # 약간의 창의성 허용하면서도 일관성 유지
        max_tokens=1000   # 더 상세한 분석을 위해 토큰 수 증가
    )

    content = response.choices[0].message.content.strip()
    
    # -----------------------------
    # JSON 안전 추출 및 검증
    # -----------------------------
    try:
        # JSON 객체만 추출 (개선된 정규식 사용)
        json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', content, re.DOTALL)
        if not json_match:
            raise ValueError(f"OpenAI 응답에서 유효한 JSON을 찾을 수 없습니다: {content}")
        
        json_str = json_match.group()
        data = json.loads(json_str)
        
        # 필수 필드 검증
        required_fields = ['summary', 'riskLevel', 'sentimentSummary', 'sentimentScore', 'sentimentCategory', 'sentimentEmoji']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            raise ValueError(f"필수 필드가 누락되었습니다: {missing_fields}")
            
    except json.JSONDecodeError as e:
        raise ValueError(f"JSON 파싱 실패: {str(e)} | 추출된 JSON: {json_str if 'json_str' in locals() else 'N/A'}")
    except Exception as e:
        raise ValueError(f"분석 결과 처리 실패: {str(e)} | 원본 응답: {content}")

    # -----------------------------
    # Pydantic 모델 검증 및 반환
    # -----------------------------
    try:
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