// service/PythonApiClient.java
package com.codereview.bot.service;

import com.codereview.bot.model.ReviewRequest;
import com.codereview.bot.model.ReviewResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import java.time.Duration;

@Slf4j
@Service
public class PythonApiClient {

    private final WebClient webClient;

    public PythonApiClient(WebClient.Builder builder) {
        this.webClient = builder
                .baseUrl("http://localhost:5000")
                .build();
    }

    public ReviewResponse reviewCode(ReviewRequest request) {
        log.info("Calling Python API: {}", request.getFilename());
        try {
            ReviewResponse response = webClient
                    .post()
                    .uri("/review")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(ReviewResponse.class)
                    .timeout(Duration.ofSeconds(60))
                    .block();

            log.info("Score: {}",
                    response != null ? response.getScore() : "null");
            return response;

        } catch (WebClientResponseException e) {
            log.error("Python API error: {} - {}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("AI service error: " + e.getMessage());
        } catch (Exception e) {
            log.error("Failed to call Python API: {}", e.getMessage());
            throw new RuntimeException(
                    "AI service unavailable. Ensure Python server is running."
            );
        }
    }

    public boolean isHealthy() {
        try {
            String health = webClient
                    .get()
                    .uri("/health")
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(5))
                    .block();
            return health != null && health.contains("running");
        } catch (Exception e) {
            return false;
        }
    }
}