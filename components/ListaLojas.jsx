'use client';

import { useState } from 'react';

export default function ListaLojas({ lojas }) {
  const [busca, setBusca] = useState('');

  if (lojas.length === 0) {
    return (
      <>
        <h1 className="title">Lojas</h1>
        <p className="subtitle">Nenhuma loja cadastrada ainda pela equipe administrativa.</p>
        <div className="empty">Volte mais tarde.</div>
      </>
    );
  }

  const termo = busca.trim().toLowerCase();
  const filtradas = termo ? lojas.filter((l) => l.nome.toLowerCase().includes(termo)) : lojas;

  return (
    <>
      <h1 className="title">Lojas com devolução</h1>
      <p className="subtitle">Lista atualizada pela nossa equipe administrativa.</p>
      <div className="field" style={{ marginBottom: 20 }}>
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar loja..."
        />
      </div>
      {filtradas.length === 0 ? (
        <div className="empty">Nenhuma loja encontrada para "{busca}".</div>
      ) : (
        <div className="store-list">
          {filtradas.map((l) => {
            const n = l.produtos.filter((p) => p.status === 'pendente').length;
            return (
              <div className="store-row" key={l.id}>
                <div className="dashline"></div>
                <div>
                  <div className="store-name">{l.nome}</div>
                  <div className="store-sub">
                    {n === 0 ? 'Nenhuma devolução pendente' : 'Devoluções em aberto'}
                  </div>
                </div>
                <div className={`count-badge ${n === 0 ? 'zero' : ''}`}>
                  {n} produto{n === 1 ? '' : 's'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
