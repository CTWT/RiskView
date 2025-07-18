package realty.domain.repository;

import realty.domain.model.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.07.18
 * 파일명 : RolePermissionRepository.java
 */

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, String> {
}