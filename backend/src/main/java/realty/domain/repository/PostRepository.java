package realty.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import realty.domain.model.Post;

/*
 * 수업명 : 가비아 2회차
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.09.03
 * 파일명 : PostRepository.java
 */

public interface PostRepository extends JpaRepository<Post, Long>, JpaSpecificationExecutor<Post> {
}