package realty.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import realty.domain.dto.LawKeywordDTO;
import realty.domain.model.LawKeyword;
import realty.domain.model.LawReference;
import realty.domain.repository.LawKeywordRepository;
import realty.domain.repository.LawReferenceRepository;
@Service
@RequiredArgsConstructor
public class LawKeywordService {
    private final LawKeywordRepository lawKeywordRepository;
    private final LawReferenceRepository lawReferenceRepository;

    public Page<LawKeywordDTO> getKeywords(int page, int size){
        Pageable pageable = PageRequest.of(page,size);
        Page<LawKeyword> lawKeywords = lawKeywordRepository.findAll(pageable);

        return LawKeywordDTOsFromKeywords(lawKeywords);
    }

    public Page<LawKeywordDTO> getKeywordsByCategory(int page, int size, String category){
        Pageable pageable = PageRequest.of(page,size);
        Page<LawKeyword> lawKeywordsByCategory = lawKeywordRepository.findAllByLawKeywordCategory(category, pageable);

        return LawKeywordDTOsFromKeywords(lawKeywordsByCategory);
    }

    private Page<LawKeywordDTO> LawKeywordDTOsFromKeywords(Page<LawKeyword> lawKeywordsPage) {
        return lawKeywordsPage.map(lawKeyword->{
                LawReference lawReference = null;
                if(lawKeyword.getLawReferenceId() != null){
                    lawReference = lawReferenceRepository
                                    .findById(lawKeyword.getLawReferenceId())
                                    .orElse(null);
                }

                return LawKeywordDTO.builder()
                                    .lawKeyword(lawKeyword.getLawKeyword())
                                    .lawKeywordDescription(lawKeyword.getLawKeywordDescription())
                                    .lawKeywordCategory(lawKeyword.getLawKeywordCategory())
                                    .lawReferenceName(lawReference == null ? null : lawReference.getLawReferenceName())
                                    .lawReferenceUrl(lawReference == null ? null : lawReference.getLawReferenceUrl())
                                    .build();
            }                        
        );
    }
}
