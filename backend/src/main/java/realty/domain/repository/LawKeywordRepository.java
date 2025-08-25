package realty.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import realty.domain.model.LawKeyword;

@Repository
public interface LawKeywordRepository extends JpaRepository<LawKeyword,Long> {
    LawKeyword findByLawKeyword(String lawKeyword);
    Page<LawKeyword> findAllByLawKeywordCategory(String category, Pageable pageable);
}
