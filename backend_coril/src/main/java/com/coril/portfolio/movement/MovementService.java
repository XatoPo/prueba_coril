package com.coril.portfolio.movement;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MovementService {

    private final MovementRepository movementRepository;

    public List<MovementResponse> getMovementsByClientId(String clientId, MovementStatus status) {
        List<Movement> movements;

        if (status != null) {
            movements = movementRepository.findByClientIdAndStatusOrderByTransactionDateDesc(clientId, status);
        } else {
            movements = movementRepository.findByClientIdOrderByTransactionDateDesc(clientId);
        }

        return movements.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private MovementResponse mapToResponse(Movement movement) {
        return new MovementResponse(
                movement.getId(),
                movement.getFund().getId(),
                movement.getFund().getName(),
                movement.getType(),
                movement.getAmount(),
                movement.getShares(),
                movement.getShareValue(),
                movement.getFund().getCurrency(),
                movement.getStatus(),
                movement.getTransactionDate()
        );
    }
}