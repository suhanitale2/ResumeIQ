
package com.suhani.resumeanalyzer.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.suhani.resumeanalyzer.model.CareerCoachHistory;

public interface CareerCoachHistoryRepository
        extends MongoRepository<CareerCoachHistory, String> {

    List<CareerCoachHistory>
            findByUserEmailOrderByCreatedAtDesc(String userEmail);
}
