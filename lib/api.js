import { supabase } from './supabaseClient';

/**
 * Registra um cadastro de devolução. Se a loja informada ainda não existir
 * (comparando sem diferenciar maiúsculas/minúsculas), ela é criada automaticamente.
 * Se já existir uma pessoa com esse telefone, o cadastro é vinculado a ela em vez
 * de duplicar nome/telefone — assim a mesma pessoa pode registrar devoluções em
 * várias lojas.
 */
export async function registrarCadastro({ lojaNome, nome, telefone, lojasExistentes }) {
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

  const telefoneTrim = telefone.trim();
  const { data: clienteExistente, error: erroBusca } = await supabase
    .from('clientes')
    .select('id')
    .eq('telefone', telefoneTrim)
    .maybeSingle();
  if (erroBusca) throw erroBusca;

  let clienteId;
  if (clienteExistente) {
    clienteId = clienteExistente.id;
  } else {
    const { data: novoCliente, error: erroCliente } = await supabase
      .from('clientes')
      .insert({ nome: nome.trim(), telefone: telefoneTrim })
      .select()
      .single();
    if (erroCliente) throw erroCliente;
    clienteId = novoCliente.id;
  }

  const { error: erroCadastro } = await supabase
    .from('cadastros')
    .insert({ cliente_id: clienteId, loja_id: lojaId, loja_nome: lojaNomeFinal });
  if (erroCadastro) throw erroCadastro;
}

export async function adicionarLoja(nome) {
  const { data, error } = await supabase.from('lojas').insert({ nome }).select().single();
  if (error) throw error;
  return data;
}

export async function adicionarProduto(lojaId, nome, plataforma) {
  const { error } = await supabase
    .from('produtos')
    .insert({ loja_id: lojaId, nome, plataforma, status: 'pendente' });
  if (error) throw error;
}

/**
 * Registra a leitura (QR code ou código de barras) de um pacote no balcão.
 * Primeira leitura de um código: cria o produto (entrada no sistema, status pendente).
 * Segunda leitura do mesmo código: marca como devolvido (saída do sistema).
 * Leituras seguintes de um código já devolvido não fazem nada além de avisar.
 */
export async function biparPacote({ lojaId, codigo }) {
  const codigoTrim = codigo.trim();
  const { data: existente, error: erroBusca } = await supabase
    .from('produtos')
    .select('id, status')
    .eq('codigo', codigoTrim)
    .maybeSingle();
  if (erroBusca) throw erroBusca;

  if (!existente) {
    const { error } = await supabase
      .from('produtos')
      .insert({ loja_id: lojaId, nome: `Pacote ${codigoTrim}`, codigo: codigoTrim, status: 'pendente' });
    if (error) throw error;
    return { acao: 'entrada' };
  }

  if (existente.status === 'pendente') {
    const { error } = await supabase
      .from('produtos')
      .update({ status: 'devolvido' })
      .eq('id', existente.id);
    if (error) throw error;
    return { acao: 'saida' };
  }

  return { acao: 'ja_finalizado' };
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

export async function excluirCadastro(cadastroId) {
  const { error } = await supabase.from('cadastros').delete().eq('id', cadastroId);
  if (error) throw error;
}
