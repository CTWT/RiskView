# create_report.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Union
from openai import OpenAI, RateLimitError
import os, json, re

# -----------------------------
# Pydantic 모델 정의
# -----------------------------
class AnomalyDetectResult(BaseModel):
    userContractPrice: Union[int, float]
    totalRiskScore: Union[int, float]
    averagePrice: Union[int, float]
    isAnomaly: bool
    deviationPercent: Union[int, float]
    riskLevel: Optional[str] = None
    riskComment: Optional[str] = None
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
    당신은 **법률 계약서 위험 분석 전문가**이자 **임차인(세입자) 관점 감성 분석 전문가**입니다.  
    분석은 반드시 **임차인의 권익과 위험**만을 기준으로 하여 수행하세요.  
    임대인(집주인)의 입장은 절대 고려하지 않습니다.  

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

    === 분석 지침 (반드시 임차인 기준으로 작성) ===

    1. **가격 이상치 분석**  
    - 시장가 대비 계약 가격이 임차인에게 유리하면 긍정 평가  
    - 불리하다면 부정 평가  
    - 영향이 적으면 중립으로 평가  

    2. **특약사항 위험도 분석**  
    - 임차인 권익 보호·주거 안정성에 유리하면 긍정  
    - 임차인에게 불리하거나 추가 비용/책임/법적 위험을 주면 부정  
    - 영향이 미미하면 중립  

    3. **종합 위험도 판정**  
    - 가격과 특약을 통합하여 임차인의 장기적 안정성과 위험을 평가  
    - 반드시 HIGH / MEDIUM / LOW 중 하나로 출력  

    4. **감성 분석 (임차인 기준)**  
    - 임차인에게 주거 안정감·경제적 이익이 크면 긍정 (😀)  
    - 큰 영향이 없으면 중립 (😐)  
    - 임차인에게 손해·불안·위험이 크면 부정 (⚠️, 😰, 🚨 중 택1)  

    === 출력 형식 (JSON만 반환) ===
    {{
    "summary": "임차인 기준으로 이상치와 특약을 종합한 상세 위험도 분석 요약 (300자 이상)",
    "riskLevel": "HIGH|MEDIUM|LOW",
    "sentimentSummary": "임차인 기준으로 계약 조건이 주는 심리적 영향 분석 (200자 이상)",
    "sentimentScore": "0~100",
    "sentimentCategory": "긍정|중립|부정",
    "sentimentEmoji": "😀|😐|⚠️|😰|🚨"
    }}
    """
    try:
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

        return AnalysisReportsDTO(**data)

    except RateLimitError as e:
        print(f"OpenAI API 할당량 초과 오류: {e}")
        # API 호출 실패 시, 할당량 초과에 대한 구체적인 응답을 반환합니다.
        return AnalysisReportsDTO(
            summary="AI 분석 서비스의 일일 사용량을 초과했습니다. 잠시 후 다시 시도해주세요.",
            riskLevel="UNKNOWN",
            sentimentSummary="API 할당량 초과로 감성 분석을 수행할 수 없습니다.",
            sentimentScore=50,
            sentimentCategory="중립",
            sentimentEmoji="⏳"
        )
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