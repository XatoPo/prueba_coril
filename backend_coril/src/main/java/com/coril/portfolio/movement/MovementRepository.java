package com.coril.portfolio.movement;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovementRepository extends JpaRepository<Movement, Long> {
    
    List<Movement> findByClientIdOrderByTransactionDateDesc(String clientId);
    
    List<Movement> findByClientIdAndStatusOrderByTransactionDateDesc(String clientId, MovementStatus status);
}