package realty.controller;

import realty.domain.dto.UserDTO;
import realty.domain.model.User;
import realty.service.UserService;
import realty.support.JwtUtil;
import realty.exception.AccountDeletedException;
import realty.exception.EmailNotVerifiedException;
import realty.exception.InvalidCredentialsException;
import realty.exception.UserNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.Map;
import java.util.HashMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.ui.Model;


/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 박윤성
 * 작성일 : 25.07.18
 * 파일명 : UserController.java
 */

@RestController
public class UserController {
    
    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * 로그인 처리
     * @param userDTO
     * @param session
     * @param request
     * @param model
     * @return 응답 객체
     */
    @PostMapping("/api/user/login")
    public ResponseEntity<Map<String, Object>> postLogin(@RequestBody UserDTO userDTO, HttpSession session, HttpServletRequest request, Model model) {
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
            System.out.println(e.getMessage());
            // 구체적 메시지와 함께 실패 응답 반환
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (Exception e) {
            // 프론트에 전달할 응답 정보 담음
            response.put("success", false);
            response.put("message", "로그인 실패: " + e.getMessage());
            System.out.println(e.getMessage());
            // 일반적인 오류 메시지와 함께 실패 응답 반환
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 회원등록 처리
     * @param userDTO
     * @param model
     * @param request
     * @return 응답 객체
     */
    @PostMapping("/api/user/signup")
    public ResponseEntity<Map<String, Object>> postRegister(@RequestBody UserDTO userDTO, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            // 유저가 입력한 정보가 담겨있는 UserDTO 객체를 사용해 회원가입 처리
            userService.registerUser(userDTO, request);
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
            System.out.println("회원가입 실패: " + e.getMessage());
            // 구체적 메시지와 함께 실패 응답 반환
            return ResponseEntity.badRequest().body(response);
        } catch (RuntimeException e) {
            // 프론트에 전달할 응답 정보 담음
            response.put("success", false);
            response.put("message", "회원가입 실패: " + e.getMessage());
            System.out.println("회원가입 실패: " + e.getMessage());
            // 구체적 메시지와 함께 실패 응답 반환
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            // 프론트에 전달할 응답 정보 담음
            response.put("success", false);
            response.put("message", "회원가입 실패: " + e.getMessage());
            System.out.println("회원가입 실패: " + e.getMessage());
            // 구체적 메시지와 함께 실패 응답 반환
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 마이페이지 화면으로 이동
     * @param session
     * @param model
     * @return
     */
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

    /**
     * 마이페이지 정보 수정 처리
     * @param userDTO
     * @param session
     * @param model
     * @return
     */
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

    /**
     * 회원탈퇴 처리
     * @param session
     * @param model
     * @return index.html
     */
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

    /**
     * 아이디 찾기 화면으로 이동
     * @param model
     * @return forgot_id.html
     */
    @GetMapping("/forgot_id")
    public String getForgotId(Model model) {
        model.addAttribute("userDTO", new UserDTO());
        return "user/forgot_id";
    }

    /**
     * 아이디 찾기 처리
     * @param userDTO
     * @param model
     * @return forgot_id.html
     */
    @PostMapping("/forgot_id")
    public String postForgotId(@ModelAttribute UserDTO userDTO, Model model) {
        try {
            // 아이디 찾기 처리
            String foundId = userService.findUserId(userDTO);
            // 성공 여부와 메시지를 모델에 추가
            model.addAttribute("success", "아이디 찾기 성공!");
            model.addAttribute("foundId", foundId);
        // 아이디를 찾지 못했을 경우
        } catch (UserNotFoundException e) {
            // 에러 메시지를 모델에 추가
            model.addAttribute("error", e.getMessage());
            // 입력값 유지를 위해 UserDTO를 다시 모델에 추가
            model.addAttribute("userDTO", userDTO);
            // 아이디 찾기 화면으로 이동
            return "user/forgot_id";
        // 그 외 예상치 못한 예외 처리
        } catch (Exception e) {
            // 일반적인 오류 메시지를 모델에 추가
            model.addAttribute("error", "아이디 찾기 실패: " + e.getMessage());
            // 입력값 유지를 위해 UserDTO를 다시 모델에 추가
            model.addAttribute("userDTO", userDTO);
            // 아이디 찾기 화면으로 이동
            return "user/forgot_id";
        }

        // 입력값 유지
        model.addAttribute("userDTO", userDTO);
        // 아이디를 찾지 못했을 경우 아이디 찾기 화면으로 이동
        return "user/forgot_id";
    }

    /**
     * 비밀번호 찾기 화면으로 이동
     * @param model
     * @return forgot_pass.html
     */
    @GetMapping("/forgot_pass")
    public String getForgotPass(Model model) {
        model.addAttribute("userDTO", new UserDTO());
        return "user/forgot_pass";
    }

    /**
     * 비밀번호 찾기 처리
     * @param userDTO
     * @param request
     * @param model
     * @return pass_reset.html
     */
    @PostMapping("/forgot_pass")
    public String postForgotPass(@ModelAttribute UserDTO userDTO, HttpServletRequest request, Model model) {
        try {
            // 비밀번호 찾기를 위한 본인 인증 수행
            User foundUser = userService.authToFindPassword(userDTO, request);
            // 찾은 사용자 정보에서 사용자 ID를 꺼내 세션에 저장
            request.getSession().setAttribute("reset_pass_user_id", foundUser.getUserId());
            // 비밀번호 재설정 페이지로 리다이렉트
            return "redirect:/reset_pass";
        } catch (UserNotFoundException e) {
            // 에러 메시지를 모델에 추가
            model.addAttribute("error", e.getMessage());
            // 입력값 유지를 위해 UserDTO를 다시 모델에 추가
            model.addAttribute("userDTO", userDTO);
            // 비밀번호 찾기 화면으로 이동
            return "user/forgot_pass";
        } catch (AccountDeletedException e) {
            // 에러 메시지를 모델에 추가
            model.addAttribute("error", e.getMessage());
            // 입력값 유지를 위해 UserDTO를 다시 모델에 추가
            model.addAttribute("userDTO", userDTO);
            // 비밀번호 찾기 화면으로 이동
            return "user/forgot_pass";
        } catch (InvalidCredentialsException e) {
            // 에러 메시지를 모델에 추가
            model.addAttribute("error", e.getMessage());
            // 입력값 유지를 위해 UserDTO를 다시 모델에 추가
            model.addAttribute("userDTO", userDTO);
            // 비밀번호 찾기 화면으로 이동
            return "user/forgot_pass";
        // 이메일 인증되지 않은 예외 처리
        } catch (EmailNotVerifiedException e) {
            // 에러 메시지를 모델에 추가
            model.addAttribute("error", e.getMessage());
            // 입력값 유지를 위해 UserDTO를 다시 모델에 추가
            model.addAttribute("userDTO", userDTO);
            // 비밀번호 찾기 화면으로 이동
            return "user/forgot_pass";
        // 그 외 예상치 못한 예외 처리
        } catch (RuntimeException e) {
            // 일반적인 오류 메시지를 모델에 추가
            model.addAttribute("error", "비밀번호 찾기 실패: " + e.getMessage());
            // 입력값 유지를 위해 UserDTO를 다시 모델에 추가
            model.addAttribute("userDTO", userDTO);
            // 비밀번호 찾기 화면으로 이동
            return "user/forgot_pass";
        } catch (Exception e) {
            // 일반적인 오류 메시지를 모델에 추가
            model.addAttribute("error", "비밀번호 찾기 실패: " + e.getMessage());
            // 입력값 유지를 위해 UserDTO를 다시 모델에 추가
            model.addAttribute("userDTO", userDTO);
            // 비밀번호 찾기 화면으로 이동
            return "user/forgot_pass";
        }
    }

    /**
     * 비밀번호 재설정 화면으로 이동
     * @param model
     * @param request
     * @param session
     * @return reset_pass.html
     */
    @GetMapping("/reset_pass")
    public String getResetPass(Model model, HttpServletRequest request, HttpSession session) {
        // 세션에서 사용자 ID가 없으면
        if (session.getAttribute("reset_pass_user_id") == null) {
            // 다시 비밀번호 찾기 화면으로 이동
            return "redirect:/forgot_pass";
        }
        UserDTO userDTO = new UserDTO();
        // 사용자 ID 정보를 UserDTO 객체에 담음
        userDTO.setUserId((String) request.getSession().getAttribute("reset_pass_user_id"));
        // 비밀번호 재설정 화면에 입력한 정보를 담을 UserDTO 객체를 모델에 추가
        model.addAttribute("userDTO", userDTO);
        // 비밀번호 재설정 화면으로 이동
        return "user/reset_pass";
    }

    /**
     * 비밀번호 재설정 처리
     * @param userDTO
     * @param model
     * @param request
     * @param session
     * @return index.html
     */
    @PostMapping("/reset_pass")
    public String postResetPass(@ModelAttribute UserDTO userDTO, Model model, HttpServletRequest request, HttpSession session) {
        try {
            // 세션에서 사용자 ID가 없으면
            if (session.getAttribute("reset_pass_user_id") == null) {
                throw new RuntimeException("올바르지 않은 접근입니다.");
            }
            // 비밀번호와 비밀번호 확인 입력이 일치하지 않으면
            if (!userDTO.getNewPassword().equals(userDTO.getConfirmNewPassword())) {
                model.addAttribute("error", "비밀번호가 일치하지 않습니다.");
                model.addAttribute("userDTO", userDTO);
                return "user/reset_pass";
            }
            // 비밀번호 재설정 처리
            userService.resetPassword((String) session.getAttribute("reset_pass_user_id"), userDTO.getNewPassword());
            // 세션에서 사용자 ID 제거
            session.removeAttribute("reset_pass_user_id");
            // 성공 메시지를 모델에 추가
            model.addAttribute("success", "비밀번호 재설정이 완료되었습니다. 다시 로그인해주세요.");
            // 비밀번호 재설정 성공 후 로그인 화면으로 이동
            return "user/login";
        // 해당 사용자를 못 찾았을 경우
        } catch (UserNotFoundException e) {
            // 에러 메시지를 모델에 추가
            model.addAttribute("error", e.getMessage());
        // 그 외 예상치 못한 예외 처리
        } catch (RuntimeException e) {
            // 일반적인 오류 메시지를 모델에 추가
            model.addAttribute("error", "비밀번호 재설정 실패: " + e.getMessage());
            e.printStackTrace();
        }
        // 입력값 유지
        model.addAttribute("userDTO", userDTO);
        // 비밀번호 재설정 화면으로 이동
        return "user/reset_pass";
    }

    /**
     * 이메일 중복 확인
     * @param email 확인할 이메일 주소
     * @return 사용 가능 여부와 메시지
     */
    @GetMapping("/api/user/check-email/{email}")
    public ResponseEntity<Map<String, Object>> checkEmail(@PathVariable String email) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 이메일 형식 검증
            if (email == null || email.trim().isEmpty()) {
                response.put("available", false);
                response.put("message", "이메일을 입력해주세요.");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 이메일 형식 정규식 검증
            String emailRegex = "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$";
            if (!email.matches(emailRegex)) {
                response.put("available", false);
                response.put("message", "유효한 이메일 형식이 아닙니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 중복 확인
            boolean exists = userService.isEmailDuplicated(email);
            
            // 중복이면
            if (exists) {
                response.put("available", false);
                response.put("message", "이미 사용 중인 이메일 주소입니다.");
            } else {
                response.put("available", true);
                response.put("message", "사용 가능한 이메일 주소입니다.");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("available", false);
            response.put("message", "이메일 확인 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 아이디 중복 확인
     * @param username 확인할 아이디
     * @return 사용 가능 여부와 메시지
     */
    @GetMapping("/api/user/check-userid/{userId}")
    public ResponseEntity<Map<String, Object>> checkUsername(@PathVariable String userId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 아이디가 없거나 공백이면
            if (userId == null || userId.trim().isEmpty()) {
                response.put("available", false);
                response.put("message", "아이디를 입력해주세요.");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 중복 확인
            boolean exists = userService.isUserIdDuplicated(userId);
            
            // 중복이면
            if (exists) {
                response.put("available", false);
                response.put("message", "이미 사용 중인 아이디입니다.");
            } else {
                response.put("available", true);
                response.put("message", "사용 가능한 아이디입니다.");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("available", false);
            response.put("message", "아이디 확인 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 닉네임 중복 확인
     * @param nickname 확인할 닉네임
     * @return 사용 가능 여부와 메시지
     */
    @GetMapping("/api/user/check-nickname/{nickname}")
    public ResponseEntity<Map<String, Object>> checkNickname(@PathVariable String nickname) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 닉네임이 없거나 공백이면
            if (nickname == null || nickname.trim().isEmpty()) {
                response.put("available", false);
                response.put("message", "닉네임을 입력해주세요.");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 중복 확인
            boolean exists = userService.isNicknameDuplicated(nickname);
            
            // 중복이면
            if (exists) {
                response.put("available", false);
                response.put("message", "이미 사용 중인 닉네임입니다.");
            } else {
                response.put("available", true);
                response.put("message", "사용 가능한 닉네임입니다.");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("available", false);
            response.put("message", "닉네임 확인 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
}
