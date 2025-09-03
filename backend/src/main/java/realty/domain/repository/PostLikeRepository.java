package realty.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import realty.domain.model.Post;
import realty.domain.model.PostLike;
import realty.domain.model.User;

/*
 * 수업명 : 가비아 2회차
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.09.03
 * 파일명 : PostLikeRepository.java
 */

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    boolean existsByPostAndUser(Post post, User user);
    void deleteByPostAndUser(Post post, User user);
    long countByPost(Post post);
}