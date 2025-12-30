import { Toaster } from 'sonner';
import { ChatWidget } from './components/ChatWidget';
import './index.css';

function App() {
  return <div>
    <ChatWidget />
    <Toaster />
  </div>;
}

export default App;
