import requests
import json
from dotenv import load_dotenv
from urllib import parse
from urllib.parse import urlencode
import os

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 박윤성
#  작성일 : 25.09.08
#  수정일 : 25.09.09
#  파일명 : building_ledger.py
#  설명  : 건축물대장 API 호출
# ============================================

# .env에서 기본 URL 로딩
load_dotenv()
building_ledger_api_base_url = os.getenv('BUILDING_LEDGER_API_BASE_URL')

# 건축물대장 표제부 API 호출 메서드
# 공공데이터포탈 건축물대장 표제부
# 건물연식 파악(사용승인일)
# 층수 파악(지상층수/지하층수)
# 총주차수 파악(실내/실외, 기계식/자주식, 주차대수/면적별)
# https://www.data.go.kr/data/15134735/openapi.do#/
def get_building_info_from_ledger(**kwargs) -> dict:
    """
    건축물대장 API를 호출하고,
    사용 승인일, 층수, 주차 대수를 추출하여 반환하는 메서드
    """
    # 기본 파라미터 설정
    default_params = {
        "sigunguCd": "11110",
        "bjdongCd": "10100",
        "platGbCd": "",
        "bun": "",
        "ji": "",
        "numOfRows": "1",
        "pageNo": "1",
        "_type": "json"
    }

    """
    요청 파라미터 명세
    ============================================
    @param base_url: 기본 URL
    @param sigunguCd: 시군구코드
    @param bjdongCd: 법정동코드
    @param platGbCd: 대지구분코드
    @param bun: 번
    @param ji: 지
    @param startDate: 검색시작일(YYYYMMDD)
    @param endDate: 검색종료일(YYYYMMDD)
    @param _type: 리턴 타입(JSON/XML)
    @param numOfRows: 페이지당 조회 개수
    @param pageNo: 페이지 번호
    @return: API 호출에 필요한 완전한 URL 문자열
    ============================================
    """

    """
    응답 파라미터 명세
    ============================================
    rnum: 결과 순번,
    platPlc: 지번 주소 (대지 위치),
    sigunguCd: 시군구 코드,
    bjdongCd: 법정동 코드,
    platGbCd: 대지 구분 코드 (0: 대지, 1: 공유지 등),
    bun: 지번 - 번,
    ji: 지번 - 지,
    mgmBldrgstPk: 건축물대장 고유번호 (PK),
    regstrGbCd: 대장 구분 코드 (1: 일반, 2: 집합),
    regstrGbCdNm: 대장 구분 이름,
    regstrKindCd: 대장 종류 코드 (2: 일반건축물),
    regstrKindCdNm: 대장 종류 이름,
    newPlatPlc: 도로명 주소,
    bldNm: 건물명,
    splotNm: 특별 부지명 (예: 단지명 등),
    block: 블록 번호,
    lot: 로트 번호,
    bylotCnt: 부지 수,
    naRoadCd: 도로명 코드,
    naBjdongCd: 도로명주소 법정동 코드,
    naUgrndCd: 지상/지하 구분 (0: 지상, 1: 지하),
    naMainBun: 도로명주소 본번,
    naSubBun: 도로명주소 부번,
    dongNm: 동 명칭,
    mainAtchGbCd: 주/부속 건물 구분 코드,
    mainAtchGbCdNm: 주/부속 건물 구분 이름,
    platArea: 대지 면적 (㎡),
    archArea: 건축 면적 (㎡),
    bcRat: 건폐율 (%),
    totArea: 연면적 (㎡),
    vlRatEstmTotArea: 용적률 산정용 연면적 (㎡),
    vlRat: 용적률 (%),
    strctCd: 구조 코드,
    strctCdNm: 건축 구조명,
    etcStrct: 기타 구조명,
    mainPurpsCd: 주용도 코드,
    mainPurpsCdNm: 주용도 명칭 (예: 단독주택),
    etcPurps: 기타 용도,
    roofCd: 지붕 코드,
    roofCdNm: 지붕 형태명,
    etcRoof: 기타 지붕 형태,
    hhldCnt: 세대 수,
    fmlyCnt: 가족 수,
    heit: 건물 높이 (m, 값이 0이면 미기재),
    grndFlrCnt: 지상 층수,  # ← ✅ 지상 층수
    ugrndFlrCnt: 지하 층수,  # ← ✅ 지하 층수
    rideUseElvtCnt: 승강기 수 (승객용),
    emgenUseElvtCnt: 승강기 수 (비상용),
    atchBldCnt: 부속 건물 수,
    atchBldArea: 부속 건물 면적 (㎡),
    totDongTotArea: 전체 동 연면적 (㎡),
    indrMechUtcnt: 실내 기계식 주차 대수,
    indrMechArea: 실내 기계식 주차 면적 (㎡),
    oudrMechUtcnt: 실외 기계식 주차 대수,
    oudrMechArea: 실외 기계식 주차 면적 (㎡),
    indrAutoUtcnt: 실내 자주식 주차 대수,
    indrAutoArea: 실내 자주식 주차 면적 (㎡),
    oudrAutoUtcnt: 실외 자주식 주차 대수,
    oudrAutoArea: 실외 자주식 주차 면적 (㎡),
    pmsDay: 건축 허가일,
    stcnsDay: 착공일,
    useAprDay: 사용 승인일 (건물 연식 확인에 사용),
    pmsnoYear: 허가번호 연도,
    pmsnoKikCd: 허가 기관 코드,
    pmsnoKikCdNm: 허가 기관 이름,
    pmsnoGbCd: 허가번호 구분 코드,
    pmsnoGbCdNm: 허가번호 구분 이름,
    hoCnt: 호 수 (집합건물일 경우),
    engrGrade: 에너지 효율 등급,
    engrRat: 에너지 효율 점수,
    engrEpi: 에너지 소비지표 (EPI),
    gnBldGrade: 녹색건축물 등급,
    gnBldCert: 녹색건축물 인증 여부,
    itgBldGrade: 통합 건축물 등급,
    itgBldCert: 통합 건축물 인증 여부,
    crtnDay: 데이터 생성일 (YYYYMMDD),
    rserthqkDsgnApplyYn: 내진설계 적용 여부 (0: 미적용, 1: 적용),
    rserthqkAblty: 내진 능력 등급 (미기재 시 공백)
    ============================================
    """

    # 병합 및 정리
    params = {**default_params, **kwargs}
    filtered_params = {k: v for k, v in params.items() if v}

    # URL 구성
    query_string = urlencode(filtered_params, encoding='utf-8')
    full_url = f"{building_ledger_api_base_url}&{query_string}"

    try:
        response = requests.get(full_url) # API 호출
        response.raise_for_status() # HTTP 에러 체크
        data = response.json() # JSON 응답
    except Exception as e:
        print("API 요청 오류:", e)
        return {}

    # 데이터 파싱
    try:
        item = data['response']['body']['items']['item'][0] # 응답 데이터에서 첫 번째 아이템 추출

        # 사용 승인일 (건물 연식 판단)
        use_approval_date = item.get('useAprDay')  # 예: "20080512"
        
        # 층수
        ground_floors = int(item.get('grndFlrCnt', 0))  # 지상층수
        underground_floors = int(item.get('ugrndFlrCnt', 0))  # 지하층수

        # 주차 대수
        indr_mech = int(item.get('indrMechUtcnt', 0))  # 실내 기계식
        oudr_mech = int(item.get('oudrMechUtcnt', 0))  # 실외 기계식
        indr_auto = int(item.get('indrAutoUtcnt', 0))  # 실내 자주식
        oudr_auto = int(item.get('oudrAutoUtcnt', 0))  # 실외 자주식

        total_parking_spaces = indr_mech + oudr_mech + indr_auto + oudr_auto

        return {
            "use_approval_date": use_approval_date, # 건물 연식
            "ground_floors": ground_floors, # 지상층수
            "underground_floors": underground_floors, # 지하층수
            "total_parking_spaces": total_parking_spaces, # 총 주차 대수
            "indr_mech": indr_mech, # 실내 기계식 주차 대수
            "oudr_mech": oudr_mech, # 실외 기계식 주차 대수
            "indr_auto": indr_auto, # 실내 자주식 주차 대수
            "oudr_auto": oudr_auto # 실외 자주식 주차 대수
        }

    except (KeyError, IndexError, TypeError) as e:
        print("응답 데이터 파싱 오류:", e)
        return {}
    except Exception as e:
        print("기타 오류:", e)
        return {}