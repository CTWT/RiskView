// users 테이블 관련 비즈니스 로직을 처리하는 UserService를 구현
package realty.service;

import realty.domain.dto.UserDTO;
import realty.domain.model.RolePermission;
import realty.domain.model.User;
import realty.domain.repository.UserRepository;
import realty.exception.AccountDeletedException;
import realty.exception.InvalidCredentialsException;
import realty.exception.UserNotFoundException;
import realty.support.JwtUtil;
import realty.exception.EmailNotVerifiedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;

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

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private LoginHistoryService loginHistoryService;

    @Autowired
    private JwtUtil jwtUtil;

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
        logger.info("Attempting login for userId: {}", userDTO.getUserId());
        // userId로 유저 객체 찾아옴
        User user = findByUserId(userDTO.getUserId());

        // 찾아오지 못할 경우
        if (user == null) {
            logger.warn("Login failed: User not found for userId: {}", userDTO.getUserId());
            throw new UserNotFoundException("존재하지 않는 아이디입니다.");
        }

        // 탈퇴한 사용자인 경우
        if (user.getIsDeleted() == 1) {
            logger.warn("Login failed: Account is deleted for userId: {}", user.getUserId());
            throw new AccountDeletedException("탈퇴한 사용자입니다.");
        }

        // 비밀번호가 일치하지 않을 경우
        if (!passwordEncoder.matches(userDTO.getPassword(), user.getPassword())) {
            logger.warn("Login failed: Invalid credentials for userId: {}", user.getUserId());
            throw new InvalidCredentialsException("아이디 혹은 비밀번호가 일치하지 않습니다.");
        }
        logger.info("Login credentials validated for userId: {}", user.getUserId());

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
        logger.debug("Client IP Address: {}", ipAddress);
        // 유저 에이전트 정보 가져오기
        String userAgent = request.getHeader("User-Agent");
        logger.debug("User-Agent: {}", userAgent);
        // 로그인 기록 남기기
        logger.info("Login successful for userId: {}. Saving login history.", user.getUserId());
        loginHistoryService.saveLoginHistory(user, ipAddress, userAgent);
        
        return user;
    }
    
    /**
     * 회원등록 처리
     * @param userDTO UserDTO 객체
     * @param request HttpServletRequest 객체
     * @throws EmailNotVerifiedException 이메일 인증이 완료되지 않았을 때
     * @throws RuntimeException userSeq가 null일 때
     */
    @Transactional
    public void signUpUser(UserDTO userDTO) {
        logger.info("Attempting to sign up new user with userId: {}", userDTO.getUserId());
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
        logger.debug("User entity saved initially with userSeq: {}", savedUser.getUserSeq());
        // userSeq가 null이 아니면
        if (savedUser.getUserSeq() != null) {
            // UserCode설정: "U" + 8자리 숫자로 포맷된 userSeq
            savedUser.setUserCode("U" + String.format("%08d", savedUser.getUserSeq()));
            logger.info("User code generated: {}", savedUser.getUserCode());
        } else {
            logger.error("Failed to generate userSeq after saving user.", new RuntimeException("userSeq is null"));
            throw new RuntimeException("userSeq가 null입니다");
        }

        // 업데이트된 User 객체를 데이터베이스에 반영
        userRepository.save(savedUser);
        logger.info("User signup successful for userId: {}", savedUser.getUserId());
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
        logger.info("Attempting to update user info for userId: {}", userId);
        // 데이터베이스에서 사용자 ID로 해당되는 사용자 정보 찾아옴
        User user = userRepository.findByUserId(userId);
        
        // 사용자를 찾을 수 없으면
        if (user == null) {
            logger.warn("User info update failed: User not found for userId: {}", userId);
            throw new UserNotFoundException("사용자를 찾을 수 없습니다.");
        }

        // 새 비밀번호를 입력한 상태라면
        if (userDTO.getNewPassword() != null && !userDTO.getNewPassword().trim().isEmpty()) {
            logger.debug("Attempting to update password for userId: {}", userId);
            // 현재 비밀번호를 입력하지 않으면
            if (userDTO.getCurrentPassword() == null || userDTO.getCurrentPassword().trim().isEmpty()) {
                logger.warn("Password update failed for {}: current password not provided.", userId);
                throw new InvalidCredentialsException("현재 비밀번호를 입력해주세요.");
            }
            // 현재 비밀번호가 일치하지 않으면
            if (!passwordEncoder.matches(userDTO.getCurrentPassword(), user.getPassword())) {
                logger.warn("Password update failed for {}: current password does not match.", userId);
                throw new InvalidCredentialsException("현재 비밀번호가 일치하지 않습니다.");
            }

            // 새 비밀번호와 비밀번호 확인이 일치하지 않으면
            if (!userDTO.getNewPassword().equals(userDTO.getConfirmNewPassword())) {
                logger.warn("Password update failed for {}: new password and confirmation do not match.", userId);
                throw new InvalidCredentialsException("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
            }

            // 새 비밀번호 저장
            user.setPassword(passwordEncoder.encode(userDTO.getNewPassword()));
            logger.debug("Password updated successfully for userId: {}", userId);
        }
        // 이름이 입력된 상태라면
        if (userDTO.getName() != null && !userDTO.getName().trim().isEmpty()) {
            // 이름 저장
            user.setName(userDTO.getName().trim());
            logger.debug("Updating name for userId: {}", userId);
        }
        // 닉네임이 입력된 상태라면
        if (userDTO.getUserNickname() != null && !userDTO.getUserNickname().trim().isEmpty()) {
            // 닉네임 저장
            user.setUserNickname(userDTO.getUserNickname().trim());
            logger.debug("Updating nickname for userId: {}", userId);
        }
        // 이메일이 입력된 상태라면
        if (userDTO.getEmail() != null && !userDTO.getEmail().trim().isEmpty()) {
            // 이메일 저장
            user.setEmail(userDTO.getEmail().trim());
            logger.debug("Updating email for userId: {}", userId);
        }
        // 언어가 입력된 상태라면
        if (userDTO.getPreferredLanguage() != null && !userDTO.getPreferredLanguage().trim().isEmpty()) {
            // 언어 저장
            user.setPreferredLanguage(userDTO.getPreferredLanguage());
            logger.debug("Updating preferred language for userId: {}", userId);
        }

        // 데이터베이스에 변경사항 저장
        userRepository.save(user);
        logger.info("User info updated successfully for userId: {}", userId);
    }

    /* 추후 개발 시 참고 예정
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
    */

    /**
     * 사용자 ID 찾기
     * @param userDTO
     * @return 찾아낸 사용자 ID
     * @throws UserNotFoundException 사용자 ID를 찾을 수 없을 때
     * @throws AccountDeletedException 탈퇴한 사용자인 경우
     */
    public String findUserId(UserDTO userDTO) {
        logger.info("Attempting to find userId for name: {} and email: {}", userDTO.getName(), userDTO.getEmail());
        // 이름과 이메일로 유저 찾아옴
        User foundUser = findByNameAndEmail(userDTO.getName(), userDTO.getEmail());

        // 유저 정보를 찾지 못하면
        if (foundUser == null) {
            logger.warn("Find userId failed: User not found for name: {} and email: {}", userDTO.getName(), userDTO.getEmail());
            throw new UserNotFoundException("입력하신 정보와 일치하는 사용자를 찾을 수 없습니다.");
        }
        
        // 탈퇴한 사용자인 경우
        if (foundUser.getIsDeleted() == 1) {
            logger.warn("Find userId failed: Account is deleted for user: {}", foundUser.getUserId());
            throw new AccountDeletedException("탈퇴한 사용자입니다.");
        }

        // 찾은 유저의 아이디 반환
        logger.info("Found userId: {} for name: {} and email: {}", foundUser.getUserId(), userDTO.getName(), userDTO.getEmail());
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
        logger.info("Attempting to authenticate for password find for userId: {} and email: {}", userDTO.getUserId(), userDTO.getEmail());
        // 입력받은 사용자 ID와 이메일로 유저 찾아옴
        User foundUser = findByUserIdAndEmail(userDTO.getUserId(), userDTO.getEmail());

        // 일치하는 사용자를 찾을 수 없는 경우
        if (foundUser == null) {
            logger.warn("Password find auth failed: User not found for userId: {} and email: {}", userDTO.getUserId(), userDTO.getEmail());
            throw new UserNotFoundException("입력하신 정보와 일치하는 사용자를 찾을 수 없습니다.");
        }

        logger.info("Password find auth successful for userId: {}", foundUser.getUserId());
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
        logger.info("Attempting to reset password for userId: {}", userId);
        // 데이터베이스에서 사용자 ID로 사용자 찾아옴
        User user = userRepository.findByUserId(userId);
        
        // 사용자를 찾을 수 없으면
        if (user == null) {
            logger.warn("Password reset failed: User not found for userId: {}", userId);
            throw new UserNotFoundException("사용자를 찾을 수 없습니다.");
        }
        
        // 사용자 비밀번호 업데이트
        user.setPassword(passwordEncoder.encode(newPassword));
        logger.debug("Password for user {} has been encoded and set.", userId);
        
        // 데이터베이스에 반영
        userRepository.save(user);
        logger.info("Password reset successful for userId: {}", userId);
    }

    /**
     * 사용자 ID로 조회
     * @param userId 사용자 ID
     * @return 사용자 정보
     */
    public User findByUserId(String userId) {
        logger.debug("Finding user by userId: {}", userId);
        return userRepository.findByUserId(userId);
    }

    /**
     * 사용자 이름과 이메일로 조회
     * @param name 사용자 이름
     * @param email 사용자 이메일
     * @return 사용자 정보
     */
    public User findByNameAndEmail(String name, String email) {
        logger.debug("Finding user by name: {} and email: {}", name, email);
        return userRepository.findByNameAndEmail(name, email);
    }

    /**
     * 사용자 ID와 이메일로 조회
     * @param userId 사용자 ID
     * @param email 사용자 이메일
     * @return 사용자 정보
     */
    public User findByUserIdAndEmail(String userId, String email) {
        logger.debug("Finding user by userId: {} and email: {}", userId, email);
        return userRepository.findByUserIdAndEmail(userId, email);
    }

    /**
     * 사용자 ID 중복 여부 확인
     * @param userId 사용자 ID
     * @return 중복 여부
     */
    public boolean isUserIdDuplicated(String userId) {
        logger.debug("Checking for userId duplication: {}", userId);
        return userRepository.existsByUserId(userId);
    }

    /**
     * 이메일 중복 여부 확인
     * @param email 이메일
     * @return 중복 여부
     */
    public boolean isEmailDuplicated(String email) {
        logger.debug("Checking for email duplication: {}", email);
        return userRepository.existsByEmail(email);
    }

    /**
     * 닉네임 중복 여부 확인
     * @param nickname 닉네임
     * @return 중복 여부
     */
    public boolean isNicknameDuplicated(String nickname) {
        logger.debug("Checking for nickname duplication: {}", nickname);
        return userRepository.existsByUserNickname(nickname);
    }

    public Map<String, Object> getCurrentUserResponse(HttpServletRequest request){
        logger.debug("Getting current user response from request.");
        Map<String, Object> response = new HashMap<>();
        
        User user = getCurrentUser(request);

        // 사용자를 찾을 수 없으면
        if (user == null) {
            logger.warn("Could not find current user to build response.");
            response.put("success", false);
            response.put("message", "사용자를 찾을 수 없습니다.");
            return response;
        }

        // 응답에 사용자 정보 담기
        response.put("success", true);
        response.put("user", Map.of(
            "userId", user.getUserId(),
            "nickname", user.getUserNickname()
        ));

        logger.debug("Successfully built response for current user: {}", user.getUserId());
        return response;
    }

    public User getCurrentUser(HttpServletRequest request) {
        logger.debug("Getting current user from request.");
        // 쿠키에서 accessToken 추출
        String accessToken = jwtUtil.extractTokenFromCookies(request, "accessToken");
        
        // accessToken이 없으면F
        if (accessToken == null || accessToken.isEmpty()) {
            logger.warn("Cannot get current user: accessToken is missing or empty.");
            throw new UserNotFoundException("사용자를 찾을 수 없습니다.");
        }

        // accessToken에서 Claims 추출
        Claims claims = jwtUtil.getClaims(accessToken);
        // Claims가 유효하지 않으면
        if (claims == null) {
            logger.warn("Cannot get current user: claims from accessToken are invalid.");
            throw new UserNotFoundException("사용자를 찾을 수 없습니다.");
        }

        // Claims에서 userId 추출
        String userId = claims.get("userId", String.class);
        if (userId == null) {
            logger.warn("Cannot get current user: userId is null in claims.");
            throw new UserNotFoundException("사용자를 찾을 수 없습니다.");
        }

        logger.debug("Found current user: {}", userId);
        return findByUserId(userId);
    }
    
    public String getCurrentUserId(HttpServletRequest request){
        logger.debug("Getting current userId from request.");
        User user = getCurrentUser(request);
        return user.getUserId();
    }

    public String getCurrentUserCode(HttpServletRequest request) {
        logger.debug("Getting current userCode from request.");
        User user = getCurrentUser(request);
        return user.getUserCode();
    }
}