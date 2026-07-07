# Plano de ação — Balcão de Devoluções (Next.js + Supabase)

## Estrutura do projeto

```
devolucoes-next/
├── app/
│   ├── layout.jsx          # layout raiz, importa o CSS global
│   ├── globals.css         # todo o visual do app (cores, tipografia, componentes)
│   ├── page.jsx            # tela pública: cadastro + lista de lojas
│   └── admin/
│       └── page.jsx        # tela administrativa: PIN + abas
├── components/
│   ├── CadastroForm.jsx
│   ├── CadastroConfirmado.jsx
│   ├── ListaLojas.jsx
│   ├── Toast.jsx
│   └── admin/
│       ├── PinGate.jsx
│       ├── LojasProdutos.jsx
│       ├── ClientesList.jsx
│       └── QrCodePanel.jsx
├── lib/
│   ├── supabaseClient.js   # conexão com o Supabase
│   ├── api.js              # todas as funções de escrita no banco
│   └── useAppData.js       # hook que carrega e sincroniza os dados em tempo real
├── schema.sql               # script para criar as tabelas no Supabase
├── .env.local.example        # modelo das variáveis de ambiente
└── package.json
```

Cada tela, componente e função tem seu próprio arquivo — nada de HTML, CSS e JS misturados.

---

## Passo 1 — Criar o projeto no Supabase

1. Acesse https://supabase.com e crie uma conta.
2. **New Project** → escolha nome, senha do banco (guarde) e região.
3. Aguarde a criação (~2 min).

## Passo 2 — Criar as tabelas

1. No painel, vá em **SQL Editor** → **New query**.
2. Copie todo o conteúdo de `schema.sql` e cole lá.
3. Clique em **Run**.
4. Confirme em **Table Editor** que as tabelas `lojas`, `produtos` e `clientes` foram criadas.

## Passo 3 — Configurar as variáveis de ambiente

1. Em **Project Settings > API**, copie a **Project URL** e a **anon public key**.
2. Na raiz do projeto, copie o arquivo `.env.local.example` e renomeie para `.env.local`:
   ```
   cp .env.local.example .env.local
   ```
3. Abra `.env.local` e preencha:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
   NEXT_PUBLIC_ADMIN_PIN=escolha_um_pin_seu
   ```

> O prefixo `NEXT_PUBLIC_` é obrigatório no Next.js para que essas variáveis fiquem disponíveis no navegador (front-end). Isso é esperado e seguro para a anon key — a segurança real vem das regras (RLS) já configuradas no `schema.sql`.

## Passo 4 — Rodar localmente no seu PC

Pré-requisito: ter o [Node.js](https://nodejs.org) instalado (versão 18 ou superior).

```bash
npm install
npm run dev
```

Abra `http://localhost:3000` no navegador.

- Tela pública: cadastro + lista de lojas
- Tela admin: `http://localhost:3000/admin` (PIN definido em `.env.local`)

Teste o fluxo completo: cadastre uma loja nova pela tela pública, confira se ela aparece no admin, adicione produtos, marque como devolvido, exclua um cadastro. Abra em outro dispositivo na mesma rede (ou peça pra alguém abrir a URL) pra confirmar a sincronização em tempo real.

## Passo 5 — Publicar (hospedar de verdade)

Diferente do app anterior (HTML puro), este é um projeto Next.js — ele **não roda bem em hospedagem 100% estática como o GitHub Pages** sem configurações extras, porque o Next.js foi feito para rodar com um pequeno servidor por trás. A forma mais simples e gratuita de publicar é a **Vercel** (empresa que mantém o Next.js):

1. Suba o projeto para um repositório no GitHub (o `.gitignore` já evita subir `node_modules` e `.env.local`).
2. Acesse https://vercel.com, crie uma conta e conecte com o GitHub.
3. **Add New Project** → selecione o repositório.
4. Em "Environment Variables", adicione as mesmas 3 variáveis do seu `.env.local`.
5. Clique em **Deploy**. Em poucos minutos você recebe uma URL definitiva, tipo `https://seu-projeto.vercel.app`.
6. Essa URL é a que deve ir no QR code (gerado automaticamente na aba "QR Code" do painel admin).

Se realmente precisar hospedar no GitHub Pages por algum motivo específico, me avise — dá pra adaptar o projeto para "exportação estática", mas com a limitação de perder alguns recursos do Next.js.

## Passo 6 — Antes de usar em produção

- Troque o PIN padrão (`NEXT_PUBLIC_ADMIN_PIN`) por um só seu.
- Lembre-se: o PIN é só uma barreira na interface, não uma autenticação real do Supabase. Se quiser reforçar isso com login de verdade (Supabase Auth), me avise.
- Os dados (`clientes`, `lojas`, `produtos`) podem ser vistos, editados e exportados como CSV/Excel a qualquer momento direto pelo **Table Editor** do Supabase.
