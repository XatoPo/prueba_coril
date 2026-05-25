package com.coril.portfolio.movement;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MovementResponse(
        Long id,
        String fundId,
        String fundName,
        MovementType type,
        BigDecimal amount,
        BigDecimal shares,
        BigDecimal shareValue,
        String currency,
        MovementStatus status,
        LocalDateTime transactionDate
) {}