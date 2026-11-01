
package com.suhani.resumeanalyzer;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class DatabaseTestController {

    private final MongoTemplate mongoTemplate;

    public DatabaseTestController(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @GetMapping("/api/database-test")
    public Map<String, String> testDatabase() {
        mongoTemplate.getDb().runCommand(
                new org.bson.Document("ping", 1)
        );

        return Map.of(
        "status", "success",
        "message", "Spring Boot is connected to MongoDB!",
        "database", mongoTemplate.getDb().getName()
);
    }
}

