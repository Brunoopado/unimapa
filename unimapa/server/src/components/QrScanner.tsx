import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QrScannerProps {
  onScan: (codigo: string) => void;
  onClose: () => void;
}

export default function QrScanner({
  onScan,
  onClose,
}: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const leuQrCodeRef = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");

    scannerRef.current = scanner;

    const iniciarCamera = async () => {
      try {
        await scanner.start(
          {
            facingMode: "environment",
          },
          {
            fps: 10,
            qrbox: {
              width: 250,
              height: 250,
            },
          },
          async (textoLido) => {
            if (leuQrCodeRef.current) {
              return;
            }

            leuQrCodeRef.current = true;

            const codigo = textoLido.trim();

            try {
              await scanner.stop();
            } catch {
              // Câmera já pode ter sido encerrada.
            }

            onScan(codigo);
          },
          () => {
            // Ignora tentativas em que nenhum QR foi encontrado.
          }
        );
      } catch (error) {
        console.error("Erro ao abrir a câmera:", error);
      }
    };

    iniciarCamera();

    return () => {
      const scannerAtual = scannerRef.current;

      if (scannerAtual?.isScanning) {
        scannerAtual.stop().catch(() => {});
      }
    };
  }, [onScan]);

  const fecharScanner = async () => {
    const scannerAtual = scannerRef.current;

    if (scannerAtual?.isScanning) {
      try {
        await scannerAtual.stop();
      } catch {
        // Ignora erro ao finalizar câmera.
      }
    }

    onClose();
  };

  return (
    <div>
      <div id="qr-reader" />

      <button type="button" onClick={fecharScanner}>
        Cancelar
      </button>
    </div>
  );
}