'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PinGate({ onLogin }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  function handleSubmit() {
    if (!onLogin(pin)) {
      setError('PIN incorreto. Tente novamente.');
    }
  }

  return (
    <div id="appShell">
      <header className="topbar">
        <div className="brand">
          Balcão<span>.</span>Devoluções
        </div>
        <div className="tag">Admin</div>
      </header>
      <main>
        <div className="pin-wrap">
          <h1 className="title" style={{ fontSize: 20, textAlign: 'center' }}>
            Área administrativa
          </h1>
          <p className="subtitle" style={{ textAlign: 'center' }}>
            Digite o PIN de acesso
          </p>
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            placeholder="••••"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
          />
          <div className="pin-error">{error}</div>
          <button className="btn block" onClick={handleSubmit}>
            Entrar
          </button>
          <Link href="/" className="admin-link" style={{ marginTop: 20, display: 'block' }}>
            ← Voltar para tela pública
          </Link>
        </div>
      </main>
    </div>
  );
}
