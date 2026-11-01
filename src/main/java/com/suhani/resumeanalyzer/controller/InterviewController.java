
package com.suhani.resumeanalyzer.controller;

import java.io.IOException;
import java.util.Map;
import java.util.List;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.suhani.resumeanalyzer.model.RecentResume;
import com.suhani.resumeanalyzer.model.InterviewHistory;
import com.suhani.resumeanalyzer.repository.InterviewHistoryRepository;
import com.suhani.resumeanalyzer.service.GeminiService;
import com.suhani.resumeanalyzer.service.ResumeStorageService;

@RestController
@RequestMapping("/api/interview")
public class InterviewController {

    private final GeminiService geminiService;
    private final ResumeStorageService resumeStorageService;
    private final InterviewHistoryRepository interviewHistoryRepository;

    public InterviewController(
            GeminiService geminiService,
            ResumeStorageService resumeStorageService,
            InterviewHistoryRepository interviewHistoryRepository) {

        this.geminiService = geminiService;
        this.resumeStorageService = resumeStorageService;
        this.interviewHistoryRepository = interviewHistoryRepository;
    }

    // Generate the first or next interview question.
    @PostMapping("/question")
    public ResponseEntity<?> generateQuestion(
            @RequestParam String resumeId,
            @RequestParam String targetRole,
            @RequestParam(required = false) String previousQuestions,
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getPrincipal() == null
                || "anonymousUser".equals(authentication.getPrincipal())) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Please log in first."));
        }

        if (resumeId == null || resumeId.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Please select a saved resume."));
        }

        if (targetRole == null || targetRole.isBlank()
                || targetRole.trim().length() > 120) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Enter a valid target job role."));
        }

        if (previousQuestions != null
                && previousQuestions.length() > 10000) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Interview history is too long."));
        }

        try {
            RecentResume resume = resumeStorageService.getResume(
                    resumeId, authentication.getName());

            byte[] pdfData = resumeStorageService.readResume(resume);

            try (PDDocument document = Loader.loadPDF(pdfData)) {

                String resumeText =
                        new PDFTextStripper().getText(document);

                if (resumeText == null || resumeText.isBlank()) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message",
                                    "No readable text found in this PDF."));
                }

                String question =
                        geminiService.generateInterviewQuestion(
                                resumeText,
                                targetRole.trim(),
                                previousQuestions);

                return ResponseEntity.ok(
                        Map.of("question", question));
            }

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Saved resume not found."));

        } catch (IOException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Could not read the resume PDF."));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("message",
                            "Could not generate an interview question. "
                                    + "Check Gemini API configuration and quota."));
        }
    }

    // Evaluate the candidate's submitted answer.
    @PostMapping("/evaluate")
    public ResponseEntity<?> evaluateAnswer(
            @RequestParam String resumeId,
            @RequestParam String question,
            @RequestParam String answer,
            @RequestParam String targetRole,
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getPrincipal() == null
                || "anonymousUser".equals(authentication.getPrincipal())) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Please log in first."));
        }

        if (resumeId == null || resumeId.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Please select a saved resume."));
        }

        if (question == null || question.isBlank()
                || question.length() > 3000) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Please provide a valid question."));
        }

        if (answer == null || answer.isBlank()
                || answer.length() > 8000) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Please provide a valid answer."));
        }

        if (targetRole == null || targetRole.isBlank()
                || targetRole.trim().length() > 120) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Please provide a valid target role."));
        }

        try {
            // Confirm that this saved resume belongs to the logged-in user.
            resumeStorageService.getResume(
                    resumeId, authentication.getName());

            String feedback =
                    geminiService.evaluateInterviewAnswer(
                            question, answer, targetRole.trim());

            InterviewHistory history = new InterviewHistory(
                    authentication.getName(),
                    resumeId,
                    targetRole.trim(),
                    question,
                    answer,
                    feedback
            );

            interviewHistoryRepository.save(history);

            return ResponseEntity.ok(
                    Map.of(
                            "feedback", feedback,
                            "historyId", history.getId()
                    ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Saved resume not found."));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("message",
                            "Could not evaluate your answer. "
                                    + "Please check Gemini API configuration and quota."));
        }
    }

    // Get interview history of the logged-in user.
    @GetMapping("/history")
    public ResponseEntity<?> getInterviewHistory(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getPrincipal() == null
                || "anonymousUser".equals(authentication.getPrincipal())) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Please log in first."));
        }

        List<InterviewHistory> history =
                interviewHistoryRepository
                        .findByUserEmailOrderByCreatedAtDesc(
                                authentication.getName());

        return ResponseEntity.ok(history);
    }
}
