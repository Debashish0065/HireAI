package com.hireai.interview.dto.response;

import com.hireai.interview.enums.InterviewStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewResponse {

    private Long id;

    private Long jobId;

    private String jobTitle;

    private InterviewStatus status;

    private Integer totalQuestions;

    private Integer score;

    private String overallFeedback;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    private List<InterviewQuestionResponse> questions;
}