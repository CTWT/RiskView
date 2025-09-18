package realty.controller;

import realty.service.NewsArticlesService;
import realty.service.NewsArticlesService.NewsArticlesPage;

import java.util.HashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
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
@Slf4j
@RequestMapping("/api/board/news_articles")
@RestController
public class NewsArticlesController {
    
    @Autowired
    private NewsArticlesService newsArticlesService;

    /**
     * 뉴스 기사 목록 호출 메서드
     * @param pageNum 페이지 번호(기본값: 1)
     * @param size 한 페이지당 보여줄 항목 수(기본값: 6)
     * @param source 뉴스 출처 (선택 사항)
     * @return 부동산 뉴스 페이지
     */
    @GetMapping(value = "", produces = "application/json; charset=UTF-8")
    public ResponseEntity<Map<String, Object>> getNewsArticles(
        @RequestParam(name = "pageNum", defaultValue = "1") int pageNum,
        @RequestParam(name = "size", defaultValue = "6") int size,
        @RequestParam(name = "source", required = false) String source) 
    {
        log.info("뉴스 기사 목록 요청 수신: pageNum={}, size={}, source={}", pageNum, size, source);
        // 뉴스 페이지 정보 불러오기 (source 파라미터 추가)
        NewsArticlesPage articlesData = newsArticlesService.getNewsPages(pageNum, size, source);
        
        log.info("뉴스 기사 목록 응답 생성: 총 {} 페이지, {}개 항목", articlesData.getTotalPages(), articlesData.getTotalItems());
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

    /**
     * 캐시된 워드클라우드 이미지를 반환하는 메서드
     * @return 워드클라우드 이미지 (image/png)
     */
    @GetMapping(value = "/keywords")
    public ResponseEntity<byte[]> getCachedNewsKeywords() {
        log.info("워드클라우드 키워드 요청 수신");
        byte[] imageBytes = newsArticlesService.getWordCloudImage();
        log.info("워드클라우드 이미지 응답 생성: {} bytes", imageBytes.length);

        // HTTP 응답 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG); // 이미지 타입 설정
        headers.setContentLength(imageBytes.length); // 이미지 크기 설정

        return ResponseEntity.ok().headers(headers).body(imageBytes); // 이미지 반환
    }

    /**
     * 워드클라우드 캐시를 수동으로 갱신하는 API
     * @return 갱신된 워드클라우드 이미지
     */
    @PostMapping(value = "/keywords/refresh")
    public ResponseEntity<byte[]> refreshNewsKeywords() {
        log.info("워드클라우드 캐시 수동 갱신 요청 수신");
        byte[] imageBytes = newsArticlesService.generateAndCacheWordCloud();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        return ResponseEntity.ok().headers(headers).body(imageBytes);
    }
}