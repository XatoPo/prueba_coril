package com.coril.portfolio.balance;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/investors/{investorId}/balances")
@RequiredArgsConstructor
public class BalanceController {

    private final BalanceService balanceService;

    @GetMapping
    public ResponseEntity<List<BalanceResponse>> getBalances(@PathVariable String investorId) {
        List<BalanceResponse> balances = balanceService.getBalancesByClientId(investorId);
        return ResponseEntity.ok(balances);
    }
}