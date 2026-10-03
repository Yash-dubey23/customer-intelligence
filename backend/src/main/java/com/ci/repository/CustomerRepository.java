package com.ci.repository;

import com.ci.model.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    Page<Customer> findByCustomerCodeContainingIgnoreCase(String customerCode, Pageable pageable);
    
    @Query("SELECT c FROM Customer c WHERE c.customerCode LIKE %:search% OR c.actualChurn LIKE %:search%")
    Page<Customer> searchCustomers(@Param("search") String search, Pageable pageable);

    @Query(value = "SELECT c.* FROM customers c JOIN predictions p ON c.id = p.customer_id " +
                   "WHERE p.id = (SELECT MAX(id) FROM predictions WHERE customer_id = c.id) " +
                   "AND p.risk_level = :riskLevel", nativeQuery = true)
    Page<Customer> findByRiskLevel(@Param("riskLevel") String riskLevel, Pageable pageable);

    long countByActualChurn(String actualChurn);
    
    @Query(value = "SELECT COUNT(*) FROM customers c JOIN predictions p ON c.id = p.customer_id " +
                   "WHERE p.id = (SELECT MAX(id) FROM predictions WHERE customer_id = c.id) " +
                   "AND p.risk_level IN ('MEDIUM', 'HIGH')", nativeQuery = true)
    long countAtRiskCustomers();
    
    @Query(value = "SELECT COUNT(*) FROM customers c JOIN predictions p ON c.id = p.customer_id " +
                   "WHERE p.id = (SELECT MAX(id) FROM predictions WHERE customer_id = c.id) " +
                   "AND p.risk_level = 'HIGH'", nativeQuery = true)
    long countHighRiskCustomers();

    @Query(value = "SELECT AVG(p.probability) FROM predictions p " +
                   "WHERE p.id IN (SELECT MAX(id) FROM predictions GROUP BY customer_id)", nativeQuery = true)
    Double getAverageChurnProbability();
    
    @Query(value = "SELECT c.contract, COUNT(c.id), SUM(CASE WHEN c.actual_churn = 'Yes' THEN 1 ELSE 0 END) " +
                   "FROM customers c GROUP BY c.contract", nativeQuery = true)
    List<Object[]> getChurnByContract();
    
    @Query(value = "SELECT CASE " +
                   "WHEN tenure <= 12 THEN '0-1 yr' " +
                   "WHEN tenure <= 24 THEN '1-2 yr' " +
                   "WHEN tenure <= 48 THEN '2-4 yr' " +
                   "ELSE '4+ yr' END as tenure_group, " +
                   "COUNT(id), SUM(CASE WHEN actual_churn = 'Yes' THEN 1 ELSE 0 END) " +
                   "FROM customers GROUP BY tenure_group", nativeQuery = true)
    List<Object[]> getChurnByTenure();
    
    @Query(value = "SELECT payment_method, COUNT(id), SUM(CASE WHEN actual_churn = 'Yes' THEN 1 ELSE 0 END) " +
                   "FROM customers GROUP BY payment_method", nativeQuery = true)
    List<Object[]> getChurnByPaymentMethod();
}
