package realty.controller;

import realty.domain.dto.LoginHistoryDTO;
import realty.domain.dto.UserDTO;
import realty.domain.model.User;
import realty.service.LoginHistoryService;
import realty.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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
    private BCryptPasswordEncoder passwordEncoder;
    
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
    public String getLogin() {
        return "user/login";
    }

    /**
     * 로그인 처리
     * @param userDTO
     * @param session
     * @return index.html
     */
    @PostMapping("/login")
    public String postLogin(@ModelAttribute UserDTO userDTO, HttpSession session, HttpServletRequest request, Model model) {
        // userId로 유저 객체 찾아옴
        User user = userService.findByUserId(userDTO.getUserId());

        // 찾아오지 못할 경우
        if (user == null) {
            // 에러 메시지를 모델에 추가해서 폼에 전달
            model.addAttribute("error", "사용자 ID를 찾을 수 없습니다.");
            // 로그인 화면으로 이동
            return "user/login";
        }

        // 탈퇴한 사용자인 경우
        if (user.getIsDeleted() == 1) {
            // 에러 메시지를 모델에 추가해서 폼에 전달
            model.addAttribute("error", "탈퇴한 사용자입니다.");
            // 로그인 화면으로 이동
            return "user/login";
        }

        // 비밀번호가 일치하지 않을 경우
        if (!passwordEncoder.matches(userDTO.getPassword(), user.getPassword())) {
            // 에러 메시지를 모델에 추가해서 폼에 전달
            model.addAttribute("error", "비밀번호가 일치하지 않습니다.");
            // 로그인 화면으로 이동
            return "user/login";
        }

        // 로그인 성공하면
        session.setAttribute("user", user); // 세션에 사용자 정보 저장
        session.setMaxInactiveInterval(60); // 1분
        System.out.println("로그인 성공");

        // 로그인 기록 남기기
        String ipAddress = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        // 로그인 기록 저장
        loginHistoryService.saveLoginHistory(user, ipAddress, userAgent);
        // 방금 데이터베이스 저장한 로그인 기록과 이전에 데이터베이스에 저장된 로그인 기록까지 모두 가져옴
        List<LoginHistoryDTO> loginHistoryList = loginHistoryService.findByUserCode(user.getUserCode());
        // 로그인 이력을 세션에 저장
        session.setAttribute("loginHistoryList", loginHistoryList);
        // 로그인 성공 화면으로 이동
        return "index";
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
     * @param model
     */
    @PostMapping("/delete-account")
    public String postDeleteAccount(HttpSession session, Model model) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser != null) {
        userService.deleteAccount(loggedInUser.getUserId());
        session.invalidate(); // 탈퇴 후 세션 제거
        }
        return "redirect:/";
    }
}
