package realty.domain.repository;

import realty.domain.model.LoginHistory;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Sort;
/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.07.30
 * 파일명 : LoginHistoryRepository.java
 */

public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {
    /**
     * 유저 코드를 기준으로 정렬된 로그인 기록 목록을 가져옴
     */
    List<LoginHistory> findByUserCode(String userCode, Sort sort);
}
