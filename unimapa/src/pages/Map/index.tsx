import { useEffect, useState } from "react";
import {
  TransformWrapper,
  TransformComponent,
} from "react-zoom-pan-pinch";
import { useSearchParams } from "react-router-dom";
import { calcularRota } from "../../services/api";
import type { RotaCalculada } from "../../types/rota";

type Andar = "Térreo" | "1º" | "2º" | "3º";
type TipoRota = "Rampa" | "Elevador" | "Escada";

/*
  O backend retorna nomes como:
  "2º Andar"
  "3º Andar"

  Mas os botões mostram:
  "2º"
  "3º"

  Esta função converte o nome vindo do backend
  para o formato utilizado pela interface.
*/
function obterLabelAndar(nomeAndar: string): Andar | null {
  if (nomeAndar.startsWith("Térreo")) {
    return "Térreo";
  }

  if (nomeAndar.startsWith("1º")) {
    return "1º";
  }

  if (nomeAndar.startsWith("2º")) {
    return "2º";
  }

  if (nomeAndar.startsWith("3º")) {
    return "3º";
  }

  return null;
}

function Map() {
  const [searchParams] = useSearchParams();

  const codigoQr = searchParams.get("codigoQr");
  const idDestino = searchParams.get("idDestino");

  const [rota, setRota] =
    useState<RotaCalculada | null>(null);

  const [andarSelecionado, setAndarSelecionado] =
    useState<Andar>("3º");

  const [tipoRota, setTipoRota] =
    useState<TipoRota>("Rampa");

  /*
    Descobre qual trecho da rota corresponde
    ao andar selecionado pelo usuário.
  */
  const indiceTrechoAtual =
    rota?.trechos.findIndex((trecho) => {
      const labelAndar = obterLabelAndar(
        trecho.andar.nome
      );

      return labelAndar === andarSelecionado;
    }) ?? -1;

  /*
    Trecho que será exibido atualmente no mapa.
  */
  const trechoAtual =
    rota && indiceTrechoAtual >= 0
      ? rota.trechos[indiceTrechoAtual]
      : null;

  /*
    Converte os pontos do trecho atual
    para o formato utilizado pela polyline SVG.
  */
  const pontosPolyline = trechoAtual
    ? trechoAtual.caminho
        .map(
          (ponto) =>
            `${ponto.x},${ponto.y}`
        )
        .join(" ")
    : "";

  /*
    "Você está aqui" aparece somente
    no primeiro trecho da rota.
  */
  const pontoPartida =
    trechoAtual &&
    indiceTrechoAtual === 0 &&
    trechoAtual.caminho.length > 0
      ? trechoAtual.caminho[0]
      : null;

  /*
    O pin "Chegada" aparece somente
    no último trecho da rota.
  */
  const pontoDestino =
    trechoAtual &&
    rota &&
    indiceTrechoAtual ===
      rota.trechos.length - 1 &&
    trechoAtual.caminho.length > 0
      ? trechoAtual.caminho[
          trechoAtual.caminho.length - 1
        ]
      : null;

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

        console.log(
          "ROTA RECEBIDA DO BACKEND:"
        );
        console.log(resultado);

        setRota(resultado);

        /*
          Quando a rota carregar, o mapa
          começa automaticamente no andar
          onde o usuário está.
        */
        if (resultado.trechos.length > 0) {
          const primeiroAndar =
            obterLabelAndar(
              resultado.trechos[0].andar.nome
            );

          if (primeiroAndar) {
            setAndarSelecionado(
              primeiroAndar
            );
          }
        }
      } catch (error) {
        console.error(
          "Erro ao buscar rota:",
          error
        );
      }
    }

    carregarRota();
  }, [codigoQr, idDestino]);

  return (
    <section className="page map-page">
      <h1>Mapa</h1>

      {/* INFORMAÇÕES TEMPORÁRIAS DA ROTA */}
      {rota && trechoAtual && (
        <div>
          <p>
            Andar: {trechoAtual.andar.nome}
          </p>

          <p>
            Origem: {rota.origem}
          </p>

          <p>
            Destino: {rota.destino}
          </p>

          <p>
            Pontos deste trecho:{" "}
            {trechoAtual.caminho.length}
          </p>

          <p>
            Trechos da rota:{" "}
            {rota.totalTrechos}
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
            {trechoAtual && (
              <svg
                viewBox={`
                  ${trechoAtual.andar.viewBox.minX}
                  ${trechoAtual.andar.viewBox.minY}
                  ${trechoAtual.andar.viewBox.largura}
                  ${trechoAtual.andar.viewBox.altura}
                `}
                className="map-image"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label={`Mapa do ${trechoAtual.andar.nome}`}
              >
                {/* PLANTA DO ANDAR */}
                <image
                  href={`/maps/${trechoAtual.andar.arquivoSvg}`}
                  x={
                    trechoAtual.andar.viewBox
                      .minX
                  }
                  y={
                    trechoAtual.andar.viewBox
                      .minY
                  }
                  width={
                    trechoAtual.andar.viewBox
                      .largura
                  }
                  height={
                    trechoAtual.andar.viewBox
                      .altura
                  }
                  preserveAspectRatio="xMidYMid meet"
                />

                {/* ROTA FIXA */}
                <polyline
                  points={pontosPolyline}
                  fill="none"
                  stroke="#00a63d"
                  strokeWidth="25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* BRILHO ANIMADO SOBRE A ROTA */}
                <polyline
                  key={pontosPolyline}
                  points={pontosPolyline}
                  fill="none"
                  stroke="#9cffb7"
                  strokeWidth="25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={100}
                  strokeDasharray="18 82"
                  strokeDashoffset="100"
                  opacity="0.95"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="100"
                    to="0"
                    dur="2.2s"
                    repeatCount="indefinite"
                  />
                </polyline>

                {/* VOCÊ ESTÁ AQUI */}
                {pontoPartida && (
                  <g
                    transform={`translate(${pontoPartida.x}, ${pontoPartida.y})`}
                    style={{
                      pointerEvents: "none",
                    }}
                  >
                    {/* Ponto de localização */}
                    <circle
                      cx="0"
                      cy="0"
                      r="22"
                      fill="#ffffff"
                      stroke="#F97316"
                      strokeWidth="7"
                    />

                    <circle
                      cx="0"
                      cy="0"
                      r="10"
                      fill="#F97316"
                    />

                    {/* Balão */}
                    <rect
                      x="-135"
                      y="-110"
                      width="270"
                      height="62"
                      rx="22"
                      fill="#F97316"
                      stroke="#ffffff"
                      strokeWidth="5"
                    />

                    {/* Ponta do balão */}
                    <polygon
                      points="-20,-51 20,-51 0,-24"
                      fill="#F97316"
                    />

                    {/* Texto */}
                    <text
                      x="0"
                      y="-78"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="27"
                      fontWeight="700"
                      fill="#ffffff"
                    >
                      Você está aqui
                    </text>
                  </g>
                )}

                {/* PIN DE CHEGADA */}
                {pontoDestino && (
                  <g
                    transform={`translate(${pontoDestino.x}, ${pontoDestino.y})`}
                    style={{
                      pointerEvents: "none",
                    }}
                  >
                    {/* Anel pulsando */}
                    <circle
                      cx="0"
                      cy="0"
                      r="12"
                      fill="none"
                      stroke="#F97316"
                      strokeWidth="6"
                      opacity="0.7"
                    >
                      <animate
                        attributeName="r"
                        values="12;40;12"
                        dur="1.8s"
                        repeatCount="indefinite"
                      />

                      <animate
                        attributeName="opacity"
                        values="0.7;0;0.7"
                        dur="1.8s"
                        repeatCount="indefinite"
                      />
                    </circle>

                    {/* Pin animado */}
                    <g>
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0 0; 0 -10; 0 0"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />

                      <path
                        d="
                          M 0 0
                          C -18 -24, -30 -40, -30 -60
                          C -30 -83, -17 -98, 0 -98
                          C 17 -98, 30 -83, 30 -60
                          C 30 -40, 18 -24, 0 0
                          Z
                        "
                        fill="#F97316"
                        stroke="#ffffff"
                        strokeWidth="6"
                      />

                      <circle
                        cx="0"
                        cy="-62"
                        r="11"
                        fill="#ffffff"
                      />
                    </g>

                    <text
                      x="0"
                      y="-120"
                      textAnchor="middle"
                      fontSize="38"
                      fontWeight="700"
                      fill="#F97316"
                      stroke="#ffffff"
                      strokeWidth="4"
                      paintOrder="stroke"
                    >
                      Chegada
                    </text>
                  </g>
                )}
              </svg>
            )}
          </TransformComponent>
        </TransformWrapper>
      </div>

      <div className="map-options-card">
        {/* ESCOLHA DA ROTA */}
        <div className="route-choice-buttons">
          {[
            "Rampa",
            "Elevador",
            "Escada",
          ].map((tipo) => (
            <button
              key={tipo}
              type="button"
              className={
                tipoRota === tipo
                  ? "active"
                  : ""
              }
              onClick={() =>
                setTipoRota(
                  tipo as TipoRota
                )
              }
            >
              VIA {tipo.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ESCOLHA DO ANDAR */}
        <div className="floor-choice-buttons">
          {(
            [
              "Térreo",
              "1º",
              "2º",
              "3º",
            ] as Andar[]
          ).map((andar) => {
            /*
              Verifica se esse andar faz
              parte da rota calculada.
            */
            const fazParteDaRota =
              rota?.trechos.some(
                (trecho) =>
                  obterLabelAndar(
                    trecho.andar.nome
                  ) === andar
              ) ?? false;

            return (
              <button
                key={andar}
                type="button"
                disabled={
                  !fazParteDaRota
                }
                className={
                  andarSelecionado ===
                  andar
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setAndarSelecionado(
                    andar
                  )
                }
              >
                {andar}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Map;