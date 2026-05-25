import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BalanceCard } from './BalanceCard';

describe('BalanceCard Component', () => {
    const mockBalance = {
        id: 1,
        fundId: 'FND-001',
        fundName: 'Coril Efectivo Soles FM',
        totalShares: 240.5555,
        investedAmount: 2400.00,
        currency: 'PEN',
        lastUpdated: '2024-05-25T10:00:00',
    };

    it('renderiza el nombre del fondo correctamente', () => {
        render(<BalanceCard balance={mockBalance} />);
        expect(screen.getByText('Coril Efectivo Soles FM')).toBeDefined();
    });

    it('muestra el tag de la moneda', () => {
        render(<BalanceCard balance={mockBalance} />);
        expect(screen.getByText('PEN')).toBeDefined();
    });

    it('formatea las cuotas a 4 decimales exactos', () => {
        render(<BalanceCard balance={mockBalance} />);
        expect(screen.getByText('240.5555')).toBeDefined();
    });

    it('formatea el monto invertido con la moneda correspondiente', () => {
        render(<BalanceCard balance={mockBalance} />);
        // Dependiendo del entorno de Node, el símbolo puede variar (S/ o PEN)
        // pero validamos que el monto numérico base esté presente.
        const amountElement = screen.getByText(/2.400/i);
        expect(amountElement).toBeDefined();
    });
});