// model/ReviewResponse.java
package com.codereview.bot.model;

import lombok.Data;
import java.util.List;

@Data
public class ReviewResponse {
    private String        filename;
    private String        language;
    private int           score;
    private String        aiReview;
    private List<BugItem> bugs;
    private List<BugItem> security;
    private List<BugItem> style;
    private List<BugItem> performance;
    private String        summary;
    private String        status;
    private String        diff;
}