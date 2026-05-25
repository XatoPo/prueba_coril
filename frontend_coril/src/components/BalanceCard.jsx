import './portfolio.css';

const ClockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

export const BalanceCard = ({ balance }) => {
    const formatCurrency = (amount, currency) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="balance-card">
            <div className="balance-card-header">
                <span className="balance-fund-name">{balance.fundName}</span>
                <span className="balance-currency-tag">{balance.currency}</span>
            </div>

            <div className="balance-stats">
                <div className="balance-stat">
                    <span className="balance-stat-label">Monto Invertido</span>
                    <span className="balance-stat-value">
                        {formatCurrency(balance.investedAmount, balance.currency)}
                    </span>
                </div>
                <div className="balance-stat">
                    <span className="balance-stat-label">Cuotas Totales</span>
                    <span className="balance-stat-value shares">
                        {Number(balance.totalShares).toFixed(4)}
                    </span>
                </div>
            </div>

            <div className="balance-card-footer">
                <ClockIcon />
                Actualizado: {formatDate(balance.lastUpdated)}
            </div>
        </div>
    );
};