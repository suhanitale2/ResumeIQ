
package com.suhani.resumeanalyzer.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.suhani.resumeanalyzer.model.InterviewHistory;

public interface InterviewHistoryRepository
        extends MongoRepository<InterviewHistory, String> {

    List<InterviewHistory> findByUserEmailOrderByCreatedAtDesc(
            String userEmail);
}

