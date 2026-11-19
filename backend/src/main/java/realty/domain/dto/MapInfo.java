package realty.domain.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 김관호
 * 작성자 : 김관호
 * 수정자 : 
 * 작성일 : 25.07.30
 * 파일명 : MapInfo.java
 */

 // OCRResponse로 받을 맵에 대한 정보 dto

@Getter
@Setter
@NoArgsConstructor
public class MapInfo {

    // addresses
    private String address = "";       // 주소
    private String x = "";                 // X 좌표(경도)
    private String y = "";                 // Y 좌표(위도)

    // addressElements
    private String sido = "";              // 시/도
    private String sigugun = "";           // 시/구/군
    private String dongmyun = "";          // 동/면
    private String buildingName = "";      // 건물 이름

    @Override
    public String toString() {
        return "주소: " + address + "\n" +
               "위도: " + y + "\n" +
               "경도: " + x + "\n" +
               "시도: " + sido + "\n" +
               "시군구: " + sigugun + "\n" +
               "동/면: " + dongmyun + "\n" +
               "건물명: " + buildingName;
    }
}
