import './portfolio.css';

export const BalanceCard = ({ balance }) => {
    const formatCurrency = (amount, currency) => {
        return new Intl.NumberFormat('es-PE', { 
            style: 'currency', 
            currency: currency 
        }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PE', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <div className="balance-card">
            <h3>{balance.fundName}</h3>
            <div className="balance-details">
                <div className="detail-item">
                    <span className="label">Monto Invertido</span>
                    <span className="value">{formatCurrency(balance.investedAmount, balance.currency)}</span>
                </div>
                <div className="detail-item">
                    <span className="label">Cuotas Totales</span>
                    <span className="value">{Number(balance.totalShares).toFixed(4)}</span>
                </div>
            </div>
            <div className="balance-footer">
                Actualizado: {formatDate(balance.lastUpdated)}
            </div>
        </div>
    );
};