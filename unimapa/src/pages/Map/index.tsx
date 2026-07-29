import { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import terceiroAndarMapa from "../../assets/maps/3_andar_base.svg";

type Andar = "Térreo" | "1º" | "2º" | "3º";
type TipoRota = "Rampa" | "Elevador" | "Escada";

function Map() {
  const [andarSelecionado, setAndarSelecionado] = useState<Andar>("3º");
  const [tipoRota, setTipoRota] = useState<TipoRota>("Rampa");

  return (
    <section className="page map-page">
      <h1>Mapa</h1>

      <div className="map-zoom-area">
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={5}
          centerOnInit
          doubleClick={{ disabled: true }}
          wheel={{ disabled: false }}
          pinch={{ disabled: false }}
          panning={{ disabled: false }}
        >
          <TransformComponent
            wrapperClass="map-transform-wrapper"
            contentClass="map-transform-content"
          >
            <img
              src={terceiroAndarMapa}
              alt="Mapa do 3º andar"
              className="map-image"
            />
          </TransformComponent>
        </TransformWrapper>
      </div>

      <div className="map-options-card">
        <div className="route-choice-buttons">
          {["Rampa", "Elevador", "Escada"].map((tipo) => (
            <button
              key={tipo}
              type="button"
              className={tipoRota === tipo ? "active" : ""}
              onClick={() => setTipoRota(tipo as TipoRota)}
            >
              VIA {tipo.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="floor-choice-buttons">
          {["Térreo", "1º", "2º", "3º"].map((andar) => (
            <button
              key={andar}
              type="button"
              className={andarSelecionado === andar ? "active" : ""}
              onClick={() => setAndarSelecionado(andar as Andar)}
            >
              {andar}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Map;