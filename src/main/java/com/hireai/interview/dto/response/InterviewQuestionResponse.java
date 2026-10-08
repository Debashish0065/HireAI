package com.hireai.interview.dto.response;

import com.hireai.interview.enums.QuestionType;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewQuestionResponse {

    private Long id;

    private Integer questionNumber;

    private String question;

    private QuestionType questionType;

    private String candidateAnswer;

    private Integer score;

    private String feedback;
}