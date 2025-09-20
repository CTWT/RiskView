package realty.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;


/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 박윤성
 * 작성일 : 25.07.18
 * 수정일 : 25.09.20
 * 파일명 : UserDTO.java
 */

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private String userId; // 사용자 ID
    private String password; // 비밀번호
    private String name; // 이름
    private String userNickname; // 닉네임
    private String email; // 이메일
    private String preferredLanguage; // 선호 언어
    private String currentPassword; // 현재 비밀번호
    private String newPassword; // 새 비밀번호
    private String confirmNewPassword; // 새 비밀번호 확인
    private LocalDateTime createdAt; // 생성일
}
