package com.coril.portfolio.movement;

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
class MovementControllerTest {

    private MockMvc mockMvc;

    @Mock
    private MovementService movementService;

    @InjectMocks
    private MovementController movementController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(movementController).build();
    }

    @Test
    void shouldReturnMovementsForInvestor() throws Exception {
        String investorId = "INV-0001";
        
        MovementResponse response = new MovementResponse(
                1L,
                "FND-001",
                "Coril Efectivo",
                MovementType.SUBSCRIPTION,
                new BigDecimal("100.0000"),
                new BigDecimal("10.0000"),
                new BigDecimal("10.0000"),
                "PEN",
                MovementStatus.EXECUTED,
                LocalDateTime.now()
        );

        when(movementService.getMovementsByClientId(investorId, null)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/investors/{investorId}/movements", investorId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].fundId").value("FND-001"))
                .andExpect(jsonPath("$[0].type").value("SUBSCRIPTION"))
                .andExpect(jsonPath("$[0].status").value("EXECUTED"));
    }

    @Test
    void shouldReturnMovementsFilteredByStatus() throws Exception {
        String investorId = "INV-0001";
        MovementStatus status = MovementStatus.PENDING;
        
        MovementResponse response = new MovementResponse(
                1L,
                "FND-001",
                "Coril Efectivo",
                MovementType.SUBSCRIPTION,
                new BigDecimal("100.0000"),
                new BigDecimal("10.0000"),
                new BigDecimal("10.0000"),
                "PEN",
                MovementStatus.PENDING,
                LocalDateTime.now()
        );

        when(movementService.getMovementsByClientId(investorId, status)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/investors/{investorId}/movements", investorId)
                .param("status", "PENDING")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }
}
