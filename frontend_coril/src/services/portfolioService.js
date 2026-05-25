const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const portfolioService = {
    getBalances: async (investorId) => {
        const response = await fetch(`${API_BASE_URL}/investors/${investorId}/balances`);
        if (!response.ok) {
            throw new Error('Error al obtener los saldos consolidados');
        }
        return response.json();
    },

    getMovements: async (investorId, status = null) => {
        let url = `${API_BASE_URL}/investors/${investorId}/movements`;
        if (status) {
            url += `?status=${status}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Error al obtener el historial de movimientos');
        }
        return response.json();
    }
};