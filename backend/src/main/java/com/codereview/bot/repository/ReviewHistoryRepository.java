// repository/ReviewHistoryRepository.java
package com.codereview.bot.repository;

import com.codereview.bot.model.ReviewHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewHistoryRepository
        extends JpaRepository<ReviewHistory, Long> {

    List<ReviewHistory> findAllByOrderByReviewedAtDesc();
}