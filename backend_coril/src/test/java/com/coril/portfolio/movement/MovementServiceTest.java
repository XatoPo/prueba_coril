package com.coril.portfolio.movement;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.coril.portfolio.fund.Fund;

@ExtendWith(MockitoExtension.class)
class MovementServiceTest {

    @Mock
    private MovementRepository movementRepository;

    @InjectMocks
    private MovementService movementService;

    private Movement sampleMovement;
    private final String clientId = "INV-0001";

    @BeforeEach
    void setUp() {
        Fund fund = new Fund("FND-001", "Coril Efectivo", "PEN");
        sampleMovement = Movement.builder()
                .id(1L)
                .clientId(clientId)
                .fund(fund)
                .type(MovementType.SUBSCRIPTION)
                .amount(new BigDecimal("100.0000"))
                .shares(new BigDecimal("10.0000"))
                .shareValue(new BigDecimal("10.0000"))
                .status(MovementStatus.EXECUTED)
                .transactionDate(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void shouldReturnAllMovementsWhenStatusIsNull() {
        // Arrange
        when(movementRepository.findByClientIdOrderByTransactionDateDesc(clientId))
                .thenReturn(List.of(sampleMovement));

        // Act
        List<MovementResponse> responses = movementService.getMovementsByClientId(clientId, null);

        // Assert
        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals("FND-001", responses.get(0).fundId());
        verify(movementRepository).findByClientIdOrderByTransactionDateDesc(clientId);
    }

    @Test
    void shouldReturnFilteredMovementsWhenStatusIsProvided() {
        // Arrange
        sampleMovement.setStatus(MovementStatus.PENDING);
        when(movementRepository.findByClientIdAndStatusOrderByTransactionDateDesc(clientId, MovementStatus.PENDING))
                .thenReturn(List.of(sampleMovement));

        // Act
        List<MovementResponse> responses = movementService.getMovementsByClientId(clientId, MovementStatus.PENDING);

        // Assert
        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals(MovementStatus.PENDING, responses.get(0).status());
        verify(movementRepository).findByClientIdAndStatusOrderByTransactionDateDesc(clientId, MovementStatus.PENDING);
    }
}