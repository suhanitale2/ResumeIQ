
package com.suhani.resumeanalyzer.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.suhani.resumeanalyzer.model.RecentResume;

public interface RecentResumeRepository
        extends MongoRepository<RecentResume, String> {

    List<RecentResume>
            findByUserEmailOrderByUploadedAtDesc(String userEmail);

    void deleteByUserEmail(String userEmail);
}

