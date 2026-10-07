import { useEffect, useRef } from "react";
import {
  QrCode,
  X,
} from "lucide-react";

import { Html5Qrcode } from "html5-qrcode";

interface QrScannerProps {
  onScan: (codigo: string) => void;
  onClose: () => void;
}

function QrScanner({
  onScan,
  onClose,
}: QrScannerProps) {
  const scannerRef =
    useRef<Html5Qrcode | null>(null);

  const onScanRef = useRef(onScan);

  const leuQrCodeRef = useRef(false);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    let cancelado = false;

    let scanner:
      | Html5Qrcode
      | null = null;

    const timer = window.setTimeout(() => {
      void iniciarCamera();
    }, 100);

    async function iniciarCamera() {
      if (cancelado) {
        return;
      }

      const elemento =
        document.getElementById(
          "qr-reader"
        );

      if (!elemento) {
        return;
      }

      elemento.innerHTML = "";

      scanner =
        new Html5Qrcode("qr-reader");

      scannerRef.current = scanner;

      leuQrCodeRef.current = false;

      try {
        await scanner.start(
          {
            facingMode: "environment",
          },
          {
            fps: 10,

            qrbox: {
              width: 220,
              height: 220,
            },
          },

          async (textoLido) => {
            if (
              cancelado ||
              leuQrCodeRef.current
            ) {
              return;
            }

            leuQrCodeRef.current = true;

            const codigo =
              textoLido.trim();

            try {
              if (
                scanner &&
                scanner.isScanning
              ) {
                await scanner.stop();
              }

              scanner?.clear();
            } catch (error) {
              console.error(
                "Erro ao parar scanner:",
                error
              );
            }

            if (!cancelado) {
              onScanRef.current(codigo);
            }
          },

          () => {
            // QR ainda não encontrado.
          }
        );

        if (
          cancelado &&
          scanner.isScanning
        ) {
          await scanner.stop();

          scanner.clear();
        }
      } catch (error) {
        if (!cancelado) {
          console.error(
            "Erro ao abrir a câmera:",
            error
          );
        }
      }
    }

    return () => {
      cancelado = true;

      window.clearTimeout(timer);

      const scannerAtual = scanner;

      if (
        scannerRef.current ===
        scannerAtual
      ) {
        scannerRef.current = null;
      }

      if (!scannerAtual) {
        return;
      }

      if (scannerAtual.isScanning) {
        void scannerAtual
          .stop()
          .then(() => {
            try {
              scannerAtual.clear();
            } catch {
              // Scanner já limpo.
            }
          })
          .catch(() => {
            try {
              scannerAtual.clear();
            } catch {
              // Ignora erro.
            }
          });

        return;
      }

      try {
        scannerAtual.clear();
      } catch {
        // Scanner ainda não iniciado.
      }
    };
  }, []);

  async function handleClose() {
    const scanner =
      scannerRef.current;

    try {
      if (
        scanner &&
        scanner.isScanning
      ) {
        await scanner.stop();
      }

      scanner?.clear();
    } catch (error) {
      console.error(
        "Erro ao fechar a câmera:",
        error
      );
    }

    scannerRef.current = null;

    onClose();
  }

  return (
    <div className="qr-scanner">
      <div className="scanner-card">
        

        <div className="scanner-camera-area">
          <div id="qr-reader" />

          <div
            className="scanner-overlay"
            aria-hidden="true"
          >
            <span className="scanner-corner scanner-corner-tl" />
            <span className="scanner-corner scanner-corner-tr" />
            <span className="scanner-corner scanner-corner-bl" />
            <span className="scanner-corner scanner-corner-br" />

            <span className="scanner-line" />
          </div>
        </div>

        <div className="scanner-instruction">
          <QrCode size={22} />

          <div>
            <strong>
              Posicione o QR Code na área indicada
            </strong>

            <span>
              Mantenha o código centralizado e evite
              movimentar a câmera.
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="qr-cancel-button"
        onClick={handleClose}
      >
        <X size={20} />
        Cancelar leitura
      </button>
    </div>
  );
}

export default QrScanner;