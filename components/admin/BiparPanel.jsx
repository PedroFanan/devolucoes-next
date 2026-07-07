'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { biparPacote } from '@/lib/api';

const ROTULO_ACAO = {
  entrada: 'Entrada',
  saida: 'Saída',
  ja_finalizado: 'Já baixado',
};

export default function BiparPanel({ lojas, onChanged, onError, onSuccess }) {
  const [lojaId, setLojaId] = useState('');
  const [lendo, setLendo] = useState(false);
  const [codigoManual, setCodigoManual] = useState('');
  const [historico, setHistorico] = useState([]);

  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const ultimaLeituraRef = useRef({ codigo: null, ts: 0 });

  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
    };
  }, []);

  function registrarHistorico(codigo, acao) {
    const lojaNome = lojas.find((l) => l.id === lojaId)?.nome || '';
    setHistorico((prev) =>
      [{ codigo, acao, lojaNome, hora: new Date().toLocaleTimeString('pt-BR') }, ...prev].slice(0, 20)
    );
  }

  async function processarCodigo(codigo) {
    if (!lojaId) {
      onError('Selecione a loja antes de bipar.');
      return;
    }
    const agora = Date.now();
    if (ultimaLeituraRef.current.codigo === codigo && agora - ultimaLeituraRef.current.ts < 3000) {
      return;
    }
    ultimaLeituraRef.current = { codigo, ts: agora };

    try {
      const { acao } = await biparPacote({ lojaId, codigo });
      if (acao === 'entrada') onSuccess(`Entrada registrada: ${codigo}`);
      else if (acao === 'saida') onSuccess(`Saída registrada: ${codigo}`);
      else onError(`Código ${codigo} já estava baixado (devolvido).`);
      registrarHistorico(codigo, acao);
      onChanged();
    } catch (e) {
      onError('Erro ao bipar: ' + e.message);
    }
  }

  async function iniciarLeitura() {
    if (!lojaId) {
      onError('Selecione a loja antes de bipar.');
      return;
    }
    setLendo(true);
    try {
      const reader = new BrowserMultiFormatReader();
      const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        if (result) processarCodigo(result.getText());
      });
      controlsRef.current = controls;
    } catch (e) {
      onError('Não foi possível acessar a câmera: ' + e.message);
      setLendo(false);
    }
  }

  function pararLeitura() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setLendo(false);
  }

  function handleManualSubmit(e) {
    e.preventDefault();
    if (!codigoManual.trim()) return;
    processarCodigo(codigoManual.trim());
    setCodigoManual('');
  }

  return (
    <>
      <h1 className="title" style={{ fontSize: 20 }}>
        Bipar pacote
      </h1>
      <p className="subtitle">
        Selecione a loja e aponte a câmera para o QR code ou código de barras do pacote. A primeira
        leitura de um código registra a entrada no sistema; a segunda leitura do mesmo código
        registra a saída (devolvido).
      </p>

      <div className="field">
        <label htmlFor="bipar-loja">Loja</label>
        <select id="bipar-loja" value={lojaId} onChange={(e) => setLojaId(e.target.value)}>
          <option value="">Selecione a loja</option>
          {lojas.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="qr-box" style={{ marginTop: 16 }}>
        <video
          ref={videoRef}
          style={{ width: '100%', borderRadius: 4, display: lendo ? 'block' : 'none' }}
          muted
          playsInline
        />
        {!lendo ? (
          <button className="btn block" onClick={iniciarLeitura}>
            Iniciar câmera
          </button>
        ) : (
          <button className="btn block secondary" onClick={pararLeitura}>
            Parar câmera
          </button>
        )}
      </div>

      <div className="section-label">Código manual</div>
      <form className="add-inline" onSubmit={handleManualSubmit}>
        <input
          type="text"
          placeholder="Digite o código caso não consiga bipar"
          value={codigoManual}
          onChange={(e) => setCodigoManual(e.target.value)}
        />
        <button type="submit" className="btn small">
          Bipar
        </button>
      </form>

      {historico.length > 0 && (
        <>
          <div className="section-label">Últimas leituras</div>
          {historico.map((h, i) => (
            <div className="produto-row" key={i}>
              <span className="p-name">
                {h.codigo}
                <span className="plataforma-badge">{h.lojaNome}</span>
              </span>
              <span className={`count-badge ${h.acao === 'saida' ? 'zero' : ''}`}>
                {ROTULO_ACAO[h.acao]}
              </span>
            </div>
          ))}
        </>
      )}
    </>
  );
}
