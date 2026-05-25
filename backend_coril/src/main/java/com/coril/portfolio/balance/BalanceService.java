package com.coril.portfolio.balance;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BalanceService {

    private final BalanceRepository balanceRepository;

    public List<BalanceResponse> getBalancesByClientId(String clientId) {
        return balanceRepository.findByClientId(clientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private BalanceResponse mapToResponse(Balance balance) {
        return new BalanceResponse(
                balance.getId(),
                balance.getFund().getId(),
                balance.getFund().getName(),
                balance.getTotalShares(),
                balance.getInvestedAmount(),
                balance.getFund().getCurrency(),
                balance.getLastUpdated()
        );
    }
}