
package com.suhani.resumeanalyzer.controller;

import java.io.IOException;
import java.util.Locale;
import java.util.Map;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.encryption.InvalidPasswordException;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.suhani.resumeanalyzer.service.ResumeAnalyzerService;
import org.springframework.http.HttpStatus;
import com.suhani.resumeanalyzer.service.GeminiService;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.suhani.resumeanalyzer.model.ResumeAnalysis;
import com.suhani.resumeanalyzer.repository.ResumeAnalysisRepository;
import com.suhani.resumeanalyzer.model.CareerCoachHistory;
import com.suhani.resumeanalyzer.model.RecentResume;
import com.suhani.resumeanalyzer.repository.CareerCoachHistoryRepository;
import com.suhani.resumeanalyzer.model.AIReviewHistory;
import com.suhani.resumeanalyzer.repository.AIReviewHistoryRepository;
import com.suhani.resumeanalyzer.service.ResumeStorageService;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    private static final int MAX_JOB_DESCRIPTION_LENGTH = 20000;

    private final ResumeAnalyzerService analyzerService;
    private final GeminiService geminiService;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final CareerCoachHistoryRepository careerCoachHistoryRepository;
    private final AIReviewHistoryRepository aiReviewHistoryRepository;
    private final ResumeStorageService resumeStorageService;


public ResumeController(
        ResumeAnalyzerService analyzerService,
        GeminiService geminiService,
        ResumeAnalysisRepository resumeAnalysisRepository,
        CareerCoachHistoryRepository careerCoachHistoryRepository,
        AIReviewHistoryRepository aiReviewHistoryRepository,
        ResumeStorageService resumeStorageService) {

    this.analyzerService = analyzerService;
    this.geminiService = geminiService;
    this.resumeAnalysisRepository = resumeAnalysisRepository;
    this.careerCoachHistoryRepository = careerCoachHistoryRepository;
    this.aiReviewHistoryRepository = aiReviewHistoryRepository;
    this.resumeStorageService = resumeStorageService;
}

