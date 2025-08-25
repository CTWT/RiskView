package realty.domain.dto;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LawKeywordDTO {
    private String lawKeyword;
    private String lawKeywordDescription;
    private String lawKeywordCategory;
    private String lawReferenceName;
    private String lawReferenceUrl;
}
