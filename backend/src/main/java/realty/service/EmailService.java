package realty.service;

import realty.support.JwtUtil;
import io.jsonwebtoken.Claims;
import java.util.Date;
import java.util.Map;
import java.util.Random;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;


/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 박윤성
 * 작성일 : 25.07.25
 * 수정일 : 25.09.25
 * 파일명 : EmailService.java
 */

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JwtUtil jwtUtil;

    // 발신자 이메일
    @Value("${spring.mail.username}")
    private String senderEmail;

    /**
     * 이메일 인증코드 전송
     * @param email 인증할 이메일 주소
     * @return 생성된 인증 코드와 JWT 토큰을 담은 Map
     */
    public Map<String, String> createVerificationCodeAndToken(String email) {
        logger.info("이메일 인증코드 및 토큰 생성 프로세스 시작. 이메일: {}", email);
        // 이메일 유효성 검사
        if (email == null || email.trim().isEmpty()) {
            logger.warn("이메일 주소가 null이거나 비어있습니다.");
            throw new IllegalArgumentException("이메일 주소를 입력해주세요.");
        }
        
        // 이메일 인증코드 생성
        String code = String.valueOf(100000 + new Random().nextInt(900000));

        // JWT 토큰 생성
        String token;
        try {
            token = jwtUtil.generateEmailVerificationToken(email, Map.of(
                "code", code,
                "email_verified", false
            ));
            logger.debug("이메일 인증용 JWT 토큰 생성 성공. 수신자: {}", email);
        } catch (Exception e) {
            logger.error("JWT 토큰 생성 중 예외 발생. 수신자: {}", email, e);
            throw new RuntimeException("이메일 인증코드 생성에 실패했습니다.", e);
        }

        // 인증 코드와 토큰을 Map에 담아 반환
        return Map.of("code", code, "token", token);
    }

    /**
     * 이메일 인증코드 인증
     * @param email 인증코드를 보냈던 수신 대상의 이메일 주소
     * @param code 이메일 인증코드
     * @return 이메일 인증 여부
     */
    public boolean verifyEmailCode(String email, String code, String token) {
        logger.info("이메일 코드 검증 시작. 이메일: {}", email);

        // 토큰 유효성 검사
        if (!jwtUtil.validateToken(token)) {
            logger.warn("이메일 코드 검증 실패: 유효하지 않은 토큰입니다. 이메일: {}", email);
            return false;
        }

        // 토큰에서 클레임 추출
        Claims claims = jwtUtil.getClaims(token);
        if (claims == null) {
            logger.warn("이메일 코드 검증 실패: 토큰에서 클레임을 추출할 수 없습니다. 이메일: {}", email);
            return false;
        }

        // 토큰에서 이메일, 인증코드, 만료일 추출
        String tokenEmail = claims.getSubject();
        String tokenCode = claims.get("code", String.class);
        Boolean emailVerified = claims.get("email_verified", Boolean.class);
        Date expiration = claims.getExpiration();

        logger.debug("토큰 정보 - 이메일: {}, 코드: {}, 인증여부: {}, 만료일: {}", tokenEmail, tokenCode, emailVerified, expiration);

        // 이메일, 인증코드, 만료일 일치 여부 확인
        boolean isValid = email.equals(tokenEmail)
            && code.equals(tokenCode)
            && (emailVerified == null || !emailVerified) // 인증 전이어야 true
            && expiration.after(new Date());

        logger.info("이메일 코드 검증 결과: {}. 이메일: {}", isValid, email);
        return isValid;
    }

    /**
     * 이메일 인증 여부를 나타내는 토큰 생성
     * @param email 사용자 이메일
     * @return 생성된 JWT 토큰 문자열
     */
    public String createVerifiedEmailToken(String email) {
        logger.info("인증 완료된 이메일 토큰 생성 시작. 이메일: {}", email);
        return jwtUtil.generateEmailVerificationToken(email, Map.of(
            "email_verified", true
        ));
    }
    
}