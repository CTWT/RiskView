package realty.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
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
    

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("http://1.201.19.40:*")  // 포트 포함 origin
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type", "Accept", "X-Requested-With") // 명시적 허용
                .allowCredentials(true);

        // 디버깅용 로그
        System.out.println("===== CORS Mapping Added =====");
        System.out.println("Allowed Origins: http://1.201.19.40:*");
        System.out.println("Allowed Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
        System.out.println("Allowed Headers: Authorization, Content-Type, Accept, X-Requested-With");
        System.out.println("Allow Credentials: true");
        System.out.println("==============================");
    }


}

