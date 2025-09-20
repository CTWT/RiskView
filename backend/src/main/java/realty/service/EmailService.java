package realty.service;

import realty.support.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.Date;
import java.util.Map;
import java.util.Random;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

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
        logger.info("이메일 인증코드 전송 프로세스 시작. 수신자: {}", email);
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

        try {
            logger.info("메일 발송 준비. 발신자: {}, 수신자: {}", senderEmail, email);
            // JavaMailSender를 통해 이메일 메시지 생성
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            // 이메일 발신자, 수신자, 제목, 내용 설정을 위해 MimeMessageHelper 객체 생성
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage,"utf-8");
            logger.debug("MimeMessageHelper 생성 및 기본 설정 완료.");
            helper.setFrom(senderEmail);
            helper.setTo(email);
            helper.setSubject("[RiskView] 이메일 인증 코드를 확인해주세요.");
            String emailContent = "<!DOCTYPE html>"
                + "<html>"
                + "<body style=\"font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;\">"
                + "  <div style=\"max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 12px; overflow: hidden;\">"
                + "    <div style=\"background-color: #8b5cf6; color: white; padding: 24px; text-align: center;\">"
                + "      <h1 style=\"margin: 0; font-size: 24px;\">RiskView 이메일 인증</h1>"
                + "    </div>"
                + "    <div style=\"padding: 32px;\">"
                + "      <h2 style=\"font-size: 20px; color: #343a40; margin-top: 0;\">인증 코드를 확인해주세요.</h2>"
                + "      <p style=\"font-size: 16px; color: #495057; line-height: 1.6;\">안녕하세요! RiskView입니다.<br>아래 인증 코드를 입력하여 본인 확인을 완료해주세요.</p>"
                + "      <div style=\"background-color: #f1f3f5; border-radius: 8px; margin: 24px 0; padding: 20px; text-align: center;\">"
                + "        <p style=\"font-size: 32px; font-weight: 700; color: #8b5cf6; margin: 0; letter-spacing: 4px;\">" + code + "</p>"
                + "      </div>"
                + "      <p style=\"font-size: 14px; color: #868e96;\">이 인증 코드는 <strong>30분</strong> 동안 유효합니다.</p>"
                + "      <p style=\"font-size: 14px; color: #868e96;\">만약 직접 요청하지 않으셨다면 이 이메일을 무시하셔도 됩니다.</p>"
                + "    </div>"
                + "    <div style=\"background-color: #f8f9fa; padding: 16px; text-align: center; font-size: 12px; color: #adb5bd;\">"
                + "      © RiskView. All rights reserved.<br>본 메일은 발신 전용입니다."
                + "    </div>"
                + "  </div>"
                + "</body>"
                + "</html>";

        
            helper.setText(emailContent, true);

            logger.debug("이메일 전송 시도...");
            // javaMailSender를 통해 이메일 전송
            javaMailSender.send(mimeMessage);
            logger.info("✅ 이메일 전송 성공. 수신자: {}", email);
        } catch (MessagingException e) {
            logger.error("❌ 이메일 전송 실패. 수신자: {}. SMTP 설정 및 네트워크를 확인하세요.", email, e);
            throw new RuntimeException("이메일 발송에 실패했습니다.", e);
        }

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