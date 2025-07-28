package realty.controller;

import realty.service.NewsArticlesService;
import realty.service.NewsArticlesService.NewsArticlesPage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.07.28
 * 파일명 : NewsArticlesController.java
 */
@RequestMapping("/board/news_articles")
@Controller
public class NewsArticlesController {
    
    @Autowired
    private NewsArticlesService newsArticlesService;

    /**
     * 뉴스 기사 목록 호출 메서드
     * @param pageNum 페이지 번호(기본값: 1)
     * @param size 한 페이지당 보여줄 항목 수(기본값: 10)
     * @param model
     * @return 부동산 뉴스 페이지
     */
    @GetMapping("")
    public String getNewsArticles(@RequestParam(defaultValue = "1") int pageNum, @RequestParam(defaultValue = "10") int size, Model model) {
        // 기사 목록과 페이징 정보를 담은 객체인 NewsArticlesPage 객체를 받아옴
        NewsArticlesPage articlesData = newsArticlesService.getNewsPages(pageNum, size);
        
        // 모델 객체에 기사 목록과 페이징 정보를 담은 객체인 NewsArticlesPage 객체를 담아 뷰로 전달
        model.addAttribute("articlesData", articlesData);
        
        // 부동산 뉴스 페이지로 이동
        return "board/news_articles";
    }
}