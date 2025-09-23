package realty.controller;

import realty.domain.dto.UserDTO;
import realty.domain.dto.LoginHistoryDTO;
import realty.domain.model.User;
import realty.service.UserService;
import realty.service.EmailService;
import realty.support.JwtUtil;
import realty.service.LoginHistoryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;
import java.util.HashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.Cookie;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 박윤성
 * 작성일 : 25.07.18
 * 수정일 : 25.09.22
 * 파일명 : UserController.java
 */

@RestController
@RequestMapping("/api/user")
public class UserController {
    
    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    @Autowired
    private LoginHistoryService loginHistoryService;

    @Value("${jwt.access-token-expiration}")
    private int accessTokenExpiration;

    @Value("${jwt.email-token-expiration}")
    private int emailTokenExpiration;

    // UserController 클래스의 로그 기록용 Logger 객체
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    /**
     * 현재 로그인된 사용자 정보 조회
     * @param request HTTP 요청 정보
     * @return 응답 객체
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(HttpServletRequest request) {
        logger.info("API: [GET /api/user/me] - 현재 로그인된 사용자 정보 조회 시작");
        Map<String, Object> response = userService.getCurrentUserResponse(request);

        return ResponseEntity.ok(response);
    }

    /**
     * 로그인 처리
     * @param userDTO 사용자 정보
     * @param request HTTP 요청 정보
     * @param response HTTP 응답 정보
     * @return 응답 객체
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> postLogin(@RequestBody UserDTO userDTO, HttpServletRequest request, HttpServletResponse response) {
        logger.info("API: [POST /api/user/login] - 로그인 처리 시작. userId: {}", userDTO.getUserId());
        // 프론트에 전달할 응답 정보 담는 객체
        Map<String, Object> responseBody = new HashMap<>();
        
        // 로그인 처리
        User user = userService.userLogin(userDTO, request);

        // JWT 발급
        String accessToken = jwtUtil.generateAccessToken(user);
        logger.debug("JWT access token generated for user: {}", user.getUserId());

        // 쿠키 생성
        Cookie accessTokenCookie = new Cookie("accessToken", accessToken);
        accessTokenCookie.setHttpOnly(true);
        // accessTokenCookie.setSecure(true); // HTTPS 환경일 때만 전송 허용하는 설정. 추후 활용.
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(accessTokenExpiration); // 토큰 만료 시간에 맞춰 설정

        // 응답에 쿠키 추가
        response.addCookie(accessTokenCookie);
        logger.debug("Access token cookie added to response.");

        // 프론트에 전달할 응답 정보 담음
        responseBody.put("success", true);
        responseBody.put("message", "로그인 성공");
        logger.info("API: [POST /api/user/login] - 로그인 성공. userId: {}", user.getUserId());
        // 담았던 정보들과 함께 성공 응답 반환
        return ResponseEntity.ok(responseBody);
    }

    /**
     * 로그아웃 처리
     * @param response HTTP 응답 정보
     * @return 응답 객체
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletResponse response) {
        logger.info("API: [POST /api/user/logout] - 로그아웃 처리 시작");
        Map<String, Object> responseBody = new HashMap<>();

        // accessToken 쿠키 삭제 (만료시킴)
        Cookie accessTokenCookie = new Cookie("accessToken", null);
        accessTokenCookie.setHttpOnly(true);
        // accessTokenCookie.setSecure(true); // HTTPS 환경일 때만 전송 허용하는 설정. 추후 활용.
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(0); // 즉시 만료

        // 응답에 쿠키 추가
        response.addCookie(accessTokenCookie);
        logger.debug("Access token cookie cleared.");

        // 프론트에 전달할 응답 정보 담음
        responseBody.put("success", true);
        responseBody.put("message", "로그아웃 성공");
        logger.info("API: [POST /api/user/logout] - 로그아웃 성공.");
        // 담았던 정보들과 함께 성공 응답 반환
        return ResponseEntity.ok(responseBody);
    }

    /**
     * 회원등록 처리
     * @param userDTO 사용자 정보
     * @param request HTTP 요청 정보
     * @return 응답 객체
     */
    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> postSignUp(
        @RequestBody UserDTO userDTO,
        HttpServletRequest request,
        HttpServletResponse response) {
        logger.info("API: [POST /api/user/signup] - 회원가입 처리 시작. userId: {}, email: {}", userDTO.getUserId(), userDTO.getEmail());
        String token = null;

        logger.debug("Attempting to retrieve emailToken from cookies.");
        // 토큰이 쿠키에 있으면
        if (request.getCookies() != null) {
            // 쿠키를 하나씩 꺼내서
            for (Cookie cookie : request.getCookies()) {
                // 쿠키 이름이 emailToken이면
                if ("emailToken".equals(cookie.getName())) {
                    logger.debug("emailToken found in cookies.");
                    // 토큰 저장
                    token = cookie.getValue();
                    break;
                }
            }
        }

        // 토큰이 없으면
        if (token == null || !jwtUtil.validateToken(token)) {
            logger.warn("Email verification token is missing or invalid.");
            throw new IllegalStateException("이메일 인증이 필요합니다.");
        }

        // 토큰에서 클레임 꺼내기
        Claims claims = jwtUtil.getClaims(token);
        if (claims == null) {
            logger.warn("Could not get claims from emailToken.");
            throw new IllegalStateException("유효하지 않은 인증 토큰입니다.");
        }

        // 토큰에서 이메일 꺼내기
        String tokenEmail = claims.getSubject();
        logger.debug("Email from token: {}, Email from DTO: {}", tokenEmail, userDTO.getEmail());

        // 요청한 이메일과 토큰 이메일이 다르면 인증 불가
        if (!tokenEmail.equals(userDTO.getEmail())) {
            logger.warn("Email from token ({}) does not match user DTO email ({}).", tokenEmail, userDTO.getEmail());
            throw new IllegalStateException("이메일 인증이 완료된 이메일과 다릅니다.");
        }
        
        Map<String, Object> responseBody = new HashMap<>();

        // 유저가 입력한 정보가 담겨있는 UserDTO 객체를 사용해 회원가입 처리
        userService.signUpUser(userDTO);

        // 이메일 인증 토큰 쿠키 삭제
        Cookie emailTokenCookie = new Cookie("emailToken", null);
        emailTokenCookie.setHttpOnly(true);
        // emailTokenCookie.setSecure(true); // 필요하면 HTTPS 환경에 맞게 설정
        emailTokenCookie.setPath("/");
        emailTokenCookie.setMaxAge(0);
        response.addCookie(emailTokenCookie);
        logger.debug("Email verification token cookie cleared.");

        // 프론트에 전달할 응답 정보 담음
        responseBody.put("success", true);
        responseBody.put("message", "회원가입 성공!");
        logger.info("API: [POST /api/user/signup] - 회원가입 성공. userId: {}", userDTO.getUserId());
        // 성공 응답 반환
        return ResponseEntity.ok(responseBody);
    }

