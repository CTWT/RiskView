package realty.domain.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import realty.domain.model.PostLike;

/*
 * 수업명 : 가비아 2회차
 * 작성자 : 박윤성
 * 수정자 : 박윤성
 * 작성일 : 25.09.03
 * 수정일 : 25.09.21
 * 파일명 : PostLikeRepository.java
 */

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    boolean existsByPostCodeAndUserCode(String postCode, String userCode);
    void deleteByPostCodeAndUserCode(String postCode, String userCode);
    long countByPostCode(String postCode);
    List<PostLike> findByPostCode(String postCode);
    long countByUserCode(String userCode);
    List<PostLike> findByUserCode(String userCode);
}