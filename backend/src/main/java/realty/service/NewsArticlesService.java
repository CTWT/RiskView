package realty.service;

import realty.domain.dto.NewsArticlesDTO;
import realty.domain.repository.NewsArticlesRepository;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.07.28
 * 파일명 : NewsArticlesService.java
 */
@Service
public class NewsArticlesService {
    
    @Autowired
    private NewsArticlesRepository newsArticlesRepository;

    /**
     * 현재 페이지에 표시할 뉴스 기사 항목들을 가져오는 메서드
     * @param pageNum 페이지 번호
     * @param size 한 페이지당 보여줄 항목 수
     * @return 현재 페이지에 표시할 뉴스 기사 항목들 및 페이징 정보 (NewsArticlesPage 객체)
     */
    public NewsArticlesPage getNewsPages(int pageNum, int size) {
        // 가져올 페이지의 번호(pageNum)와 한 페이지당 항목수(size)를 지정
        // 유저가 제출한 페이지 번호는 1부터 시작하지만, Spring Data JPA는 0부터 시작하므로 -1
        Pageable pageable = PageRequest.of(pageNum - 1, size);

        // 데이터베이스에서 Pageable 객체에 저장된 조건에 해당하는 뉴스 기사를 찾아서 가져옴.
        // Page<NewsArticles> 타입으로 결과 반환.
        Page<NewsArticlesDTO> newsPage = newsArticlesRepository.findAll(pageable)
            // Page<NewsArticles> 타입을 Page<NewsArticleDTO>로 매핑
            .map(news -> new NewsArticlesDTO(
                // 제목을 꺼냄
                news.getTitle(),
                // 내용을 꺼냄
                news.getContent(),
                // 발행일을 꺼내 2000-01-01과 같은 형식으로 만듬
                news.getPublishedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))
            )
        );

        // 총 페이지 수
        int totalPages = newsPage.getTotalPages();
        // 페이지 수가 0이 되는 것을 방지(최소 1이상): 데이터가 없을 때도 1페이지는 표시해야 하기 때문
        if (totalPages == 0) {
            totalPages = 1;
        }

        // --- PaginationInfo의 로직을 NewsArticlesPage 생성 시 직접 계산하여 전달하도록 변경 ---
        // 현재 블록: 0블록은 1~10페이지, 1블록은 11~20페이지, ... (blockSize는 10으로 고정)
        int blockSize = 10;
        int currentBlock = (pageNum - 1) / blockSize;
        // (각 블록의)시작페이지 : 1, 11, 21, 31, ...
        int startPage = currentBlock * blockSize + 1;
        // (각 블록의)마지막 페이지: 10, 20, 30, 40, ... 단, 총 페이지 수를 넘지 않도록
        int endPage = Math.min(startPage + blockSize - 1, totalPages);
        // 이전 블록 존재 여부
        boolean hasPrevBlock = startPage > 1;
        // 다음 블록 존재 여부
        boolean hasNextBlock = endPage < totalPages;
        // 이전 블록의 시작 페이지
        int prevBlockStartPage = hasPrevBlock ? startPage - blockSize : 1;
        // 다음 블록의 시작 페이지
        int nextBlockStartPage = hasNextBlock ? endPage + 1 : totalPages;


        // 페이징된 뉴스 기사 목록과 모든 페이징 관련 정보를 NewsArticlesPage 객체에 담아 반환
        return new NewsArticlesPage(
            newsPage.getContent(), // 뉴스 목록
            newsPage.getTotalElements(), // 총 게시물 수
            totalPages, // 총 페이지 수
            pageNum, // 현재 페이지 (Spring Page는 0-based이므로 이미 처리됨)
            size, // 한 페이지당 보여줄 항목 수
            startPage, // 페이지 블록 시작 페이지
            endPage, // 페이지 블록 끝 페이지
            prevBlockStartPage, // 이전 블록 시작 페이지
            nextBlockStartPage, // 다음 블록 시작 페이지
            hasPrevBlock, // 이전 블록 존재 여부
            hasNextBlock // 다음 블록 존재 여부
        );
    }

    /**
     * 뉴스 목록 + 페이지 정보를 담고 있는 클래스
     */
    public static class NewsArticlesPage {
        // 현재 페이지에 표시할 뉴스 기사 DTO 목록
        private List<NewsArticlesDTO> newsList;
        // 전체 뉴스 기사 개수
        private long totalItems;
        // 전체 페이지 수
        private int totalPages;
        // 현재 페이지 번호
        private int currentPage;
        // 한 페이지당 보여줄 항목 수 (pageSize)
        private int pageSize;
        // 현재 페이지 블록의 시작 페이지 번호 (예: 1, 11, 21...)
        private int startPage;
        // 현재 페이지 블록의 마지막 페이지 번호 (예: 10, 20, 30... 또는 총 페이지 수)
        private int endPage;
        // 이전 페이지 블록의 시작 페이지 번호 (이전 블록으로 이동 시 사용)
        private int prevBlockStartPage;
        // 다음 페이지 블록의 시작 페이지 번호 (다음 블록으로 이동 시 사용)
        private int nextBlockStartPage;
        // 이전 페이지 블록 존재 여부
        private boolean hasPrevBlock;
        // 다음 페이지 블록 존재 여부
        private boolean hasNextBlock;

        // 생성자
        public NewsArticlesPage(List<NewsArticlesDTO> newsList,
                                long totalItems,
                                int totalPages,
                                int currentPage,
                                int pageSize,
                                int startPage,
                                int endPage,
                                int prevBlockStartPage,
                                int nextBlockStartPage,
                                boolean hasPrevBlock,
                                boolean hasNextBlock) {
            this.newsList = newsList;
            this.totalItems = totalItems;
            this.totalPages = totalPages;
            this.currentPage = currentPage;
            this.pageSize = pageSize;
            this.startPage = startPage;
            this.endPage = endPage;
            this.prevBlockStartPage = prevBlockStartPage;
            this.nextBlockStartPage = nextBlockStartPage;
            this.hasPrevBlock = hasPrevBlock;
            this.hasNextBlock = hasNextBlock;
        }

        // Getter 및 Boolean
        public List<NewsArticlesDTO> getNewsList() { return newsList; }
        public long getTotalItems() { return totalItems; }
        public int getTotalPages() { return totalPages; }
        public int getCurrentPage() { return currentPage; }
        public int getPageSize() { return pageSize; }
        public int getStartPage() { return startPage; }
        public int getEndPage() { return endPage; }
        public int getPrevBlockStartPage() { return prevBlockStartPage; }
        public int getNextBlockStartPage() { return nextBlockStartPage; }
        public boolean isHasPrevBlock() { return hasPrevBlock; }
        public boolean isHasNextBlock() { return hasNextBlock; }
    }
}
