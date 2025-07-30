package realty.controller;

import realty.domain.dto.LoginHistoryDTO;
import realty.domain.dto.UserDTO;
import realty.domain.model.User;
import realty.service.LoginHistoryService;
import realty.service.UserService;
import realty.exception.AccountDeletedException;
import realty.exception.EmailNotVerifiedException;
import realty.exception.InvalidCredentialsException;
import realty.exception.UserNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 박윤성
 * 작성일 : 25.07.18
 * 파일명 : UserController.java
 */

@Controller
public class UserController {
    
    @Autowired
    private UserService userService;

    @Autowired
    private LoginHistoryService loginHistoryService;
    
    /**
     * 홈 화면으로 이동
     * @return index.html
     */
    @GetMapping({"/", "/index"})
    public String getIndex() {
        // 홈 화면으로 이동
        return "index";
    }

    /**
     * 로그인 화면으로 이동
     * @return login.html
     */
    @GetMapping("/login")
    public String getLogin(Model model) {
        model.addAttribute("userDTO", new UserDTO());
        return "user/login";
    }

    /**
     * 로그인 처리
     * @param userDTO
     * @param session
     * @param request
     * @param model
     * @return index.html
     */
    @PostMapping("/login")
    public String postLogin(@ModelAttribute UserDTO userDTO, HttpSession session, HttpServletRequest request, Model model) {
        try {
            // 로그인 처리
            User user = userService.userLogin(userDTO, request);

            // 로그인 성공하면
            session.setAttribute("user", user); // 세션에 사용자 정보 저장
            session.setMaxInactiveInterval(60); // 1분
            System.out.println("로그인 성공");

            // 방금 데이터베이스에 저장한 로그인 기록과 이전에 데이터베이스에 저장된 로그인 기록까지 모두 가져옴
            List<LoginHistoryDTO> loginHistoryList = loginHistoryService.findByUserCode(user.getUserCode());
            // 로그인 이력을 세션에 저장
            session.setAttribute("loginHistoryList", loginHistoryList);
            // 로그인 성공 화면으로 이동
            return "index";
        } catch (UserNotFoundException e) {
            // 에러 메시지를 모델에 추가
            model.addAttribute("error", e.getMessage());
            // 입력값 유지를 위해 UserDTO를 다시 모델에 추가
            model.addAttribute("userDTO", userDTO);
            // 로그인 화면으로 이동
            return "user/login";
        } catch (InvalidCredentialsException e) {
            // 아이디 또는 비밀번호가 올바르지 않음
            model.addAttribute("error", e.getMessage());
            // 입력값 유지를 위해 UserDTO를 다시 모델에 추가
            model.addAttribute("userDTO", userDTO);
            // 로그인 화면으로 이동
            return "user/login";
        } catch (AccountDeletedException e) {
            // 탈퇴한 사용자
            model.addAttribute("error", e.getMessage());
            model.addAttribute("userDTO", userDTO);
            // 로그인 화면으로 이동
            return "user/login";
        } catch (Exception e) {
            // 서버 오류
            model.addAttribute("error", e.getMessage());
            model.addAttribute("userDTO", userDTO);
            // 로그인 화면으로 이동
            return "user/login";
        }
    }

    /**
     * 로그아웃 처리
     * @param session
     * @return index.html
     */
    @PostMapping("/logout")
    public String postLogout(HttpSession session) {
        // 세션 인증 비활성화
        session.invalidate();
        System.out.println("로그아웃 성공!");
        // 로그아웃 후 홈 화면으로 이동
        return "index";
    }

    /**
     * 회원가입 화면으로 이동
     * @param model
     * @return register.html
     */
    @GetMapping("/register")
    public String getRegister(Model model) {
        // 회원가입 화면에 입력한 정보를 담을 UserDTO 객체를 모델에 추가
        model.addAttribute("userDTO", new UserDTO());
        return "user/register";
    }

    /**
     * 회원등록 처리
     * @param userDTO
     * @param model
     * @param request
     * @return index.html
     */
    @PostMapping("/register")
    public String postRegister(@ModelAttribute UserDTO userDTO, Model model, HttpServletRequest request) {
        try {
            // 유저가 입력한 정보가 담겨있는 UserDTO 객체를 사용해 회원처리 처리
            userService.registerUser(userDTO, request);
            // 사용자 정보, 성공 여부와 메시지를 모델에 추가
            model.addAttribute("userDTO", userDTO);
            model.addAttribute("success", "회원가입 성공!");
            // 회원가입 성공 후 홈 화면으로 이동
            return "index";
        } catch (Exception e) {
            // 실패 여부와 메시지를 모델에 추가
            model.addAttribute("error", "회원가입 실패: " + e.getMessage());
            // 회원가입 실패 시 다시 회원가입 화면으로 이동
            return "user/register";
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
            if (!userDTO.getResetPassword().equals(userDTO.getConfirmResetPassword())) {
                model.addAttribute("error", "비밀번호가 일치하지 않습니다.");
                model.addAttribute("userDTO", userDTO);
                return "user/reset_pass";
            }
            // 비밀번호 재설정 처리
            userService.resetPass((String) session.getAttribute("reset_pass_user_id"), userDTO.getResetPassword());
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
}
