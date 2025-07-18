package realty.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;

import jakarta.servlet.http.HttpSession;
import realty.domain.dto.UserDTO;
import realty.domain.model.User;
import realty.service.UserService;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.07.18
 * 파일명 : UserController.java
 */

@Controller
public class UserController {
    
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    
    @Autowired
    private UserService userService;
    
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
        return "login";
    }

    /**
     * 로그인 처리
     * @param userDTO
     * @param session
     * @return index.html
     */
    @PostMapping("/login")
    public String postLogin(@ModelAttribute UserDTO userDTO, HttpSession session) {
        // userId로 유저 객체 찾아옴
        User user = userService.findByUserId(userDTO.getUserId());

        // 찾아오지 못할 경우
        if (user == null) {
            System.out.println("사용자 ID를 찾을 수 없습니다: " + userDTO.getUserId());
            // 로그인 실패 시 에러 메시지와 함께 로그인 화면으로 리다이렉트
            return "redirect:/login?error=true";
        }

        // 비밀번호가 일치하지 않을 경우
        if (!passwordEncoder.matches(userDTO.getPassword(), user.getPassword())) {
            System.out.println("비밀번호가 일치하지 않습니다");
            // 로그인 실패 시 에러 메시지와 함께 로그인 화면으로 리다이렉트
            return "redirect:/login?error=true";
        }

        // 로그인 성공하면
        session.setAttribute("user", user); // 세션에 사용자 정보 저장
        session.setMaxInactiveInterval(60); // 1분
        System.out.println("로그인 성공");
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
        return "register";
    }

    /**
     * 회원등록 처리
     * @param userDTO
     * @param model
     * @return index.html
     */
    @PostMapping("/register")
    public String postRegister(@ModelAttribute UserDTO userDTO, Model model) {
        try {
            // 유저가 입력한 정보가 담겨있는 UserDTO 객체를 사용해 회원처리 처리
            userService.registerUser(userDTO);
            // 사용자 정보, 성공 여부와 메시지를 모델에 추가
            model.addAttribute("userDTO", userDTO);
            model.addAttribute("success", "회원가입 성공!");
            // 회원가입 성공 후 홈 화면으로 이동
            return "index";
        } catch (Exception e) {
            // 실패 여부와 메시지를 모델에 추가
            model.addAttribute("error", "회원가입 실패: " + e.getMessage());
            // 회원가입 실패 시 다시 회원가입 화면으로 이동
            return "register";
        }
    }
}
