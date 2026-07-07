'use client';

import { useState } from 'react';
import {
  adicionarLoja,
  adicionarProduto,
  marcarDevolvido,
  excluirProduto,
  excluirLoja,
} from '@/lib/api';

const PLATAFORMAS = ['TikTok', 'Magalu', 'Shopee', 'Shein', 'Outra'];

export default function LojasProdutos({ lojas, onChanged, onError, onSuccess }) {
  const [novaLoja, setNovaLoja] = useState('');
  const [novoProduto, setNovoProduto] = useState({}); // { [lojaId]: texto digitado }
  const [plataforma, setPlataforma] = useState({}); // { [lojaId]: 'TikTok' | ... | 'Outra' }
  const [plataformaOutra, setPlataformaOutra] = useState({}); // { [lojaId]: texto digitado }

  const [lojaRapidaId, setLojaRapidaId] = useState('');
  const [produtoRapidoNome, setProdutoRapidoNome] = useState('');
  const [plataformaRapida, setPlataformaRapida] = useState(PLATAFORMAS[0]);
  const [plataformaRapidaOutra, setPlataformaRapidaOutra] = useState('');

  async function handleAddLoja() {
    if (!novaLoja.trim()) return;
    try {
      const nova = await adicionarLoja(novaLoja.trim());
      setNovaLoja('');
      onSuccess('Loja adicionada.');
      onChanged();
      if (nova?.id) setLojaRapidaId(nova.id);
    } catch (e) {
      onError('Erro: ' + e.message);
    }
  }

  async function handleAddProdutoRapido() {
    const nome = produtoRapidoNome.trim();
    if (!lojaRapidaId || !nome) return;
    const plataformaFinal =
      plataformaRapida === 'Outra' ? plataformaRapidaOutra.trim() || 'Outra' : plataformaRapida;
    try {
      await adicionarProduto(lojaRapidaId, nome, plataformaFinal);
      setProdutoRapidoNome('');
      setPlataformaRapidaOutra('');
      onSuccess('Produto adicionado.');
      onChanged();
    } catch (e) {
      onError('Erro: ' + e.message);
    }
  }

  async function handleAddProduto(lojaId) {
    const nome = (novoProduto[lojaId] || '').trim();
    if (!nome) return;
    const plataformaSelecionada = plataforma[lojaId] || PLATAFORMAS[0];
    const plataformaFinal =
      plataformaSelecionada === 'Outra'
        ? (plataformaOutra[lojaId] || '').trim() || 'Outra'
        : plataformaSelecionada;
    try {
      await adicionarProduto(lojaId, nome, plataformaFinal);
      setNovoProduto((prev) => ({ ...prev, [lojaId]: '' }));
      setPlataformaOutra((prev) => ({ ...prev, [lojaId]: '' }));
      onSuccess('Produto adicionado.');
      onChanged();
    } catch (e) {
      onError('Erro: ' + e.message);
    }
  }

  async function handleDevolver(produtoId) {
    try {
      await marcarDevolvido(produtoId);
      onSuccess('Marcado como devolvido.');
      onChanged();
    } catch (e) {
      onError('Erro: ' + e.message);
    }
  }

  async function handleExcluirProduto(produtoId) {
    try {
      await excluirProduto(produtoId);
      onSuccess('Produto excluído.');
      onChanged();
    } catch (e) {
      onError('Erro: ' + e.message);
    }
  }

  async function handleExcluirLoja(lojaId) {
    if (
      !confirm(
        'Excluir esta loja e todos os produtos vinculados a ela? Os clientes já cadastrados NÃO serão excluídos.'
      )
    )
      return;
    try {
      await excluirLoja(lojaId);
      onSuccess('Loja excluída.');
      onChanged();
    } catch (e) {
      onError('Erro: ' + e.message);
    }
  }

  return (
    <>
      <h1 className="title" style={{ fontSize: 20 }}>
        Lojas e produtos
      </h1>
      <p className="subtitle">
        Cadastre lojas e os produtos aguardando devolução. Marque como devolvido ou exclua quando
        finalizado.
      </p>

      <div className="section-label">Nova loja</div>
      <div className="add-inline">
        <input
          type="text"
          value={novaLoja}
          onChange={(e) => setNovaLoja(e.target.value)}
          placeholder="Nome da loja"
        />
        <button className="btn small" onClick={handleAddLoja}>
          Adicionar
        </button>
      </div>

      <div className="section-label">Adicionar produto</div>
      <p className="subtitle" style={{ margin: '0 0 12px', fontSize: 12.5 }}>
        Escolha a loja direto aqui, sem precisar rolar a lista abaixo.
      </p>
      <div className="add-inline">
        <select value={lojaRapidaId} onChange={(e) => setLojaRapidaId(e.target.value)}>
          <option value="">Selecione a loja</option>
          {lojas.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nome}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Nome do produto"
          value={produtoRapidoNome}
          onChange={(e) => setProdutoRapidoNome(e.target.value)}
        />
        <select value={plataformaRapida} onChange={(e) => setPlataformaRapida(e.target.value)}>
          {PLATAFORMAS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {plataformaRapida === 'Outra' && (
          <input
            type="text"
            placeholder="Qual plataforma?"
            value={plataformaRapidaOutra}
            onChange={(e) => setPlataformaRapidaOutra(e.target.value)}
          />
        )}
        <button className="btn small" onClick={handleAddProdutoRapido}>
          Adicionar
        </button>
      </div>

      <div className="section-label">Lojas cadastradas</div>
      {lojas.length === 0 && <div className="empty">Nenhuma loja ainda.</div>}

      {lojas.map((l) => (
        <div className="admin-store-card" key={l.id}>
          <div className="admin-store-head">
            <strong>{l.nome}</strong>
            <button className="icon-btn del" onClick={() => handleExcluirLoja(l.id)}>
              Excluir loja
            </button>
          </div>

          {l.produtos.length === 0 && (
            <div className="produto-row">
              <span className="p-name" style={{ color: 'var(--ink-soft)' }}>
                Nenhum produto cadastrado
              </span>
            </div>
          )}

          {l.produtos.map((p) => (
            <div className="produto-row" key={p.id}>
              <span
                className="p-name"
                style={
                  p.status === 'devolvido'
                    ? { textDecoration: 'line-through', color: 'var(--ink-soft)' }
                    : {}
                }
              >
                {p.nome}
                {p.plataforma && <span className="plataforma-badge">{p.plataforma}</span>}
              </span>
              <div className="p-actions">
                {p.status === 'pendente' && (
                  <button className="icon-btn done" onClick={() => handleDevolver(p.id)}>
                    Devolvido
                  </button>
                )}
                <button className="icon-btn del" onClick={() => handleExcluirProduto(p.id)}>
                  Excluir
                </button>
              </div>
            </div>
          ))}

          <div className="add-inline">
            <input
              type="text"
              placeholder="Nome do produto"
              value={novoProduto[l.id] || ''}
              onChange={(e) => setNovoProduto((prev) => ({ ...prev, [l.id]: e.target.value }))}
            />
            <select
              value={plataforma[l.id] || PLATAFORMAS[0]}
              onChange={(e) => setPlataforma((prev) => ({ ...prev, [l.id]: e.target.value }))}
            >
              {PLATAFORMAS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {(plataforma[l.id] || PLATAFORMAS[0]) === 'Outra' && (
              <input
                type="text"
                placeholder="Qual plataforma?"
                value={plataformaOutra[l.id] || ''}
                onChange={(e) => setPlataformaOutra((prev) => ({ ...prev, [l.id]: e.target.value }))}
              />
            )}
            <button className="btn small" onClick={() => handleAddProduto(l.id)}>
              Adicionar
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
