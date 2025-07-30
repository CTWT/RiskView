package realty.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 박윤성
 * 작성일 : 25.07.18
 * 파일명 : UserDTO.java
 */

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private String userId;
    private String password;
    private String name;
    private String userNickname;
    private String email;
    private String preferredLanguage;
    // 비밀번호 찾기에서 새 비밀번호 지정할 때 사용
    private String resetPassword;
    // 비밀번호 찾기에서 새 비밀번호 확인할 때 사용
    private String confirmResetPassword; 
}
