package realty.domain.repository;

import realty.domain.model.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 
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
}
