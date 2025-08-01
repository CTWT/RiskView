package realty.domain.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 김관호
 * 작성자 : 김관호
 * 수정자 : 
 * 작성일 : 25.07.31
 * 파일명 : Documents.java
 */

@Entity
@Table(name = "documents")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Documents {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_id", columnDefinition = "BIGINT COMMENT '문서 고유 ID'")
    private Long documentId;

    @Column(name = "document_code", length = 20, nullable = false, unique = true, columnDefinition = "VARCHAR(20) COMMENT '문서 고유코드'")
    private String documentCode;

    @Column(name = "user_code", length = 20, nullable = false, columnDefinition = "VARCHAR(20) COMMENT '사용자 관리코드 (FK)'")
    private String userCode;

    @Column(name = "title", length = 255, columnDefinition = "VARCHAR(255) COMMENT '문서 제목'")
    private String title;

    @Column(name = "status", length = 50, columnDefinition = "VARCHAR(50) DEFAULT 'UPLOAD' COMMENT '문서 처리 상태'")
    private String status;

    @Column(name = "is_deleted", columnDefinition = "BOOLEAN DEFAULT FALSE COMMENT '삭제 여부'")
    private Boolean isDeleted;

    @Column(name = "created_at", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시'")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "user_code",
        referencedColumnName = "user_code",
        insertable = false,
        updatable = false
    )
    private User user;

    @PrePersist
    public void onPrePersist(){
        createdAt = LocalDateTime.now();
    }
}

