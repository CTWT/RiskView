package realty.controller;

import realty.service.NewsArticlesService;
import realty.service.NewsArticlesService.NewsArticlesPage;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 박윤성
 * 작성일 : 25.07.28
 * 파일명 : NewsArticlesController.java
 */
@RequestMapping("/api/board/news_articles")
@RestController
public class NewsArticlesController {
    
    @Autowired
    private NewsArticlesService newsArticlesService;

    /**
     * 뉴스 기사 목록 호출 메서드
     * @param pageNum 페이지 번호(기본값: 1)
     * @param size 한 페이지당 보여줄 항목 수(기본값: 6)
     * @return 부동산 뉴스 페이지
     */
    @GetMapping(value = "", produces = "application/json; charset=UTF-8")
    public ResponseEntity<Map<String, Object>> getNewsArticles(
        @RequestParam(name = "pageNum", defaultValue = "1") int pageNum,
        @RequestParam(name = "size", defaultValue = "6") int size) {
        // 뉴스 페이지 정보 불러오기
        NewsArticlesPage articlesData = newsArticlesService.getNewsPages(pageNum, size);
        
        // 응답 데이터 구성
        Map<String, Object> response = new HashMap<>();
        response.put("content", articlesData.getNewsList());  // 기사 목록
        response.put("totalPages", articlesData.getTotalPages());  // 전체 페이지 수
        response.put("totalElements", articlesData.getTotalItems());  // 전체 항목 수
        response.put("number", articlesData.getCurrentPage());  // 현재 페이지 (0부터 시작)
        response.put("size", articlesData.getPageSize());  // 페이지당 항목 수

        // 프론트엔드 페이지네이션에 필요한 추가 정보도 함께 전달
        response.put("startPage", articlesData.getStartPage()); // 페이지 블록 시작 페이지
        response.put("endPage", articlesData.getEndPage()); // 페이지 블록 끝 페이지
        response.put("hasPrevBlock", articlesData.isHasPrevBlock()); // 이전 블록 존재 여부
        response.put("hasNextBlock", articlesData.isHasNextBlock()); // 다음 블록 존재 여부
        response.put("prevBlockStartPage", articlesData.getPrevBlockStartPage()); // 이전 블록의 시작 페이지
        response.put("nextBlockStartPage", articlesData.getNextBlockStartPage()); // 다음 블록의 시작 페이지

        return ResponseEntity.ok(response);
    }
}