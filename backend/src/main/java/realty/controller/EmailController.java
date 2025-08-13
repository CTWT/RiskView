package realty.controller;

import realty.service.EmailService;
import realty.support.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 박윤성
 * 작성일 : 25.07.25
 * 파일명 : EmailController.java
 */

@RestController
public class EmailController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * 이메일 인증코드 발송
     * @param email 이메일 주소
     * @param request HTTP 요청
     * @return 응답 객체
     */
    @PostMapping("/api/send-verification-email-code")
    public ResponseEntity<?> sendVerificationEmailCode(
            @RequestParam("email") String email, HttpServletRequest request) {
        try {
            // 이메일 인증코드 발송
            String result = emailService.sendVerificationEmailCode(email, request);
            // OK 응답 반환
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /**
     * 이메일 인증코드 확인
     * @param email 이메일 주소
     * @param code 인증코드
     * @param request HTTP 요청
     * @return 응답 객체
     */
    @PostMapping("/api/verify-email-code")
    public ResponseEntity<?> verifyEmailCode(
            @RequestParam("email") String email,
            @RequestParam("code") String code,
            HttpServletRequest request) {
        // 이메일 인증 프로세스 거친 뒤 이메일 인증 여부 반환받음
        boolean isVerified = emailService.verifyEmailCode(email, code, request);
        // 인증 성공 시
        if (isVerified) {
            // JWT 토큰 생성
            String token = jwtUtil.generateToken(email);

            // JSON 형식으로 응답
            return ResponseEntity.ok()
                .body(Map.of(
                    "message", "이메일 인증 성공!",
                    "token", token
                ));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("인증번호가 올바르지 않거나 만료되었습니다.");
    }
}