package com.ci.service;

import com.ci.exception.MlServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class MlServiceClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${app.ml.service.url}")
    private String mlServiceUrl;

    public Map<String, Object> getHealth() {
        try {
            return webClientBuilder.build()
                    .get()
                    .uri(mlServiceUrl + "/health")
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (Exception e) {
            throw new MlServiceException("Failed to get ML service health", e);
        }
    }

    public Map<String, Object> predict(Map<String, Object> requestBody) {
        try {
            return webClientBuilder.build()
                    .post()
                    .uri(mlServiceUrl + "/predict")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (Exception e) {
            throw new MlServiceException("Failed to get prediction from ML service", e);
        }
    }

    public Map<String, Object> getMetrics() {
        try {
            return webClientBuilder.build()
                    .get()
                    .uri(mlServiceUrl + "/metrics")
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (Exception e) {
            throw new MlServiceException("Failed to get ML service metrics", e);
        }
    }

    public Map<String, Object> getDataQuality() {
        try {
            return webClientBuilder.build()
                    .get()
                    .uri(mlServiceUrl + "/data-quality")
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (Exception e) {
            throw new MlServiceException("Failed to get ML service data quality", e);
        }
    }
}
