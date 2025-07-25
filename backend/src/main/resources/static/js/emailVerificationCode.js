/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.07.25
 * 파일명 : emailVerificationCode.js
 */

document.addEventListener('DOMContentLoaded', function() {

    //==================이메일 인증코드 전송 버튼 이벤트==================
    // 이메일 인증코드 전송 버튼
    const sendEmailCodeBtn = document.getElementById('sendEmailVerificationCode');
    // 이메일 입력 텍스트
    const emailInput = document.querySelector('input[name="email"]');

    // 이메일 인증코드 전송 버튼을 누르면
    sendEmailCodeBtn.addEventListener('click', function () {
        console.log('Button clicked');

        // 사용자가 입력한 이메일 주소를 가지고 옴
        const email = emailInput.value.trim();

        // 이메일 주소가 없으면 입력란으로 포커싱
        if (!email) {
            alert('이메일 주소를 입력해주세요.');
            emailInput.focus();
            return;
        }   

        /**
         * 이메일 주소 유효성 검사
         * ^ : 문자열 시작
         * [^\s@]+ : \s(공백문자)와 @를 제외한 문자를 1개 이상(+)
         * @ : @ 문자
         * \. : . 문자
         * $ : 문자열 종료
         */ 
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // 사용자가 입력한 텍스트가 이메일 주소 형식 정규식과 일치하지 않으면 입력란으로 포커싱
        if (!emailRegex.test(email)) {
            alert('유효한 이메일 주소를 입력해주세요.');
            emailInput.focus();
            return;
        }

        // 이메일 인증코드 버튼을 누르면 전송되는 동안 버튼을 안 눌리는 버튼으로 변경
        sendEmailCodeBtn.disabled = true;
        // 원래 이메일 인증코드 버튼 텍스트를 날라가지 않도록 따로 저장해둠.
        const originalText = sendEmailCodeBtn.textContent;
        // 이메일 인증코드 버튼 텍스트를 '발송 중...'으로 변경
        sendEmailCodeBtn.textContent = '발송 중...';

        // 이메일 인증코드 전송 요청
        fetch('/send-verification-email-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                email: email
            }).toString()
        })
        .then(response => {
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(text || '인증코드 발송에 실패했습니다.');
                });
            }
            return response.text();
        })
        .then(data => {
            console.log('Success data:', data);
            alert(data);
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message);
        })
        .finally(() => {
            // 이메일 인증코드 발송 버튼 다시 활성화
            sendEmailCodeBtn.disabled = false;
            // 이메일 인증코드 발송 버튼 텍스트를 원래 이메일 인증코드 버튼 텍스트로 변경
            sendEmailCodeBtn.textContent = originalText;
        });
    });

    //==================이메일 인증코드 확인 버튼 이벤트==================

    // 인증코드 확인 버튼
    const verifyEmailCodeBtn = document.getElementById('verifyEmailCodeButton');
    // 인증코드 입력 텍스트
    const codeInput = document.querySelector('input[name="emailVerificationCode"]');

    // 인증코드 확인 버튼을 누르면
    verifyEmailCodeBtn.addEventListener('click', function () {
        // 사용자가 입력한 이메일 주소와 인증코드를 가지고 옴
        const email = emailInput.value.trim();
        // 사용자가 입력한 인증코드를 가지고 옴
        const code = codeInput.value.trim();

        // 이메일 입력란이나 인증코드 입력란이 비어있을 때
        if (!email || !code) {
            alert('이메일과 인증코드를 모두 입력해주세요.');
            return;
        }

        // 인증코드 확인 요청
        fetch('/verify-email-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                email: email,
                code: code
            }).toString()
        })
        // 서버 응답을 텍스트로 변환
        .then(response => response.text())
        // 서버 응답 메시지 팝업 띄움
        .then(result => {
            alert(result);
        })
        .catch(error => {
            console.error('인증 오류:', error);
            alert('인증 요청 중 오류가 발생했습니다.');
        });
    });
});