'use client';

import { useEffect, useRef, useState } from 'react';

export default function LojaSelector({ lojas, value, onChange, onSelected }) {
  const [aberto, setAberto] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickFora(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  const termo = value.trim().toLowerCase();
  const filtradas = termo ? lojas.filter((l) => l.nome.toLowerCase().includes(termo)) : lojas;
  const existeExata = lojas.some((l) => l.nome.toLowerCase() === termo);

  return (
    <div className="combo" ref={wrapperRef}>
      <input
        id="f-loja"
        type="text"
        autoComplete="off"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setAberto(true)}
        placeholder="Digite ou escolha a loja"
      />
      {aberto && (
        <div className="combo-list">
          {filtradas.length === 0 && (
            <div className="combo-empty">Nenhuma loja encontrada.</div>
          )}
          {filtradas.map((l) => (
            <button
              type="button"
              key={l.id}
              className="combo-item"
              onClick={() => {
                onChange(l.nome);
                setAberto(false);
                onSelected?.(l);
              }}
            >
              {l.nome}
            </button>
          ))}
          {termo && !existeExata && (
            <button
              type="button"
              className="combo-item combo-new"
              onClick={() => setAberto(false)}
            >
              Cadastrar nova loja: "{value.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}
