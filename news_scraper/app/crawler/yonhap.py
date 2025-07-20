import requests
from bs4 import BeautifulSoup

def get_yonhap_news():
    url = 'https://www.yna.co.kr/economy/real-estate'
    headers = {'User-Agent': 'Mozilla/5.0'}
    res = requests.get(url, headers=headers)
    soup = BeautifulSoup(res.text, 'html.parser')

    articles = soup.select('span.title01')
    result = []

    for span in articles[:5]:
        a_tag = span.find_parent('a')
        if not a_tag:
            continue

        title = span.get_text(strip=True)
        link = a_tag.get('href')

        try:
            detail_res = requests.get(link, headers=headers)
            detail_soup = BeautifulSoup(detail_res.text, 'html.parser')
            paragraphs = detail_soup.select('div.story-news.article p')
            content = '\n'.join(p.get_text(strip=True) for p in paragraphs)

            result.append({
                'title': title,
                'content': content
            })
        except:
            continue

    return result
