'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';

/**
 * Carrega lojas, produtos e clientes do Supabase e se mantém sincronizado
 * em tempo real: qualquer alteração feita em qualquer dispositivo é refletida
 * automaticamente aqui, sem precisar recarregar a página.
 */
export function useAppData() {
  const [lojas, setLojas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [lojasRes, produtosRes, clientesRes] = await Promise.all([
        supabase.from('lojas').select('id, nome').order('nome'),
        supabase.from('produtos').select('id, loja_id, nome, status'),
        supabase
          .from('clientes')
          .select('id, loja_id, loja_nome, nome, telefone, created_at')
          .order('created_at'),
      ]);

      if (lojasRes.error) throw lojasRes.error;
      if (produtosRes.error) throw produtosRes.error;
      if (clientesRes.error) throw clientesRes.error;

      const lojasComProdutos = lojasRes.data.map((l) => ({
        id: l.id,
        nome: l.nome,
        produtos: produtosRes.data.filter((p) => p.loja_id === l.id),
      }));

      setLojas(lojasComProdutos);
      setClientes(
        clientesRes.data.map((c) => ({
          id: c.id,
          loja: c.loja_nome,
          nome: c.nome,
          telefone: c.telefone,
          criadoEm: c.created_at,
        }))
      );
    } catch (e) {
      console.error('Erro ao carregar dados do Supabase:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel('app-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lojas' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes' }, loadData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  return { lojas, clientes, loading, reload: loadData };
}
