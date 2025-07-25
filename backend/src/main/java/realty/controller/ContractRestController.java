package realty.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import realty.domain.dto.LeaseContract;
import realty.service.ContractService;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 김관호
 * 작성자 : 김관호
 * 수정자 : 
 * 작성일 : 25.07.21
 * 파일명 : ContractRestController.java
 */

 /*
  * OCR 결과 및 계약서의 데이터를 REST 통신 하기위한 RestController
  */

@RestController
@RequiredArgsConstructor
public class ContractRestController {

    private final ContractService contractService;
    
    /**
     * @param contract 파이썬으로부터 받은 OCR 데이터
     */
    @PostMapping("/api/upload")
    public ResponseEntity<String> upload(@RequestBody LeaseContract contract) {
        System.out.println("✅ 수신 데이터: " + contract);
        //테스트용
        leaseContract = contract; 
        
        return ResponseEntity.ok("데이터 수신 완료"); // 프론트에서 리다이렉트
    }
    

    /**
     * 
     * @param documentcode 검색할 계약서의 code
     * @return 검색한 계약서의 데이터를 JSON화 하여 반환
     */
    @GetMapping("/api/download/{documentcode}")
    public ResponseEntity<LeaseContract> download(@PathVariable String documentcode) {
        LeaseContract contract = contractService.findByDocumentcode(documentcode);
        return ResponseEntity.ok(contract);
    }
    
    //테스트용
    //타임리프 임시 테스트를 위해 스태틱변수에 데이터를 저장함(수정 예정)
    private static LeaseContract leaseContract = null;
    public static LeaseContract getLeaseContract() {
        return leaseContract;
    }
}
