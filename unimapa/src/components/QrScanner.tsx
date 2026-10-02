import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QrScannerProps {
  onScan: (codigo: string) => void;
  onClose: () => void;
}

function QrScanner({
  onScan,
  onClose,
}: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const onScanRef = useRef(onScan);

  const leuQrCodeRef = useRef(false);

  /*
    Mantém sempre a versão mais recente
    da função recebida por props.
  */
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    let componenteAtivo = true;

    const scanner = new Html5Qrcode("qr-reader");

    scannerRef.current = scanner;

    async function iniciarCamera() {
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

          /*
            QR CODE ENCONTRADO
          */
          async (textoLido) => {
            if (
              !componenteAtivo ||
              leuQrCodeRef.current
            ) {
              return;
            }

            leuQrCodeRef.current = true;

            const codigo =
              textoLido.trim();

            try {
              if (scanner.isScanning) {
                await scanner.stop();
              }
            } catch (error) {
              console.error(
                "Erro ao parar a câmera:",
                error
              );
            }

            if (componenteAtivo) {
              onScanRef.current(codigo);
            }
          },

          /*
            Executado várias vezes enquanto
            ainda não encontrou um QR.
            Não precisamos fazer nada.
          */
          () => {}
        );

        /*
          Pode acontecer de o componente
          ser fechado enquanto a câmera
          ainda estava sendo iniciada.
        */
        if (
          !componenteAtivo &&
          scanner.isScanning
        ) {
          await scanner.stop();
          scanner.clear();
        }
      } catch (error) {
        if (componenteAtivo) {
          console.error(
            "Erro ao abrir a câmera:",
            error
          );
        }
      }
    }

    void iniciarCamera();

    /*
      LIMPEZA AO SAIR DA PÁGINA
    */
    return () => {
      componenteAtivo = false;

      if (scannerRef.current === scanner) {
        scannerRef.current = null;
      }

      if (scanner.isScanning) {
        scanner
          .stop()
          .then(() => {
            try {
              scanner.clear();
            } catch {
              // Scanner já foi limpo.
            }
          })
          .catch(() => {
            // Ignora erro ao desmontar.
          });

        return;
      }

      try {
        scanner.clear();
      } catch {
        // Scanner ainda não estava iniciado.
      }
    };
  }, []);

  /*
    BOTÃO CANCELAR
  */
  async function handleClose() {
    const scanner =
      scannerRef.current;

    try {
      if (scanner?.isScanning) {
        await scanner.stop();
      }

      if (scanner) {
        scanner.clear();
      }
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
      <div id="qr-reader" />

      <button
        type="button"
        className="qr-cancel-button"
        onClick={handleClose}
      >
        Cancelar
      </button>
    </div>
  );
}

export default QrScanner;