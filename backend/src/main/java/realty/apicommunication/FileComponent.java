package realty.apicommunication;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class FileComponent {
    public HttpEntity<MultiValueMap<String, Object>> createMultipartRequest(MultipartFile file) throws IOException {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename(); // 서버 쪽에서 파일명 인식하도록
            }
        });

        return new HttpEntity<>(body, headers);
    }

    /**
     * 
     * @param file     임시 파일
     * @param fileName 설정한 파일 이름
     * @param session  세션
     * @return 파일경로
     */
    public String saveFile(File file, String fileName, HttpSession session) {
        if (file == null || file.isFile() == false) {
            throw new IllegalArgumentException("파일이 아니거나 null 입니다.");
        }

        try {
            // 1. 저장힐 폴더 경로 설정
            Path dir = Paths.get(getStoredPath());

            // 2. 저장할 폴더가 없으면 생성
            if (Files.notExists(dir)) {
                Files.createDirectories(dir);
            }

            Path filePath = dir.resolve(fileName);

            // 3. 임시 파일 → 저장 폴더로 복사 (기존 파일 덮어쓰기 허용)
            Files.copy(file.toPath(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // 4. 임시 파일 삭제
            boolean deleted = file.delete();
            if (!deleted) {
                System.err.println("임시 파일 삭제 실패: " + file.getAbsolutePath());
            }

            return filePath.toString();

        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패", e);
        }

    }

    /**
     * MultipartFile을 받아서 File로 temp폴더에 저장하는 함수
     */
    public void saveTmpFile(MultipartFile file, HttpSession session) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있거나 null 입니다.");
        }

        try {
            // 1. 임시 폴더 경로 설정)
            Path tempDir = Paths.get(getTempPath());

            // 2. 임시 폴더가 없으면 생성
            if (Files.notExists(tempDir)) {
                Files.createDirectories(tempDir);
            }

            // 3. 저장할 임시 파일 경로 생성 (중복 방지를 위해 현재시간 붙임)
            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path tempFilePath = tempDir.resolve(filename);

            // 4. MultipartFile → File로 저장
            file.transferTo(tempFilePath);

            // 5. 세션에 임시 파일 경로 저장
            session.setAttribute("tempFilePath", tempFilePath.toString());

        } catch (IOException e) {
            throw new RuntimeException("임시 파일 저장 실패", e);
        }
    }

    /**
     * 1분마다 실행되며, 5분 이상 지난 임시 파일을 삭제
     */
    @Scheduled(fixedRate = 60_000) // 1분마다 실행
    public void cleanOldTempFiles() {
        Path tempDir = Paths.get(getTempPath());
        if (!Files.exists(tempDir))
            return;

        try {
            Files.list(tempDir).forEach(path -> {
                try {
                    File file = path.toFile();
                    long lastModified = file.lastModified();
                    long ageMinutes = (Instant.now().toEpochMilli() - lastModified) / 1000 / 60;

                    if (ageMinutes >= 5) {
                        Files.deleteIfExists(path);
                        System.out.println("삭제됨: " + path);
                    }
                } catch (Exception e) {
                    System.err.println("삭제 실패: " + path);
                    e.printStackTrace();
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public String getStoredPath() {
        return Paths.get(System.getProperty("user.dir"), "backend", "src", "main", "java", "realty", "savedfile")
                .toString();
    }

    public String getTempPath() {
        return Paths.get(System.getProperty("user.dir"), "backend", "src", "main", "java", "realty", "tempfile")
                .toString();
    }

    public int longtoInt(long l) {
        Long ll = l;
        return ll.intValue();
    }
}
