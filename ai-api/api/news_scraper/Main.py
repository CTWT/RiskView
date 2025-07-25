from app.crawler.News_Yeonhap import News_Yeonhap_Save
from app.crawler.News_114 import News_114_Save

#  이름 : 유연우
#  작성자 : 유연우
#  수정자 :
#  수정일 : 25.07.24
#  작성일 : 25.07.23
#  파일명 : Main.py

# 부동산 114, 연합뉴스, 조선비즈 크롤링 및 DB 저장을 동작하게 하는 Main 파일
# 현재 부동산 114, 연합뉴스 동작

if __name__ == "__main__":
    News_114_Save()
    News_Yeonhap_Save()
