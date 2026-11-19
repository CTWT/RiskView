package realty.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "law_references")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LawReference {

    @Id
    @Column(name = "law_reference_id", length = 50, nullable = false)
    private String lawReferenceId; // 관련법조항 고유번호

    @Column(name = "law_reference_name", length = 50, nullable = false, unique = true)
    private String lawReferenceName; // 관련법조항 이름

    @Column(name = "law_reference_url", columnDefinition = "TEXT")
    private String lawReferenceUrl; // 관련법조항 URL

    @Column(name = "created_by", length = 20,  columnDefinition= "recode constructor")
    private String createdBy; // 레코드 생성자

    @Column(name = "created_at", nullable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt; // 생성일시

    @PrePersist
    public void onPrePersist(){
        createdAt = LocalDateTime.now();
    }
}

