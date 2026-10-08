
package com.hireai.file.repository;

import com.hireai.file.entity.FileMetadata;
import com.hireai.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileMetadataRepository extends JpaRepository<FileMetadata, Long> {

    /**
     * Returns all files belonging to a user,
     * newest upload first.
     */
    List<FileMetadata> findByUserOrderByUploadedAtDesc(User user);

    /**
     * Finds a specific file only when it belongs to the given user.
     */
    Optional<FileMetadata> findByIdAndUser(
            Long id,
            User user
    );

    /**
     * Returns the most recently uploaded file for a user.
     *
     * This is useful because HireAI currently treats the uploaded
     * resume as the candidate's active resume.
     */
    Optional<FileMetadata> findFirstByUserOrderByUploadedAtDesc(
            User user
    );

    /**
     * Finds a stored file using its generated storage filename.
     */
    Optional<FileMetadata> findByStoredFileName(
            String storedFileName
    );
}