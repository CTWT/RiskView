package realty.controller;

import java.io.IOException;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import realty.apicommunication.MapComponent;
import realty.apicommunication.OcrComponent;
import realty.domain.dto.ContractDTO;
import realty.domain.dto.MapInfo;
import realty.domain.model.User;
import realty.service.ContractService;

@Controller
@RequiredArgsConstructor
public class TestContractController {
    private final ContractService contractService;
    private final OcrComponent ocrComponent;
    private final MapComponent mapComponent;

    /**
     * 계약서를 저장하는 PostMapping
     */
    @PostMapping("/test_contracts")
    public String insertData(@ModelAttribute("contractInfo") ContractDTO.ContractInfo contractInfo,
            HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/";
        }

        String userCode = user.getUserCode();
        
        contractService.save(contractInfo, userCode);
        return "ocr/InsertSuccess";
    }

    /**
     * 파일 업로드 후 OCR 실행
     */
    @PostMapping("/test_upload")
    public String handleFileUpload(@RequestParam("file") MultipartFile file, Model model)
            throws IOException {
        //계약서 정보
        ContractDTO.ContractInfo contractInfo = ocrComponent.getContractInfo(file);

        //맵 정보
        String address = contractInfo.getStructuredContractDataDTO().getLocation();
        MapInfo mapInfo = mapComponent.getMapInfo(address);
        
        model.addAttribute("contractInfo", contractInfo);
        model.addAttribute("mapInfo", mapInfo);

        return "ocr/OCRResult";
    }

    @GetMapping("/test_upload")
    public String testUpload(){
        return "ocr/ImageUpload";
    }
    
}
