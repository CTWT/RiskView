package realty.service;

import realty.support.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.Date;
import java.util.Map;
import java.util.Random;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;


/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 박윤성
 * 작성일 : 25.07.25
 * 파일명 : EmailService.java
 */

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    @Autowired
    private JwtUtil jwtUtil;

    // 발신자 이메일
    @Value("${spring.mail.username}")
    private String senderEmail;

    /**
     * 이메일 인증코드 전송
     * @param email 인증코드를 보낼 이메일 주소
     * @param request HTTP 요청
     * @return 이메일 인증코드 발송 결과
     */
    public String sendVerificationEmailCode(String email) {
        // 이메일 유효성 검사
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("이메일 주소가 입력되지 않았습니다.");
        }
        
        // 이메일 인증코드 생성
        Random random = new Random();
        String code = String.valueOf(100000 + random.nextInt(900000));

        // JWT 토큰 생성
        String token = jwtUtil.generateEmailVerificationToken(email, Map.of(
            "code", code,
            "email_verified", false
        ));

        try {
            // JavaMailSender를 통해 이메일 메시지 생성
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            // 이메일 발신자, 수신자, 제목, 내용 설정을 위해 MimeMessageHelper 객체 생성
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage,"utf-8");
            helper.setFrom(senderEmail);
            helper.setTo(email);
            helper.setSubject("이메일 인증코드");
            String emailContent = "<div style=\"font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.6;\">"
                                + "<h2 style=\"color: #0056b3;\">이메일 인증 안내</h2>"
                                + "<p>안녕하세요. 귀하의 이메일 인증을 위한 코드가 발급되었습니다.</p>"
                                + "<p>아래 인증 코드를 입력하여 본인 확인을 완료해 주세요.</p>"
                                + "<div style=\"background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;\">"
                                + "<p style=\"font-size: 24px; font-weight: bold; color: #d9534f; margin: 0;\">" + code + "</p>"
                                + "</div>"
                                + "<p>본 인증 코드는 30분 동안 유효합니다.</p>"
                                + "<p>감사합니다.</p>"
                                + "<p style=\"font-size: 12px; color: #777;\">본 메일은 발신 전용입니다.</p>"
                                + "</div>";
            helper.setText(emailContent, true);

            // javaMailSender를 통해 이메일 전송
            javaMailSender.send(mimeMessage);
        } catch (MessagingException e) {
            throw new RuntimeException("이메일 발송에 실패했습니다.", e);
        }

        System.out.println(email + "로 인증코드를 발송했습니다.");

        // 코드가 포함된 토큰 반환
        return token;
    }

    /**
     * 이메일 인증코드 인증
     * @param email 인증코드를 보냈던 수신 대상의 이메일 주소
     * @param code 이메일 인증코드
     * @return 이메일 인증 여부
     */
    public boolean verifyEmailCode(String email, String code, String token) {

        // 토큰 유효성 검사
        if (!jwtUtil.validateToken(token)) return false;

        // 토큰에서 클레임 추출
        Claims claims = jwtUtil.getClaims(token);
        if (claims == null) return false;

        // 토큰에서 이메일, 인증코드, 만료일 추출
        String tokenEmail = claims.getSubject();
        String tokenCode = claims.get("code", String.class);
        Boolean emailVerified = claims.get("email_verified", Boolean.class);
        Date expiration = claims.getExpiration();

        // 이메일, 인증코드, 만료일 일치 여부 확인
        return email.equals(tokenEmail)
            && code.equals(tokenCode)
            && (emailVerified == null || !emailVerified) // 인증 전이어야 true
            && expiration.after(new Date());
    }

    /**
     * 이메일 인증 여부를 나타내는 토큰 생성
     * @param email 사용자 이메일
     * @return 생성된 JWT 토큰 문자열
     */
    public String createVerifiedEmailToken(String email) {
        return jwtUtil.generateEmailVerificationToken(email, Map.of(
            "email_verified", true
        ));
    }
    
}