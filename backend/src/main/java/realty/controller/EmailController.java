package realty.controller;

import realty.service.EmailService;
import realty.support.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;
import jakarta.servlet.http.Cookie;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
 * 수정일 : 25.09.25
 * 파일명 : EmailController.java
 */

@RestController
@RequestMapping("/api")
public class EmailController {

    private static final Logger logger = LoggerFactory.getLogger(EmailController.class);

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
        logger.info("API 요청 수신: 이메일 인증코드 발송. 수신자 이메일: {}", email);

        try {
            // 인증 코드와 토큰 생성
            Map<String, String> codeAndToken = emailService.createVerificationCodeAndToken(email);
            logger.debug("EmailService로부터 인증 코드 및 토큰 수신 완료.");

            // 토큰을 HttpOnly 쿠키에 담아 응답에 추가
            Cookie emailTokenCookie = new Cookie("emailToken", codeAndToken.get("token"));
            emailTokenCookie.setHttpOnly(true);
            emailTokenCookie.setPath("/");
            emailTokenCookie.setMaxAge(emailTokenExpiration); // yml에 설정된 만료 시간
            response.addCookie(emailTokenCookie);
            logger.debug("emailToken을 HttpOnly 쿠키에 설정했습니다.");

            // 메시지와 함께 OK 응답 반환
            logger.info("이메일 인증코드 및 토큰 생성 성공. 수신자: {}", email);
            return ResponseEntity.ok(Map.of(
                "code", codeAndToken.get("code"),
                "token", codeAndToken.get("token")
            ));
        } catch (IllegalArgumentException e) {
            logger.warn("잘못된 요청으로 인증코드 발송 실패. 수신자: {}, 원인: {}", email, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("서버 내부 오류로 인증코드 발송 실패. 수신자: {}", email, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("인증코드 생성 중 오류가 발생했습니다.");
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
        logger.info("API 요청 수신: 이메일 인증코드 확인. 이메일: {}", email);

        // 쿠키에서 토큰 추출
        String token = jwtUtil.extractTokenFromCookies(request, "emailToken");

        // 토큰이 없으면
        if (token == null) {
            logger.debug("쿠키에 emailToken이 없어 헤더에서 Bearer 토큰 추출 시도.");
            // 헤더에서 토큰 추출
            String authHeader = request.getHeader("Authorization");
            // 토큰이 있으면
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7); // 토큰 부분만 추출
                logger.debug("헤더에서 Bearer 토큰 추출 성공.");
            } else {
                logger.warn("인증 토큰을 찾을 수 없음 (쿠키 및 헤더). 이메일: {}", email);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("인증 토큰이 없습니다.");
            }
        }

        // 이메일 인증 프로세스 거친 뒤 이메일 인증 여부 반환받음
        boolean isVerified = emailService.verifyEmailCode(email, code, token);
        // 인증 성공 시
        if (isVerified) {
            logger.info("이메일 인증 성공. 이메일: {}", email);
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
            logger.debug("인증 완료된 emailToken을 쿠키에 저장.");
            // 메시지와 함께 성공 응답
            return ResponseEntity.ok().body(Map.of("message", "이메일 인증 성공!", "code", "001"));
        }
        // 인증 실패 시
        logger.warn("이메일 인증 실패. 이메일: {}", email);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("인증번호가 올바르지 않거나 만료되었습니다.");
    }
}