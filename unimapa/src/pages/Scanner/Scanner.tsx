import { useNavigate } from "react-router-dom";

import QrScanner from "../../components/QrScanner";

function Scanner() {
  const navigate = useNavigate();

  function handleScan(codigo: string) {
    console.log("QR CODE LIDO:", codigo);
  }

  function handleClose() {
    navigate("/");
  }

  return (
    <section className="page scanner-page">
      <h2>Escanear QR Code</h2>

      <p>
        Posicione o QR Code dentro da área indicada para identificar sua localização.
      </p>

      <QrScanner
        onScan={handleScan}
        onClose={handleClose}
      />
    </section>
  );
}

export default Scanner;