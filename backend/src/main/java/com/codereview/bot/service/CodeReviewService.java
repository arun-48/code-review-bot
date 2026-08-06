// service/CodeReviewService.java
package com.codereview.bot.service;

import com.codereview.bot.model.*;
import com.codereview.bot.repository.ReviewHistoryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CodeReviewService {

    private final PythonApiClient         pythonApiClient;
    private final ReviewHistoryRepository historyRepository;
    private final ObjectMapper            objectMapper;

    public ReviewResponse review(ReviewRequest request) {
        log.info("Starting review for: {}", request.getFilename());

        if (!pythonApiClient.isHealthy()) {
            throw new RuntimeException(
                    "AI service is not running."
            );
        }

        ReviewResponse response = pythonApiClient
                .reviewCode(request);

        if (response == null) {
            throw new RuntimeException(
                    "Empty response from AI service"
            );
        }

        saveHistory(request, response);

        return response;
    }

    private void saveHistory(
            ReviewRequest  request,
            ReviewResponse response
    ) {
        try {
            ReviewHistory history = new ReviewHistory();
            history.setFilename(request.getFilename());
            history.setLanguage(request.getLanguage());
            history.setCode(request.getCode());
            history.setScore(response.getScore());
            history.setStatus(response.getStatus());
            history.setAiReview(response.getAiReview());
            history.setSummary(response.getSummary());
            history.setSecurityCount(
                    safeSize(response.getSecurity()));
            history.setBugCount(
                    safeSize(response.getBugs()));
            history.setStyleCount(
                    safeSize(response.getStyle()));
            history.setPerformanceCount(
                    safeSize(response.getPerformance()));

            // ← Save all issues as JSON
            List<BugItem> allIssues = new ArrayList<>();
            if (response.getSecurity() != null)
                allIssues.addAll(response.getSecurity());
            if (response.getBugs() != null)
                allIssues.addAll(response.getBugs());
            if (response.getPerformance() != null)
                allIssues.addAll(response.getPerformance());
            if (response.getStyle() != null)
                allIssues.addAll(response.getStyle());

            history.setIssuesJson(
                    objectMapper.writeValueAsString(allIssues)
            );

            historyRepository.save(history);
            log.info("Review saved to database with {} issues",
                    allIssues.size());

        } catch (Exception e) {
            log.error("Failed to save history: {}",
                    e.getMessage());
        }
    }

    private int safeSize(List<?> list) {
        return list != null ? list.size() : 0;
    }

    public List<ReviewHistory> getHistory() {
        return historyRepository
                .findAllByOrderByReviewedAtDesc();
    }

    public ReviewHistory getHistoryById(Long id) {
        return historyRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Review not found: " + id)
                );
    }
}