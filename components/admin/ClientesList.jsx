'use client';

import { excluirCliente } from '@/lib/api';

export default function ClientesList({ clientes, onChanged, onError, onSuccess }) {
  async function handleExcluir(id) {
    if (
      !confirm(
        'Confirma que a devolução deste cliente já foi concluída e o cadastro pode ser excluído?'
      )
    )
      return;
    try {
      await excluirCliente(id);
      onSuccess('Cadastro excluído.');
      onChanged();
    } catch (e) {
      onError('Erro: ' + e.message);
    }
  }

  const ordenados = [...clientes].reverse();

  return (
    <>
      <h1 className="title" style={{ fontSize: 20 }}>
        Cadastros recebidos
      </h1>
      <p className="subtitle">
        Exclua um cadastro apenas depois que a devolução do cliente já tiver sido concluída.
      </p>
      {ordenados.length === 0 && <div className="empty">Nenhum cadastro ainda.</div>}
      {ordenados.map((c) => (
        <div className="cliente-row" key={c.id}>
          <div className="c-info">
            <div className="c-name">{c.nome}</div>
            <div className="c-sub">
              {c.loja} · {c.telefone}
            </div>
          </div>
          <button className="icon-btn del" onClick={() => handleExcluir(c.id)}>
            Excluir
          </button>
        </div>
      ))}
    </>
  );
}
