package realty.controller;

import realty.domain.dto.UserDTO;
import realty.domain.model.User;
import realty.service.UserService;
import realty.service.EmailService;
import realty.support.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;
import java.util.HashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
        Map<String, Object> response = new HashMap<>();
        // 쿠키에서 accessToken 추출
        String accessToken = jwtUtil.extractTokenFromCookies(request, "accessToken");

        // accessToken이 없으면
        if (accessToken == null || accessToken.isEmpty()) {
            // 응답에 실패 정보 담음
            response.put("success", false);
            response.put("message", "Access Token이 없습니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        // accessToken에서 Claims 추출
        Claims claims = jwtUtil.getClaims(accessToken);
        // Claims가 유효하지 않으면
        if (claims == null) {
            response.put("success", false);
            response.put("message", "유효하지 않은 토큰입니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        // Claims에서 userId 추출
        String userId = claims.get("userId", String.class);
        if (userId == null) {
            response.put("success", false);
            response.put("message", "토큰에 사용자 ID가 없습니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        // 유저 정보 조회
        User user = userService.findByUserId(userId);
        // 사용자를 찾을 수 없으면
        if (user == null) {
            response.put("success", false);
            response.put("message", "사용자를 찾을 수 없습니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        // 응답에 사용자 정보 담기
        response.put("success", true);
        response.put("user", Map.of(
            "userId", user.getUserId(),
            "nickname", user.getUserNickname()
        ));
        // 응답 반환
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
        // 프론트에 전달할 응답 정보 담는 객체
        Map<String, Object> responseBody = new HashMap<>();
        
        // 로그인 처리
        User user = userService.userLogin(userDTO, request);

        // JWT 발급
        String accessToken = jwtUtil.generateAccessToken(user);

        // 쿠키 생성
        Cookie accessTokenCookie = new Cookie("accessToken", accessToken);
        accessTokenCookie.setHttpOnly(true);
        // accessTokenCookie.setSecure(true); // HTTPS 환경일 때만 전송 허용하는 설정. 추후 활용.
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(accessTokenExpiration); // 토큰 만료 시간에 맞춰 설정

        // 응답에 쿠키 추가
        response.addCookie(accessTokenCookie);

        // 프론트에 전달할 응답 정보 담음
        responseBody.put("success", true);
        responseBody.put("message", "로그인 성공");
        logger.info("로그인 성공!");
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
        Map<String, Object> responseBody = new HashMap<>();

        // accessToken 쿠키 삭제 (만료시킴)
        Cookie accessTokenCookie = new Cookie("accessToken", null);
        accessTokenCookie.setHttpOnly(true);
        // accessTokenCookie.setSecure(true); // HTTPS 환경일 때만 전송 허용하는 설정. 추후 활용.
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(0); // 즉시 만료

        // 응답에 쿠키 추가
        response.addCookie(accessTokenCookie);

        // 프론트에 전달할 응답 정보 담음
        responseBody.put("success", true);
        responseBody.put("message", "로그아웃 성공");
        logger.info("로그아웃 성공!");
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
        String token = null;

        // 토큰이 쿠키에 있으면
        if (request.getCookies() != null) {
            // 쿠키를 하나씩 꺼내서
            for (Cookie cookie : request.getCookies()) {
                // 쿠키 이름이 emailToken이면
                if ("emailToken".equals(cookie.getName())) {
                    // 토큰 저장
                    token = cookie.getValue();
                    break;
                }
            }
        }

        // 토큰이 없으면
        if (token == null || !jwtUtil.validateToken(token)) {
            throw new IllegalStateException("이메일 인증이 필요합니다.");
        }

        // 토큰에서 클레임 꺼내기
        Claims claims = jwtUtil.getClaims(token);
        if (claims == null) {
            throw new IllegalStateException("유효하지 않은 인증 토큰입니다.");
        }

        // 토큰에서 이메일 꺼내기
        String tokenEmail = claims.getSubject();

        // 요청한 이메일과 토큰 이메일이 다르면 인증 불가
        if (!tokenEmail.equals(userDTO.getEmail())) {
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

        // 프론트에 전달할 응답 정보 담음
        responseBody.put("success", true);
        responseBody.put("message", "회원가입 성공!");
        logger.info("회원가입 성공!");
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
        Map<String, Object> response = new HashMap<>();
        
        // 아이디를 데이터베이스에서 조회해서 찾아옴
        User foundUser = userService.findByNameAndEmail(userDTO.getName(), userDTO.getEmail());
        // 찾은 사용자 ID를 응답 객체에 추가
        response.put("userId", foundUser.getUserId());
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
        Map<String, Object> responseBody = new HashMap<>();

        // payload에서 아이디와 이메일 꺼내기
        String userId = payload.get("userId");
        String email = payload.get("email");
        
        // 아이디가 입력되지 않았을 경우
        if (userId == null || userId.trim().isEmpty()) {
            responseBody.put("message", "아이디를 입력해주세요.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseBody);
        }
        // 이메일이 입력되지 않았을 경우
        if (email == null || email.trim().isEmpty()) {
            responseBody.put("message", "이메일을 입력해주세요.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseBody);
        }

        // 아이디와 이메일이 모두 일치하는 사용자 확인
        User foundUser = null;
        foundUser = userService.findByUserIdAndEmail(userId.trim(), email.trim());

        // 사용자를 찾지 못했다면
        if (foundUser == null) {
            responseBody.put("message", "입력하신 아이디와 이메일에 해당하는 계정을 찾을 수 없습니다.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseBody);
        }

        // 이메일 인증코드 발송
        String emailToken = emailService.sendVerificationEmailCode(email.trim());

        // HttpOnly 쿠키로 저장
        Cookie emailTokenCookie = new Cookie("emailToken", emailToken);
        emailTokenCookie.setHttpOnly(true);
        emailTokenCookie.setPath("/");
        // cookie.setSecure(true); // HTTPS 환경일 때만 전송 허용하는 설정. 추후 활용.
        emailTokenCookie.setMaxAge(emailTokenExpiration);
        response.addCookie(emailTokenCookie);

        // 성공 응답
        responseBody.put("message", email + "로 인증코드를 발송했습니다.");
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
        Map<String, Object> responseBody = new HashMap<>();

        // 비밀번호와 비밀번호 확인 입력이 일치하지 않으면
        if (!userDTO.getNewPassword().equals(userDTO.getConfirmNewPassword())) {
            // 실패 여부와 에러 메시지를 응답 객체에 추가
            responseBody.put("success", false);
            responseBody.put("message", "비밀번호가 일치하지 않습니다.");
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

        // 프론트에 보낼 정보들을 담음
        responseBody.put("success", true);
        responseBody.put("message", "비밀번호 재설정이 완료되었습니다. 다시 로그인해주세요.");
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
        Map<String, Object> response = new HashMap<>();
        // 이메일 형식 검증
        if (email == null || email.trim().isEmpty()) {
            // 실패 여부와 메시지를 응답 객체에 추가
            response.put("available", false);
            response.put("message", "이메일을 입력해주세요.");
            // 실패 응답 반환
            return ResponseEntity.badRequest().body(response);
        }
        
        // 이메일 형식 정규식 검증
        String emailRegex = "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$";
        if (!email.matches(emailRegex)) {
            // 실패 여부와 메시지를 응답 객체에 추가
            response.put("available", false);
            response.put("message", "유효한 이메일 형식이 아닙니다.");
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
        } else {
            // 성공 여부와 메시지를 응답 객체에 추가
            response.put("available", true);
            response.put("message", "사용 가능한 이메일 주소입니다.");
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
        Map<String, Object> response = new HashMap<>();
        
        // 아이디가 없거나 공백이면
        if (userId == null || userId.trim().isEmpty()) {
            // 실패 여부와 메시지를 응답 객체에 추가
            response.put("available", false);
            response.put("message", "아이디를 입력해주세요.");
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
        } else {
            // 성공 여부와 메시지를 응답 객체에 추가
            response.put("available", true);
            response.put("message", "사용 가능한 아이디입니다.");
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
        Map<String, Object> response = new HashMap<>();
        
        // 닉네임이 없거나 공백이면
        if (nickname == null || nickname.trim().isEmpty()) {
            // 실패 여부와 메시지를 응답 객체에 추가
            response.put("available", false);
            response.put("message", "닉네임을 입력해주세요.");
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
        } else {
            // 성공 여부와 메시지를 응답 객체에 추가
            response.put("available", true);
            response.put("message", "사용 가능한 닉네임입니다.");
        }
        // 성공 응답 반환
        return ResponseEntity.ok(response);
    }


    /* 추후 마이페이지 개발 시 참고
    @GetMapping("/mypage")
    public String getMyPage(HttpSession session, Model model) {
        // 세션에서 로그인된 사용자 가져오기
        User loggedInUser = (User) session.getAttribute("user");

        // 로그인 안 한 경우
        if (loggedInUser == null) {
            // 로그인 페이지로 이동
            return "redirect:/login";
        }

        // 데이터베이스에서 유저 정보 조회
        User userFromDb = userService.findByUserId(loggedInUser.getUserId());

        if (userFromDb == null) {
            model.addAttribute("error", "사용자 정보를 불러올 수 없습니다.");
            return "index";
        }

        // User → UserDTO 변환
        UserDTO userDTO = new UserDTO();
        userDTO.setUserId(userFromDb.getUserId());
        userDTO.setUserNickname(userFromDb.getUserNickname());
        userDTO.setEmail(userFromDb.getEmail());
        userDTO.setName(userFromDb.getName());
        userDTO.setPreferredLanguage(userFromDb.getPreferredLanguage());
        userDTO.setCurrentPassword("");
        userDTO.setNewPassword("");
        userDTO.setConfirmNewPassword("");

        // 모델 객체에 담아 뷰로 전달
        model.addAttribute("userDTO", userDTO);
        // 마이페이지 화면으로 이동
        return "user/mypage";
    }

    @PostMapping("/mypage")
    public String postMyPage(@ModelAttribute UserDTO userDTO, HttpSession session, Model model) {
        // 세션에서 로그인된 사용자 가져오기
        User loggedInUser = (User) session.getAttribute("user");

        // 로그인 안 한 경우
        if (loggedInUser == null) {
            // 로그인 페이지로 이동
            return "redirect:/login";
        }

        try {
            // 사용자 정보 수정 처리
            userService.updateUserInfo(loggedInUser.getUserId(), userDTO);
            // 세션의 사용자 정보도 업데이트
            User updatedUser = userService.findByUserId(loggedInUser.getUserId());
            session.setAttribute("user", updatedUser);
            // 성공 메시지 추가
            model.addAttribute("success", "정보가 성공적으로 수정되었습니다.");
            // 마이페이지로 돌아가기
            return "user/mypage";
        } catch (UserNotFoundException e) {
            model.addAttribute("error", e.getMessage());
            // 입력값 유지
            model.addAttribute("userDTO", userDTO);
            // 다시 마이페이지로 돌아가기
            return "user/mypage";
        } catch (InvalidCredentialsException e) {
            model.addAttribute("error", e.getMessage());
            // 입력값 유지
            model.addAttribute("userDTO", userDTO);
            // 다시 마이페이지로 돌아가기
            return "user/mypage";
        } catch (Exception e) {
            model.addAttribute("error", "정보 수정 중 오류가 발생했습니다: " + e.getMessage());
            // 입력값 유지
            model.addAttribute("userDTO", userDTO);
            // 다시 마이페이지로 돌아가기
            return "user/mypage";
        }
    }

    @PostMapping("/delete_account")
    public String postDeleteAccount(HttpSession session, Model model) {
        // 로그인한 사용자 정보를 세션에서 가져오기
        User loggedInUser = (User) session.getAttribute("user");
        // 로그인한 사용자가 있으면
        if (loggedInUser != null) {
            // 회원탈퇴 처리
            userService.deleteAccount(loggedInUser.getUserId());
            // 탈퇴 후 세션 비활성화
            session.invalidate();
        }
        return "redirect:/";
    }
    */
}
