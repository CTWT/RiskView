package realty.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import realty.domain.model.Documents;

@Repository
public interface DocumentsRepository extends JpaRepository<Documents, Long> {
    Documents findByUserCode(String userCode);
}
