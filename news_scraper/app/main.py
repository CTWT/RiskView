# 이름 : 임해균
# 작성자 : 임해균 
# 수정자 : 
# 작성일 : 2025-07-20
# 파일명 : main.py

from flask import Flask, render_template
from crawler.chosun import get_chosun_news
from crawler.yonhap import get_yonhap_news

app = Flask(__name__)

@app.route('/')
def index():
    chosun_news = get_chosun_news()
    yonhap_news = get_yonhap_news()
    return render_template('index.html', chosun_list=chosun_news, yonhap_list=yonhap_news)

if __name__ == '__main__':
    app.run(debug=True)