    /**
     * 아이디 찾기 처리
     * @param userDTO
     * @return 응답 객체
     */
    @PostMapping("/forgot-id")
    public ResponseEntity<Map<String, Object>> postForgotId(@RequestBody UserDTO userDTO) {
        logger.info("API: [POST /api/user/forgot-id] - 아이디 찾기 처리 시작. name: {}, email: {}", userDTO.getName(), userDTO.getEmail());
        Map<String, Object> response = new HashMap<>();
        
        // 아이디를 데이터베이스에서 조회해서 찾아옴
        User foundUser = userService.findByNameAndEmail(userDTO.getName(), userDTO.getEmail());
        // 찾은 사용자 ID를 응답 객체에 추가
        response.put("userId", foundUser.getUserId());
        logger.info("API: [POST /api/user/forgot-id] - 아이디 찾기 성공. name: {}, email: {}, found userId: {}", userDTO.getName(), userDTO.getEmail(), foundUser.getUserId());
        // 찾은 사용자 ID와 함께 성공 응답 반환
        return ResponseEntity.ok(response);
    }

    /**
     * 비밀번호 찾기를 위한 이메일 인증코드 발송
     * @param payload 사용자 아이디와 이메일
     * @param response HTTP 응답 정보
     * @return 응답 객체
     */
    @PostMapping("/send-password-reset-code")
    public ResponseEntity<Map<String, Object>> sendPasswordResetCode(
        @RequestBody Map<String, String> payload,
        HttpServletResponse response) {
        logger.info("API: [POST /api/user/send-password-reset-code] - 비밀번호 재설정 코드 발송 시작. userId: {}, email: {}", payload.get("userId"), payload.get("email"));
        Map<String, Object> responseBody = new HashMap<>();

        // payload에서 아이디와 이메일 꺼내기
        String userId = payload.get("userId");
        String email = payload.get("email");
        
        // 아이디가 입력되지 않았을 경우
        if (userId == null || userId.trim().isEmpty()) {
            responseBody.put("message", "아이디를 입력해주세요.");
            logger.warn("API: [POST /api/user/send-password-reset-code] - 비밀번호 재설정 코드 발송 실패: userId가 비어있음.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseBody);
        }
        // 이메일이 입력되지 않았을 경우
        if (email == null || email.trim().isEmpty()) {
            responseBody.put("message", "이메일을 입력해주세요.");
            logger.warn("API: [POST /api/user/send-password-reset-code] - 비밀번호 재설정 코드 발송 실패: email이 비어있음.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseBody);
        }

        // 아이디와 이메일이 모두 일치하는 사용자 확인
        User foundUser = userService.findByUserIdAndEmail(userId.trim(), email.trim());

        // 사용자를 찾지 못했다면
        if (foundUser == null) {
            responseBody.put("message", "입력하신 아이디와 이메일에 해당하는 계정을 찾을 수 없습니다.");
            logger.warn("API: [POST /api/user/send-password-reset-code] - 사용자를 찾을 수 없음. userId: {}, email: {}", userId.trim(), email.trim());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseBody);
        }

        // 이메일 인증코드 발송
        String emailToken = emailService.sendVerificationEmailCode(email.trim());
        logger.info("API: [POST /api/user/send-password-reset-code] - 비밀번호 재설정 코드를 이메일로 발송. email: {}", email.trim());

        // HttpOnly 쿠키로 저장
        Cookie emailTokenCookie = new Cookie("emailToken", emailToken);
        emailTokenCookie.setHttpOnly(true);
        emailTokenCookie.setPath("/");
        // cookie.setSecure(true); // HTTPS 환경일 때만 전송 허용하는 설정. 추후 활용.
        emailTokenCookie.setMaxAge(emailTokenExpiration);
        response.addCookie(emailTokenCookie);
        logger.debug("emailToken for password reset added to cookie.");

        // 성공 응답
        responseBody.put("message", email + "로 인증코드를 발송했습니다.");
        responseBody.put("token", emailToken); // 프론트엔드에 토큰 전달
        // 응답 반환
        return ResponseEntity.ok(responseBody);
    }

    /**
     * 비밀번호 재설정 처리
     * @param userDTO 사용자 정보
     * @param request HTTP 요청 정보
     * @return 응답 객체
     */
    @PostMapping("/reset-pass")
    public ResponseEntity<Map<String, Object>> postResetPass(@RequestBody UserDTO userDTO,
        HttpServletResponse response) {
        logger.info("API: [POST /api/user/reset-pass] - 비밀번호 재설정 처리 시작. userId: {}", userDTO.getUserId());
        Map<String, Object> responseBody = new HashMap<>();

        // 비밀번호와 비밀번호 확인 입력이 일치하지 않으면
        if (!userDTO.getNewPassword().equals(userDTO.getConfirmNewPassword())) {
            // 실패 여부와 에러 메시지를 응답 객체에 추가
            responseBody.put("success", false);
            responseBody.put("message", "비밀번호가 일치하지 않습니다.");
            logger.warn("API: [POST /api/user/reset-pass] - 비밀번호 재설정 실패: 새 비밀번호와 확인이 일치하지 않음. userId: {}", userDTO.getUserId());
            // 실패 응답 반환
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseBody);
        }

        // 비밀번호 재설정 처리
        userService.resetPassword(userDTO.getUserId(), userDTO.getNewPassword());

        // emailToken 쿠키 삭제
        Cookie emailTokenCookie = new Cookie("emailToken", null);
        emailTokenCookie.setHttpOnly(true);
        // emailTokenCookie.setSecure(true); // 필요하면 HTTPS 환경에 맞게 설정
        emailTokenCookie.setPath("/");
        emailTokenCookie.setMaxAge(0);
        response.addCookie(emailTokenCookie);
        logger.debug("emailToken cookie cleared after password reset.");

        // 프론트에 보낼 정보들을 담음
        responseBody.put("success", true);
        responseBody.put("message", "비밀번호 재설정이 완료되었습니다. 다시 로그인해주세요.");
        logger.info("API: [POST /api/user/reset-pass] - 비밀번호 재설정 성공. userId: {}", userDTO.getUserId());
        // 담았던 정보들과 함께 성공 응답 반환
        return ResponseEntity.ok(responseBody);
    }

