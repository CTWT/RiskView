package realty.apicommunication;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;
import realty.domain.dto.MapInfo;

@Component
@RequiredArgsConstructor
public class MapComponent {
    private final RestTemplate restTemplate;

    /**
     * FastAPI에 naver_map 요청
     * @param address 주소
     * @return MapInfo
     */
    public MapInfo getMapInfo(String address){
        triggerFastApiNaverMap();

        Map<String,String> requestBody = new HashMap<>();
        requestBody.put("address", address);

        ResponseEntity<MapInfo> response = restTemplate.postForEntity(
                "http://localhost:8000/naver_map",
                requestBody,
                MapInfo.class);

        return response.getBody();
    }


    /**
     * FastAPI 서버 쪽의 ocr 트리거 활성화
     */
    private void triggerFastApiNaverMap() {
        Map<String, String> triggerBody = new HashMap<>();
        triggerBody.put("api_name", "naver_map");
        restTemplate.postForEntity("http://localhost:8000/trigger", triggerBody, Void.class);
    }
}
