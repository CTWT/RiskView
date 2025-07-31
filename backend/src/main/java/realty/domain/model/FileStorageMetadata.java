package realty.domain.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "file_storage_metadata")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class FileStorageMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "file_id", columnDefinition = "BIGINT COMMENT '파일 고유 ID'")
    private Long fileId;

    @Column(name = "file_code", length = 20, nullable = false, unique = true,
            columnDefinition = "VARCHAR(20) COMMENT '파일 고유 코드'")
    private String fileCode;

    @Column(name = "document_code", length = 20, nullable = false,
            columnDefinition = "VARCHAR(20) COMMENT '문서 고유코드(FK)'")
    private String documentCode;

    @Column(name = "original_name", length = 255,
            columnDefinition = "VARCHAR(255) COMMENT '원본 파일명'")
    private String originalName;

    @Column(name = "stored_path", length = 255,
            columnDefinition = "VARCHAR(255) COMMENT '저장 경로'")
    private String storedPath;

    @Column(name = "file_size_kb",
            columnDefinition = "INT COMMENT '파일 크기(KB)'")
    private Integer fileSizeKb;

    @Column(name = "file_type", length = 50,
            columnDefinition = "VARCHAR(50) COMMENT '파일 유형(MIME)'")
    private String fileType;

    @Column(name = "is_encrypted",
            columnDefinition = "BOOLEAN DEFAULT TRUE COMMENT '암호화 여부'")
    private Boolean isEncrypted;

    @Column(name = "upload_at",
            columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '업로드 시각'")
    private LocalDateTime uploadAt;

    // 연관관계 매핑 (선택적)
    // 문서와의 다대일 관계
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_code", referencedColumnName = "document_code",
                insertable = false, updatable = false)
    private Documents document;
}