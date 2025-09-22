package realty.domain.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import realty.domain.model.AnalysisReport;

public interface AnalysisReportRepository extends JpaRepository<AnalysisReport, Long> {
    Optional<AnalysisReport> findByDocumentCode(String documentCode);
}
