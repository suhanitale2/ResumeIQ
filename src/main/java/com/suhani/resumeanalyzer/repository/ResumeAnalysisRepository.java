
package com.suhani.resumeanalyzer.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.suhani.resumeanalyzer.model.ResumeAnalysis;

public interface ResumeAnalysisRepository
        extends MongoRepository<ResumeAnalysis, String> {

    List<ResumeAnalysis> findByUserEmailOrderByAnalyzedAtDesc(
            String userEmail);

    long countByUserEmail(String userEmail);
}

