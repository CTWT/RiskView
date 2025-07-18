package realty.domain.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.07.18
 * 파일명 : User.java
 */

@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name="users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_seq")
    private Long userSeq;
    
    /**
     * 사용자 고유 코드 (U + 8자리 숫자)
     */
    @Column(name = "user_code", unique = true, nullable = false, length = 20)
    @Builder.Default
    private String userCode="U10000000"; // 기본값으로 임시 코드 설정
    
    @Column(name = "user_id", unique = true, nullable = false)
    private String userId;

    @Column(name = "user_nickname", unique = true, nullable = false)
    private String userNickname;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(name = "password_hash", nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String name;
    
    @ManyToOne
    @JoinColumn(name = "role")
    private RolePermission role;
    
    @Column(name = "preferred_language")
    @Builder.Default
    private String preferredLanguage = "KO";
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "is_deleted")
    @Builder.Default
    private int isDeleted = 0;
}