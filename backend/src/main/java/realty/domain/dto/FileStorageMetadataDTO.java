package realty.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Builder
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class FileStorageMetadataDTO {
    private String originalName;
    private String storedPath;
    private Integer fileSizeKb;
    private String fileType;
    private Boolean isEncrypted;
}
