package realty.controller;

import realty.domain.dto.UserDTO;
import realty.domain.model.User;
import realty.service.UserService;
import realty.service.EmailService;
import realty.support.JwtUtil;
import realty.exception.AccountDeletedException;
import realty.exception.EmailNotVerifiedException;
import realty.exception.InvalidCredentialsException;
import realty.exception.UserNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.HashMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

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

    /**
     * 로그인 처리
     * @param userDTO 사용자 정보
     * @param request HTTP 요청 정보
     * @return 응답 객체
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> postLogin(@RequestBody UserDTO userDTO, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            // 로그인 처리
            User user = userService.userLogin(userDTO, request);

            // JWT 발급
            String accessToken = jwtUtil.generateAccessToken(user);

            // 프론트에 전달할 응답 정보 담음
            response.put("success", true);
            response.put("message", "로그인 성공!");
            response.put("token", accessToken);
            System.out.println("로그인 성공!");

            // 담았던 정보들과 함께 성공 응답 반환
            return ResponseEntity.ok(response);

        } catch (UserNotFoundException | AccountDeletedException | InvalidCredentialsException e) {
            // 프론트에 전달할 응답 정보 담음
            response.put("success", false);
            response.put("message", e.getMessage());
            e.printStackTrace();
            // 구체적 메시지와 함께 실패 응답 반환
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (Exception e) {
            // 프론트에 전달할 응답 정보 담음
            response.put("success", false);
            response.put("message", "로그인 실패: " + e.getMessage());
            e.printStackTrace();
            // 일반적인 오류 메시지와 함께 실패 응답 반환
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 회원등록 처리
     * @param userDTO 사용자 정보
     * @param request HTTP 요청 정보
     * @return 응답 객체
     */
    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> postSignUp(@RequestBody UserDTO userDTO, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            // 유저가 입력한 정보가 담겨있는 UserDTO 객체를 사용해 회원가입 처리
            userService.signUpUser(userDTO, request);
            // 프론트에 전달할 응답 정보 담음
            response.put("success", true);
            response.put("message", "회원가입 성공!");
            System.out.println("회원가입 성공!");
            // 성공 응답 반환
            return ResponseEntity.ok(response);
        } catch (EmailNotVerifiedException e) {
            // 프론트에 전달할 응답 정보 담음
            response.put("success", false);
            response.put("message", "회원가입 실패: " + e.getMessage());
            e.printStackTrace();
            // 구체적 메시지와 함께 실패 응답 반환
            return ResponseEntity.badRequest().body(response);
        } catch (RuntimeException e) {
            // 프론트에 전달할 응답 정보 담음
            response.put("success", false);
            response.put("message", "회원가입 실패: " + e.getMessage());
            e.printStackTrace();
            // 구체적 메시지와 함께 실패 응답 반환
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            // 프론트에 전달할 응답 정보 담음
            response.put("success", false);
            response.put("message", "회원가입 실패: " + e.getMessage());
            e.printStackTrace();
            // 구체적 메시지와 함께 실패 응답 반환
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 아이디 찾기 처리
     * @param userDTO
     * @return 응답 객체
     */
    @PostMapping("/forgot-id")
    public ResponseEntity<Map<String, Object>> postForgotId(@RequestBody UserDTO userDTO) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 아이디를 데이터베이스에서 조회해서 찾아옴
            User foundUser = userService.findByNameAndEmail(userDTO.getName(), userDTO.getEmail());
            // 찾은 사용자 ID를 응답 객체에 추가
            response.put("userId", foundUser.getUserId());
            // 찾은 사용자 ID와 함께 성공 응답 반환
            return ResponseEntity.ok(response);
        // 아이디를 찾지 못했을 경우
        } catch (UserNotFoundException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        // 그 외 예상치 못한 예외 처리
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * 비밀번호 찾기를 위한 이메일 인증코드 발송
     * @param userId 사용자 아이디
     * @param email 이메일 주소
     * @return 응답 객체
     */
    @PostMapping("/send-password-reset-code")
    public ResponseEntity<Map<String, Object>> sendPasswordResetCode(
            @RequestParam("userId") String userId,
            @RequestParam("email") String email) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 아이디가 입력되지 않았을 경우
            if (userId == null || userId.trim().isEmpty()) {
                response.put("message", "아이디를 입력해주세요.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            // 이메일이 입력되지 않았을 경우
            if (email == null || email.trim().isEmpty()) {
                response.put("message", "이메일을 입력해주세요.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // 아이디와 이메일이 모두 일치하는 사용자 확인
            User foundUser = null;
            try {
                foundUser = userService.findByUserIdAndEmail(userId.trim(), email.trim());
            } catch (UserNotFoundException e) {
                response.put("message", "입력하신 아이디와 이메일에 해당하는 계정을 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            } catch (AccountDeletedException e) {
                response.put("message", "삭제된 계정입니다.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // 사용자를 찾지 못했다면
            if (foundUser == null) {
                response.put("message", "입력하신 아이디와 이메일에 해당하는 계정을 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // 이메일 인증코드 발송
            String code = emailService.sendVerificationEmailCode(email.trim());

            // 이메일 인증용 JWT 발급
            String emailToken = jwtUtil.generateEmailVerificationToken(email.trim(), code);

            // 성공 응답
            response.put("message", email + "로 인증코드를 발송했습니다.");
            response.put("token", emailToken);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("message", "인증코드 발송 중 오류가 발생했습니다.");
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 비밀번호 재설정 처리
     * @param userDTO 사용자 정보
     * @param request HTTP 요청 정보
     * @return 응답 객체
     */
    @PostMapping("/reset-pass")
    public ResponseEntity<Map<String, Object>> postResetPass(@RequestBody UserDTO userDTO, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            // 비밀번호와 비밀번호 확인 입력이 일치하지 않으면
            if (!userDTO.getNewPassword().equals(userDTO.getConfirmNewPassword())) {
                // 실패 여부와 에러 메시지를 응답 객체에 추가
                response.put("success", false);
                response.put("message", "비밀번호가 일치하지 않습니다.");
                // 실패 응답 반환
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            // 비밀번호 재설정 처리
            userService.resetPassword(userDTO.getUserId(), userDTO.getNewPassword());
            // 프론트에 보낼 정보들을 담음
            response.put("success", true);
            response.put("message", "비밀번호 재설정이 완료되었습니다. 다시 로그인해주세요.");
            // 담았던 정보들과 함께 성공 응답 반환
            return ResponseEntity.ok(response);
        // 해당 사용자를 못 찾았을 경우
        } catch (UserNotFoundException e) {
            // 실패 여부와 에러 메시지를 응답 객체에 추가
            response.put("success", false);
            response.put("message", e.getMessage());
            e.printStackTrace();
            // 실패 응답 반환
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        // 그 외 예상치 못한 예외 처리
        } catch (RuntimeException e) {
            // 실패 여부와 에러 메시지를 응답 객체에 추가
            response.put("success", false);
            response.put("message", "비밀번호 재설정 실패: " + e.getMessage());
            e.printStackTrace();
            // 실패 응답 반환
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * 이메일 중복 확인
     * @param email 확인할 이메일 주소
     * @return 사용 가능 여부와 메시지
     */
    @GetMapping("/check-email/{email}")
    public ResponseEntity<Map<String, Object>> checkEmail(@PathVariable String email) {
        Map<String, Object> response = new HashMap<>();
        
        try {
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
            
        } catch (Exception e) {
            // 실패 여부와 메시지를 응답 객체에 추가
            response.put("available", false);
            response.put("message", "이메일 확인 중 오류가 발생했습니다.");
            e.printStackTrace();
            // 실패 응답 반환
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 아이디 중복 확인
     * @param username 확인할 아이디
     * @return 사용 가능 여부와 메시지
     */
    @GetMapping("/check-userid/{userId}")
    public ResponseEntity<Map<String, Object>> checkUsername(@PathVariable String userId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
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
            
        } catch (Exception e) {
            // 실패 여부와 메시지를 응답 객체에 추가
            response.put("available", false);
            response.put("message", "아이디 확인 중 오류가 발생했습니다.");
            e.printStackTrace();
            // 실패 응답 반환
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 닉네임 중복 확인
     * @param nickname 확인할 닉네임
     * @return 사용 가능 여부와 메시지
     */
    @GetMapping("/check-nickname/{nickname}")
    public ResponseEntity<Map<String, Object>> checkNickname(@PathVariable String nickname) {
        Map<String, Object> response = new HashMap<>();
        
        try {
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
            
        } catch (Exception e) {
            // 실패 여부와 메시지를 응답 객체에 추가
            response.put("available", false);
            response.put("message", "닉네임 확인 중 오류가 발생했습니다.");
            e.printStackTrace();
            // 실패 응답 반환
            return ResponseEntity.status(500).body(response);
        }
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
