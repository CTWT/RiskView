from datetime import date
import fitz  # PyMuPDF
import re
from typing import Union


#  수업명 : 가비아 2회차
#  이름 : 김관호
#  작성자 : 김관호
#  수정자 : 
#  작성일 : 25.07.21
#  파일명 : StringHelper.py
 
# String 처리를 위한 클래스

# 숫자를 한글(원정) 단위로 바꿔주는 함수
def number_to_korean(number: int) -> str:
    from datetime import date
    
    units = ['', '만', '억', '조', '경']
    nums = '일이삼사오육칠팔구'
    result = []

    if number == 0:
        return '영'

    num_str = str(number)[::-1]
    for i in range(0, len(num_str), 4):
        part = num_str[i:i+4][::-1]
        part_result = ''
        for j, digit in enumerate(part[::-1]):
            if digit != '0':
                unit = ['','십','백','천'][j]
                part_result = nums[int(digit)-1] + unit + part_result
        if part_result:
            result.insert(0, part_result + units[i // 4])

    return ''.join(result)

def korean_to_number(korean: str) -> int:
    num_map = {'일': 1, '이': 2, '삼': 3, '사': 4, '오': 5,
               '육': 6, '칠': 7, '팔': 8, '구': 9, '영': 0}
    unit_map = {'십': 10, '백': 100, '천': 1000}
    section_map = {'만': 10**4, '억': 10**8, '조': 10**12, '경': 10**16}

    total = 0
    section_total = 0
    num = 0

    for char in korean:
        if char in num_map:
            num = num_map[char]
        elif char in unit_map:
            # 단위 앞에 숫자 없으면 1로 처리
            if num == 0:
                num = 1
            section_total += num * unit_map[char]
            num = 0
        elif char in section_map:
            # 현재까지 계산된 section_total + num에 단위 곱함
            section_total += num
            total += section_total * section_map[char]
            section_total = 0
            num = 0
        else:
            # 한글 숫자가 아닌 문자 무시 또는 필요 시 예외 처리
            pass

    total += section_total + num
    return total

# 숫자를 콤마 붙여주는 함수
def format_number_with_commas(number: int) -> str:
    return f"{number:,}"

# 숫자에 붙은 콤마를 떼어주는 함수
def parse_number_with_commas(number_str: str) -> int:
    return int(number_str.replace(",", ""))

# 문자열을 / 기준으로 분할해주는 함수
def split_license_phone(license_phone: str) -> list[str]:
    return license_phone.split(" / ")


def find_token_sequence(tokens: list[str], pattern: list[str], nth: int = 1) -> int:
    """
    tokens 리스트에서 pattern이 nth 번째 나타나는 시작 인덱스를 반환.
    못 찾으면 -1 반환.
    """

    index = 0
    for i in range(len(tokens) - len(pattern) + 1):
        if tokens[i : i + len(pattern)] == pattern:
            index += 1
            if(index == nth):
                return i
    return -1


def extract_between_tokens(tokens: list[str], start_token: list[str], end_token: list[str]) -> str:
    """
    tokens 리스트에서 start_token 이후부터 end_token 이전까지의 토큰들을 문자열로 반환.
    start_token과 end_token은 리스트로, 연속된 단어 패턴을 의미함.
    """
    start_idx = find_token_sequence(tokens, start_token)
    end_idx = find_token_sequence(tokens, end_token)

    if start_idx == -1 or end_idx == -1:
        return ""

    start = start_idx + len(start_token)
    end = end_idx

    nth = 1
    while start >= end:
        nth +=1
        end = find_token_sequence(tokens,end_token,nth)
        if(end == -1):
            return ""

    result = ' '.join(tokens[start:end])
    del tokens[0:end]
    return result

def strip_tokens_from_start(tokens: list[str], original_string: str) -> str:
    while True:
        for token in tokens:
            if original_string.startswith(token):
                original_string = original_string[len(token):]  # 앞부분 잘라냄
                break  # 변경했으니 다시 처음부터 탐색
        else:
            break  # for문이 break 없이 끝났다면 더 이상 삭제할 게 없음
    return original_string

def convert_string_to_date(fullstr: str) -> date:
    trimedStr = fullstr.strip()

    numbers = re.findall(r'\d+', trimedStr)  # 숫자만 추출 (문자열 형태)
    numbers = list(map(int, numbers))  # 문자열 → 정수로 변환

    if len(numbers) != 3:
        return None

    try:
        year, month, day = map(int, numbers)
        return date(year, month, day)
    except Exception:
        return None

# 그래픽적으로 텍스트가 일정길이 이상이 되면 줄바꿈해주는 함수
def split_text_by_width(text: str, max_width: float, fontname: str = "helv", fontsize: float = 12) -> list[str]:
    words = text.split()
    lines = []
    current_line = ""

    for word in words:
        test_line = current_line + " " + word if current_line else word
        length = fitz.get_text_length(test_line, fontname=fontname, fontsize=fontsize)
        if length <= max_width:
            current_line = test_line
        else:
            lines.append(current_line)
            current_line = word

    if current_line:
        lines.append(current_line)

    return lines

def get_valid_string(*args: str, default: str = "") -> str:
    for s in args:
        if s:  # None, '', False 모두 건너뜀
            return s
    return default

def cut_before_space(s: str) -> str:
    return s.split(' ')[0]

def string_to_number(s: str) -> Union[int, float]:
    # 숫자와 소수점만 추출
    parts = re.findall(r'\d+|\.', s)

    # 숫자 하나는 무조건 있어야 함
    if not any(part.isdigit() for part in parts):
        return 0

    # 붙이기
    number_str = ''.join(parts)

    # 소수점이 1개 초과면 잘못된 실수 → 첫 번째만 살리고 나머지는 제거
    if number_str.count('.') > 1:
        first_dot = number_str.find('.')
        number_str = number_str[:first_dot + 1] + number_str[first_dot + 1:].replace('.', '')

    return float(number_str) if '.' in number_str else int(number_str)
    