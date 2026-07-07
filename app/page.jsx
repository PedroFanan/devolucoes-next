'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAppData } from '@/lib/useAppData';
import { registrarCliente } from '@/lib/api';
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
        </div>
        <div className="tag">Loja</div>
      </header>

      <main>
        {tab === 'cadastro' &&
          (confirmado ? (
            <CadastroConfirmado onVerLojas={() => setTab('lojas')} />
          ) : (
            <CadastroForm
              lojas={lojas}
              onSubmit={async ({ loja, nome, telefone }) => {
                try {
                  await registrarCliente({ lojaNome: loja, nome, telefone, lojasExistentes: lojas });
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
      </footer>

      <Toast message={toast} />
    </div>
  );
}
