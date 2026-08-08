import { useEffect, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useSearchParams } from "react-router-dom";
import { calcularRota } from "../../services/api";
import type { RotaCalculada } from "../../types/rota";

type Andar = "Térreo" | "1º" | "2º" | "3º";
type TipoRota = "Rampa" | "Elevador" | "Escada";

function Map() {
  const [searchParams] = useSearchParams();

  const codigoQr = searchParams.get("codigoQr");
  const idDestino = searchParams.get("idDestino");
  
  const [rota, setRota] = useState<RotaCalculada | null>(null);

  const pontosPolyline = rota
  ? rota.caminho
      .map((ponto) => `${ponto.x},${ponto.y}`)
      .join(" ")
  : "";

  useEffect(() => {
  async function carregarRota() {
    try {
      if (!codigoQr || !idDestino) {
        return;
      }

      const resultado = await calcularRota(
        codigoQr,
        idDestino
      );

      console.log("ROTA RECEBIDA DO BACKEND:");
      console.log(resultado);

      setRota(resultado);

    } catch (error) {
      console.error(
        "Erro ao buscar rota:",
        error
      );
    }
  }

  carregarRota();
}, [codigoQr, idDestino]);
  const [andarSelecionado, setAndarSelecionado] = useState<Andar>("3º");
  const [tipoRota, setTipoRota] = useState<TipoRota>("Rampa");

  return (
    <section className="page map-page">
      <h1>Mapa</h1>

      {rota && (
  <div>
    <p>Andar: {rota.andar.nome}</p>
    <p>Origem: {rota.origem}</p>
    <p>Destino: {rota.destino}</p>
    <p>
      Pontos da rota: {rota.caminho.length}
    </p>
  </div>
)}



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
            {rota && (
              <svg
                viewBox={`${rota.andar.viewBox.minX} ${rota.andar.viewBox.minY} ${rota.andar.viewBox.largura} ${rota.andar.viewBox.altura}`}
                className="map-image"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label={`Mapa do ${rota.andar.nome}`}
              >
                <image
                  href={`/maps/${rota.andar.arquivoSvg}`}
                  x={rota.andar.viewBox.minX}
                  y={rota.andar.viewBox.minY}
                  width={rota.andar.viewBox.largura}
                  height={rota.andar.viewBox.altura}
                  preserveAspectRatio="xMidYMid meet"
                />

                <polyline
                  points={pontosPolyline}
                  fill="none"
                  stroke="#00a63d"
                  strokeWidth="25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
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