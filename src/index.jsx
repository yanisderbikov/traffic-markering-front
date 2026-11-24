import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { SessionProvider } from './shared/session';
import { initTheme } from './shared/theme';
import { loadMiniApp } from './shared/miniApp';
import MiniAppGate from './components/MiniApp/MiniAppGate';
import './index.css';

initTheme();

const root = ReactDOM.createRoot(document.getElementById('root'));
const render = () =>
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <SessionProvider>
          <MiniAppGate>
            <App />
          </MiniAppGate>
        </SessionProvider>
        <Toaster position="top-right" />
      </BrowserRouter>
    </React.StrictMode>
  );

// Внутри Telegram сначала подгружаем его SDK (нужен initData для входа), на сайте — сразу
loadMiniApp().finally(render);
