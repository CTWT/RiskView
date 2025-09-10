package realty.domain.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
 * 파일명 : FileStorageMetadata.java
 */

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

    @Column(name = "entity_code", length = 20, nullable = false)
    private String entityCode;

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

    @PrePersist
    public void onPrePersist(){
        uploadAt = LocalDateTime.now();
    }
}