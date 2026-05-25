package com.coril.portfolio.movement;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/investors/{investorId}/movements")
@RequiredArgsConstructor
public class MovementController {

    private final MovementService movementService;

    @GetMapping
    public ResponseEntity<List<MovementResponse>> getMovements(
            @PathVariable String investorId,
            @RequestParam(required = false) MovementStatus status) {
        List<MovementResponse> movements = movementService.getMovementsByClientId(investorId, status);
        return ResponseEntity.ok(movements);
    }
}