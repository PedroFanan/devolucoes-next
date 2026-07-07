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
  plataforma text not null default 'Outra', -- ex: TikTok, Magalu, Shopee, Shein ou texto livre
  status text not null default 'pendente' check (status in ('pendente','devolvido')),
  codigo text, -- código do QR/código de barras da transportadora, lido na tela "Bipar" do admin
  created_at timestamptz not null default now()
);

-- Se a tabela já existia antes deste campo ser adicionado, este comando garante que ele
-- seja criado sem apagar os dados (idempotente: pode rodar de novo sem erro).
alter table produtos add column if not exists codigo text;

-- Código único por pacote (permite vários produtos sem código, pois NULL nunca colide).
create unique index if not exists produtos_codigo_key on produtos (codigo) where codigo is not null;

-- ---------- TABELA: clientes (identidade da pessoa - nome + telefone, sem repetição) ----------
-- telefone identifica a pessoa: se ela já tiver cadastro, um novo cadastro (em outra
-- loja) é vinculado à mesma pessoa em vez de duplicar nome/telefone.
create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text not null unique,
  created_at timestamptz not null default now()
);

-- ---------- TABELA: cadastros (cada devolução registrada por um cliente em uma loja) ----------
-- loja_id fica nulo se a loja for excluída (o cadastro NUNCA some, conforme exigido)
create table if not exists cadastros (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  loja_id uuid references lojas(id) on delete set null,
  loja_nome text not null, -- guardado separado, garante que o nome da loja não se perde mesmo se a loja for excluída
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
alter table cadastros enable row level security;

-- Qualquer pessoa pode LER as 4 tabelas (necessário pra tela pública funcionar)
create policy "select_publico_lojas" on lojas for select using (true);
create policy "select_publico_produtos" on produtos for select using (true);
create policy "select_publico_clientes" on clientes for select using (true);
create policy "select_publico_cadastros" on cadastros for select using (true);

-- Qualquer pessoa pode CRIAR loja (cliente pode cadastrar loja nova), se identificar
-- como cliente e registrar um cadastro de devolução
create policy "insert_publico_lojas" on lojas for insert with check (true);
create policy "insert_publico_clientes" on clientes for insert with check (true);
create policy "insert_publico_cadastros" on cadastros for insert with check (true);

-- Produtos, atualização e exclusão: liberado para o app funcionar (o painel admin é protegido
-- só por PIN na interface, não por autenticação real do Supabase — ver aviso no README)
create policy "insert_publico_produtos" on produtos for insert with check (true);
create policy "update_publico_produtos" on produtos for update using (true);
create policy "delete_publico_produtos" on produtos for delete using (true);
create policy "delete_publico_lojas" on lojas for delete using (true);
create policy "delete_publico_clientes" on clientes for delete using (true);
create policy "delete_publico_cadastros" on cadastros for delete using (true);

-- ============================================================
-- REALTIME (opcional, mas recomendado)
-- Permite que todos os dispositivos vejam mudanças na hora,
-- sem precisar recarregar a página
-- ============================================================
alter publication supabase_realtime add table lojas;
alter publication supabase_realtime add table produtos;
alter publication supabase_realtime add table clientes;
alter publication supabase_realtime add table cadastros;
