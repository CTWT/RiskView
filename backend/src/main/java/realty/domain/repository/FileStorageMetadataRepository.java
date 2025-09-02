package realty.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import realty.domain.model.FileStorageMetadata;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 김관호
 * 작성자 : 김관호
 * 수정자 : 
 * 작성일 : 25.07.29
 * 파일명 : FileStorageMetadataRepository.java
 */
@Repository
public interface FileStorageMetadataRepository extends JpaRepository<FileStorageMetadata, Long>{
    FileStorageMetadata findByDocumentCode(String documentCode);
}
