package realty.domain.repository;

import realty.domain.model.Post;
import realty.domain.model.User;
import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

/*
 * 수업명 : 가비아 2회차
 * 작성자 : 박윤성
 * 수정자 : 김관호
 * 작성일 : 25.09.03
 * 파일명 : PostRepository.java
 */

public interface PostRepository extends JpaRepository<Post, Long>, JpaSpecificationExecutor<Post> {
    Optional<Post> findByPostCode(String postCode);

    /**
     * 
     * @param userCode
     * @return
     */
    long countByAuthorUserCode(String userCode);
    List<Post> findByAuthorUserCode(String userCode);
    List<Post> findByAuthor(User user);
    List<Post> findByPostCodeIn(List<String> postCodes);
}