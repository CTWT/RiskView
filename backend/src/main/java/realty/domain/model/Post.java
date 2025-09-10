package realty.domain.model;

import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Formula;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/*
 * 수업명 : 가비아 2회차
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.09.03
 * 파일명 : Post.java
 */

@Entity
@Table(name = "posts")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id")
    private Long Id;

    @Column(name = "post_code", nullable = false, unique = true, length = 20)
    private String postCode;

    // FK → users.user_code 참조
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_code", referencedColumnName = "user_code", nullable = false)
    private User author;

    @Enumerated(EnumType.STRING)
    @Column(name = "board_type", nullable = false, length = 20)
    private BoardType boardType;

    @Column(name = "post_type", length = 20)
    private String postType; // 인기, 정보, 질문 등 (nullable)

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "tags", length = 255)
    private String tags; // 쉼표 구분 태그

    @ColumnDefault("0")
    @Column(nullable = false)
    private int views;

    // 좋아요 개수
    @Formula("(select count(*) from post_likes pl where pl.post_code = post_code)")
    private int likesCount;

    // 댓글 개수
    @Formula("(select count(*) from community_comments cc where cc.post_code = post_code and cc.is_deleted = false)")
    private int commentsCount;

    // 댓글 엔티티 연관관계
    @Builder.Default
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<CommunityComment> comments = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum BoardType {
        FREE, SUPPORT
    }

    // == 유틸 메서드 == //
    public void incrementViews() {
        this.views++;
    }

    public void update(String title, String content, String tags) {
        this.title = title;
        this.content = content;
        this.tags = tags;
    }
}