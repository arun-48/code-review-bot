// model/ReviewHistory.java
package com.codereview.bot.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "review_history")
public class ReviewHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String filename;
    private String language;
    private int    score;
    private String status;

    @Column(columnDefinition = "TEXT")
    private String code;

    @Column(columnDefinition = "TEXT")
    private String aiReview;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String issuesJson;   // ← ADD THIS

    private int securityCount;
    private int bugCount;
    private int styleCount;
    private int performanceCount;

    private LocalDateTime reviewedAt;

    @PrePersist
    public void prePersist() {
        reviewedAt = LocalDateTime.now();
    }
}