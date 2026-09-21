import {
  QrCode,
  Search,
  Navigation,
} from "lucide-react";

function HowToUse() {
  return (
    <section className="page how-to-use-page">
      <div className="how-to-use-intro">
        

        <h1>
          Como navegar pelo campus
        </h1>

        <p>
          Chegue ao seu destino em apenas
          3 passos.
        </p>
      </div>

      <div className="steps-container">
        {/* PASSO 1 */}
        <div className="step-card">
          <div className="step-icon">
            <QrCode size={34} />
          </div>

          <div className="step-content">
            <span className="step-number">
              PASSO 1
            </span>

            <h2>
              Escaneie o QR Code ou digite o código
            </h2>

            <p>
              Informe sua localização atual usando
              o QR Code ou o código do ponto de
              referência.
            </p>
          </div>
        </div>

        {/* PASSO 2 */}
        <div className="step-card">
          <div className="step-icon">
            <Search size={34} />
          </div>

          <div className="step-content">
            <span className="step-number">
              PASSO 2
            </span>

            <h2>
              Pesquise o destino
            </h2>

            <p>
              Use a barra de pesquisa para encontrar
              a sala ou local desejado.
            </p>
          </div>
        </div>

        {/* PASSO 3 */}
        <div className="step-card">
          <div className="step-icon">
            <Navigation size={34} />
          </div>

          <div className="step-content">
            <span className="step-number">
              PASSO 3
            </span>

            <h2>
              Siga a rota
            </h2>

            <p>
              Visualize o caminho no mapa e siga as
              instruções até chegar ao destino.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowToUse;