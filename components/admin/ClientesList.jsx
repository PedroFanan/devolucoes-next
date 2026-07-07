'use client';

import { excluirCadastro } from '@/lib/api';

export default function ClientesList({ clientes, onChanged, onError, onSuccess }) {
  async function handleExcluir(id) {
    if (
      !confirm(
        'Confirma que a devolução deste cadastro já foi concluída e pode ser excluído?'
      )
    )
      return;
    try {
      await excluirCadastro(id);
      onSuccess('Cadastro excluído.');
      onChanged();
    } catch (e) {
      onError('Erro: ' + e.message);
    }
  }

  const comCadastros = clientes.filter((c) => c.cadastros.length > 0);
  const ordenados = [...comCadastros].sort((a, b) => {
    const maisRecenteA = a.cadastros[a.cadastros.length - 1]?.criadoEm || '';
    const maisRecenteB = b.cadastros[b.cadastros.length - 1]?.criadoEm || '';
    return maisRecenteB.localeCompare(maisRecenteA);
  });

  return (
    <>
      <h1 className="title" style={{ fontSize: 20 }}>
        Cadastros recebidos
      </h1>
      <p className="subtitle">
        Cada cliente pode ter cadastros em mais de uma loja. Exclua um cadastro apenas depois que a
        devolução naquela loja já tiver sido concluída.
      </p>
      {ordenados.length === 0 && <div className="empty">Nenhum cadastro ainda.</div>}
      {ordenados.map((c) => (
        <div className="cliente-card" key={c.id}>
          <div className="c-info">
            <div className="c-name">{c.nome}</div>
            <div className="c-sub">{c.telefone}</div>
          </div>
          {[...c.cadastros].reverse().map((cad) => (
            <div className="cliente-row" key={cad.id}>
              <div className="c-info">
                <div className="c-sub">{cad.loja}</div>
              </div>
              <button className="icon-btn del" onClick={() => handleExcluir(cad.id)}>
                Excluir
              </button>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
