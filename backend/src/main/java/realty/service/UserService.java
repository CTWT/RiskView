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
import org.springframework.beans.factory.annotation.Value;

import java.util.HashMap;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Date;
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
 * 수정일 : 25.09.25
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

    @Value("${app.encryption.secret-key}")
    private String secretKey;

    @Value("${app.encryption.iv}")
    private String iv;

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
        logger.info("로그인 시도 시작. userId: {}", userDTO.getUserId());
        // userId로 유저 객체 찾아옴
        User user = findByUserId(userDTO.getUserId());

        // 찾아오지 못할 경우
        if (user == null) {
            logger.warn("로그인 실패: 사용자를 찾을 수 없음. userId: {}", userDTO.getUserId());
            throw new UserNotFoundException("존재하지 않는 아이디입니다.");
        }

        // 탈퇴한 사용자인 경우
        if (user.getIsDeleted() == 1) {
            logger.warn("로그인 실패: 탈퇴한 계정. userId: {}", user.getUserId());
            throw new AccountDeletedException("탈퇴한 사용자입니다.");
        }

        // 비밀번호가 일치하지 않을 경우
        if (!passwordEncoder.matches(userDTO.getPassword(), user.getPassword())) {
            logger.warn("로그인 실패: 비밀번호 불일치. userId: {}", user.getUserId());
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
        logger.info("로그인 성공. 로그인 기록 저장. userId: {}", user.getUserId());
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
        logger.info("신규 회원가입 처리 시작. userId: {}", userDTO.getUserId());
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
            logger.info("사용자 코드 생성 완료: {}", savedUser.getUserCode());
        } else {
            logger.error("userSeq 생성 실패. userSeq가 null입니다.", new RuntimeException("userSeq is null"));
            throw new RuntimeException("userSeq가 null입니다");
        }

        // 업데이트된 User 객체를 데이터베이스에 반영
        userRepository.save(savedUser);
        logger.info("회원가입 성공. userId: {}", savedUser.getUserId());
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
        logger.info("사용자 정보 수정 시작. userId: {}", userId);
        // 데이터베이스에서 사용자 ID로 해당되는 사용자 정보 찾아옴
        User user = userRepository.findByUserId(userId);
        
        // 사용자를 찾을 수 없으면
        if (user == null) {
            logger.warn("사용자 정보 수정 실패: 사용자를 찾을 수 없음. userId: {}", userId);
            throw new UserNotFoundException("사용자를 찾을 수 없습니다.");
        }

        // 새 비밀번호를 입력한 상태라면
        if (userDTO.getNewPassword() != null && !userDTO.getNewPassword().trim().isEmpty()) {
            logger.debug("비밀번호 변경 시도. userId: {}", userId);
            // 현재 비밀번호를 입력하지 않으면
            if (userDTO.getCurrentPassword() == null || userDTO.getCurrentPassword().trim().isEmpty()) {
                logger.warn("비밀번호 변경 실패: 현재 비밀번호가 입력되지 않음. userId: {}", userId);
                throw new InvalidCredentialsException("현재 비밀번호를 입력해주세요.");
            }
            // 현재 비밀번호가 일치하지 않으면
            if (!passwordEncoder.matches(userDTO.getCurrentPassword(), user.getPassword())) {
                logger.warn("비밀번호 변경 실패: 현재 비밀번호 불일치. userId: {}", userId);
                throw new InvalidCredentialsException("현재 비밀번호가 일치하지 않습니다.");
            }

            // 새 비밀번호와 비밀번호 확인이 일치하지 않으면
            if (!userDTO.getNewPassword().equals(userDTO.getConfirmNewPassword())) {
                logger.warn("비밀번호 변경 실패: 새 비밀번호와 확인이 일치하지 않음. userId: {}", userId);
                throw new InvalidCredentialsException("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
            }

            // 새 비밀번호 저장
            user.setPassword(passwordEncoder.encode(userDTO.getNewPassword()));
            logger.debug("비밀번호 변경 성공. userId: {}", userId);
        }
        // 이름이 입력된 상태라면
        if (userDTO.getName() != null && !userDTO.getName().trim().isEmpty()) {
            // 이름 저장
            user.setName(userDTO.getName().trim());
            logger.debug("이름 변경. userId: {}", userId);
        }
        // 닉네임이 입력된 상태라면
        if (userDTO.getUserNickname() != null && !userDTO.getUserNickname().trim().isEmpty()) {
            // 닉네임 저장
            user.setUserNickname(userDTO.getUserNickname().trim());
            logger.debug("닉네임 변경. userId: {}", userId);
        }
        // 이메일이 입력된 상태라면
        if (userDTO.getEmail() != null && !userDTO.getEmail().trim().isEmpty()) {
            // 이메일 저장
            user.setEmail(userDTO.getEmail().trim());
            logger.debug("이메일 변경. userId: {}", userId);
        }
        // 언어가 입력된 상태라면
        if (userDTO.getPreferredLanguage() != null && !userDTO.getPreferredLanguage().trim().isEmpty()) {
            // 언어 저장
            user.setPreferredLanguage(userDTO.getPreferredLanguage());
            logger.debug("선호 언어 변경. userId: {}", userId);
        }

        // 데이터베이스에 변경사항 저장
        userRepository.save(user);
        logger.info("사용자 정보 수정 성공. userId: {}", userId);
    }

    /**
     * 회원 탈퇴 처리
     * @param userId 사용자 ID
     * @param password 현재 비밀번호
     */
    @Transactional
    public void deleteAccount(String userId) {
        logger.info("회원 탈퇴 처리 시작. userId: {}", userId);
        // 사용자 ID로 데이터베이스에서 사용자 찾기
        User user = userRepository.findByUserId(userId);
        if (user == null) {
            throw new UserNotFoundException("사용자를 찾을 수 없습니다.");
        }
        // 회원탈퇴처리 (is_deleted = 1)
        user.setIsDeleted(1);
        userRepository.save(user);
        logger.info("회원 탈퇴 처리 완료 (is_deleted=1). userId: {}", userId);
    }

    /**
     * 사용자 ID 찾기
     * @param userDTO
     * @return 찾아낸 사용자 ID
     * @throws UserNotFoundException 사용자 ID를 찾을 수 없을 때
     * @throws AccountDeletedException 탈퇴한 사용자인 경우
     */
    public String findUserId(UserDTO userDTO) {
        logger.info("아이디 찾기 시작. name: {}, email: {}", userDTO.getName(), userDTO.getEmail());
        // 이름과 이메일로 유저 찾아옴
        User foundUser = findByNameAndEmail(userDTO.getName(), userDTO.getEmail());

        // 유저 정보를 찾지 못하면
        if (foundUser == null) {
            logger.warn("아이디 찾기 실패: 사용자를 찾을 수 없음. name: {}, email: {}", userDTO.getName(), userDTO.getEmail());
            throw new UserNotFoundException("입력하신 정보와 일치하는 사용자를 찾을 수 없습니다.");
        }
        
        // 탈퇴한 사용자인 경우
        if (foundUser.getIsDeleted() == 1) {
            logger.warn("아이디 찾기 실패: 탈퇴한 계정. userId: {}", foundUser.getUserId());
            throw new AccountDeletedException("탈퇴한 사용자입니다.");
        }

        // 찾은 유저의 아이디 반환
        logger.info("아이디 찾기 성공. userId: {} for name: {}, email: {}", foundUser.getUserId(), userDTO.getName(), userDTO.getEmail());
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
        logger.info("비밀번호 찾기 인증 시작. userId: {}, email: {}", userDTO.getUserId(), userDTO.getEmail());
        // 입력받은 사용자 ID와 이메일로 유저 찾아옴
        User foundUser = findByUserIdAndEmail(userDTO.getUserId(), userDTO.getEmail());

        // 일치하는 사용자를 찾을 수 없는 경우
        if (foundUser == null) {
            logger.warn("비밀번호 찾기 인증 실패: 사용자를 찾을 수 없음. userId: {}, email: {}", userDTO.getUserId(), userDTO.getEmail());
            throw new UserNotFoundException("입력하신 정보와 일치하는 사용자를 찾을 수 없습니다.");
        }

        logger.info("비밀번호 찾기 인증 성공. userId: {}", foundUser.getUserId());
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
        logger.info("비밀번호 재설정 시작. userId: {}", userId);
        // 데이터베이스에서 사용자 ID로 사용자 찾아옴
        User user = userRepository.findByUserId(userId);
        
        // 사용자를 찾을 수 없으면
        if (user == null) {
            logger.warn("비밀번호 재설정 실패: 사용자를 찾을 수 없음. userId: {}", userId);
            throw new UserNotFoundException("사용자를 찾을 수 없습니다.");
        }
        
        // 사용자 비밀번호 업데이트
        user.setPassword(passwordEncoder.encode(newPassword));
        logger.debug("새 비밀번호 암호화 및 설정 완료. userId: {}", userId);
        
        // 데이터베이스에 반영
        userRepository.save(user);
        logger.info("비밀번호 재설정 성공. userId: {}", userId);
    }

    /**
     * 사용자 ID로 조회
     * @param userId 사용자 ID
     * @return 사용자 정보
     */
    public User findByUserId(String userId) {
        logger.trace("사용자 조회 (by userId: {})", userId);
        return userRepository.findByUserId(userId);
    }

    /**
     * 사용자 이름과 이메일로 조회
     * @param name 사용자 이름
     * @param email 사용자 이메일
     * @return 사용자 정보
     */
    public User findByNameAndEmail(String name, String email) {
        logger.trace("사용자 조회 (by name: {}, email: {})", name, email);
        return userRepository.findByNameAndEmail(name, email);
    }

    /**
     * 사용자 ID와 이메일로 조회
     * @param userId 사용자 ID
     * @param email 사용자 이메일
     * @return 사용자 정보
     */
    public User findByUserIdAndEmail(String userId, String email) {
        logger.trace("사용자 조회 (by userId: {}, email: {})", userId, email);
        return userRepository.findByUserIdAndEmail(userId, email);
    }

    /**
     * 사용자 ID 중복 여부 확인
     * @param userId 사용자 ID
     * @return 중복 여부
     */
    public boolean isUserIdDuplicated(String userId) {
        logger.debug("아이디 중복 확인. userId: {}", userId);
        return userRepository.existsByUserId(userId);
    }

    /**
     * 이메일 중복 여부 확인
     * @param email 이메일
     * @return 중복 여부
     */
    public boolean isEmailDuplicated(String email) {
        logger.debug("이메일 중복 확인. email: {}", email);
        return userRepository.existsByEmail(email);
    }

    /**
     * 닉네임 중복 여부 확인
     * @param nickname 닉네임
     * @return 중복 여부
     */
    public boolean isNicknameDuplicated(String nickname) {
        logger.debug("닉네임 중복 확인. nickname: {}", nickname);
        return userRepository.existsByUserNickname(nickname);
    }

    public Map<String, Object> getCurrentUserResponse(HttpServletRequest request){
        logger.debug("현재 사용자 정보 응답 생성 시작");
        Map<String, Object> response = new HashMap<>();
        
        User user = getCurrentUser(request);

        // 사용자를 찾을 수 없으면
        if (user == null) {
            logger.warn("현재 사용자 정보를 찾을 수 없어 응답을 생성할 수 없습니다.");
            response.put("success", false);
            response.put("message", "사용자를 찾을 수 없습니다.");
            return response;
        }

        // 응답에 사용자 정보 담기
        response.put("success", true);
        response.put("user", Map.of(
            "userCode", user.getUserCode(),
            "userId", user.getUserId(),
            "userNickname", user.getUserNickname(),
            "email", user.getEmail(),
            "name", user.getName(),
            "preferredLanguage", user.getPreferredLanguage(),
            "createdAt", user.getCreatedAt()
        ));

        // 토큰에서 만료 시간을 읽어와 남은 시간을 계산
        try {
            Claims claims = jwtUtil.getClaims(jwtUtil.extractTokenFromCookies(request, "accessToken"));
            if (claims != null) {
                long expirationTimestamp = claims.getExpiration().getTime();
                response.put("sessionExpiresAt", expirationTimestamp);
            }
        } catch (Exception e) {
            logger.warn("세션 남은 시간 계산 중 오류 발생: {}", e.getMessage());
        }

        logger.debug("현재 사용자 정보 응답 생성 완료. userId: {}", user.getUserId());
        return response;
    }

    public User getCurrentUser(HttpServletRequest request) {
        logger.debug("요청에서 현재 사용자 정보 조회 시작");
        // 쿠키에서 accessToken 추출
        String accessToken = jwtUtil.extractTokenFromCookies(request, "accessToken");
        
        // accessToken이 없으면F
        if (accessToken == null || accessToken.isEmpty()) {
            logger.warn("현재 사용자를 조회할 수 없음: accessToken이 쿠키에 없습니다.");
            throw new UserNotFoundException("사용자를 찾을 수 없습니다.");
        }

        // accessToken에서 Claims 추출
        Claims claims = jwtUtil.getClaims(accessToken);
        // Claims가 유효하지 않으면
        if (claims == null) {
            logger.warn("현재 사용자를 조회할 수 없음: accessToken의 claims가 유효하지 않습니다.");
            throw new UserNotFoundException("사용자를 찾을 수 없습니다.");
        }

        // Claims에서 userId 추출
        String userId = claims.get("userId", String.class);
        if (userId == null) {
            logger.warn("현재 사용자를 조회할 수 없음: claims에 userId가 없습니다.");
            throw new UserNotFoundException("사용자를 찾을 수 없습니다.");
        }

        logger.debug("현재 시간: {}", new Date());
        return findByUserId(userId);
    }
    
    public String getCurrentUserId(HttpServletRequest request){
        logger.debug("현재 사용자 ID 조회");
        User user = getCurrentUser(request);
        return user.getUserId();
    }

    public String getCurrentUserCode(HttpServletRequest request) {
        logger.debug("현재 사용자 코드 조회");
        User user = getCurrentUser(request);
        return user.getUserCode();
    }

    /**
     * 마이페이지에 필요한 사용자 정보를 DTO로 변환하여 반환
     * @param userId
     * @return
     */
    public UserDTO getUserInfoForMyPage(String userId) {
        logger.debug("마이페이지용 사용자 정보 조회 시작. userId: {}", userId);
        User user = findByUserId(userId);
        if (user == null) {
            throw new UserNotFoundException("사용자를 찾을 수 없습니다.");
        }

        UserDTO userDTO = new UserDTO();
        userDTO.setUserId(user.getUserId());
        userDTO.setUserNickname(user.getUserNickname());
        userDTO.setEmail(user.getEmail());
        userDTO.setName(user.getName());
        userDTO.setPreferredLanguage(user.getPreferredLanguage());
        userDTO.setCreatedAt(user.getCreatedAt());
        // 비밀번호 관련 필드는 null 또는 빈 값으로 설정

        logger.debug("마이페이지용 사용자 정보 조회 성공. userId: {}", userId);
        return userDTO;
    }

    /**
     * 현재 비밀번호 일치 여부 확인
     * @param userId 사용자 ID
     * @param currentPassword 사용자가 입력한 현재 비밀번호
     * @return 일치하면 true, 아니면 false
     */
    public boolean verifyCurrentPassword(String userId, String currentPassword) {
        logger.debug("현재 비밀번호 확인 시작. userId: {}", userId);
        User user = findByUserId(userId);
        if (user == null) {
            throw new UserNotFoundException("사용자를 찾을 수 없습니다.");
        }
        if (currentPassword == null || currentPassword.trim().isEmpty()) {
            throw new InvalidCredentialsException("현재 비밀번호를 입력해주세요.");
        }
        boolean isMatch = passwordEncoder.matches(currentPassword, user.getPassword());
        logger.debug("비밀번호 일치 여부 확인 결과: {}. userId: {}", isMatch, userId);
        return isMatch;
    }

    /**
     * 주민등록번호와 같은 민감 정보를 AES-256으로 암호화
     * @param plainText 암호화할 평문
     * @return Base64로 인코딩된 암호문
     */
    public String encrypt(String plainText) {
        if (plainText == null || plainText.trim().isEmpty()) {
            return null;
        }
        try {
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "AES");
            IvParameterSpec ivSpec = new IvParameterSpec(iv.getBytes(StandardCharsets.UTF_8));

            logger.info("secretKey length (chars): {}", secretKey.length());
            logger.info("secretKey length (bytes): {}", secretKey.getBytes(StandardCharsets.UTF_8).length);

            logger.info("iv length (chars): {}", iv.length());
            logger.info("iv length (bytes): {}", iv.getBytes(StandardCharsets.UTF_8).length);

            cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec);
            byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            logger.error("데이터 암호화 중 오류 발생", e);
            throw new RuntimeException("데이터 암호화에 실패했습니다.", e);
        }
    }

    /**
     * AES-256으로 암호화된 데이터를 복호화
     * @param encryptedText Base64로 인코딩된 암호문
     * @return 복호화된 평문
     */
    public String decrypt(String encryptedText) {
        if (encryptedText == null || encryptedText.trim().isEmpty()) {
            return null;
        }
        try {
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "AES");
            IvParameterSpec ivSpec = new IvParameterSpec(iv.getBytes(StandardCharsets.UTF_8));
            cipher.init(Cipher.DECRYPT_MODE, keySpec, ivSpec);
            byte[] decodedBytes = Base64.getDecoder().decode(encryptedText);
            byte[] decrypted = cipher.doFinal(decodedBytes);
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            logger.error("데이터 복호화 중 오류 발생", e);
            // 복호화 실패 시, 원본 암호화된 텍스트를 반환하거나, 정책에 따라 null 또는 빈 문자열을 반환할 수 있습니다.
            return encryptedText; // 혹은 null
        }
    }
}
