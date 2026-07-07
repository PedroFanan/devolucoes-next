'use client';

import { useState, useEffect } from 'react';
import { useAppData } from '@/lib/useAppData';
import PinGate from '@/components/admin/PinGate';
import LojasProdutos from '@/components/admin/LojasProdutos';
import ClientesList from '@/components/admin/ClientesList';
import QrCodePanel from '@/components/admin/QrCodePanel';
import Toast, { useToast } from '@/components/Toast';

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '2026';

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [tab, setTab] = useState('lojas');
  const { lojas, clientes, loading, reload } = useAppData();
  const { toast, showToast } = useToast();

  useEffect(() => {
    setAuthed(sessionStorage.getItem('admin_authed') === 'true');
    setChecked(true);
  }, []);

  function handleLogin(pin) {
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem('admin_authed', 'true');
      setAuthed(true);
      return true;
    }
    return false;
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_authed');
    setAuthed(false);
  }

  if (!checked) return <div className="loading">Carregando...</div>;
  if (!authed) return <PinGate onLogin={handleLogin} />;
  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div id="appShell">
      <header className="topbar">
        <div className="brand">
          Balcão<span>.</span>Devoluções
        </div>
        <div className="tag">Admin</div>
      </header>

      <main>
        {tab === 'lojas' && (
          <LojasProdutos lojas={lojas} onChanged={reload} onError={showToast} onSuccess={showToast} />
        )}
        {tab === 'clientes' && (
          <ClientesList clientes={clientes} onChanged={reload} onError={showToast} onSuccess={showToast} />
        )}
        {tab === 'qr' && <QrCodePanel />}

        <span className="admin-link" onClick={handleLogout}>
          Sair do modo administrativo
        </span>
      </main>

      <footer className="tabbar">
        <button className={tab === 'lojas' ? 'active' : ''} onClick={() => setTab('lojas')}>
          Lojas / Produtos
        </button>
        <button className={tab === 'clientes' ? 'active' : ''} onClick={() => setTab('clientes')}>
          Cadastros
        </button>
        <button className={tab === 'qr' ? 'active' : ''} onClick={() => setTab('qr')}>
          QR Code
        </button>
      </footer>

      <Toast message={toast} />
    </div>
  );
}
