// users 테이블 관련 비즈니스 로직을 처리하는 UserService를 구현
package realty.service;

import realty.domain.dto.UserDTO;
import realty.domain.model.RolePermission;
import realty.domain.model.User;
import realty.domain.repository.UserRepository;
import realty.exception.AccountDeletedException;
import realty.exception.InvalidCredentialsException;
import realty.exception.UserNotFoundException;
import realty.exception.EmailNotVerifiedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 박윤성
 * 작성일 : 25.07.18
 * 파일명 : UserService.java
 */

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private LoginHistoryService loginHistoryService;

    /**
     * 로그인 처리
     * @param userDTO
     * @param request
     * @return 로그인 성공 시 User 객체
     * @throws UserNotFoundException 사용자 ID를 찾을 수 없을 때
     * @throws AccountDeletedException 탈퇴한 사용자인 경우
     * @throws InvalidCredentialsException 비밀번호가 일치하지 않을 때
     */
    public User userLogin(UserDTO userDTO, HttpServletRequest request) {
        // userId로 유저 객체 찾아옴
        User user = findByUserId(userDTO.getUserId());

        // 찾아오지 못할 경우
        if (user == null) {
            throw new UserNotFoundException("존재하지 않는 아이디입니다.");
        }

        // 탈퇴한 사용자인 경우
        if (user.getIsDeleted() == 1) {
            throw new AccountDeletedException("탈퇴한 사용자입니다.");
        }

        // 비밀번호가 일치하지 않을 경우
        if (!passwordEncoder.matches(userDTO.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("아이디 혹은 비밀번호가 일치하지 않습니다.");
        }

        // 모든 검증 통과 후 로그인 기록 남기기
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }

        // IP가 여러 개인 경우 첫 번째 추출
        if (ipAddress.contains(",")) {
            ipAddress = ipAddress.split(",")[0].trim();
        }

        // IPv6 로컬호스트 → IPv4 로 변환
        if ("0:0:0:0:0:0:0:1".equals(ipAddress) || "::1".equals(ipAddress)) {
            ipAddress = "127.0.0.1";
        }

        String userAgent = request.getHeader("User-Agent");
        loginHistoryService.saveLoginHistory(user, ipAddress, userAgent);
        
        return user;
    }
    
    /**
     * 사용자 등록
     * @param userDTO UserDTO 객체
     * @param request HttpServletRequest 객체
     * @throws EmailNotVerifiedException 이메일 인증이 완료되지 않았을 때
     * @throws RuntimeException userSeq가 null일 때
     */
    @Transactional
    public void registerUser(UserDTO userDTO, HttpServletRequest request) {

        /**
         * 이메일 인증 여부 확인
         * 세션에서 이메일 인증 여부 가져옴
         * UserDTO 객체에서 사용자 이메일 가져옴
         */
        Boolean isEmailVerified = (Boolean) request.getSession().getAttribute("email_verified_" + userDTO.getEmail());
        // 이메일 인증 여부를 확인할 수 없거나 안 받았으면
        if (isEmailVerified == null || !isEmailVerified) {
            throw new EmailNotVerifiedException("이메일 인증이 완료되지 않았습니다.");
        }

        // UserDTO 객체에 담겨 있는 회원가입 시 입력 정보를 User 객체에 다시 옮겨 담음
        User user = new User();
        user.setUserId(userDTO.getUserId());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword())); // 비밀번호 해싱
        user.setName(userDTO.getName());
        user.setUserNickname(userDTO.getUserNickname());
        user.setEmail(userDTO.getEmail());
        user.setPreferredLanguage(userDTO.getPreferredLanguage());

        // 기본 역할 설정
        RolePermission role = new RolePermission();
        role.setRole("user");
        user.setRole(role);
        // User 객체 저장
        User savedUser = userRepository.save(user);
        // userSeq가 null이 아니면
        if (savedUser.getUserSeq() != null) {
            // UserCode설정: "U" + 8자리 숫자로 포맷된 userSeq
            savedUser.setUserCode("U" + String.format("%08d", savedUser.getUserSeq()));
            System.out.println("유저 코드 생성 완료");
        } else {
            throw new RuntimeException("userSeq가 null입니다");
        }

        // 업데이트된 User 객체를 데이터베이스에 반영
        userRepository.save(savedUser);
        System.out.println("회원가입 성공!");
    }

    /**
     * 사용자 정보 수정
     * @param userId 사용자 ID
     * @param userDTO 사용자 정보
     * @throws UserNotFoundException 사용자를 찾을 수 없을 때
     * @throws InvalidCredentialsException 비밀번호가 일치하지 않을 때
     */
    @Transactional
    public void updateUserInfo(String userId, UserDTO userDTO) {
        // 데이터베이스에서 사용자 ID로 해당되는 사용자 정보 찾아옴
        User user = userRepository.findByUserId(userId);
        
        // 사용자를 찾을 수 없으면
        if (user == null) {
            throw new UserNotFoundException("사용자를 찾을 수 없습니다.");
        }

        // 새 비밀번호를 입력한 상태라면
        if (userDTO.getNewPassword() != null && !userDTO.getNewPassword().trim().isEmpty()) {
            // 현재 비밀번호를 입력하지 않으면
            if (userDTO.getCurrentPassword() == null || userDTO.getCurrentPassword().trim().isEmpty()) {
                throw new InvalidCredentialsException("현재 비밀번호를 입력해주세요.");
            }
            // 현재 비밀번호가 일치하지 않으면
            if (!passwordEncoder.matches(userDTO.getCurrentPassword(), user.getPassword())) {
                throw new InvalidCredentialsException("현재 비밀번호가 일치하지 않습니다.");
            }

            // 새 비밀번호와 비밀번호 확인이 일치하지 않으면
            if (!userDTO.getNewPassword().equals(userDTO.getConfirmNewPassword())) {
                throw new InvalidCredentialsException("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
            }

            // 새 비밀번호 저장
            user.setPassword(passwordEncoder.encode(userDTO.getNewPassword()));
        }
        // 이름이 입력된 상태라면
        if (userDTO.getName() != null && !userDTO.getName().trim().isEmpty()) {
            // 이름 저장
            user.setName(userDTO.getName().trim());
        }
        // 닉네임이 입력된 상태라면
        if (userDTO.getUserNickname() != null && !userDTO.getUserNickname().trim().isEmpty()) {
            // 닉네임 저장
            user.setUserNickname(userDTO.getUserNickname().trim());
        }
        // 이메일이 입력된 상태라면
        if (userDTO.getEmail() != null && !userDTO.getEmail().trim().isEmpty()) {
            // 이메일 저장
            user.setEmail(userDTO.getEmail().trim());
        }
        // 언어가 입력된 상태라면
        if (userDTO.getPreferredLanguage() != null && !userDTO.getPreferredLanguage().trim().isEmpty()) {
            // 언어 저장
            user.setPreferredLanguage(userDTO.getPreferredLanguage());
        }

        // 데이터베이스에 변경사항 저장
        userRepository.save(user);
    }

    /**
     * 회원탈퇴
     * @param userId 사용자 ID
     */
    public void deleteAccount(String userId) {
        // 사용자 ID로 데이터베이스에서 사용자 찾기
        User user = userRepository.findByUserId(userId);
        // 사용자를 찾았으면
        if (user != null) {
            // 회원탈퇴처리
            user.setIsDeleted(1);
            // 데이터베이스에 반영
            userRepository.save(user);
        // 사용자를 찾을 수 없으면
        } else {
            System.out.println("사용자를 찾을 수 없습니다");
        }
    }

    /**
     * 사용자 ID 찾기
     * @param userDTO
     * @return 찾아낸 사용자 ID
     * @throws UserNotFoundException 사용자 ID를 찾을 수 없을 때
     * @throws AccountDeletedException 탈퇴한 사용자인 경우
     */
    public String findUserId(UserDTO userDTO) {
        // 이름과 이메일로 유저 찾아옴
        User foundUser = findByNameAndEmail(userDTO.getName(), userDTO.getEmail());

        // 유저 정보를 찾지 못하면
        if (foundUser == null) {
            throw new UserNotFoundException("입력하신 정보와 일치하는 사용자를 찾을 수 없습니다.");
        }
        
        // 탈퇴한 사용자인 경우
        if (foundUser.getIsDeleted() == 1) {
            throw new AccountDeletedException("탈퇴한 사용자입니다.");
        }

        // 찾은 유저의 아이디 반환
        return foundUser.getUserId();
    }

    /**
     * 비밀번호 찾기
     * @param userDTO
     * @param request
     * @throws UserNotFoundException 사용자 ID를 찾을 수 없을 때
     * @throws EmailNotVerifiedException 이메일 인증이 완료되지 않았을 때
     */
    public User authToFindPassword(UserDTO userDTO, HttpServletRequest request) {
        // 입력받은 사용자 ID와 이메일로 유저 찾아옴
        User foundUser = findByUserIdAndEmail(userDTO.getUserId(), userDTO.getEmail());

        // 일치하는 사용자를 찾을 수 없는 경우
        if (foundUser == null) {
            throw new UserNotFoundException("입력하신 정보와 일치하는 사용자를 찾을 수 없습니다.");
        }

        // EmailService의 verifyEmailCode 메서드에서 성공 시 "email_verified_" 속성을 세션에 저장
        Boolean isEmailVerified = (Boolean) request.getSession().getAttribute("email_verified_" + userDTO.getEmail());

        // 이메일 인증 여부를 확인할 수 없거나 인증을 받지 않았으면 오류 처리
        if (isEmailVerified == null || !isEmailVerified) {
            throw new EmailNotVerifiedException("이메일 인증을 완료해야 비밀번호를 재설정할 수 있습니다.");
        }

        // 인증 성공 후 이메일 인증 세션 플래그 제거
        request.getSession().removeAttribute("email_verified_" + userDTO.getEmail());
        // 찾아낸 사용자 객체 반환
        return foundUser;
    }

    /**
     * 패스워드 재설정
     * @param userId 사용자 ID
     * @param newPassword 재설정할 비밀번호
     * @throws UserNotFoundException 사용자 ID를 찾을 수 없을 때
     */
    @Transactional
    public void resetPassword(String userId, String newPassword) {

        // 데이터베이스에서 사용자 ID로 사용자 찾아옴
        User user = userRepository.findByUserId(userId);
        
        // 사용자를 찾을 수 없으면
        if (user == null) {
            throw new UserNotFoundException("사용자를 찾을 수 없습니다.");
        }
        
        // 사용자 비밀번호 업데이트
        user.setPassword(passwordEncoder.encode(newPassword));
        
        // 데이터베이스에 반영
        userRepository.save(user);
    }

    /**
     * 사용자 ID로 조회
     * @param userId 사용자 ID
     * @return 사용자 정보
     */
    public User findByUserId(String userId) {
        return userRepository.findByUserId(userId);
    }

    /**
     * 사용자 이름과 이메일로 조회
     * @param name 사용자 이름
     * @param email 사용자 이메일
     * @return 사용자 정보
     */
    public User findByNameAndEmail(String name, String email) {
        return userRepository.findByNameAndEmail(name, email);
    }

    /**
     * 사용자 ID와 이메일로 조회
     * @param userId 사용자 ID
     * @param email 사용자 이메일
     * @return 사용자 정보
     */
    public User findByUserIdAndEmail(String userId, String email) {
        return userRepository.findByUserIdAndEmail(userId, email);
    }

    /**
     * 사용자 ID 중복 여부 확인
     * @param userId 사용자 ID
     * @return 중복 여부
     */
    public boolean isUserIdDuplicated(String userId) {
        return userRepository.existsByUserId(userId);
    }

    /**
     * 이메일 중복 여부 확인
     * @param email 이메일
     * @return 중복 여부
     */
    public boolean isEmailDuplicated(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * 닉네임 중복 여부 확인
     * @param nickname 닉네임
     * @return 중복 여부
     */
    public boolean isNicknameDuplicated(String nickname) {
        return userRepository.existsByUserNickname(nickname);
    }
}