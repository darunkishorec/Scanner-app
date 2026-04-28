import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useState } from 'react';
import RegistrationScreen from './screens/RegistrationScreen';
import ScannerScreen from './screens/ScannerScreen';
import SuccessScreen from './screens/SuccessScreen';
import LiveCartView from './screens/LiveCartView';
import QueueScreen from './screens/QueueScreen';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';

function ScannerApp() {
  const [screen, setScreen] = useState('register');
  const [user, setUser] = useState({ name: '', phone: '' });
  const [result, setResult] = useState(null);
  const [queueId, setQueueId] = useState(null);

  const handleRegistered = (name, phone) => {
    setUser({ name, phone });
    setScreen('scanner');
  };

  const handleSuccess = (data) => {
    setResult(data);
    setScreen('liveCart');  // Changed from 'success' to 'liveCart'
  };

  const handleQueue = (queueData) => {
    setQueueId(queueData.queueId);
    setScreen('queue');
  };

  const handleCartReady = (cartId) => {
    setResult({ cartId, assignedTo: user.name });
    setScreen('liveCart');
  };

  return (
    <>
      {screen === 'register' && (
        <RegistrationScreen onSubmit={handleRegistered} />
      )}
      {screen === 'scanner' && (
        <ScannerScreen
          user={user}
          onSuccess={handleSuccess}
          onQueue={handleQueue}
          onExit={() => setScreen('register')}
        />
      )}
      {screen === 'liveCart' && (
        <LiveCartView
          cartId={result?.cartId}
          customerName={user.name}
        />
      )}
      {screen === 'queue' && (
        <QueueScreen
          queueId={queueId}
          customerName={user.name}
          onCartReady={handleCartReady}
        />
      )}
      {screen === 'success' && (
        <SuccessScreen
          result={result}
          user={user}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ScannerApp />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          duration={4000}
        />
      </div>
    </Router>
  );
}