    /**
     * 이메일 중복 확인
     * @param email 확인할 이메일 주소
     * @return 사용 가능 여부와 메시지
     */
    @GetMapping("/check-email/{email}")
    public ResponseEntity<Map<String, Object>> checkEmail(@PathVariable String email) {
        logger.info("API: [GET /api/user/check-email/{email}] - 이메일 중복 확인 시작. email: {}", email);
        Map<String, Object> response = new HashMap<>();
        // 이메일 형식 검증
        if (email == null || email.trim().isEmpty()) {
            // 실패 여부와 메시지를 응답 객체에 추가
            response.put("available", false);
            response.put("message", "이메일을 입력해주세요.");
            logger.warn("API: [GET /api/user/check-email/{email}] - 이메일 중복 확인 실패: email이 비어있음.");
            // 실패 응답 반환
            return ResponseEntity.badRequest().body(response);
        }
        
        // 이메일 형식 정규식 검증
        String emailRegex = "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$";
        if (!email.matches(emailRegex)) {
            // 실패 여부와 메시지를 응답 객체에 추가
            response.put("available", false);
            response.put("message", "유효한 이메일 형식이 아닙니다.");
            logger.warn("API: [GET /api/user/check-email/{email}] - 이메일 중복 확인 실패: 유효하지 않은 이메일 형식. email: '{}'", email);
            // 실패 응답 반환
            return ResponseEntity.badRequest().body(response);
        }
        
        // 중복 확인
        boolean exists = userService.isEmailDuplicated(email);
        
        // 중복이면
        if (exists) {
            // 실패 여부와 메시지를 응답 객체에 추가
            response.put("available", false);
            response.put("message", "이미 사용 중인 이메일 주소입니다.");
            logger.info("API: [GET /api/user/check-email/{email}] - 이메일 중복. email: '{}'", email);
        } else {
            // 성공 여부와 메시지를 응답 객체에 추가
            response.put("available", true);
            response.put("message", "사용 가능한 이메일 주소입니다.");
            logger.info("API: [GET /api/user/check-email/{email}] - 이메일 사용 가능. email: '{}'", email);
        }
        // 성공 응답 반환
        return ResponseEntity.ok(response);
    }