@GetMapping("/history")
public ResponseEntity<?> getResumeHistory(
        Authentication authentication) {

    if (authentication == null
            || !authentication.isAuthenticated()) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Please log in to view your history.");
    }

    String userEmail = authentication.getName();

    List<ResumeAnalysis> history =
            resumeAnalysisRepository
                    .findByUserEmailOrderByAnalyzedAtDesc(userEmail);

    return ResponseEntity.ok(history);
}
    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "jobDescription", required = false)
            String jobDescription) {

        // 1. Check whether a file was selected
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("Please select a resume file.");
        }

        // 2. Check the file name and extension
        String fileName = file.getOriginalFilename();

        if (fileName == null
                || !fileName.toLowerCase(Locale.ROOT).endsWith(".pdf")) {
            return ResponseEntity.badRequest()
                    .body("Please upload a PDF file for now.");
        }

        // 3. Limit the uploaded file size to 5 MB
        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest()
                    .body("File is too large. Please upload a PDF under 5 MB.");
        }

        // 4. Limit the optional job description length
        if (jobDescription != null
                && jobDescription.length() > MAX_JOB_DESCRIPTION_LENGTH) {
            return ResponseEntity.badRequest()
                    .body("Job description is too long. Please shorten it.");
        }

        try (PDDocument document = Loader.loadPDF(file.getBytes())) {

            // 5. Extract text from the PDF
            PDFTextStripper stripper = new PDFTextStripper();
            String extractedText = stripper.getText(document);

            if (extractedText == null || extractedText.isBlank()) {
                return ResponseEntity.badRequest()
                        .body("No readable text found in the PDF. "
                                + "Scanned PDFs may require OCR.");
            }

            // 6. Analyze the resume
            Map<String, Object> analysis =
                    analyzerService.analyzeResume(extractedText);

            // 7. Analyze job description when provided
            if (jobDescription != null && !jobDescription.isBlank()) {
                Map<String, Object> jobMatch =
                        analyzerService.analyzeJobMatch(
                                extractedText, jobDescription);

                analysis.putAll(jobMatch);
            }

            
            // 8. Add file information to the response
            analysis.put("fileName", fileName);
            analysis.put("extractedText", extractedText);

            // 9. Get the authenticated user's identity
            Authentication authentication =
                    org.springframework.security.core.context
                            .SecurityContextHolder.getContext()
                            .getAuthentication();

            if (authentication == null
                    || !authentication.isAuthenticated()
                    || authentication.getPrincipal() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Please log in to analyze a resume.");
            }

            String userEmail = authentication.getName();
            // Save the uploaded PDF in the user's private recent-resume storage.
            resumeStorageService.saveResume(file, userEmail);  

            // 10. Save the analysis summary to MongoDB
            ResumeAnalysis savedAnalysis = new ResumeAnalysis();

            savedAnalysis.setUserEmail(userEmail);
            savedAnalysis.setFileName(fileName);
            savedAnalysis.setAnalyzedAt(LocalDateTime.now());

            savedAnalysis.setResumeScore(
                    ((Number) analysis.get("resumeScore")).intValue());

            savedAnalysis.setSectionScore(
                    ((Number) analysis.get("sectionScore")).intValue());

            savedAnalysis.setSkillsScore(
                    ((Number) analysis.get("skillsScore")).intValue());

            savedAnalysis.setLengthScore(
                    ((Number) analysis.get("lengthScore")).intValue());

            savedAnalysis.setSkillCount(
                    ((Number) analysis.get("skillCount")).intValue());

            savedAnalysis.setWordCount(
                    ((Number) analysis.get("wordCount")).intValue());

            @SuppressWarnings("unchecked")
            List<String> detectedSkills =
                    (List<String>) analysis.get("detectedSkills");

            savedAnalysis.setDetectedSkills(
                    detectedSkills == null
                            ? new java.util.ArrayList<>()
                            : new java.util.ArrayList<>(detectedSkills));

            resumeAnalysisRepository.save(savedAnalysis);

            return ResponseEntity.ok(analysis);


        } catch (InvalidPasswordException e) {
            return ResponseEntity.badRequest()
                    .body("This PDF is password-protected. "
                            + "Please upload an unlocked PDF.");

        } catch (IOException e) {
            return ResponseEntity.badRequest()
                    .body("Could not read the PDF. "
                            + "Please upload a valid, readable PDF.");
        }
    }
    

@PostMapping("/ai-review")
public ResponseEntity<?> reviewResumeWithAI(
        @RequestParam("file") MultipartFile file,
        Authentication authentication) {

    // 1. Check login session
    if (authentication == null
            || !authentication.isAuthenticated()
            || authentication.getPrincipal() == null
            || "anonymousUser".equals(authentication.getPrincipal())) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Please log in to use AI Review."));
    }

    // 2. Validate the PDF
    if (file == null || file.isEmpty()) {
        return ResponseEntity.badRequest()
                .body(Map.of("message", "Please select a resume file."));
    }

    String fileName = file.getOriginalFilename();

    if (fileName == null
            || !fileName.toLowerCase(Locale.ROOT).endsWith(".pdf")) {
        return ResponseEntity.badRequest()
                .body(Map.of("message", "Please upload a PDF file."));
    }

    if (file.getSize() > MAX_FILE_SIZE) {
        return ResponseEntity.badRequest()
                .body(Map.of("message", "Please upload a PDF under 5 MB."));
    }

    try (PDDocument document = Loader.loadPDF(file.getBytes())) {

        PDFTextStripper stripper = new PDFTextStripper();
        String extractedText = stripper.getText(document);

        if (extractedText == null || extractedText.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "No readable text found in the PDF."));
        }

        // 3. Generate the AI review
        String aiReview = geminiService.reviewResume(extractedText);

        // 4. Save the review for the logged-in user
        AIReviewHistory history = new AIReviewHistory();
        history.setUserEmail(authentication.getName());
        history.setFileName(fileName);
        history.setAiReview(aiReview);
        history.setCreatedAt(LocalDateTime.now());

        aiReviewHistoryRepository.save(history);

        // 5. Return the same response format used by the frontend
        return ResponseEntity.ok(Map.of("aiReview", aiReview));

    } catch (IOException e) {
        return ResponseEntity.badRequest()
                .body(Map.of("message",
                        "Could not read the PDF. Please upload a valid PDF."));

    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(Map.of("message",
                        "AI review failed. Please check the API key, "
                                + "internet connection, model availability, "
                                + "and API quota."));
    }
}

