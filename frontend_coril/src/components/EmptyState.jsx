import './ui.css';

const InboxIcon = () => (
    <svg
        width="28" height="28"
        viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={1.5}
        strokeLinecap="round" strokeLinejoin="round"
    >
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
        <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
    </svg>
);

/**
 * Representación visual para listas o consultas sin resultados.
 */
export const EmptyState = ({ title, description }) => {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">
                <InboxIcon />
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
};