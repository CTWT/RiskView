package realty.config;

import java.io.IOException;
import java.io.InputStream;

import org.springframework.core.io.InputStreamResource;

public class MultipartInputStreamFileResource extends InputStreamResource{

    private final String fileName;

    public MultipartInputStreamFileResource(InputStream inputStream, String fileName) {
        super(inputStream);
        this.fileName = fileName;
    }

    @Override
    public String getFilename() {
        return this.fileName;
    }

    @Override
    public long contentLength() throws IOException {
        return -1; // 계산 불필요
    }
    
}
