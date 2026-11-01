
package com.suhani.resumeanalyzer.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.suhani.resumeanalyzer.model.RecentResume;
import com.suhani.resumeanalyzer.repository.RecentResumeRepository;

@Service
public class ResumeStorageService {

    private final RecentResumeRepository recentResumeRepository;
    private final Path storagePath;

    public ResumeStorageService(
            RecentResumeRepository recentResumeRepository,
            @Value("${app.resume-storage-dir}") String storageDirectory) {

        this.recentResumeRepository = recentResumeRepository;
        this.storagePath = Paths.get(storageDirectory)
                .toAbsolutePath()
                .normalize();
    }

    public RecentResume saveResume(
            MultipartFile file, String userEmail) throws IOException {

        Files.createDirectories(storagePath);

        String storedFileName = UUID.randomUUID() + ".pdf";
        Path destination = storagePath.resolve(storedFileName).normalize();

        if (!destination.startsWith(storagePath)) {
            throw new IOException("Invalid file location.");
        }

        Files.write(destination, file.getBytes());

        try {
            RecentResume resume = new RecentResume();
            resume.setUserEmail(userEmail);
            resume.setFileName(file.getOriginalFilename());
            resume.setStoredFileName(storedFileName);
            resume.setContentType("application/pdf");
            resume.setFileSize(file.getSize());
            resume.setUploadedAt(LocalDateTime.now());

            RecentResume savedResume =
                    recentResumeRepository.save(resume);

            // Keep only the latest 5 resumes for this user.
            List<RecentResume> resumes =
                    recentResumeRepository
                            .findByUserEmailOrderByUploadedAtDesc(userEmail);

            for (int i = 5; i < resumes.size(); i++) {
                deleteResumeFile(resumes.get(i));
                recentResumeRepository.delete(resumes.get(i));
            }

            return savedResume;

        } catch (Exception e) {
            Files.deleteIfExists(destination);
            throw e;
        }
    }

    public List<RecentResume> getRecentResumes(String userEmail) {
        return recentResumeRepository
                .findByUserEmailOrderByUploadedAtDesc(userEmail)
                .stream()
                .limit(5)
                .toList();
    }

    public RecentResume getResume(String id, String userEmail) {
        RecentResume resume = recentResumeRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Resume not found."));

        if (!resume.getUserEmail().equals(userEmail)) {
            throw new IllegalArgumentException("Resume not found.");
        }

        return resume;
    }

    public byte[] readResume(RecentResume resume) throws IOException {
        Path filePath = storagePath
                .resolve(resume.getStoredFileName())
                .normalize();

        if (!filePath.startsWith(storagePath)) {
            throw new IOException("Invalid file location.");
        }

        return Files.readAllBytes(filePath);
    }

    public void deleteResume(String id, String userEmail)
            throws IOException {

        RecentResume resume = getResume(id, userEmail);

        deleteResumeFile(resume);
        recentResumeRepository.delete(resume);
    }

    private void deleteResumeFile(RecentResume resume)
            throws IOException {

        Path filePath = storagePath
                .resolve(resume.getStoredFileName())
                .normalize();

        if (!filePath.startsWith(storagePath)) {
            throw new IOException("Invalid file location.");
        }

        Files.deleteIfExists(filePath);
    }
}
