import { useEffect, useState } from "react";

import {
  Map,
  MapPin,
  QrCode,
  Search,
} from "lucide-react";

import { Link } from "react-router-dom";

import { buscarQrPorCodigo } from "../../services/api";

import {
  getCurrentLocation,
  saveCurrentLocation,
} from "../../services/cookieService";

import type { CurrentLocation } from "../../types/location";

function Home() {
  const [referenceCode, setReferenceCode] =
    useState("");

  const [currentLocation, setCurrentLocation] =
    useState<CurrentLocation | null>(null);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    const savedLocation =
      getCurrentLocation();

    if (savedLocation) {
      setCurrentLocation(savedLocation);
    }
  }, []);

  async function handleSaveLocation() {
    const codigo = referenceCode.trim();

    if (!codigo) {
      setMessage(
        "Digite um código de localização."
      );

      return;
    }

    try {
      const resposta =
        await buscarQrPorCodigo(codigo);

      const location: CurrentLocation = {
        pointCode: resposta.codigoQr,
        name: resposta.descricao,
        floor: resposta.andar,
      };

      saveCurrentLocation(location);

      setCurrentLocation(location);
      setReferenceCode("");

      setMessage(
        "Localização salva com sucesso."
      );
    } catch (error) {
      console.error(
        "Erro ao localizar QR Code:",
        error
      );

      setMessage(
        "Código não encontrado. Verifique o código informado."
      );
    }
  }

  return (
    <section className="page home-page">
      {/* LOCALIZAÇÃO */}
      <div className="location-card">
        <h2>
          <MapPin size={24} />
          Você está em:
        </h2>

        <div
          className={`current-location ${
            currentLocation
              ? "active"
              : ""
          }`}
        >
          {currentLocation ? (
            <>
              <strong>
                {currentLocation.name}
              </strong>

              <span>
                {currentLocation.floor}
              </span>
            </>
          ) : (
            <Link
              to="/scanner"
              className="scan-location-button"
            >
              <QrCode size={26} />

              <span>
                Escanear QR Code
              </span>
            </Link>
          )}
        </div>

        <p className="separator">
          ou
        </p>

        <div className="code-row">
          <input
            type="text"
            placeholder="Digite o código"
            value={referenceCode}
            onChange={(event) =>
              setReferenceCode(
                event.target.value
              )
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSaveLocation();
              }
            }}
          />

          <button
            type="button"
            onClick={handleSaveLocation}
            aria-label="Salvar localização"
          >
            ✓
          </button>
        </div>

        {message && (
          <p className="feedback-message">
            {message}
          </p>
        )}

        <p className="demo-codes">
          Códigos disponíveis para teste:
          QR_3_01, QR_3_02, QR_3_03,
          QR_3_04, QR_3_05
        </p>
      </div>

      {/* AÇÕES */}
      <div className="home-actions">
        <Link
          to="/search"
          className="home-card"
        >
          <span className="home-card-icon">
            <Search size={52} />
          </span>

          <h3>Pesquisar Destino</h3>

          <p>Encontre salas</p>
        </Link>

        <Link
          to="/map"
          className="home-card"
        >
          <span className="home-card-icon">
            <Map size={52} />
          </span>

          <h3>Ver Mapa</h3>

          <p>Visualizar mapa</p>
        </Link>
      </div>
    </section>
  );
}

export default Home;