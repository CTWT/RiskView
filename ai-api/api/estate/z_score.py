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
        deposit_str = row.get("grfe", "0").replace(",", "")
        monthly_str = row.get("rtfe", "0").replace(",", "")

        deposit = int(deposit_str) if deposit_str else 0 # grfe 값을 가져오고 없으면 0 반환. 50,000 -> 50000
        monthly = int(monthly_str) if monthly_str else 0 # rtfe 값을 가져오고 없으면 0 반환. 50,000 -> 50000
        # 환산전세가(월세를 전세로 환산한 것) 반환
        return deposit if monthly == 0 else deposit + monthly * 100 # 월세가 없으면 전세금액 그대로, 있으면 보증금 + 월세 * 100
    except (ValueError, TypeError):
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
# 사용자 입력값에 대한 Z-score 계산 함수
# ============================================
def calculate_user_z_score(user_value, values):
    """
    기존 데이터 분포를 기준으로 사용자 입력값의 Z-score를 계산합니다.
    @param user_value: 사용자가 입력한 계약금액
    @param values: 비교 기준이 될 계약금액 리스트
    @return: 사용자의 Z-score (float) 또는 계산 불가 시 None
    """
    n = len(values)
    if n == 0:
        return None

    mean = sum(values) / n
    variance = sum((x - mean) ** 2 for x in values) / n
    std_dev = math.sqrt(variance)

    if std_dev == 0:
        return 0.0 # 모든 데이터가 동일하면 Z-score는 0

    return (user_value - mean) / std_dev

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
