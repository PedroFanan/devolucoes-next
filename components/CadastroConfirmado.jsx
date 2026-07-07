export default function CadastroConfirmado({ onVerLojas }) {
  return (
    <div className="confirm-stamp">
      <div className="circle">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <h1 className="title" style={{ fontSize: 20 }}>
        Cadastro confirmado
      </h1>
      <p className="subtitle">
        Você já pode acompanhar as lojas com produtos aguardando devolução.
      </p>
      <button className="btn block" onClick={onVerLojas}>
        Ver lojas com devolução
      </button>
    </div>
  );
}
