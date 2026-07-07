'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAppData } from '@/lib/useAppData';
import { registrarCadastro } from '@/lib/api';
import CadastroForm from '@/components/CadastroForm';
import CadastroConfirmado from '@/components/CadastroConfirmado';
import ListaLojas from '@/components/ListaLojas';
import Toast, { useToast } from '@/components/Toast';

export default function PublicPage() {
  const { lojas, loading } = useAppData();
  const [tab, setTab] = useState('cadastro');
  const [confirmado, setConfirmado] = useState(false);
  const { toast, showToast } = useToast();

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div id="appShell">
      <header className="topbar">
        <div className="brand">
          Balcão<span>.</span>Devoluções
          <div className="brand-address">Ponto de coleta: Av. Brasil, 2971</div>
        </div>
        <div className="tag">Loja</div>
      </header>

      <main>
        <img
          src="https://cataas.com/cat"
          alt="Gato de teste"
          style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '16px' }}
        />

        {tab === 'cadastro' &&
          (confirmado ? (
            <CadastroConfirmado onVerLojas={() => setTab('lojas')} />
          ) : (
            <CadastroForm
              lojas={lojas}
              onSubmit={async ({ loja, nome, telefone }) => {
                try {
                  await registrarCadastro({ lojaNome: loja, nome, telefone, lojasExistentes: lojas });
                  setConfirmado(true);
                } catch (e) {
                  showToast('Erro ao enviar cadastro: ' + e.message);
                }
              }}
            />
          ))}

        {tab === 'lojas' && <ListaLojas lojas={lojas} />}

        <Link href="/admin" className="admin-link">
          Acesso da equipe administrativa →
        </Link>
      </main>

      <footer className="tabbar">
        <div className="tabbar-address">Av. Brasil, 2971</div>
        <div className="tabbar-buttons">
          <button
            className={tab === 'cadastro' ? 'active' : ''}
            onClick={() => {
              setTab('cadastro');
              setConfirmado(false);
            }}
          >
            Cadastro
          </button>
          <button className={tab === 'lojas' ? 'active' : ''} onClick={() => setTab('lojas')}>
            Lojas p/ devolução
          </button>
        </div>
      </footer>

      <Toast message={toast} />
    </div>
  );
}
