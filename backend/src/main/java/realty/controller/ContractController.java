package realty.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import realty.domain.dto.LeaseContract;

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
public class ContractController {
    
    /*
     * OCR결과로 받은 데이터를 타임리프 화면에 띄우기 위한 GetMapping
     */
    @GetMapping("/result")
    public String showResult(Model model) {
        LeaseContract contract = ContractRestController.getLeaseContract();

        if(contract == null) {
            return "redirect:/errorPage";
        }

        model.addAttribute("contract", contract);
        System.out.println("계약서 정보 " +contract);
        return "ocrResult";
    }
}
