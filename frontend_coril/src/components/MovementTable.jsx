import './portfolio.css';

export const MovementTable = ({ movements }) => {
    const formatCurrency = (amount, currency) => {
        return new Intl.NumberFormat('es-PE', { style: 'currency', currency: currency }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-PE', { 
            year: 'numeric', month: 'short', day: 'numeric' 
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return <span className="badge badge-warning">⏳ En Proceso</span>;
            case 'EXECUTED':
                return <span className="badge badge-success">✓ Ejecutado</span>;
            case 'REJECTED':
                return <span className="badge badge-error">✕ Rechazado</span>;
            default:
                return <span className="badge">{status}</span>;
        }
    };

    const getOperationText = (type) => {
        return type === 'SUBSCRIPTION' ? 'Aporte' : 'Rescate';
    };

    return (
        <div className="table-container">
            <table className="movement-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Fondo Asignado</th>
                        <th>Operación</th>
                        <th>Monto</th>
                        <th>Cuotas</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {movements.map((mov) => (
                        <tr key={mov.id}>
                            <td>{formatDate(mov.transactionDate)}</td>
                            <td>{mov.fundName}</td>
                            <td>
                                <span className={mov.type === 'SUBSCRIPTION' ? 'type-subscription' : 'type-redemption'}>
                                    {getOperationText(mov.type)}
                                </span>
                            </td>
                            <td>{formatCurrency(mov.amount, mov.currency)}</td>
                            <td>
                                {mov.status === 'PENDING' || mov.status === 'REJECTED' 
                                    ? '-' 
                                    : Number(mov.shares).toFixed(4)}
                            </td>
                            <td>{getStatusBadge(mov.status)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};