@PostMapping("/career-coach")
public ResponseEntity<?> generateCareerCoachPlan(
        @RequestParam("file") MultipartFile file,
        @RequestParam("targetRole") String targetRole,
        @RequestParam(value = "jobDescription", required = false)
        String jobDescription,
        @RequestParam(value = "focusArea", required = false)
        String focusArea,
        Authentication authentication) {

    // 1. Require an authenticated user
    if (authentication == null
            || !authentication.isAuthenticated()
            || authentication.getPrincipal() == null
            || "anonymousUser".equals(authentication.getPrincipal())) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                        "message",
                        "Please log in to use the AI Career Coach."));
    }

    // 2. Validate the target role
    if (targetRole == null || targetRole.isBlank()) {
        return ResponseEntity.badRequest()
                .body(Map.of(
                        "message",
                        "Please enter your target job role."));
    }

    if (targetRole.trim().length() > 120) {
        return ResponseEntity.badRequest()
                .body(Map.of(
                        "message",
                        "Target job role must be 120 characters or fewer."));
    }

    // 3. Validate the optional job description
    if (jobDescription != null
            && jobDescription.length() > 12000) {
        return ResponseEntity.badRequest()
                .body(Map.of(
                        "message",
                        "Job description must be 12000 characters or fewer."));
    }

    // 4. Validate the uploaded resume
    if (file == null || file.isEmpty()) {
        return ResponseEntity.badRequest()
                .body(Map.of(
                        "message",
                        "Please select your resume PDF first."));
    }

    String fileName = file.getOriginalFilename();

    if (fileName == null
            || !fileName.toLowerCase(Locale.ROOT).endsWith(".pdf")) {
        return ResponseEntity.badRequest()
                .body(Map.of(
                        "message",
                        "Please upload a PDF file."));
    }

    if (file.getSize() > MAX_FILE_SIZE) {
        return ResponseEntity.badRequest()
                .body(Map.of(
                        "message",
                        "Please upload a PDF under 5 MB."));
    }

    // 5. Extract resume text and generate the career plan
    try (PDDocument document = Loader.loadPDF(file.getBytes())) {

        PDFTextStripper stripper = new PDFTextStripper();
        String extractedText = stripper.getText(document);

        if (extractedText == null || extractedText.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "No readable text found in the PDF. "
                            + "Scanned PDFs may require OCR."));
        }

       String careerPlan = geminiService.generateCareerPlan(
        extractedText,
        targetRole.trim(),
        jobDescription,
        focusArea);

// Save the generated career plan for the logged-in user.
CareerCoachHistory history = new CareerCoachHistory();

history.setUserEmail(authentication.getName());
history.setFileName(fileName);
history.setTargetRole(targetRole.trim());
history.setFocusArea(
        focusArea == null || focusArea.isBlank()
                ? "complete-plan"
                : focusArea.trim());
history.setJobDescription(
        jobDescription == null ? "" : jobDescription);
history.setCareerPlan(careerPlan);
history.setCreatedAt(LocalDateTime.now());

careerCoachHistoryRepository.save(history);

return ResponseEntity.ok(
        Map.of("careerCoach", careerPlan));

    } catch (InvalidPasswordException e) {
        return ResponseEntity.badRequest()
                .body(Map.of(
                        "message",
                        "This PDF is password-protected. "
                        + "Please upload an unlocked PDF."));

    } catch (IOException e) {
        return ResponseEntity.badRequest()
                .body(Map.of(
                        "message",
                        "Could not read the PDF. "
                        + "Please upload a valid PDF."));

    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(Map.of(
                        "message",
                        "Career Coach could not generate a plan. "
                        + "Check the Gemini API key, internet connection, "
                        + "model availability, and API quota."));
    }
}

