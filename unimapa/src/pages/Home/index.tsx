import { Map, QrCode, Search } from "lucide-react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <section className="page home-page">
      <div className="location-card">
        <h2>Você está em:</h2>

        <div className="current-location">
          Escaneie um QR Code para definir sua localização
        </div>

        <p className="separator">ou</p>

        <div className="code-row">
          <input type="text" placeholder="Digite o código do ponto de referência..." />
          <button type="button">✓</button>
        </div>
      </div>

      <div className="home-actions">
        <Link to="/map" className="home-card">
          <QrCode size={64} />
          <h3>Escanear QR Code</h3>
          <p>Identifique sua localização atual no campus</p>
        </Link>

        <Link to="/search" className="home-card">
          <Search size={64} />
          <h3>Pesquisar Destino</h3>
          <p>Encontre salas</p>
        </Link>

        <Link to="/map" className="home-card">
          <Map size={64} />
          <h3>Ver Mapa</h3>
          <p>Visualizar mapa</p>
        </Link>
      </div>
    </section>
  );
}

export default Home;