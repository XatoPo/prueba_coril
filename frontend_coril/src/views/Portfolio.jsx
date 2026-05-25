import { useState, useEffect } from 'react';
import { portfolioService } from '../services/portfolioService';
import { BalanceCard } from '../components/BalanceCard';
import { MovementTable } from '../components/MovementTable';
import { Loader } from '../components/Loader';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../components/ToastContext';
import '../components/ui.css';
import '../components/portfolio.css';

// Ícono de usuario (sólo usado en el chip del header, tamaño pequeño)
const UserIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

// Filtros de estado — se pasan al backend
const STATUS_FILTERS = [
    { value: '',         label: 'Todos' },
    { value: 'PENDING',  label: 'En Proceso' },
    { value: 'EXECUTED', label: 'Ejecutados' },
    { value: 'REJECTED', label: 'Rechazados' },
];

export const Portfolio = () => {
    const { addToast } = useToast();
    const investorId = 'INV-0001';

    const [balances,        setBalances]        = useState([]);
    const [movements,       setMovements]       = useState([]);
    const [loadingBalances, setLoadingBalances] = useState(true);
    const [loadingMovements,setLoadingMovements]= useState(true);
    const [statusFilter,    setStatusFilter]    = useState('');
    // Filtro por fondo: gestionado aquí y pasado a MovementTable como prop
    const [fundFilter,      setFundFilter]      = useState('');

    // Resetea el filtro de fondo cuando cambia el filtro de estado
    // (evita combinación de filtros que deje la tabla vacía sin aviso claro)
    const handleStatusFilter = (value) => {
        setStatusFilter(value);
        setFundFilter('');
    };

    // Fetch de Saldos
    useEffect(() => {
        let isMounted = true;
        const fetchBalances = async () => {
            try {
                setLoadingBalances(true);
                const data = await portfolioService.getBalances(investorId);
                if (isMounted) setBalances(data);
            } catch (err) {
                console.error('Error en petición de saldos:', err);
                if (isMounted) addToast('No se pudieron cargar los saldos consolidados.', 'error');
            } finally {
                if (isMounted) setLoadingBalances(false);
            }
        };
        fetchBalances();
        return () => { isMounted = false; };
    }, [addToast]);

    // Fetch de Movimientos (reacciona al filtro de estado → petición al backend)
    useEffect(() => {
        let isMounted = true;
        const fetchMovements = async () => {
            try {
                setLoadingMovements(true);
                const data = await portfolioService.getMovements(investorId, statusFilter || null);
                if (isMounted) setMovements(data);
            } catch (err) {
                console.error('Error en petición de movimientos:', err);
                if (isMounted) addToast('No se pudo cargar el historial de operaciones.', 'error');
            } finally {
                if (isMounted) setLoadingMovements(false);
            }
        };
        fetchMovements();
        return () => { isMounted = false; };
    }, [statusFilter, addToast]);

    return (
        <div className="portfolio-layout">

            {/* ── Header ── */}
            <header className="portfolio-header">
                <div className="portfolio-header-text">
                    <h1>Mi Portafolio</h1>
                    <p>Resumen consolidado e historial de operaciones en Fondos Mutuos</p>
                </div>
                <div className="portfolio-investor-chip">
                    <UserIcon />
                    {investorId}
                </div>
            </header>

            {/* ── Posición Global ── */}
            <section className="portfolio-section">
                <div className="section-header">
                    <span className="section-title">Posición Global</span>
                </div>

                {loadingBalances ? (
                    <Loader text="Calculando posición global..." />
                ) : balances.length === 0 ? (
                    <EmptyState
                        title="Sin saldo activo"
                        description="Actualmente no mantienes inversiones en ningún Fondo Mutuo."
                    />
                ) : (
                    <div className="balance-grid">
                        {balances.map((balance) => (
                            <BalanceCard key={balance.id} balance={balance} />
                        ))}
                    </div>
                )}
            </section>

            {/* ── Historial de Operaciones ── */}
            <section className="portfolio-section">
                <div className="section-header">
                    <span className="section-title">Historial de Operaciones</span>

                    {/* Filtro de estado → llama al backend */}
                    <div className="filter-group">
                        <span className="filter-group-label">Estado:</span>
                        <div className="filter-bar">
                            {STATUS_FILTERS.map(({ value, label }) => (
                                <button
                                    key={value}
                                    className={`filter-btn ${statusFilter === value ? 'active' : ''}`}
                                    onClick={() => handleStatusFilter(value)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loadingMovements ? (
                    <Loader text="Recuperando historial transaccional..." />
                ) : movements.length === 0 ? (
                    <EmptyState
                        title="Sin movimientos"
                        description="No se encontraron operaciones para el criterio seleccionado."
                    />
                ) : (
                    <MovementTable
                        movements={movements}
                        fundFilter={fundFilter}
                        onFundFilterChange={setFundFilter}
                    />
                )}
            </section>

        </div>
    );
};