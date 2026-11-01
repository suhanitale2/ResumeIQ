package com.suhani.resumeanalyzer.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "interviewHistory")
public class InterviewHistory {

    @Id
    private String id;

    private String userEmail;
    private String resumeId;
    private String targetRole;
    private String question;
    private String answer;
    private String feedback;
    private LocalDateTime createdAt;

    public InterviewHistory() {
    }

    public InterviewHistory(
            String userEmail,
            String resumeId,
            String targetRole,
            String question,
            String answer,
            String feedback) {

        this.userEmail = userEmail;
        this.resumeId = resumeId;
        this.targetRole = targetRole;
        this.question = question;
        this.answer = answer;
        this.feedback = feedback;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public String getResumeId() {
        return resumeId;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public String getQuestion() {
        return question;
    }

    public String getAnswer() {
        return answer;
    }

    public String getFeedback() {
        return feedback;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
