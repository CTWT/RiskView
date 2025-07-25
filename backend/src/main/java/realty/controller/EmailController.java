package realty.controller;

import realty.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;


/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.07.25
 * 파일명 : EmailController.java
 */

@RestController
public class EmailController {

    @Autowired
    private EmailService emailService;

    // 이메일 인증코드 전송
    @PostMapping("/send-verification-email-code")
    public String sendVerificationEmailCode(@RequestParam("email") String email, HttpServletRequest request) {
        return emailService.sendVerificationEmailCode(email, request);
    }

    // 이메일 인증코드로 인증
    @PostMapping("/verify-email-code")
    public String verifyEmailCode(@RequestParam("email") String email, @RequestParam("code") String code, HttpServletRequest request) {
        boolean result = emailService.verifyEmailCode(email, code, request);
        return result ? "이메일 인증 성공!" : "이메일 인증 실패";
    }
}