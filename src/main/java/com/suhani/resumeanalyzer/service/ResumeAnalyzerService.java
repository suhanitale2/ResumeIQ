package com.suhani.resumeanalyzer.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

@Service
public class ResumeAnalyzerService {

    private final Map<String, List<String>> skillKeywords =
            new LinkedHashMap<>();

    public ResumeAnalyzerService() {
        skillKeywords.put("Java", Arrays.asList("java", "spring boot"));
        skillKeywords.put("Python", Arrays.asList("python"));
        skillKeywords.put("SQL", Arrays.asList("sql"));
        skillKeywords.put("MySQL", Arrays.asList("mysql"));
        skillKeywords.put("Excel", Arrays.asList("excel"));
        skillKeywords.put("Power BI", Arrays.asList("power bi"));
        skillKeywords.put("C++", Arrays.asList("c++"));
        skillKeywords.put("JavaScript", Arrays.asList("javascript"));
        skillKeywords.put("HTML", Arrays.asList("html"));
        skillKeywords.put("CSS", Arrays.asList("css"));
        skillKeywords.put("React", Arrays.asList("react"));
        skillKeywords.put("Git", Arrays.asList("git", "github"));
        skillKeywords.put("Pandas", Arrays.asList("pandas"));
        skillKeywords.put("NumPy", Arrays.asList("numpy"));
        skillKeywords.put("Machine Learning",
                Arrays.asList("machine learning"));
        skillKeywords.put("OpenCV", Arrays.asList("opencv"));
        skillKeywords.put("MongoDB", Arrays.asList("mongodb"));
        skillKeywords.put("Docker", Arrays.asList("docker"));
    }

    // Checks for a keyword without matching it inside another word.
    private boolean containsKeyword(String text, String keyword) {
        String regex = "(?<![a-z0-9])"
                + Pattern.quote(keyword.toLowerCase(Locale.ROOT))
                + "(?![a-z0-9])";

        return Pattern.compile(regex).matcher(text).find();
    }

