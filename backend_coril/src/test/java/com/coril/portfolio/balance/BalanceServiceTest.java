package com.coril.portfolio.balance;

import com.coril.portfolio.fund.Fund;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BalanceServiceTest {

    @Mock
    private BalanceRepository balanceRepository;

    @InjectMocks
    private BalanceService balanceService;

    private Balance sampleBalance;
    private final String clientId = "INV-0001";

    @BeforeEach
    void setUp() {
        Fund fund = new Fund("FND-001", "Coril Efectivo", "PEN");
        sampleBalance = Balance.builder()
                .id(1L)
                .clientId(clientId)
                .fund(fund)
                .totalShares(new BigDecimal("100.0000"))
                .investedAmount(new BigDecimal("1000.0000"))
                .lastUpdated(LocalDateTime.now())
                .build();
    }

    @Test
    void shouldReturnBalancesForClientId() {
        // Arrange
        when(balanceRepository.findByClientId(clientId)).thenReturn(List.of(sampleBalance));

        // Act
        List<BalanceResponse> responses = balanceService.getBalancesByClientId(clientId);

        // Assert
        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals("FND-001", responses.get(0).fundId());
        assertEquals(new BigDecimal("100.0000"), responses.get(0).totalShares());
        assertEquals(new BigDecimal("1000.0000"), responses.get(0).investedAmount());
        assertEquals("PEN", responses.get(0).currency());
        verify(balanceRepository).findByClientId(clientId);
    }

    @Test
    void shouldReturnEmptyListWhenNoBalancesFound() {
        // Arrange
        when(balanceRepository.findByClientId(clientId)).thenReturn(List.of());

        // Act
        List<BalanceResponse> responses = balanceService.getBalancesByClientId(clientId);

        // Assert
        assertNotNull(responses);
        assertEquals(0, responses.size());
        verify(balanceRepository).findByClientId(clientId);
    }
}
