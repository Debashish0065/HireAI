package com.hireai.interview.entity;

import com.hireai.interview.enums.QuestionType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interview_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // INTERVIEW
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "interview_id",
            nullable = false
    )
    private Interview interview;

    // =========================================================
    // QUESTION
    // =========================================================

    /**
     * AI-generated interview question.
     */
    @Column(
            nullable = false,
            length = 2000
    )
    private String question;

    // =========================================================
    // QUESTION TYPE
    // =========================================================

    /**
     * Technical / Behavioral / HR / Situational
     */
    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private QuestionType questionType;

    // =========================================================
    // CANDIDATE ANSWER
    // =========================================================

    /**
     * Candidate's answer.
     * Nullable because the question exists before the
     * candidate submits an answer.
     */
    @Column(length = 5000)
    private String candidateAnswer;

    // =========================================================
    // AI SCORE
    // =========================================================

    /**
     * Nullable until the answer has been evaluated.
     */
    private Integer score;

    // =========================================================
    // AI FEEDBACK
    // =========================================================

    @Column(length = 3000)
    private String feedback;

    // =========================================================
    // QUESTION ORDER
    // =========================================================

    @Column(nullable = false)
    private Integer questionNumber;
}