package realty.domain.model;

import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Formula;
import org.hibernate.annotations.Where;
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
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "user_seq", nullable = false)
    private User author;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BoardType boardType;

    @Column(length = 20)
    private String postType; // "인기", "정보", "질문" 등. '인기'는 동적으로 결정될 수 있으므로 nullable.

    @Column(nullable = false, length = 255)
    private String title;

    @Lob
    @Column(nullable = false)
    private String content;

    @Lob
    private String tags; // 쉼표로 구분된 태그 문자열

    @ColumnDefault("0")
    private int views;

    @Formula("(select count(*) from post_likes pl where pl.post_id = post_id)")
    private int likesCount;

    @Formula("(select count(*) from community_comments cc where cc.post_id = post_id and cc.is_deleted = false)")
    private int commentsCount;

    @Builder.Default
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @Where(clause = "is_deleted = false")
    @OrderBy("createdAt ASC")
    private List<CommunityComment> comments = new ArrayList<>();

    @ColumnDefault("false")
    private boolean hasAttachment;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum BoardType {
        FREE, SUPPORT
    }

    public void incrementViews() {
        this.views++;
    }

    public void update(String title, String content, String tags) {
        this.title = title;
        this.content = content;
        this.tags = tags;
    }
}