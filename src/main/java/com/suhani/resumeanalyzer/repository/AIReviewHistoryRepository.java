
package com.suhani.resumeanalyzer.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.suhani.resumeanalyzer.model.AIReviewHistory;

public interface AIReviewHistoryRepository
        extends MongoRepository<AIReviewHistory, String> {

    List<AIReviewHistory>
            findByUserEmailOrderByCreatedAtDesc(String userEmail);
}
