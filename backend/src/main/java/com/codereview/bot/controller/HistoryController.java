// controller/HistoryController.java
package com.codereview.bot.controller;

import com.codereview.bot.model.ReviewHistory;
import com.codereview.bot.repository.ReviewHistoryRepository;
import com.codereview.bot.service.CodeReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/history")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class HistoryController {

    private final CodeReviewService reviewService;

    private final ReviewHistoryRepository reviewHistoryRepository;

    // ── Get all history ──
    @GetMapping
    public ResponseEntity<List<ReviewHistory>> getAll() {
        return ResponseEntity.ok(reviewService.getHistory());
    }

    // ── Get by ID ──
    @GetMapping("/{id}")
    public ResponseEntity<ReviewHistory> getById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                reviewService.getHistoryById(id)
        );
    }

    @DeleteMapping
    public ResponseEntity<Map<String, String>> clearAllHistory() {
        reviewHistoryRepository.deleteAll();
        return ResponseEntity.ok(
                Map.of("message", "All history cleared successfully")
        );
    }
}