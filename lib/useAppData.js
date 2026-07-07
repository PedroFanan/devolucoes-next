'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';

/**
 * Carrega lojas e produtos do Supabase (e, quando `withClientes` é true, também
 * clientes/cadastros) e se mantém sincronizado em tempo real: qualquer alteração
 * feita em qualquer dispositivo é refletida automaticamente aqui, sem precisar
 * recarregar a página.
 *
 * `withClientes` fica desligado por padrão na tela pública para não carregar
 * nome/telefone de todo mundo no navegador de quem só quer ver a lista de lojas.
 */
export function useAppData({ withClientes = false } = {}) {
  const [lojas, setLojas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const queries = [
        supabase.from('lojas').select('id, nome').order('nome'),
        supabase.from('produtos').select('id, loja_id, nome, plataforma, status'),
      ];
      if (withClientes) {
        queries.push(supabase.from('clientes').select('id, nome, telefone').order('nome'));
        queries.push(
          supabase
            .from('cadastros')
            .select('id, cliente_id, loja_id, loja_nome, created_at')
            .order('created_at')
        );
      }

      const [lojasRes, produtosRes, clientesRes, cadastrosRes] = await Promise.all(queries);

      if (lojasRes.error) throw lojasRes.error;
      if (produtosRes.error) throw produtosRes.error;
      if (withClientes) {
        if (clientesRes.error) throw clientesRes.error;
        if (cadastrosRes.error) throw cadastrosRes.error;
      }

      const lojasComProdutos = lojasRes.data.map((l) => ({
        id: l.id,
        nome: l.nome,
        produtos: produtosRes.data.filter((p) => p.loja_id === l.id),
      }));

      setLojas(lojasComProdutos);

      if (withClientes) {
        setClientes(
          clientesRes.data.map((c) => ({
            id: c.id,
            nome: c.nome,
            telefone: c.telefone,
            cadastros: cadastrosRes.data
              .filter((cd) => cd.cliente_id === c.id)
              .map((cd) => ({ id: cd.id, loja: cd.loja_nome, criadoEm: cd.created_at })),
          }))
        );
      }
    } catch (e) {
      console.error('Erro ao carregar dados do Supabase:', e);
    } finally {
      setLoading(false);
    }
  }, [withClientes]);

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel('app-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lojas' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, loadData);

    if (withClientes) {
      channel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes' }, loadData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cadastros' }, loadData);
    }

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData, withClientes]);

  return { lojas, clientes, loading, reload: loadData };
}
