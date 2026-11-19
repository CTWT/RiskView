package realty.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.jpa.domain.Specification;
import realty.domain.dto.BoardDTOs.PostSearchCondition;
import realty.domain.model.Post;
import realty.domain.model.Post.BoardType;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/*
 * 수업명 : 가비아 2회차
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.09.03
 * 파일명 : PostSpecifications.java
 */

public class PostSpecifications {

    private static final Logger log = LoggerFactory.getLogger(PostSpecifications.class);

    public static Specification<Post> withCondition(PostSearchCondition condition) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            log.info("Building specification for condition: {}", condition);

            // 1. 게시판 타입 필터링
            if (condition.getBoard() != null && !condition.getBoard().trim().isEmpty()) {
                try {
                    BoardType boardType = BoardType.valueOf(condition.getBoard().toUpperCase());
                    predicates.add(criteriaBuilder.equal(root.get("boardType"), boardType));
                    log.debug("Applying board filter: {}", boardType);
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid board type provided: '{}'. Ignoring filter.", condition.getBoard());
                }
            } else {
                log.debug("No board filter applied.");
            }

            // 2. 검색어 필터링
            if (condition.getSearchQuery() != null && !condition.getSearchQuery().trim().isEmpty()) {
                String pattern = "%" + condition.getSearchQuery().toLowerCase() + "%";
                String category = condition.getSearchCategory();

                if ("제목".equalsIgnoreCase(category)) {
                    predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), pattern));
                    log.debug("  - Predicate: title LIKE '{}'", pattern);
                } else if ("내용".equalsIgnoreCase(category)) {
                    predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("content")), pattern));
                    log.debug("  - Predicate: content LIKE '{}'", pattern);
                } else if ("작성자".equalsIgnoreCase(category)) {
                    predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("author").get("userNickname")), pattern));
                    log.debug("  - Predicate: author.userNickname LIKE '{}'", pattern);
                } else { // 기본: 제목+내용
                    predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("content")), pattern)
                    ));
                    log.debug("  - Predicate: title LIKE '{}' OR content LIKE '{}'", pattern, pattern);
                }
            } else {
                log.debug("No search query filter applied.");
            }

            // 3. 기간 필터링
            if (condition.getPeriod() != null && !condition.getPeriod().equals("전체 기간")) {
                LocalDateTime startDate = null;
                LocalDateTime now = LocalDateTime.now();
                log.debug("Applying period filter: {}", condition.getPeriod());
                switch (condition.getPeriod()) {
                    case "1주일": startDate = now.minusWeeks(1); break;
                    case "1개월": startDate = now.minusMonths(1); break;
                    case "3개월": startDate = now.minusMonths(3); break;
                    default:
                        log.warn("Unknown period value: '{}'. Ignoring filter.", condition.getPeriod());
                        break;
                }
                if (startDate != null) {
                    predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), startDate));
                    log.debug("  - Predicate: createdAt >= '{}'", startDate);
                }
            } else {
                log.debug("No period filter applied (전체 기간).");
            }

            log.info("Constructed {} predicates for the query.", predicates.size());
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}