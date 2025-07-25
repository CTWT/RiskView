package realty.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import lombok.RequiredArgsConstructor;
import realty.domain.dto.LeaseContract;
import realty.service.ContractService;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 김관호
 * 작성자 : 김관호
 * 수정자 : 
 * 작성일 : 25.07.21
 * 파일명 : ContractController.java
 */

 /* 
  * 계약서와 관련된 일반 컨트롤러(타임리프 테스트를 위해 만듦)
  */

@Controller
@RequiredArgsConstructor
public class ContractController {
    
    private final ContractService contractService;

    /*
     * OCR결과로 받은 데이터를 타임리프 화면에 띄우기 위한 GetMapping
     */
    @GetMapping("/contracts")
    public String showResult(Model model) {
        LeaseContract contract = ContractRestController.getLeaseContract();

        model.addAttribute("contract", contract);
        System.out.println("계약서 정보 " +contract);
        return "ocr/OCRResult";
    }

    @PostMapping("/contracts")
    public String insertData(@ModelAttribute LeaseContract contract) {
        contractService.save(contract);
        return "ocr/InsertSuccess";
    }
}
