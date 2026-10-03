package com.ci.repository;

import com.ci.model.Prediction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, Long> {
    
    List<Prediction> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    
    @Query("SELECT p FROM Prediction p WHERE p.customer.id = :customerId ORDER BY p.createdAt DESC LIMIT 1")
    Optional<Prediction> findLatestByCustomerId(@Param("customerId") Long customerId);
    
    long countByRiskLevel(String riskLevel);
    
    Page<Prediction> findByRiskLevel(String riskLevel, Pageable pageable);
    
    Page<Prediction> findByCustomerId(Long customerId, Pageable pageable);
    
    @Query("SELECT p FROM Prediction p WHERE p.createdAt BETWEEN :startDate AND :endDate")
    Page<Prediction> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);
    
    @Query("SELECT COUNT(p) FROM Prediction p WHERE p.createdAt >= :startDate")
    long countPredictionsSince(@Param("startDate") LocalDateTime startDate);
    
    @Query(value = "SELECT CAST(created_at AS DATE) as pred_date, COUNT(*) as total_preds, " +
                   "SUM(CASE WHEN risk_level = 'HIGH' THEN 1 ELSE 0 END) as high_risk, " +
                   "SUM(CASE WHEN risk_level = 'MEDIUM' THEN 1 ELSE 0 END) as med_risk, " +
                   "SUM(CASE WHEN risk_level = 'LOW' THEN 1 ELSE 0 END) as low_risk " +
                   "FROM predictions GROUP BY CAST(created_at AS DATE) ORDER BY pred_date ASC LIMIT 30", nativeQuery = true)
    List<Object[]> getPredictionTrend();
    
    @Query("SELECT p.riskLevel, COUNT(p) FROM Prediction p GROUP BY p.riskLevel")
    List<Object[]> getRiskDistribution();
}
