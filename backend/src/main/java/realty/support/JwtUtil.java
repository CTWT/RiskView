package realty.support;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.Claims;
import java.util.Date;
import java.util.Base64;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.08.13
 * 파일명 : JwtUtil.java
 */

/**
 * JWT 토큰 생성, 정보 추출, 만료 여부 확인 기능을 제공하는 유틸리티 클래스
 */
@Component
public class JwtUtil {

    // application.properties 또는 application.yml에서 주입받는 값
    @Value("${jwt.secret}")
    private String base64Secret; // Base64로 인코딩된 비밀 키

    @Value("${jwt.expiration}")
    private int expiration; // 토큰 만료 시간 (초 단위)

    /**
     * Base64로 인코딩된 시크릿 키를 디코딩하여 HMAC-SHA 알고리즘에 맞는 SecretKey로 반환
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = Base64.getUrlDecoder().decode(base64Secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * 일반 액세스 토큰 생성
     * @param email 사용자 이메일
     * @return 생성된 JWT 토큰 문자열
     */
    public String generateAccessToken(String email) {
        Date now = new Date(); // 현재 시간
        Date expiry = new Date(now.getTime() + expiration * 1000L); // 만료 시간 계산

        return Jwts.builder()
                .setSubject(email)            // 토큰 제목
                .claim("type", "access")    // 토큰 타입: access
                .setIssuedAt(now)             // 토큰 발급 시간
                .setExpiration(expiry)        // 토큰 만료 시간
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // 서명 알고리즘 및 키 설정
                .compact();                   // 토큰 문자열 생성
    }

    /**
     * 이메일 인증용 토큰 생성
     * @param email 사용자 이메일
     * @param code 이메일 인증코드
     * @return 생성된 JWT 토큰 문자열
     */
    public String generateEmailVerificationToken(String email, String code) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expiration * 1000L); // 만료 시간 계산
    
        return Jwts.builder()
                .setSubject(email)                              // 토큰 제목
                .claim("type", "email_verification") // 토큰 타입: email_verification
                .claim("code", code)                        // 이메일 인증코드
                .setIssuedAt(now)                                // 토큰 발급 시간
                .setExpiration(expiry)                           // 토큰 만료 시간
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // 서명 알고리즘 및 키 설정
                .compact();                                      // 토큰 문자열 생성
    }

    // 토큰 유효성 검사
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false; // 예외 발생 시 유효하지 않음
        }
    }

    // 토큰에서 Claims 추출
    public Claims getClaims(String token) {
        try {
            return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody(); // Claims 반환
        } catch (Exception e) {
            return null; // 예외 발생 시 null 반환
        }
    }
}
