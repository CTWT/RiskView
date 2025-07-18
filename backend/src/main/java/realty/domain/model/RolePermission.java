package realty.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.07.18
 * 파일명 : RolePermission.java
 */

@Entity
@Table(name = "role_permissions")
@Getter
@Setter
public class RolePermission {
    @Id
    @Column(name = "role", length = 50)
    private String role = "user";

    @Column(name = "can_upload")
    private boolean canUpload;

    @Column(name = "can_delete")
    private boolean canDelete;

    @Column(name = "can_manage_users")
    private boolean canManageUsers;

    @Column(name = "can_view_all_docs")
    private boolean canViewAllDocs;
}