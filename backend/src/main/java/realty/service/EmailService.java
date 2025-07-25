package realty.service;

import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.07.25
 * 파일명 : EmailService.java
 */

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    // 
    @Value("${spring.mail.username}")
    private String senderEmail;

    /**
     * 이메일 인증코드 생성
     * @return 이메일 인증코드
     */
    public String generateEmailCode() {
        Random random = new Random();
        // 6자리 인증코드
        int code = 100000 + random.nextInt(900000);
        // 인증코드를 문자열로 변환하여 반환
        return String.valueOf(code);
    }

    /**
     * 이메일 인증코드 전송
     * @param email 인증코드를 보낼 이메일 주소
     */
    public String sendVerificationEmailCode(String email, HttpServletRequest request) {
        // 이메일 유효성 검사
        if (email == null || email.trim().isEmpty()) {
            return "이메일 주소가 입력되지 않았습니다.";
        }
        
        // 이메일 인증코드 생성
        String code = generateEmailCode();

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
            System.out.println("이메일 발송 실패: " + e.getMessage());
        }

        System.out.println(email + "로 인증코드를 발송했습니다.");

        // 세션에 이메일 인증코드와 만료시간 저장
        request.getSession().setAttribute("emailVerificationCode_" + email, code);
        request.getSession().setAttribute("emailVerification_Expiry_" + email, System.currentTimeMillis() + 1800000); // 30분

        // 성공 메시지 반환
        return email + "로 인증코드가 발송되었습니다.";
    }

    /**
     * 이메일 인증코드 인증
     * @param email 인증코드를 보냈던 수신 대상의 이메일 주소
     * @param code 이메일 인증코드
     * @return
     */
    public boolean verifyEmailCode(String email, String code, HttpServletRequest request) {
        // 세션에서 해당 이메일 주소로 보냈던 인증코드를 가져오기
        String storedCode = (String) request.getSession().getAttribute("emailVerificationCode_" + email);
        // 세션에서 이메일 인증코드의 제한 시간을 가져오기
        Long expirationTime = (Long) request.getSession().getAttribute("emailVerification_Expiry_" + email);

        // 제한시간이 만료되기 전이고 보냈던 인증코드가 있으면
        // 수정: System.currentTimeMillis() < expirationTime (현재 시간이 만료 시간보다 작아야 함)
        if (expirationTime != null && System.currentTimeMillis() < expirationTime && storedCode != null) {
            // 이메일 인증코드가 일치하면
            if (storedCode.equals(code)) {
                System.out.println("이메일 인증 성공!");

                // 인증 완료 표시
                request.getSession().setAttribute("email_verified_" + email, true);
                
                // 인증 후 세션에서 인증코드 정보 제거
                request.getSession().removeAttribute("emailVerificationCode_" + email);
                request.getSession().removeAttribute("emailVerification_Expiry_" + email);
                // 인증 성공 여부를 true로 반환
                return true;
            }
        }
        // 인증 실패 반환
        System.out.println("이메일 인증 실패!");
        return false;
    }
}