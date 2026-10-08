
package com.hireai.file.entity;

import com.hireai.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "files",
        indexes = {
                @Index(name = "idx_files_user_id", columnList = "user_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "original_file_name",
            nullable = false,
            length = 255
    )
    private String originalFileName;

    @Column(
            name = "stored_file_name",
            nullable = false,
            length = 255,
            unique = true
    )
    private String storedFileName;

    @Column(
            name = "file_path",
            nullable = false,
            length = 1000
    )
    private String filePath;

    @Column(
            name = "content_type",
            nullable = false,
            length = 100
    )
    private String contentType;

    @Column(
            name = "file_size",
            nullable = false
    )
    private Long fileSize;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_files_user")
    )
    private User user;

    @Column(
            name = "uploaded_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        if (uploadedAt == null) {
            uploadedAt = LocalDateTime.now();
        }
    }
}