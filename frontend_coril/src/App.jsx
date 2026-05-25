import { ToastProvider } from './components/ToastProvider';
import { Portfolio } from './views/Portfolio';

function App() {
  return (
    <ToastProvider>
      <Portfolio />
    </ToastProvider>
  );
}

export default App;