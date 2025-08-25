package realty.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import realty.domain.model.LawReference;

@Repository
public interface LawReferenceRepository extends JpaRepository<LawReference,String> {
    LawReference findByLawReferenceId(String lawReferenceId);
}