    public Map<String, Object> analyzeResume(String resumeText) {

        String text = resumeText.toLowerCase(Locale.ROOT);

        List<String> detectedSkills = new ArrayList<>();

        for (Map.Entry<String, List<String>> entry
                : skillKeywords.entrySet()) {

            for (String keyword : entry.getValue()) {
                if (containsKeyword(text, keyword)) {
                    detectedSkills.add(entry.getKey());
                    break;
                }
            }
        }

        Map<String, Boolean> sections = new LinkedHashMap<>();

        sections.put("Summary",
                text.contains("summary")
                        || text.contains("objective"));

        sections.put("Technical Skills",
                text.contains("technical skills")
                        || text.contains("skills"));

        sections.put("Experience",
                text.contains("experience")
                        || text.contains("internship"));

        sections.put("Projects", text.contains("projects"));

        sections.put("Education", text.contains("education"));

        List<String> missingSections = new ArrayList<>();

        for (Map.Entry<String, Boolean> entry
                : sections.entrySet()) {

            if (!entry.getValue()) {
                missingSections.add(entry.getKey());
            }
        }

        List<String> suggestions = new ArrayList<>();

        // Suggestions for missing sections
        if (!sections.get("Summary")) {
            suggestions.add(
                    "Add a short professional summary highlighting "
                    + "your skills and career goals.");
        }

        if (!sections.get("Technical Skills")) {
            suggestions.add(
                    "Add a Technical Skills section with relevant "
                    + "programming languages, tools, and technologies.");
        }

        if (!sections.get("Experience")) {
            suggestions.add(
                    "If applicable, include internships, work experience, "
                    + "or relevant practical training.");
        }

        if (!sections.get("Projects")) {
            suggestions.add(
                    "Add relevant projects describing your role, "
                    + "technologies used, and results.");
        }

        if (!sections.get("Education")) {
            suggestions.add(
                    "Include your degree, college, and graduation year.");
        }

        // Suggestions based on detected skills
        if (detectedSkills.isEmpty()) {
            suggestions.add(
                    "No listed technical skills were detected. "
                    + "Add relevant skills using their standard names.");
        } else if (detectedSkills.size() < 5) {
            suggestions.add(
                    "Review the job description and add any relevant "
                    + "skills you genuinely possess but have not listed.");
        } else {
            suggestions.add(
                    "Prioritize the skills most relevant to your target "
                    + "job and support them with project examples.");
        }

        // Suggestions based on available resume sections
        if (sections.get("Experience")) {
            suggestions.add(
                    "Strengthen your experience details with specific "
                    + "contributions and measurable results where possible.");
        }

        if (sections.get("Projects")) {
            suggestions.add(
                    "For each project, explain the problem, your contribution, "
                    + "technologies used, and outcome.");
        }

        if (sections.get("Summary")) {
            suggestions.add(
                    "Keep your summary concise and tailor it to the "
                    + "role you are applying for.");
        }
        // Calculate a basic resume score out of 100

        // Calculate resume score components

        int sectionScore = 0;

        // Each detected section contributes 10 points
        for (Boolean found : sections.values()) {
            if (Boolean.TRUE.equals(found)) {
                sectionScore += 10;
            }
        }

        // Skills score: maximum 30 points
        int skillsScore =
                Math.min(detectedSkills.size() * 5, 30);

        // Count words in the extracted resume text
        int wordCount = text.trim().isEmpty()
                ? 0
                : text.trim().split("\\s+").length;

        // Content length score: maximum 20 points
        int lengthScore = 0;

        if (wordCount >= 300) {
            lengthScore = 20;
        } else if (wordCount >= 150) {
            lengthScore = 10;
        } else if (wordCount >= 75) {
            lengthScore = 5;
        }

        // Total score out of 100
        int resumeScore =
                sectionScore + skillsScore + lengthScore;


        Map<String, Object> result = new LinkedHashMap<>();

        result.put("detectedSkills", detectedSkills);
        result.put("skillCount", detectedSkills.size());
        result.put("resumeScore", resumeScore);
        result.put("sectionScore", sectionScore);
        result.put("skillsScore", skillsScore);
        result.put("lengthScore", lengthScore);
        result.put("wordCount", wordCount);
        result.put("sections", sections);
        result.put("missingSections", missingSections);
        result.put("suggestions", suggestions);

        return result;
    }
    
public Map<String, Object> analyzeJobMatch(
        String resumeText, String jobDescription) {

    List<String> jobSkills = new ArrayList<>();
    List<String> matchedSkills = new ArrayList<>();
    List<String> missingSkills = new ArrayList<>();

    String resume = resumeText.toLowerCase(Locale.ROOT);
    String job = jobDescription.toLowerCase(Locale.ROOT);

    for (Map.Entry<String, List<String>> entry : skillKeywords.entrySet()) {

        boolean requiredInJob = false;

        for (String keyword : entry.getValue()) {
            if (containsKeyword(job, keyword)) {
                requiredInJob = true;
                break;
            }
        }

        if (requiredInJob) {
            jobSkills.add(entry.getKey());

            boolean foundInResume = false;

            for (String keyword : entry.getValue()) {
                if (containsKeyword(resume, keyword)) {
                    foundInResume = true;
                    break;
                }
            }

            if (foundInResume) {
                matchedSkills.add(entry.getKey());
            } else {
                missingSkills.add(entry.getKey());
            }
        }
    }

    int matchPercentage = jobSkills.isEmpty()
            ? 0
            : (int) Math.round(
                    matchedSkills.size() * 100.0 / jobSkills.size()
              );

    Map<String, Object> matchResult = new LinkedHashMap<>();

    matchResult.put("jobSkills", jobSkills);
    matchResult.put("matchedSkills", matchedSkills);
    matchResult.put("missingSkills", missingSkills);
    matchResult.put("jobMatchPercentage", matchPercentage);

    return matchResult;
}

}