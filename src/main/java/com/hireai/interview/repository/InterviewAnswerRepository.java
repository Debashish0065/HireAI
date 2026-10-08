package com.hireai.interview.repository;

import com.hireai.interview.entity.Interview;
import com.hireai.interview.entity.InterviewAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewAnswerRepository
        extends JpaRepository<InterviewAnswer, Long> {

    /**
     * Get all answers for an interview in creation order.
     */
    List<InterviewAnswer> findByInterviewOrderByCreatedAtAsc(
            Interview interview
    );

    /**
     * Find an existing answer for a specific interview question.
     *
     * The current InterviewAnswer entity stores the question text,
     * not a separate question ID, so this method cannot identify
     * a question by questionId yet.
     */
    Optional<InterviewAnswer> findByInterviewAndQuestion(
            Interview interview,
            String question
    );

    /**
     * Delete all answers belonging to an interview.
     */
    void deleteAllByInterview(
            Interview interview
    );
}