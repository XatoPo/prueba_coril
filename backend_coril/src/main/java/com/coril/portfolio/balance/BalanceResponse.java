package com.coril.portfolio.balance;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BalanceResponse(
        Long id,
        String fundId,
        String fundName,
        BigDecimal totalShares,
        BigDecimal investedAmount,
        String currency,
        LocalDateTime lastUpdated
) {}