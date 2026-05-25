import './ui.css';

/**
 * Componente visual para indicar procesamiento asíncrono en curso.
 */
export const Loader = ({ text = "Cargando información..." }) => {
    return (
        <div className="loader-container">
            <div className="loader-spinner"></div>
            <p>{text}</p>
        </div>
    );
};