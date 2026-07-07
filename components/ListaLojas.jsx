export default function ListaLojas({ lojas }) {
  if (lojas.length === 0) {
    return (
      <>
        <h1 className="title">Lojas</h1>
        <p className="subtitle">Nenhuma loja cadastrada ainda pela equipe administrativa.</p>
        <div className="empty">Volte mais tarde.</div>
      </>
    );
  }

  return (
    <>
      <h1 className="title">Lojas com devolução</h1>
      <p className="subtitle">Lista atualizada pela nossa equipe administrativa.</p>
      <div className="store-list">
        {lojas.map((l) => {
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
    </>
  );
}