    /**
     * 아이디 중복 확인
     * @param username 확인할 아이디
     * @return 사용 가능 여부와 메시지
     */
    @GetMapping("/check-userid/{userId}")
    public ResponseEntity<Map<String, Object>> checkUsername(@PathVariable String userId) {
        logger.info("API: [GET /api/user/check-userid/{userId}] - 아이디 중복 확인 시작. userId: {}", userId);
        Map<String, Object> response = new HashMap<>();
        
        // 아이디가 없거나 공백이면
        if (userId == null || userId.trim().isEmpty()) {
            // 실패 여부와 메시지를 응답 객체에 추가
            response.put("available", false);
            response.put("message", "아이디를 입력해주세요.");
            logger.warn("API: [GET /api/user/check-userid/{userId}] - 아이디 중복 확인 실패: userId가 비어있음.");
            // 실패 응답 반환
            return ResponseEntity.badRequest().body(response);
        }
        
        // 중복 확인
        boolean exists = userService.isUserIdDuplicated(userId);
        
        // 중복이면
        if (exists) {
            // 실패 여부와 메시지를 응답 객체에 추가
            response.put("available", false);
            response.put("message", "이미 사용 중인 아이디입니다.");
            logger.info("API: [GET /api/user/check-userid/{userId}] - 아이디 중복. userId: '{}'", userId);
        } else {
            // 성공 여부와 메시지를 응답 객체에 추가
            response.put("available", true);
            response.put("message", "사용 가능한 아이디입니다.");
            logger.info("API: [GET /api/user/check-userid/{userId}] - 아이디 사용 가능. userId: '{}'", userId);
        }
        // 성공 응답 반환
        return ResponseEntity.ok(response);
    }

