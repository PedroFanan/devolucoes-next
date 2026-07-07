import { supabase } from './supabaseClient';

/**
 * Registra um cliente. Se a loja informada ainda não existir (comparando
 * sem diferenciar maiúsculas/minúsculas), ela é criada automaticamente.
 */
export async function registrarCliente({ lojaNome, nome, telefone, lojasExistentes }) {
  const existente = lojasExistentes.find(
    (l) => l.nome.trim().toLowerCase() === lojaNome.trim().toLowerCase()
  );

  let lojaId, lojaNomeFinal;

  if (existente) {
    lojaId = existente.id;
    lojaNomeFinal = existente.nome;
  } else {
    const { data, error } = await supabase
      .from('lojas')
      .insert({ nome: lojaNome.trim() })
      .select()
      .single();
    if (error) throw error;
    lojaId = data.id;
    lojaNomeFinal = data.nome;
  }

  const { error: erroCliente } = await supabase
    .from('clientes')
    .insert({ loja_id: lojaId, loja_nome: lojaNomeFinal, nome, telefone });
  if (erroCliente) throw erroCliente;
}

export async function adicionarLoja(nome) {
  const { error } = await supabase.from('lojas').insert({ nome });
  if (error) throw error;
}

export async function adicionarProduto(lojaId, nome) {
  const { error } = await supabase
    .from('produtos')
    .insert({ loja_id: lojaId, nome, status: 'pendente' });
  if (error) throw error;
}

export async function marcarDevolvido(produtoId) {
  const { error } = await supabase
    .from('produtos')
    .update({ status: 'devolvido' })
    .eq('id', produtoId);
  if (error) throw error;
}

export async function excluirProduto(produtoId) {
  const { error } = await supabase.from('produtos').delete().eq('id', produtoId);
  if (error) throw error;
}

export async function excluirLoja(lojaId) {
  const { error } = await supabase.from('lojas').delete().eq('id', lojaId);
  if (error) throw error;
}

export async function excluirCliente(clienteId) {
  const { error } = await supabase.from('clientes').delete().eq('id', clienteId);
  if (error) throw error;
}
