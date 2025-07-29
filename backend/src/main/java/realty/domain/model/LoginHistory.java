package realty.domain.model;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;


/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.07.30
 * 파일명 : LoginHistory.java
 */

@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name="login_history")
public class LoginHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "login_id", nullable = false)
    private Long loginId;

    @Column(name = "login_code", nullable = false, unique = true, length = 20)
    @Builder.Default
    private String loginCode="LH00000000"; // 기본값으로 임시 코드 설정

    @Column(name = "user_code", nullable = false, length = 20)
    private String userCode;

    @Column(name = "ip_address", length = 100)
    private String ipAddress;

    @Lob // @Lob: 글자가 매우 길어질 경우에 대비
    @Column(name = "user_agent")
    private String userAgent;

    @CreationTimestamp
    @Column(name = "login_time", nullable = false)
    private LocalDateTime loginTime;
    
}
