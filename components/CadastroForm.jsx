'use client';

import { useState, useEffect, useRef } from 'react';
import LojaSelector from './LojaSelector';

export default function CadastroForm({ lojas, onSubmit }) {
  const [loja, setLoja] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [enviando, setEnviando] = useState(false);
  const nomeRef = useRef(null);
  const telefoneRef = useRef(null);
  const submitRef = useRef(null);

  useEffect(() => {
    setNome(localStorage.getItem('meuNome') || '');
    setTelefone(localStorage.getItem('meuTelefone') || '');
  }, []);

  function focarProximoCampo() {
    if (!nome.trim()) {
      nomeRef.current?.focus();
    } else if (!telefone.trim()) {
      telefoneRef.current?.focus();
    } else {
      submitRef.current?.focus();
    }
  }

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
            <LojaSelector lojas={lojas} value={loja} onChange={setLoja} onSelected={focarProximoCampo} />
          </div>
          <div className="field">
            <label htmlFor="f-nome">Nome completo</label>
            <input
              id="f-nome"
              ref={nomeRef}
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
              ref={telefoneRef}
              type="tel"
              required
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>
          <button type="submit" className="btn block" ref={submitRef} disabled={enviando}>
            {enviando ? 'Enviando...' : 'Confirmar cadastro'}
          </button>
        </form>
      </div>
    </>
  );
}
