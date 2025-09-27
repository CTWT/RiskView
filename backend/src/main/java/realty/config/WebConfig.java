package realty.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 김관호
 * 작성자 : 김관호
 * 수정자 : 
 * 작성일 : 25.08.04
 * 파일명 : WebConfig.java
 */

 /**
  * Web설정에 관한 Config
  */

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    /**
     * 리액트에 포트를 열어줌
     */
    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/**")  // 모든 경로에 대해
                                .allowedOrigins(
                    "http://localhost:5173",   // 로컬 개발 환경
                    "http://1.201.19.40",           // 배포 서버 환경
                    "http://1.201.19.40:8080"       // 배포 서버 환경
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
    
}
