package realty.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import realty.domain.model.TransactionAnomaly;

public interface TransactionAnomalyRepository extends JpaRepository<TransactionAnomaly, Long> {
    
}
