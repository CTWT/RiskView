package realty.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import realty.domain.model.ContractClause;

public interface ContractClauseRepository extends JpaRepository<ContractClause, Long> {
    
}
