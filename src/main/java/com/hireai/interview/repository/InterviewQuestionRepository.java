package com.hireai.interview.repository;

import com.hireai.interview.entity.Interview;
import com.hireai.interview.entity.InterviewQuestion;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewQuestionRepository
        extends JpaRepository<InterviewQuestion, Long> {

    // Get all questions of an interview
    List<InterviewQuestion> findByInterview(
            Interview interview
    );

    // Get questions ordered by question number
    List<InterviewQuestion> findByInterviewOrderByQuestionNumberAsc(
            Interview interview
    );

    // Find a specific question belonging to an interview
    java.util.Optional<InterviewQuestion> findByIdAndInterview(
            Long id,
            Interview interview
    );
}