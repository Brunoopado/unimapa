import { useEffect, useState } from "react";
import { Map, MapPin, QrCode, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { findReferencePointByCode } from "../../data/demoQrCodes";
import {
  getCurrentLocation,
  saveCurrentLocation,
} from "../../services/cookieService";
import type { CurrentLocation } from "../../types/location";

function Home() {
  const [referenceCode, setReferenceCode] = useState("");
  const [currentLocation, setCurrentLocation] =
    useState<CurrentLocation | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedLocation = getCurrentLocation();

    if (savedLocation) {
      setCurrentLocation(savedLocation);
    }
  }, []);

  function handleSaveLocation() {
    const foundLocation = findReferencePointByCode(referenceCode);

    if (!foundLocation) {
      setMessage("Código não encontrado. Teste: P001, P002, P003 ou P004.");
      return;
    }

    saveCurrentLocation(foundLocation);
    setCurrentLocation(foundLocation);
    setReferenceCode("");
    setMessage("Localização salva com sucesso.");
  }

  return (
    <section className="page home-page">
      <div className="location-card">
        <h2>
          <MapPin size={24} />
          Você está em:
        </h2>

        <div className={`current-location ${currentLocation ? "active" : ""}`}>
          {currentLocation ? (
            <>
              <strong>{currentLocation.name}</strong>
              <span>{currentLocation.floor}</span>
            </>
          ) : (
            "Escaneie um QR Code para definir sua localização"
          )}
        </div>

        <p className="separator">ou</p>

        <div className="code-row">
          <input
            type="text"
            placeholder="Digite o código"
            value={referenceCode}
            onChange={(event) => setReferenceCode(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSaveLocation();
              }
            }}
          />
          <button type="button" onClick={handleSaveLocation}>
            ✓
          </button>
        </div>

        {message && <p className="feedback-message">{message}</p>}

        <p className="demo-codes">Códigos de teste: P001, P002, P003, P004</p>
      </div>

      <div className="home-actions">
        <Link to="/map" className="home-card">
          <span className="home-card-icon">
            <QrCode size={52} />
          </span>
          <h3>Escanear QR Code</h3>
          <p>Identifique sua localização atual no campus</p>
        </Link>

        <Link to="/search" className="home-card">
          <span className="home-card-icon">
            <Search size={52} />
          </span>
          <h3>Pesquisar Destino</h3>
          <p>Encontre salas</p>
        </Link>

        <Link to="/map" className="home-card">
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