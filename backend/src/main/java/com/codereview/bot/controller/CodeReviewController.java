// controller/CodeReviewController.java
package com.codereview.bot.controller;

import com.codereview.bot.model.ReviewRequest;
import com.codereview.bot.model.ReviewResponse;
import com.codereview.bot.service.CodeReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CodeReviewController {

    private final CodeReviewService reviewService;

    // ── Main review endpoint ──
    @PostMapping("/review")
    public ResponseEntity<ReviewResponse> review(
            @Valid @RequestBody ReviewRequest request
    ) {
        log.info("Review request: {}", request.getFilename());
        ReviewResponse response = reviewService.review(request);
        return ResponseEntity.ok(response);
    }

    // ── Health check ──
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok(
                "{\"status\":\"running\",\"service\":\"java-backend\"}"
        );
    }

    // ── Quick test ──
    @GetMapping("/test")
    public ResponseEntity<ReviewResponse> test() {
        ReviewRequest request = new ReviewRequest();
        request.setCode(
                "public User getUser(String userId) {\n" +
                        "    String query = \"SELECT * FROM users WHERE id=\" + userId;\n" +
                        "    return db.executeQuery(query);\n" +
                        "}"
        );
        request.setLanguage("java");
        request.setFilename("UserService.java");
        return ResponseEntity.ok(reviewService.review(request));
    }
}