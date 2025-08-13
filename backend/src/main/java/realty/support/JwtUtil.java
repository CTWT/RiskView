package realty.support;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.JwtParser;
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
     * 사용자 이메일을 기반으로 JWT 토큰 생성
     * @param email 사용자 이메일
     * @return 생성된 JWT 토큰 문자열
     */
    public String generateToken(String email) {
        Date now = new Date(); // 현재 시간
        Date expiry = new Date(now.getTime() + expiration * 1000); // 만료 시간 계산

        return Jwts.builder()
                .setSubject(email)            // 토큰 제목(보통 사용자 식별자)
                .setIssuedAt(now)             // 토큰 발급 시간
                .setExpiration(expiry)        // 토큰 만료 시간
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // 서명 알고리즘 및 키 설정
                .compact();                   // 토큰 문자열 생성
    }

    /**
     * JWT 토큰 파서를 생성하여 반환
     * @return JwtParser 인스턴스
     */
    private JwtParser getParser() {
        return Jwts.parserBuilder()
                   .setSigningKey(getSigningKey()) // 서명 키 설정
                   .build();
    }

    /**
     * 토큰에서 사용자 이메일(subject) 추출
     * @param token JWT 토큰
     * @return 이메일(subject) 값, 유효하지 않은 경우 null
     */
    public String getEmailFromToken(String token) {
        try {
            return getParser()
                .parseClaimsJws(token)  // 토큰 검증 및 파싱
                .getBody()
                .getSubject();         // subject 필드 추출
        } catch (Exception e) {
            return null; // 유효하지 않거나 만료된 토큰 처리
        }
    }

    /**
     * 토큰의 만료 여부 확인
     * @param token JWT 토큰
     * @return 만료되었으면 true, 아니면 false
     */
    public boolean isExpired(String token) {
        Date expirationDate = getParser()
                .parseClaimsJws(token)
                .getBody()
                .getExpiration(); // 만료 시간 추출

        return expirationDate.before(new Date()); // 현재 시간보다 전이면 만료됨
    }
}
