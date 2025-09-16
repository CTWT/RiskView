package realty.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import realty.domain.model.AnalysisReport;

public interface AnalysisReportRepository extends JpaRepository<AnalysisReport, Long> {
    
}
