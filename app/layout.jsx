import './globals.css';

export const metadata = {
  title: 'Balcão de Devoluções',
  description: 'Cadastro e acompanhamento de devoluções por loja',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
