package com.ci.controller;

import com.ci.dto.RetentionActionRequest;
import com.ci.model.RetentionAction;
import com.ci.service.RetentionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/retention")
@RequiredArgsConstructor
public class RetentionController {

    private final RetentionService retentionService;

    @PostMapping
    public ResponseEntity<com.ci.dto.RetentionActionResponse> createAction(@RequestBody RetentionActionRequest request) {
        RetentionAction saved = retentionService.createAction(request);
        return ResponseEntity.ok(retentionService.mapToResponse(saved));
    }

    @GetMapping({"/customer/{customerId}", "/{customerId}"})
    public ResponseEntity<List<com.ci.dto.RetentionActionResponse>> getActions(@PathVariable Long customerId) {
        return ResponseEntity.ok(retentionService.getByCustomerId(customerId));
    }
}
