-- ============================================================
-- ESQUEMA DO BANCO - Balcão de Devoluções
-- Rode este script inteiro no Supabase: SQL Editor > New query
-- ============================================================

-- Extensão necessária para gerar IDs únicos (uuid)
create extension if not exists "pgcrypto";

-- ---------- TABELA: lojas ----------
create table if not exists lojas (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  created_at timestamptz not null default now()
);

-- ---------- TABELA: produtos (produtos aguardando devolução, ligados a uma loja) ----------
create table if not exists produtos (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references lojas(id) on delete cascade,
  nome text not null,
  status text not null default 'pendente' check (status in ('pendente','devolvido')),
  created_at timestamptz not null default now()
);

-- ---------- TABELA: clientes (cadastros feitos pelo público via QR code) ----------
-- loja_id fica nulo se a loja for excluída (o cliente NUNCA some, conforme exigido)
create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid references lojas(id) on delete set null,
  loja_nome text not null, -- guardado separado, garante que o nome da loja não se perde mesmo se a loja for excluída
  nome text not null,
  telefone text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Necessário no Supabase para permitir leitura/escrita pública
-- (o app usa a "anon key", então as regras abaixo controlam
-- o que qualquer visitante pode fazer)
-- ============================================================

alter table lojas enable row level security;
alter table produtos enable row level security;
alter table clientes enable row level security;

-- Qualquer pessoa pode LER as 3 tabelas (necessário pra tela pública funcionar)
create policy "select_publico_lojas" on lojas for select using (true);
create policy "select_publico_produtos" on produtos for select using (true);
create policy "select_publico_clientes" on clientes for select using (true);

-- Qualquer pessoa pode CRIAR loja (cliente pode cadastrar loja nova) e cadastro de cliente
create policy "insert_publico_lojas" on lojas for insert with check (true);
create policy "insert_publico_clientes" on clientes for insert with check (true);

-- Produtos, atualização e exclusão: liberado para o app funcionar (o painel admin é protegido
-- só por PIN na interface, não por autenticação real do Supabase — ver aviso no README)
create policy "insert_publico_produtos" on produtos for insert with check (true);
create policy "update_publico_produtos" on produtos for update using (true);
create policy "delete_publico_produtos" on produtos for delete using (true);
create policy "delete_publico_lojas" on lojas for delete using (true);
create policy "delete_publico_clientes" on clientes for delete using (true);

-- ============================================================
-- REALTIME (opcional, mas recomendado)
-- Permite que todos os dispositivos vejam mudanças na hora,
-- sem precisar recarregar a página
-- ============================================================
alter publication supabase_realtime add table lojas;
alter publication supabase_realtime add table produtos;
alter publication supabase_realtime add table clientes;
