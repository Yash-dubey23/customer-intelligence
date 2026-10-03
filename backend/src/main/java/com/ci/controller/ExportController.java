package com.ci.controller;

import com.ci.dto.CustomerListResponse;
import com.ci.dto.CustomerResponse;
import com.ci.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.PrintWriter;
import java.io.StringWriter;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class ExportController {

    private final CustomerService customerService;

    @GetMapping(value = "/customers", produces = "text/csv")
    public ResponseEntity<String> exportCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String risk,
            @RequestParam(required = false) String contract,
            @RequestParam(required = false) Integer tenureMin,
            @RequestParam(required = false) Integer tenureMax,
            @RequestParam(required = false) Double probMin,
            @RequestParam(required = false) Double probMax) {

        // Fetch up to 10000 records for export
        CustomerListResponse response = customerService.list(search, risk, contract, tenureMin, tenureMax, probMin, probMax, PageRequest.of(0, 10000, Sort.by("id").descending()));
        
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        
        pw.println("CustomerCode,Contract,Tenure,MonthlyCharges,ActualChurn,RiskLevel,Probability");
        
        for (CustomerResponse c : response.getContent()) {
            String riskLevel = c.getLatestPrediction() != null ? c.getLatestPrediction().getRiskLevel() : "";
            Double prob = c.getLatestPrediction() != null ? c.getLatestPrediction().getProbability() : null;
            String probStr = prob != null ? String.valueOf(prob) : "";
            
            pw.printf("%s,%s,%d,%.2f,%s,%s,%s\n",
                    c.getCustomerCode(),
                    c.getContract(),
                    c.getTenure(),
                    c.getMonthlyCharges(),
                    c.getActualChurn(),
                    riskLevel,
                    probStr);
        }
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDispositionFormData("attachment", "customers_export.csv");
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(sw.toString());
    }
}
