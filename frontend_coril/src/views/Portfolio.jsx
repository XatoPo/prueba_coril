import { useState, useEffect } from 'react';
import { portfolioService } from '../services/portfolioService';
import { BalanceCard } from '../components/BalanceCard';
import { MovementTable } from '../components/MovementTable';
import { Loader } from '../components/Loader';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../components/ToastContext';
import '../components/ui.css';

export const Portfolio = () => {
    const { addToast } = useToast();
    const investorId = 'INV-0001'; 

    const [balances, setBalances] = useState([]);
    const [movements, setMovements] = useState([]);
    const [loadingBalances, setLoadingBalances] = useState(true);
    const [loadingMovements, setLoadingMovements] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');

    // Fetch de Saldos
    useEffect(() => {
        let isMounted = true;

        const fetchBalances = async () => {
            try {
                setLoadingBalances(true);
                const data = await portfolioService.getBalances(investorId);
                if (isMounted) setBalances(data);
            } catch (err) {
                console.error("Error en petición de saldos:", err);
                if (isMounted) addToast('No se pudieron cargar los saldos consolidados.', 'error');
            } finally {
                if (isMounted) setLoadingBalances(false);
            }
        };

        fetchBalances();
        return () => { isMounted = false; };
    }, [addToast]);

    // Fetch de Movimientos (Reacciona al filtro)
    useEffect(() => {
        let isMounted = true;

        const fetchMovements = async () => {
            try {
                setLoadingMovements(true);
                const data = await portfolioService.getMovements(investorId, statusFilter);
                if (isMounted) setMovements(data);
            } catch (err) {
                console.error("Error en petición de movimientos:", err);
                if (isMounted) addToast('No se pudo cargar el historial de operaciones.', 'error');
            } finally {
                if (isMounted) setLoadingMovements(false);
            }
        };

        fetchMovements();
        return () => { isMounted = false; };
    }, [statusFilter, addToast]);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--color-primary)', margin: '0 0 0.5rem 0' }}>Mi Portafolio</h1>
                <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                    Resumen consolidado e historial de operaciones de fondos mutuos.
                </p>
            </header>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-text-main)' }}>
                    Posición Global
                </h2>
                {loadingBalances ? (
                    <Loader text="Calculando posición global..." />
                ) : balances.length === 0 ? (
                    <EmptyState 
                        title="Sin saldo activo" 
                        description="Actualmente no mantienes inversiones en ningún fondo mutuo." 
                    />
                ) : (
                    <div className="balance-grid">
                        {balances.map(balance => (
                            <BalanceCard key={balance.id} balance={balance} />
                        ))}
                    </div>
                )}
            </section>

            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--color-text-main)' }}>
                        Historial de Operaciones
                    </h2>
                    <div className="filter-container" style={{ margin: 0 }}>
                        <select 
                            className="filter-select" 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">Todos los movimientos</option>
                            <option value="PENDING">En proceso</option>
                            <option value="EXECUTED">Ejecutados</option>
                            <option value="REJECTED">Rechazados</option>
                        </select>
                    </div>
                </div>

                {loadingMovements ? (
                    <Loader text="Recuperando historial transaccional..." />
                ) : movements.length === 0 ? (
                    <EmptyState 
                        title="Sin movimientos" 
                        description="No se encontraron operaciones registradas para el criterio seleccionado." 
                    />
                ) : (
                    <MovementTable movements={movements} />
                )}
            </section>
        </div>
    );
};