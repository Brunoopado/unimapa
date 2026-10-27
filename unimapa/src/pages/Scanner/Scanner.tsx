import { useState } from "react";
import { useNavigate } from "react-router-dom";

import QrScanner from "../../components/QrScanner";

import { buscarQrPorCodigo } from "../../services/api";

import {
  saveCurrentLocation,
} from "../../services/cookieService";

import type {
  CurrentLocation,
} from "../../types/location";

function Scanner() {
  const navigate = useNavigate();

  const [erro, setErro] = useState("");
  const [scannerKey, setScannerKey] = useState(0);

  async function handleScan(codigoLido: string) {
    const codigo = codigoLido.trim();

    console.log("QR CODE LIDO:", codigo);

    try {
      setErro("");

      const resposta =
        await buscarQrPorCodigo(codigo);

      const location: CurrentLocation = {
        pointCode: resposta.codigoQr,
        name: resposta.descricao,
        floor: resposta.andar,
      };

      saveCurrentLocation(location);

      console.log(
        "LOCALIZAÇÃO SALVA:",
        location
      );

      navigate("/");
    } catch (error) {
      console.error(
        "Erro ao localizar QR Code:",
        error
      );

      setErro(
        "QR Code não reconhecido. Tente novamente."
      );

      // Reinicia a câmera após uma leitura inválida
      setScannerKey((valor) => valor + 1);
    }
  }

  function handleClose() {
    navigate("/");
  }

  return (
    <section className="page scanner-page">
      <h2>Escanear QR Code</h2>

      <p>
        Posicione o QR Code dentro da área indicada
        para identificar sua localização.
      </p>

      {erro && (
        <div className="scanner-error">
          {erro}
        </div>
      )}

      <QrScanner
        key={scannerKey}
        onScan={handleScan}
        onClose={handleClose}
      />
    </section>
  );
}

export default Scanner;