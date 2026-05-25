package com.coril.portfolio.balance;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class BalanceControllerTest {

    private MockMvc mockMvc;

    @Mock
    private BalanceService balanceService;

    @InjectMocks
    private BalanceController balanceController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(balanceController).build();
    }

    @Test
    void shouldReturnBalancesForInvestor() throws Exception {
        String investorId = "INV-0001";
        
        BalanceResponse response = new BalanceResponse(
                1L,
                "FND-001",
                "Coril Efectivo",
                new BigDecimal("100.0000"),
                new BigDecimal("1000.0000"),
                "PEN",
                LocalDateTime.now()
        );

        when(balanceService.getBalancesByClientId(investorId)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/investors/{investorId}/balances", investorId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].fundId").value("FND-001"))
                .andExpect(jsonPath("$[0].fundName").value("Coril Efectivo"));
    }
}
