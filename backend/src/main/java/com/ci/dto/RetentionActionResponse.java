package com.ci.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RetentionActionResponse {
    private Long id;
    private Long customerId;
    private String status;
    private String notes;
    private Long actedBy;
    private LocalDateTime actedAt;
}
