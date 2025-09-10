import math
from Estate import runEstate

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 
#  작성일 : 25.09.10
#  수정일 : 
#  파일명 : z_score.py
#  설명  : 이상치 분석 통계학적 계산
# ============================================

# ============================================
# 계약금액 계산
# ============================================
def calculate_contract_price(row):
    try:
        deposit = int(row.get("grfe", "0").replace(",", "")) # grfe 값을 가져오고 없으면 0 반환. 50,000 -> 50000
        monthly = int(row.get("rtfe", "0").replace(",", "")) # rtfe 값을 가져오고 없으면 0 반환. 50,000 -> 50000
        # 환산전세가(월세를 전세로 환산한 것) 반환
        return deposit if monthly == 0 else deposit + monthly * 100 # 월세가 없으면 전세금액 그대로, 있으면 보증금 + 월세 * 100
    except Exception:
        return None

# ============================================
# Z-score 계산 함수
# ============================================
def compute_z_scores(values):
    """
    Z-score 계산기
    @param values: 계약금액 리스트
    @return: z-score 리스트 (None 포함 가능)
    """
    n = len(values) # 데이터 개수
    if n == 0:
        return []

    mean = sum(values) / n # 평균
    variance = sum((x - mean) ** 2 for x in values) / n # 분산(σ²): 각 값에서 평균을 뺀 차이를 제곱하고, 그걸 모두 더해서 개수로 나눔.
    std_dev = math.sqrt(variance) # 표준편차(σ): 분산의 제곱근

    if std_dev == 0:
        return [0 for _ in values] # 표준편차가 0이란 건 모든 값이 동일하다는 뜻. 따라서 Z-score도 모두 0으로 반환.

    z_scores = [(x - mean) / std_dev for x in values] # Z-score 계산: 각 값에서 평균을 뺀 후 표준편차로 나눔.
    return z_scores

# ============================================
#  Z-score 값에 따른 이상치 분류
# ============================================
def classify_z_score(z):
    if abs(z) < 1:
        return "정상"
    elif abs(z) < 2:
        return "주의"
    else:
        return "이상치"
