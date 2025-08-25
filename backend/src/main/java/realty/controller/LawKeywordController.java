package realty.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import realty.domain.dto.LawKeywordDTO;
import realty.service.LawKeywordService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/lawKeyword")
public class LawKeywordController {
    private final LawKeywordService lawKeywordService;

    @GetMapping("/keywords")
    public Page<LawKeywordDTO> getKeywords(
            @RequestParam int page,
            @RequestParam(defaultValue = "8") int size,
            @RequestParam(required = false) String category
    ) {
        if (category != null) {
            return lawKeywordService.getKeywordsByCategory(page, size, category);
        } else {
            return lawKeywordService.getKeywords(page, size);
        }
    }

}
