// model/BugItem.java
package com.codereview.bot.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class BugItem {
    private Integer line;
    private String  severity;
    private String  category;
    private String  description;
    private String  suggestion;

    @JsonProperty("original_code")
    private String  originalCode;   // ← ADD THIS

    @JsonProperty("fixed_code")
    private String  fixedCode;      // ← ADD THIS
}