package realty.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.io.File;
import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

import realty.domain.dto.ContractDTO;
import realty.domain.dto.MapInfo;
import realty.domain.model.User;
import realty.service.ContractService;

@ExtendWith(MockitoExtension.class)
class ContractControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ContractService contractService;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private ContractController contractController;

    private final ObjectMapper objectMapper = new ObjectMapper();  // 직접 생성

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(contractController)
        .defaultResponseCharacterEncoding(StandardCharsets.UTF_8)
        .build();
    }

    /**
     * ocr 스캔 결과 테스트 코드
     * 
     * @throws Exception
     */
    @Test
    @DisplayName("OCR 업로드 API 성공")
    void testHandleFileUploadSuccess() throws Exception {
        // 1. 테스트용 가짜 업로드 파일 생성
        MockMultipartFile mockFile = new MockMultipartFile(
                "file", // 요청 파라미터 이름과 일치해야 함
                "test.pdf", // 파일명
                "application/pdf", // MIME 타입
                "dummy data".getBytes() // 파일 내용 (바이트 배열)
        );

        // 2. contractService.getFileFromMultipartFile() 호출 시 반환할 가짜 File 객체 생성
        File dummyConvertedFile = new File("dummy/path/test.pdf");

        // 3. OCR API 호출 시 실제 반환값으로 사용할 가짜 OCRResponse 객체 생성
        ContractDTO.OCRResponse ocrResponse = ContractDTO.OCRResponse.builder()
                .structuredContractDataDTO(new ContractDTO.StructuredContractDataDTO()) // OCR 결과 데이터 (빈 객체)
                .mapInfo(new MapInfo()) // 맵 정보 포함 (빈 객체)
                .build();

        // 4. contractService 내부 메서드 동작을 가짜로 정의 (Mocking)
        when(contractService.getFileFromMultipartFile(any())).thenReturn(dummyConvertedFile); // MultipartFile -> File
                                                                                              // 변환 결과 반환
        when(contractService.getHttpBodyFromFile(any())).thenReturn(new LinkedMultiValueMap<>()); // HTTP 바디 생성 결과 반환 (빈
                                                                                                  // 맵)
        when(contractService.getFileMetadata(any())).thenReturn(new ContractDTO.FileStorageMetadataDTO()); // 파일 메타데이터
                                                                                                           // 반환 (빈 객체)

        // 5. restTemplate.postForEntity()가 "/trigger" 호출 시 Void 반환하도록 가짜 응답 설정
        when(restTemplate.postForEntity(
                eq("http://localhost:8000/trigger"), // URL이 trigger API 일 때
                any(), // 어떤 HttpEntity든지 허용
                eq(Void.class) // Void 타입 응답
        )).thenReturn(ResponseEntity.ok(null)); // HTTP 200 OK, 내용 없음

        // 6. restTemplate.postForEntity()가 "/ocr" 호출 시 가짜 OCRResponse 반환하도록 설정
        when(restTemplate.postForEntity(
                eq("http://localhost:8000/ocr"), // URL이 ocr API 일 때
                any(), // 어떤 HttpEntity든지 허용
                eq(ContractDTO.OCRResponse.class) // OCRResponse 타입 응답
        )).thenReturn(ResponseEntity.ok(ocrResponse)); // HTTP 200 OK, 가짜 OCRResponse 반환

        // 7. MockMvc를 이용해 "/upload"에 파일 첨부 POST 요청 실행 후 결과 검증
        mockMvc.perform(multipart("/upload").file(mockFile)) // 파일 첨부 POST 요청
                .andExpect(status().isOk()) // HTTP 응답 코드 200 OK 예상
                .andExpect(jsonPath("$.contractInfo").exists()) // JSON 응답에 contractInfo 필드 존재 확인
                .andExpect(jsonPath("$.mapInfo").exists()); // JSON 응답에 mapInfo 필드 존재 확인
    }

    @Test
    @DisplayName("insertData - 로그인된 사용자 있을 때 성공")
    void testInsertDataWithUser() throws Exception {
        // 세션에 담길 User 객체 준비
        User user = new User();
        user.setUserCode("user123");

        // MockHttpSession에 user 저장
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("user", user);

        // 전송할 ContractInfo 객체 (빈 객체로 예시)
        ContractDTO.ContractInfo contractInfo = ContractDTO.ContractInfo.builder().build();

        // contractService.save 호출 시 별도 동작 설정 없이 진행

        mockMvc.perform(post("/contracts")
                .session(session)  // 세션 주입
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.TEXT_PLAIN)
                .content(objectMapper.writeValueAsString(contractInfo))  // JSON 요청 바디
        )
                .andExpect(status().isOk())
                .andExpect(content().string("Contract Save Complete!"));
    }

    @Test
    @DisplayName("insertData - 세션에 사용자 없을 때 500 에러")
    void testInsertDataNoUser() throws Exception {
        ContractDTO.ContractInfo contractInfo = ContractDTO.ContractInfo.builder().build();

        mockMvc.perform(post("/contracts")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.TEXT_PLAIN)
                .content(objectMapper.writeValueAsString(contractInfo))
        )
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("No Logined User"));
    }

}
