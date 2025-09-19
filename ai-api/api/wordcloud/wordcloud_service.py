# ai-api/api/wordcloud/wordcloud_service.py
import os, re, numpy as np, random, io
from PIL import Image, ImageOps
from wordcloud import WordCloud, STOPWORDS
from dotenv import load_dotenv
from collections import Counter
import pymysql

# 생성자 : 유연우
# 생성일 : 25.09.17
# 파일명 : wordcloud_service.py
# 수정자 :
# 수정일 : 25.09.19
# 설명 : 워드클라우드 생성 서비스

load_dotenv()
DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")
DB_PORT = int(os.getenv("DB_PORT"))

FONT_PATHS = [
    # macOS 기본 폰트
    "/System/Library/Fonts/AppleSDGothicNeo.ttc",
    # Windows 기본 폰트
    "C:/Windows/Fonts/malgun.ttf",
    # 공통 설치용 (Noto Sans CJK KR)
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
    "C:/Windows/Fonts/NotoSansCJKkr-Regular.otf",
]

FONT_PATH = next((p for p in FONT_PATHS if os.path.exists(p)), None)
if not FONT_PATH:
    raise FileNotFoundError("굵은 한글 폰트를 찾지 못했습니다.")

BASE_DIR = os.path.dirname(__file__)
MASK_PATH = os.path.join(BASE_DIR, "house_mask_clean.png")

COOL = ["#00e5ff", "#00c3ff", "#00a2ff", "#0080ff", "#60a5fa", "#93c5fd"]
VIOLET = ["#7c5cff", "#8b5cf6", "#a78bfa"]
MAGENTA = ["#d946ef", "#ff4fd8"]


# def _clamp01(x):
#     return max(0.0, min(1.0, x))


def _weighted_choice(items, weights):
    s = sum(weights)
    r = random.uniform(0, s)
    acc = 0
    for it, w in zip(items, weights):
        acc += w
        if r <= acc:
            return it
    return items[-1]


def _get_text(months=12):
    conn = pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        port=DB_PORT,
    )
    with conn.cursor() as cur:
        cur.execute(
            "SELECT title, content FROM news_articles "
            "WHERE published_at >= DATE_SUB(NOW(), INTERVAL %s MONTH) "
            "ORDER BY published_at DESC",
            (months,),
        )
        rows = cur.fetchall()
    conn.close()
    text = " ".join(
        re.sub(r"[^\w\s가-힣%·\-/~]+", " ", (t or "") + " " + (c or ""))
        for t, c in rows
    )
    return text


def generate_wordcloud(months: int = 12) -> bytes:
    text = _get_text(months)
    tokens = text.split()
    freqs = Counter(tokens)

    def palette_color_func(
        word, font_size, position, orientation, random_state=None, **kwargs
    ):
        f = freqs.get(word, 1)
        t = np.log1p(f) / np.log1p(max(freqs.values()))
        if t < 0.40:
            pool = COOL
            weights = [4, 4, 3, 3, 2, 2]
        elif t < 0.75:
            pool = COOL + VIOLET
            weights = [4, 4, 3, 3, 2, 2, 2, 2, 1]
        else:
            pool = COOL + VIOLET + MAGENTA
            weights = [4, 4, 3, 3, 2, 2, 2, 2, 1, 1, 1]
        return _weighted_choice(pool, weights)

    mask_img = Image.open(MASK_PATH).convert("L")
    if np.array(mask_img).mean() < 127:
        mask_img = ImageOps.invert(mask_img)
        mask_img = mask_img.point(lambda x: 255 if x > 240 else 0, "L")
    mask = np.array(mask_img)

    wc = WordCloud(
        font_path=FONT_PATH,
        background_color="white",
        mask=mask,
        width=1200,
        height=1200,
        scale=3,
        margin=1,
        prefer_horizontal=1.0,
        max_words=1000,
        max_font_size=320,
        min_font_size=8,
        relative_scaling=0.25,
        stopwords=set(STOPWORDS),
        collocations=False,
        contour_width=0,
    ).generate(text)
    wc.recolor(color_func=palette_color_func, random_state=42)

    buf = io.BytesIO()
    wc.to_image().save(buf, format="PNG")
    return buf.getvalue()


# 로컬에서 시각화 확인용 함수 (FastAPI 라우트에서는 호출 X)
def preview_wordcloud(months: int = 12, save_path: str | None = None):
    png = generate_wordcloud(months=months)
    from PIL import Image as _Image
    import io as _io

    _im = _Image.open(_io.BytesIO(png))
    # 파일 저장 옵션
    if save_path:
        _im.save(save_path, format="PNG")
    # 화면 표시 (함수 내부 임포트로 서버 의존성 최소화)
    import matplotlib.pyplot as _plt

    _plt.figure(figsize=(6, 6))
    _plt.imshow(_im)
    _plt.axis("off")
    _plt.tight_layout()
    _plt.show()


if __name__ == "__main__":
    preview_wordcloud(months=12, save_path="wordcloud_preview.png")
