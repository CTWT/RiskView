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
    private String roadAddress = "";       // 도로명 주소
    private String jibunAddress = "";      // 지번 주소
    private String englishAddress = "";    // 영어 주소
    private String x = "";                  // X 좌표(경도)
    private String y = "";                  // Y 좌표(위도)
    private String distance = "";           // 중심 좌표로부터의 거리(m)

    // addressElements
    private String sido = "";               // 시/도
    private String sigugun = "";            // 시/구/군
    private String dongmyun = "";           // 동/면
    private String ri = "";                 // 리
    private String roadName = "";           // 도로명
    private String buildingNumber = "";     // 건물 번호
    private String buildingName = "";       // 건물 이름
    private String landNumber = "";         // 번지 (Python은 LandNumber였는데 변수명 통일 위해 소문자로)
    private String postalCode = "";         // 우편번호

    @Override
    public String toString() {
        return "도로명 주소: " + roadAddress + "\n" +
               "지번 주소: " + jibunAddress + "\n" +
               "영문 주소: " + englishAddress + "\n" +
               "위도: " + y + "\n" +
               "경도: " + x + "\n" +
               "거리: " + distance + "\n" +
               "시도: " + sido + "\n" +
               "시군구: " + sigugun + "\n" +
               "동/면: " + dongmyun + "\n" +
               "리: " + ri + "\n" +
               "도로명: " + roadName + "\n" +
               "건물번호: " + buildingNumber + "\n" +
               "건물명: " + buildingName + "\n" +
               "산번호: " + landNumber + "\n" +
               "우편번호: " + postalCode;
    }
}
