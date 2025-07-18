// users 테이블 관련 비즈니스 로직을 처리하는 UserService를 구현
package realty.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import realty.domain.dto.UserDTO;
import realty.domain.model.RolePermission;
import realty.domain.model.User;
import realty.domain.repository.UserRepository;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.07.18
 * 파일명 : UserService.java
 */

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    /**
     * 사용자 ID로 조회
     * @param userId 사용자 ID
     * @return 사용자 정보
     */
    public User findByUserId(String userId) {
        return userRepository.findByUserId(userId);
    }
    
    /**
     * 사용자 등록
     * @param user User 객체
     */
    public void registerUser(UserDTO userDTO) {
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
        // 사용자 고유 코드 생성
        generateUserCode(savedUser);
        System.out.println("회원가입 성공!");
    }

    /**
     * 사용자 고유 코드 생성
     */
    public void generateUserCode(User user) {
        if (user.getUserCode() != null && user.getUserSeq() != null) {
            user.setUserCode("U" + String.format("%08d", user.getUserSeq()));
            System.out.println("유저 코드 생성 완료");
        }
    }
}