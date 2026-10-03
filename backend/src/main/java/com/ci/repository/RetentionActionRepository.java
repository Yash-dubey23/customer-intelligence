package com.ci.repository;

import com.ci.model.RetentionAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RetentionActionRepository extends JpaRepository<RetentionAction, Long> {
    List<RetentionAction> findByCustomerIdOrderByActedAtDesc(Long customerId);
}
