package realty.domain.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import realty.domain.model.TransactionAnomaly;

public interface TransactionAnomalyRepository extends JpaRepository<TransactionAnomaly, Long> {
    Optional<TransactionAnomaly> findByReportCode(String reportCode);
}
