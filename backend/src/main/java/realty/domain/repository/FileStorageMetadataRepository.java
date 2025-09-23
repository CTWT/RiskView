package realty.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;
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
    @Transactional
    @Modifying
    @Query("DELETE FROM FileStorageMetadata f WHERE f.postCode = :postCode")
    void deleteByPostCode(String postCode);
}
