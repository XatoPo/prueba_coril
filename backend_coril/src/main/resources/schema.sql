-- ===========================================================================
-- Esquema de Base de Datos: Portfolio Management
-- ===========================================================================

-- Tabla de catálogo de Fondos Mutuos.
-- Resuelve la necesidad de mostrar el "Fondo asociado" (nombre real y moneda).
CREATE TABLE fund (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    currency VARCHAR(3) NOT NULL
);

-- Tabla de saldos consolidados por cliente y fondo.
-- Mantiene la posición actual ejecutada, aislando las transacciones en tránsito.
CREATE TABLE balance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_id VARCHAR(50) NOT NULL,
    fund_id VARCHAR(50) NOT NULL,
    total_shares DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    invested_amount DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    last_updated TIMESTAMP NOT NULL,
    CONSTRAINT fk_balance_fund FOREIGN KEY (fund_id) REFERENCES fund(id),
    CONSTRAINT uk_client_fund UNIQUE (client_id, fund_id)
);

-- Tabla de historial de movimientos financieros.
-- Registra operaciones de suscripción y redención de cuotas de fondos mutuos.
CREATE TABLE movement (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_id VARCHAR(50) NOT NULL,
    fund_id VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL, 
    amount DECIMAL(19, 4) NOT NULL,
    shares DECIMAL(19, 4),
    share_value DECIMAL(19, 4),
    transaction_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL, 
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_movement_fund FOREIGN KEY (fund_id) REFERENCES fund(id)
);

-- Índices estratégicos para optimizar las consultas del portafolio por cliente
CREATE INDEX idx_movement_client_fund ON movement(client_id, fund_id);
CREATE INDEX idx_movement_status ON movement(status);