    /**
     * 닉네임 중복 확인
     * @param nickname 확인할 닉네임
     * @return 사용 가능 여부와 메시지
     */
    @GetMapping("/check-nickname/{nickname}")
    public ResponseEntity<Map<String, Object>> checkNickname(@PathVariable String nickname) {
        logger.info("API: [GET /api/user/check-nickname/{nickname}] - 닉네임 중복 확인 시작. nickname: {}", nickname);
        Map<String, Object> response = new HashMap<>();
        
        // 닉네임이 없거나 공백이면
        if (nickname == null || nickname.trim().isEmpty()) {
            // 실패 여부와 메시지를 응답 객체에 추가
            response.put("available", false);
            response.put("message", "닉네임을 입력해주세요.");
            logger.warn("API: [GET /api/user/check-nickname/{nickname}] - 닉네임 중복 확인 실패: nickname이 비어있음.");
            // 실패 응답 반환
            return ResponseEntity.badRequest().body(response);
        }
        
        // 중복 확인
        boolean exists = userService.isNicknameDuplicated(nickname);
        
        // 중복이면
        if (exists) {
            // 실패 여부와 메시지를 응답 객체에 추가
            response.put("available", false);
            response.put("message", "이미 사용 중인 닉네임입니다.");
            logger.info("API: [GET /api/user/check-nickname/{nickname}] - 닉네임 중복. nickname: '{}'", nickname);
        } else {
            // 성공 여부와 메시지를 응답 객체에 추가
            response.put("available", true);
            response.put("message", "사용 가능한 닉네임입니다.");
            logger.info("API: [GET /api/user/check-nickname/{nickname}] - 닉네임 사용 가능. nickname: '{}'", nickname);
        }
        // 성공 응답 반환
        return ResponseEntity.ok(response);
    }

    /**
     * 마이페이지 정보 조회
     * @param request
     * @return
     */
    @GetMapping("/mypage")
    public ResponseEntity<UserDTO> getMyPage(HttpServletRequest request) {
        logger.info("API: [GET /api/user/mypage] - 마이페이지 정보 조회 시작");
        String userId = userService.getCurrentUserId(request);
        UserDTO userDTO = userService.getUserInfoForMyPage(userId);
        logger.info("API: [GET /api/user/mypage] - 마이페이지 정보 조회 성공. userId: {}", userId);
        return ResponseEntity.ok(userDTO);
    }

