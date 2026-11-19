package realty.domain.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import realty.domain.model.ContractClause;

public interface ContractClauseRepository extends JpaRepository<ContractClause, Long> {
    Optional<ContractClause> findByDocumentCode(String documentCode);
}
