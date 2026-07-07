'use client';

import { useState, useEffect } from 'react';

export default function CadastroForm({ lojas, onSubmit }) {
  const [loja, setLoja] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    setNome(localStorage.getItem('meuNome') || '');
    setTelefone(localStorage.getItem('meuTelefone') || '');
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!loja.trim() || !nome.trim() || !telefone.trim()) return;
    setEnviando(true);
    await onSubmit({ loja: loja.trim(), nome: nome.trim(), telefone: telefone.trim() });
    localStorage.setItem('meuNome', nome.trim());
    localStorage.setItem('meuTelefone', telefone.trim());
    setLoja('');
    setEnviando(false);
  }

  return (
    <>
      <h1 className="title">Cadastre-se para devolução</h1>
      <p className="subtitle">
        Preencha seus dados abaixo. Se sua loja ainda não estiver na lista, pode digitar o nome
        normalmente.
      </p>
      <div className="ticket">
        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="f-loja">Loja</label>
            <input
              id="f-loja"
              list="lojaOptionsList"
              autoComplete="off"
              required
              value={loja}
              onChange={(e) => setLoja(e.target.value)}
              placeholder="Digite ou selecione a loja"
            />
            <datalist id="lojaOptionsList">
              {lojas.map((l) => (
                <option key={l.id} value={l.nome} />
              ))}
            </datalist>
          </div>
          <div className="field">
            <label htmlFor="f-nome">Nome completo</label>
            <input
              id="f-nome"
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Maria Silva"
            />
          </div>
          <div className="field">
            <label htmlFor="f-tel">Telefone</label>
            <input
              id="f-tel"
              type="tel"
              required
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>
          <button type="submit" className="btn block" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Confirmar cadastro'}
          </button>
        </form>
      </div>
    </>
  );
}
