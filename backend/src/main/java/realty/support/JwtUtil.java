package realty.support;

import realty.domain.model.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.Cookie;
import java.util.Date;
import java.util.Map;
import java.util.Base64;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;


/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 박윤성
 * 작성일 : 25.08.13
 * 파일명 : JwtUtil.java
 */

/**
 * JWT 토큰 생성, 정보 추출, 만료 여부 확인 기능을 제공하는 유틸리티 클래스
 */
@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    // application.properties 또는 application.yml에서 주입받는 값
    @Value("${jwt.secret}")
    private String base64Secret; // Base64로 인코딩된 비밀 키

    @Value("${jwt.access-token-expiration}")
    private int accessTokenExpiration; // 액세스 토큰 만료 시간 (초 단위)

    @Value("${jwt.email-token-expiration}")
    private int emailTokenExpiration; // 이메일 토큰 만료 시간 (초 단위)

    /**
     * Base64로 인코딩된 시크릿 키를 디코딩하여 HMAC-SHA 알고리즘에 맞는 SecretKey로 반환
     */
    private SecretKey getSigningKey() {
        try {
            byte[] keyBytes = Base64.getUrlDecoder().decode(base64Secret);
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (Exception e) {
            logger.error("⚠️ JWT 서명 키 생성 실패. Base64 시크릿 키가 유효한지, 길이가 충분한지 확인하세요.", e);
            throw new RuntimeException("JWT 서명 키 생성에 실패했습니다.", e);
        }
    }

    /**
     * 일반 액세스 토큰 생성
     * @param user 사용자 정보
     * @return 생성된 JWT 토큰 문자열
     */
    public String generateAccessToken(User user) {
        logger.debug("액세스 토큰 생성 시작. 사용자 ID: {}", user.getUserId());
        return Jwts.builder()              // 토큰 문자열 생성
                .setSubject(user.getEmail())
                .claim("userId", user.getUserId())
                .claim("nickname", user.getUserNickname())
                .claim("email", user.getEmail())
                .claim("name", user.getName())
                .claim("role", user.getRole())
                .claim("language", user.getPreferredLanguage())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiration * 1000L))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * 이메일 인증용 토큰 생성
     * @param email 사용자 이메일
     * @param code 이메일 인증코드
     * @return 생성된 JWT 토큰 문자열
     */
    public String generateEmailVerificationToken(String email, Map<String, Object> claimsMap) {
        logger.debug("이메일 인증 토큰 생성 시작. 이메일: {}", email);
        Date now = new Date();
        Date expiry = new Date(now.getTime() + emailTokenExpiration * 1000L);

        // Builder에 기본 설정
        var builder = Jwts.builder()
            .setSubject(email)
            .setIssuedAt(now)
            .setExpiration(expiry)
            .signWith(getSigningKey(), SignatureAlgorithm.HS256);

        // Map에 있는 모든 클레임을 builder에 추가
        if (claimsMap != null) {
            claimsMap.forEach(builder::claim);
        }

        String token = builder.compact();
        logger.info("이메일 인증 토큰 생성 완료. 이메일: {}", email);
        return token;
    }

    /**
     * 토큰 유효성 검사
     * @param token JWT 토큰
     * @return 토큰 유효성 여부
     */
    public boolean validateToken(String token) {
        logger.trace("토큰 유효성 검사 시작.");
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            logger.warn("토큰 유효성 검사 실패: {}", e.getMessage());
            return false; // 예외 발생 시 유효하지 않음
        }
    }

    /**
     * 쿠키에서 토큰 추출
     * @param request HTTP 요청 정보
     * @param tokenName 찾고자 하는 토큰 이름
     * @return 추출된 토큰 값
     */
    public String extractTokenFromCookies(HttpServletRequest request, String tokenName) {
        logger.debug("쿠키에서 '{}' 토큰 추출 시도.", tokenName);
        // 요청에 쿠키가 없으면 null 반환
        if (request.getCookies() == null) return null;

        // 모든 쿠키 순회
        for (Cookie cookie : request.getCookies()) {
            // 쿠키에 있는 토큰 이름이 찾고자 하는 토큰 이름과 일치하면
            if (tokenName.equals(cookie.getName())) {
                logger.debug("쿠키에서 '{}' 토큰을 찾았습니다.", tokenName);
                // 해당 쿠키 값(토큰) 반환
                return cookie.getValue();
            }
        }
        logger.debug("쿠키에서 '{}' 토큰을 찾지 못했습니다.", tokenName);
        // 찾고자 하는 토큰이 없으면 null 반환
        return null;
    }

    /**
     * 토큰에서 Claims 추출
     * @param token JWT 토큰
     * @return 추출된 Claims
     */
    public Claims getClaims(String token) {
        logger.trace("토큰에서 클레임 추출 시도.");
        try {
            return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody(); // Claims 반환
        } catch (Exception e) {
            logger.warn("토큰에서 클레임 추출 실패: {}", e.getMessage());
            return null; // 예외 발생 시 null 반환
        }
    }
}
