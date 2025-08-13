package realty.domain.repository;

import realty.domain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 박윤성
 * 작성일 : 25.07.18
 * 파일명 : UserRepository.java
 */

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    /**
     * 데이터베이스에서 사용자 ID로 조회하는 메서드
     * @param userId 사용자 ID
     */
    User findByUserId(String userId);

    /**
     * 데이터베이스에서 이름과 이메일로 조회하는 메서드
     * @param name
     * @param email
     * @return
     */
    User findByNameAndEmail(String name, String email);

    /**
     * 데이터베이스에서 사용자 ID와 이메일로 조회하는 메서드
     * @param userId
     * @param email
     * @return
     */
    User findByUserIdAndEmail(String userId, String email);

    /**
     * 데이터베이스에서 사용자 ID 중복 여부 확인하는 메서드
     * @param userId 사용자 ID
     * @return 중복 여부
     */
    boolean existsByUserId(String userId);

    /**
     * 데이터베이스에서 이메일 중복 여부 확인하는 메서드
     * @param email 이메일
     * @return 중복 여부
     */
    boolean existsByEmail(String email);

    /**
     * 데이터베이스에서 닉네임 중복 여부 확인하는 메서드
     * @param nickname 닉네임
     * @return 중복 여부
     */
    boolean existsByUserNickname(String nickname);
}
