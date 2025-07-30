package realty.domain.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 김관호
 * 작성자 : 김관호
 * 수정자 : 
 * 작성일 : 25.07.30
 * 파일명 : OCRResponse.java
 */

 // Fast서버에 OCR을 요청 후 Response를 받을 dto

@Getter
@Setter
@RequiredArgsConstructor
public class OCRResponse {
    private LeaseContract leaseContract;
    private MapInfo mapInfo;
}
