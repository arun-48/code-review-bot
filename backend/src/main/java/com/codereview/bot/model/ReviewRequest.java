// model/ReviewRequest.java
package com.codereview.bot.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReviewRequest {

    @NotBlank(message = "Code cannot be empty")
    private String code;

    private String language = "java";
    private String filename = "code.java";
    private String context;
}