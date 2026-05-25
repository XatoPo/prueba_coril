import { ToastProvider } from './components/ToastProvider';
import { Portfolio } from './views/Portfolio';

function App() {
  return (
    <ToastProvider>
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
        <Portfolio />
      </div>
    </ToastProvider>
  );
}

export default App;