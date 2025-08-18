package realty.controller;

import realty.service.EmailService;
import realty.support.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;
import jakarta.servlet.http.Cookie;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
@RequestMapping("/api")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${jwt.email-token-expiration}")
    private int emailTokenExpiration;

    /**
     * 이메일 인증코드 발송
     * @param payload 이메일 주소를 포함한 페이로드
     * @param request HTTP 요청
     * @param response HTTP 응답
     * @return 응답 객체
     */
    @PostMapping("/send-verification-email-code")
    public ResponseEntity<?> sendVerificationEmailCode(
            @RequestBody Map<String, String> payload,
            HttpServletRequest request,
            HttpServletResponse response) {

        // 페이로드에서 이메일 추출
        String email = payload.get("email");

        try {
            // 이메일 인증코드 발송
            String emailToken = emailService.sendVerificationEmailCode(email);

            // HttpOnly 쿠키로 저장
            Cookie cookie = new Cookie("emailToken", emailToken);
            cookie.setHttpOnly(true);
            // cookie.setSecure(true); // HTTPS 환경에서만 전송되도록. 추후 활성화 예정.
            cookie.setPath("/");
            cookie.setMaxAge(emailTokenExpiration); // 유효기간 설정

            // 응답에 쿠키 추가
            response.addCookie(cookie);

            // 메시지와 함께 OK 응답 반환
            return ResponseEntity.ok(Map.of(
                "message", email + "로 인증코드를 발송했습니다."
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /**
     * 이메일 인증코드 확인
     * @param payload 이메일 주소와 인증코드를 포함한 페이로드
     * @param request HTTP 요청
     * @return 응답 객체
     */
    @PostMapping("/verify-email-code")
    public ResponseEntity<?> verifyEmailCode(
            @RequestBody Map<String, String> payload,
            HttpServletRequest request,
            HttpServletResponse response) {

        // 페이로드에서 이메일, 인증코드 추출
        String email = payload.get("email");
        String code = payload.get("code");

        // 쿠키에서 토큰 추출
        String token = jwtUtil.extractTokenFromCookies(request, "emailToken");

        // 토큰이 없으면
        if (token == null) {
            // 헤더에서 토큰 추출
            String authHeader = request.getHeader("Authorization");
            // 토큰이 있으면
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7); // 토큰 부분만 추출
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("인증 토큰이 없습니다.");
            }
        }

        // 이메일 인증 프로세스 거친 뒤 이메일 인증 여부 반환받음
        boolean isVerified = emailService.verifyEmailCode(email, code, token);
        // 인증 성공 시
        if (isVerified) {
            // 인증된 이메일 토큰 생성
            String verifiedToken = emailService.createVerifiedEmailToken(email);
            // HttpOnly 쿠키로 저장
            Cookie verifiedCookie = new Cookie("emailToken", verifiedToken);
            verifiedCookie.setHttpOnly(true);
            verifiedCookie.setPath("/");
            // verifiedCookie.setSecure(true); // HTTPS 환경에서만 전송되도록. 추후 활성화 예정.
            verifiedCookie.setMaxAge(emailTokenExpiration);
            // 응답에 쿠키 추가
            response.addCookie(verifiedCookie);
            // 메시지와 함께 성공 응답
            return ResponseEntity.ok().body(Map.of("message", "이메일 인증 성공!"));
        }
        // 인증 실패 시
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("인증번호가 올바르지 않거나 만료되었습니다.");
    }
}