    /**
     * 마이페이지 정보 수정
     * @param userDTO
     * @param request
     * @return
     */
    @PutMapping("/mypage")
    public ResponseEntity<Map<String, Object>> updateMyPage(@RequestBody UserDTO userDTO, HttpServletRequest request) {
        logger.info("API: [PUT /api/user/mypage] - 마이페이지 정보 수정 시작. userId: {}", userDTO.getUserId());
        String currentUserId = userService.getCurrentUserId(request);
        Map<String, Object> responseBody = new HashMap<>();
        try {
            userService.updateUserInfo(currentUserId, userDTO);
            responseBody.put("success", true);
            responseBody.put("message", "정보가 성공적으로 수정되었습니다.");
            logger.info("API: [PUT /api/user/mypage] - 마이페이지 정보 수정 성공. userId: {}", currentUserId);
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            logger.error("API: [PUT /api/user/mypage] - 마이페이지 정보 수정 중 오류 발생. userId: {}", currentUserId, e);
            responseBody.put("success", false);
            responseBody.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseBody);
        }
    }

    /**
     * 현재 비밀번호 확인
     * @param payload 현재 비밀번호
     * @param request HTTP 요청 정보
     * @return 응답 객체
     */
    @PostMapping("/verify-password")
    public ResponseEntity<Map<String, Object>> verifyCurrentPassword(@RequestBody Map<String, String> payload, HttpServletRequest request) {
        logger.info("API: [POST /api/user/verify-password] - 현재 비밀번호 확인 시작");
        String currentUserId = userService.getCurrentUserId(request);
        String currentPassword = payload.get("currentPassword");
        Map<String, Object> responseBody = new HashMap<>();

        try {
            boolean isMatch = userService.verifyCurrentPassword(currentUserId, currentPassword);
            logger.info("API: [POST /api/user/verify-password] - 현재 비밀번호 확인 완료. userId: {}, isMatch: {}", currentUserId, isMatch);
            responseBody.put("success", isMatch);
            responseBody.put("message", isMatch ? "비밀번호 확인이 완료되었습니다." : "비밀번호가 일치하지 않습니다.");
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            logger.error("API: [POST /api/user/verify-password] - 현재 비밀번호 확인 중 오류 발생. userId: {}", currentUserId, e);
            responseBody.put("success", false);
            responseBody.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseBody);
        }
    }

    /**
     * 회원 탈퇴
     * @param payload 비밀번호
     * @param request HTTP 요청 정보
     * @param response HTTP 응답 정보
     * @return 응답 객체
     */
    @DeleteMapping("/delete-account")
    public ResponseEntity<Map<String, Object>> deleteAccount(@RequestBody Map<String, String> payload, HttpServletRequest request, HttpServletResponse response) {
        logger.info("API: [DELETE /api/user/delete-account] - 회원 탈퇴 처리 시작");
        String currentUserId = userService.getCurrentUserId(request);
        String password = payload.get("password");
        Map<String, Object> responseBody = new HashMap<>();

        // 현재 비밀번호가 일치하는지 확인
        if (!userService.verifyCurrentPassword(currentUserId, password)) {
            logger.warn("API: [DELETE /api/user/delete-account] - 회원 탈퇴 실패: 비밀번호 불일치. userId: {}", currentUserId);
            responseBody.put("success", false);
            responseBody.put("message", "비밀번호가 일치하지 않습니다.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseBody);
        }

        // 회원 탈퇴 처리
        userService.deleteAccount(currentUserId);
        logger.info("API: [DELETE /api/user/delete-account] - 회원 탈퇴 성공. userId: {}", currentUserId);
        responseBody.put("success", true);
        responseBody.put("message", "회원 탈퇴가 완료되었습니다.");
        return ResponseEntity.ok(responseBody);
    }

    /**
     * 로그인 이력 조회
     * @param request HTTP 요청 정보
     * @return 응답 객체
     */
    @GetMapping("/login-history")
    public ResponseEntity<List<LoginHistoryDTO>> getLoginHistory(HttpServletRequest request) {
        logger.info("API: [GET /api/user/login-history] - 로그인 이력 조회 시작");
        String userCode = userService.getCurrentUserCode(request);
        List<LoginHistoryDTO> loginHistories = loginHistoryService.findByUserCode(userCode);
        return ResponseEntity.ok(loginHistories);
    }
}
