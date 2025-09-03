package realty.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import realty.domain.model.CommunityComment;

/*
 * 수업명 : 가비아 2회차
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.09.03
 * 파일명 : CommunityCommentRepository.java
 */

public interface CommunityCommentRepository extends JpaRepository<CommunityComment, Long> {
}