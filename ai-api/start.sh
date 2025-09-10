#!/bin/bash

# ============================================
#  ai-api 서버 동시 실행 스크립트 (에러 처리 추가)
# ============================================

#!/bin/bash

# 스크립트의 실제 위치(디렉토리)를 기준으로 절대 경로 설정
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "AI API 서버들을 시작합니다..."

echo "워드클라우드 API (port 5002) 시작 중..."
python3 "$DIR/api/morpheme/wordcloud_main.py" &
PID1=$!
sleep 1
if ! kill -0 $PID1 2>/dev/null; then
    echo "❌ 워드클라우드 API 시작 실패"
    exit 1
else
    echo "✅ 워드클라우드 API 시작됨 (PID: $PID1)"
fi

# 형태소 분석기 API (port 5001)
echo "형태소 분석기 API (port 5001) 시작 중..."
python3 "$DIR/api/morpheme/okt_analyzer.py" &
PID2=$!
sleep 1
if ! kill -0 $PID2 2>/dev/null; then
    echo "❌ 형태소 분석기 API 시작 실패"
    exit 1
else
    echo "✅ 형태소 분석기 API 시작됨 (PID: $PID2)"
fi

echo "🎉 모든 AI API 서버가 백그라운드에서 성공적으로 실행되었습니다."
