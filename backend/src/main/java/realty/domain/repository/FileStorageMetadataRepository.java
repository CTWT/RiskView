package realty.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import realty.domain.model.FileStorageMetadata;

@Repository
public interface FileStorageMetadataRepository extends JpaRepository<FileStorageMetadata, Long>{
    FileStorageMetadata findByDocumentCode(String documentCode);
}
