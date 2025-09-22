package realty.domain.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import realty.domain.model.CommunityComment;
import realty.domain.model.Post;
import realty.domain.model.User;

/*
 * 수업명 : 가비아 2회차
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.09.03
 * 파일명 : CommunityCommentRepository.java
 */

public interface CommunityCommentRepository extends JpaRepository<CommunityComment, Long> {
    List<CommunityComment> findByPost(Post post);
    Optional<CommunityComment> findByCommentCode(String commentCode);

    long countByAuthorUserCode(String userCode);
    List<CommunityComment> findByAuthorUserCode(String userCode);
    long countByPostId(Long postId);
    List<CommunityComment> findByAuthor(User user);
}