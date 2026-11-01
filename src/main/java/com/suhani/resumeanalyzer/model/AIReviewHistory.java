
package com.suhani.resumeanalyzer.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "aiReviewHistory")
public class AIReviewHistory {

    @Id
    private String id;

    private String userEmail;
    private String fileName;
    private String aiReview;
    private LocalDateTime createdAt;

    public AIReviewHistory() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getAiReview() {
        return aiReview;
    }

    public void setAiReview(String aiReview) {
        this.aiReview = aiReview;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

