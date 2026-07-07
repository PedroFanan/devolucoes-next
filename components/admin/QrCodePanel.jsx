'use client';

import { useEffect, useState } from 'react';

export default function QrCodePanel() {
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(window.location.origin);
  }, []);

  const qrSrc = url
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(
        url
      )}`
    : '';

  return (
    <>
      <h1 className="title" style={{ fontSize: 20 }}>
        QR Code de acesso
      </h1>
      <p className="subtitle">
        Imprima ou exiba este código para que os clientes acessem a tela de cadastro escaneando com
        o celular.
      </p>
      <div className="qr-box">
        {qrSrc && <img src={qrSrc} width={220} height={220} alt="QR code de acesso ao cadastro" />}
        <p>{url}</p>
      </div>
    </>
  );
}