@GetMapping("/ai-review/history")
public ResponseEntity<?> getAIReviewHistory(
        Authentication authentication) {

    if (authentication == null
            || !authentication.isAuthenticated()
            || authentication.getPrincipal() == null
            || "anonymousUser".equals(authentication.getPrincipal())) {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                        "message",
                        "Please log in to view your AI Review history."));
    }

    List<AIReviewHistory> history =
            aiReviewHistoryRepository
                    .findByUserEmailOrderByCreatedAtDesc(
                            authentication.getName());

    return ResponseEntity.ok(history);
}

@GetMapping("/career-coach/history")
public ResponseEntity<?> getCareerCoachHistory(
        Authentication authentication) {

    if (authentication == null
            || !authentication.isAuthenticated()
            || authentication.getPrincipal() == null
            || "anonymousUser".equals(
                    authentication.getPrincipal())) {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                        "message",
                        "Please log in to view your career plans."));
    }

    List<CareerCoachHistory> history =
            careerCoachHistoryRepository
                    .findByUserEmailOrderByCreatedAtDesc(
                            authentication.getName());

    return ResponseEntity.ok(history);
}
@GetMapping("/recent")
public ResponseEntity<?> getRecentResumes(
        Authentication authentication) {

    // Check whether the user is logged in.
    if (authentication == null
            || !authentication.isAuthenticated()
            || authentication.getPrincipal() == null
            || "anonymousUser".equals(authentication.getPrincipal())) {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Please log in to view your resumes."));
    }

    // Fetch only this user's recent resumes.
    List<RecentResume> resumes =
            resumeStorageService.getRecentResumes(authentication.getName());

    // Return only safe details, not the private storage filename.
    List<Map<String, Object>> response = resumes.stream()
            .map(resume -> Map.<String, Object>of(
                    "id", resume.getId(),
                    "fileName", resume.getFileName(),
                    "fileSize", resume.getFileSize(),
                    "uploadedAt", resume.getUploadedAt()
            ))
            .toList();

    return ResponseEntity.ok(response);
}
@GetMapping("/recent/{id}/download")
public ResponseEntity<?> downloadRecentResume(
        @PathVariable String id,
        Authentication authentication) {

    if (authentication == null
            || !authentication.isAuthenticated()
            || authentication.getPrincipal() == null
            || "anonymousUser".equals(authentication.getPrincipal())) {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Please log in to download your resume."));
    }

    try {
        RecentResume resume = resumeStorageService.getResume(
                id, authentication.getName());

        byte[] pdfData = resumeStorageService.readResume(resume);

        String safeFileName = resume.getFileName()
                .replace("\"", "")
                .replace("\r", "")
                .replace("\n", "");

        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .header(
                        org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + safeFileName + "\"")
                .body(pdfData);

    } catch (IllegalArgumentException e) {
        return ResponseEntity.notFound().build();

    } catch (IOException e) {
        return ResponseEntity.internalServerError()
                .body(Map.of("message", "Could not download the resume."));
    }
}
@DeleteMapping("/recent/{id}")
public ResponseEntity<?> deleteRecentResume(
        @PathVariable String id,
        Authentication authentication) {

    if (authentication == null
            || !authentication.isAuthenticated()
            || authentication.getPrincipal() == null
            || "anonymousUser".equals(authentication.getPrincipal())) {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Please log in to delete your resume."));
    }

    try {
        resumeStorageService.deleteResume(id, authentication.getName());

        return ResponseEntity.ok(
                Map.of("message", "Resume deleted successfully."));

    } catch (IllegalArgumentException e) {
        return ResponseEntity.notFound().build();

    } catch (IOException e) {
        return ResponseEntity.internalServerError()
                .body(Map.of("message", "Could not delete the resume."));
    }
}
}
