package realty.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import realty.domain.dto.MapInfo;
import realty.service.NaverMapService;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 김관호
 * 작성자 : 김관호
 * 수정자 : 
 * 작성일 : 25.08.08
 * 파일명 : NaverMapController.java
 */

 /**
  * NaverMap API 활용관련 Controller
  */

@RestController
@RequiredArgsConstructor
public class NaverMapController {

    private final NaverMapService naverMapService;

    /**
     * 
     * @param address 주소
     * @return MapInfo 반환
     */
    @PostMapping("/mapInfo")
    public ResponseEntity<MapInfo> getMapInfo(@RequestParam("address") String address){
        MapInfo mapInfo = naverMapService.getMapInfo(address);
        return ResponseEntity.ok(mapInfo);
        
    }  
}
