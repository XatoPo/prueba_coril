import { useState, useMemo } from 'react';
import './portfolio.css';

// --- Íconos SVG (tamaño controlado por CSS, no por el SVG) ---

const ArrowDownIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <polyline points="19 12 12 19 5 12" />
    </svg>
);

const ArrowUpIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
    </svg>
);

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const ClockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const XIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

// Íconos de ordenamiento para cabeceras
const SortNoneIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="8 15 12 19 16 15" />
        <polyline points="16 9 12 5 8 9" />
    </svg>
);
const SortAscIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="8 15 12 19 16 15" />
    </svg>
);
const SortDescIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 9 12 5 8 9" />
    </svg>
);

// --- Helpers ---

const formatCurrency = (amount, currency) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency }).format(amount);

const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('es-PE', {
        year: 'numeric', month: 'short', day: 'numeric',
    });

// --- Sub-componentes ---

const OperationChip = ({ type }) => {
    const isSubscription = type === 'SUBSCRIPTION';
    return (
        <span className={`operation-chip ${isSubscription ? 'subscription' : 'redemption'}`}>
            {isSubscription ? <ArrowDownIcon /> : <ArrowUpIcon />}
            {isSubscription ? 'Aporte' : 'Rescate'}
        </span>
    );
};

const StatusBadge = ({ status }) => {
    const config = {
        EXECUTED: { label: 'Ejecutado', icon: <CheckIcon />, cls: 'executed' },
        PENDING:  { label: 'En Proceso', icon: <ClockIcon />, cls: 'pending' },
        REJECTED: { label: 'Rechazado', icon: <XIcon />,     cls: 'rejected' },
    };
    const { label, icon, cls } = config[status] ?? { label: status, icon: null, cls: '' };
    return (
        <span className={`status-badge ${cls}`}>
            {icon}
            {label}
        </span>
    );
};

// Cabecera con indicador de ordenamiento
const SortableHeader = ({ label, field, sortConfig, onSort }) => {
    const isActive = sortConfig.field === field;
    const SortIcon = isActive
        ? (sortConfig.dir === 'asc' ? SortAscIcon : SortDescIcon)
        : SortNoneIcon;

    return (
        <th
            className={`th-sortable ${isActive ? 'th-sort-active' : ''}`}
            onClick={() => onSort(field)}
        >
            {label}
            <span className="sort-icon">
                <SortIcon />
            </span>
        </th>
    );
};

// --- Lógica de ordenamiento ---

const SORT_COMPARATORS = {
    transactionDate: (a, b) => new Date(a.transactionDate) - new Date(b.transactionDate),
    fundName:        (a, b) => a.fundName.localeCompare(b.fundName, 'es'),
    type:            (a, b) => a.type.localeCompare(b.type),
    amount:          (a, b) => a.amount - b.amount,
    shares:          (a, b) => (a.shares ?? 0) - (b.shares ?? 0),
    status:          (a, b) => a.status.localeCompare(b.status),
};

// --- Componente Principal ---

export const MovementTable = ({ movements, fundFilter, onFundFilterChange }) => {
    const [sortConfig, setSortConfig] = useState({ field: 'transactionDate', dir: 'desc' });

    // Deriva la lista única de fondos para el selector
    const availableFunds = useMemo(() => {
        const names = [...new Set(movements.map((m) => m.fundName))].sort((a, b) =>
            a.localeCompare(b, 'es')
        );
        return names;
    }, [movements]);

    const handleSort = (field) => {
        setSortConfig((prev) =>
            prev.field === field
                ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
                : { field, dir: 'asc' }
        );
    };

    // Aplica filtro de fondo y luego ordena
    const displayedMovements = useMemo(() => {
        let filtered = fundFilter
            ? movements.filter((m) => m.fundName === fundFilter)
            : movements;

        const comparator = SORT_COMPARATORS[sortConfig.field];
        if (!comparator) return filtered;

        return [...filtered].sort((a, b) =>
            sortConfig.dir === 'asc' ? comparator(a, b) : comparator(b, a)
        );
    }, [movements, fundFilter, sortConfig]);

    const headerProps = { sortConfig, onSort: handleSort };

    return (
        <div className="table-wrapper">
            {/* ── Barra de filtro por fondo ── */}
            <div className="table-toolbar">
                <span className="toolbar-label">Filtrar por fondo:</span>
                <div className="fund-filter-bar">
                    <button
                        className={`filter-btn ${!fundFilter ? 'active' : ''}`}
                        onClick={() => onFundFilterChange('')}
                    >
                        Todos los fondos
                    </button>
                    {availableFunds.map((name) => (
                        <button
                            key={name}
                            className={`filter-btn ${fundFilter === name ? 'active' : ''}`}
                            onClick={() => onFundFilterChange(name)}
                        >
                            {name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="table-container">
                <table className="movement-table">
                    <thead>
                        <tr>
                            <SortableHeader label="Fecha"     field="transactionDate" {...headerProps} />
                            <SortableHeader label="Fondo"     field="fundName"        {...headerProps} />
                            <SortableHeader label="Operación" field="type"            {...headerProps} />
                            <SortableHeader label="Monto"     field="amount"          {...headerProps} />
                            <SortableHeader label="Cuotas"    field="shares"          {...headerProps} />
                            <SortableHeader label="Estado"    field="status"          {...headerProps} />
                        </tr>
                    </thead>
                    <tbody>
                        {displayedMovements.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="td-empty-filter">
                                    No hay movimientos para el fondo seleccionado.
                                </td>
                            </tr>
                        ) : (
                            displayedMovements.map((mov) => {
                                const isSubscription = mov.type === 'SUBSCRIPTION';
                                const sharesSettled = mov.status !== 'PENDING' && mov.status !== 'REJECTED';
                                return (
                                    <tr key={mov.id}>
                                        <td className="col-date">{formatDate(mov.transactionDate)}</td>
                                        <td className="col-fund">{mov.fundName}</td>
                                        <td><OperationChip type={mov.type} /></td>
                                        <td className={`col-amount ${isSubscription ? 'subscription' : 'redemption'}`}>
                                            {isSubscription ? '+' : '−'} {formatCurrency(mov.amount, mov.currency)}
                                        </td>
                                        <td className="col-shares">
                                            {sharesSettled ? Number(mov.shares).toFixed(4) : '—'}
                                        </td>
                                        <td><StatusBadge status={mov.status} /></td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};