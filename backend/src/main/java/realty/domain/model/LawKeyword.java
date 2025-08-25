package realty.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "law_keywords")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LawKeyword {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "law_keyword_id", nullable = false, updatable = false, columnDefinition = "BIGINT")
    private Long lawKeywordId; // 법령키워드 고유번호

    @Column(name = "law_keyword", nullable = false, length = 100)
    private String lawKeyword; // 법령키워드

    @Column(name = "law_keyword_description", columnDefinition = "TEXT")
    private String lawKeywordDescription; // 법령키워드 설명

    @Column(name = "law_keyword_category", length = 50)
    private String lawKeywordCategory; // 법령키워드 분류

    @Column(name = "law_reference_id", length = 50)
    private String lawReferenceId; // 관련법조항 고유번호

    @Column(name = "created_at", nullable = false, updatable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt; // 생성일시

    @PrePersist
    public void onPrePersist(){
        createdAt = LocalDateTime.now();
    }
}
