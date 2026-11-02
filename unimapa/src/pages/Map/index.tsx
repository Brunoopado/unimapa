import { useEffect, useState } from "react";

import {
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";

import { useSearchParams } from "react-router-dom";

import {
  buscarAndares,
  calcularRota,
} from "../../services/api";

import type {
  AndarMapa,
} from "../../services/api";

import {
  getCurrentLocation,
  getRoutePreference,
} from "../../services/cookieService";

import {
  clearActiveRoute,
  getActiveRoute,
  saveActiveRoute,
} from "../../services/routeSessionService";

import type {
  RotaCalculada,
} from "../../types/rota";


type Andar =
  | "Térreo"
  | "1º"
  | "2º"
  | "3º";

type TipoRota =
  | "Rampa"
  | "Elevador"
  | "Escada";


/* Helpers */

function obterTipoRotaPreferido(): TipoRota {
  const preferencia =
    getRoutePreference();

  if (preferencia === "ramps") {
    return "Rampa";
  }

  if (preferencia === "elevators") {
    return "Elevador";
  }

  return "Escada";
}


function obterLabelAndar(
  nomeAndar: string
): Andar | null {
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


function obterOrdemAndar(
  nomeAndar: string
) {
  const andar =
    obterLabelAndar(nomeAndar);

  if (!andar) {
    return null;
  }

  const ordem: Record<Andar, number> = {
    Térreo: 0,
    "1º": 1,
    "2º": 2,
    "3º": 3,
  };

  return ordem[andar];
}


function obterTextoTipoRota(
  tipoRota: TipoRota
) {
  if (tipoRota === "Elevador") {
    return "pelo elevador";
  }

  if (tipoRota === "Escada") {
    return "pela escada";
  }

  return "pela rampa";
}


function Map() {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const codigoQr =
    searchParams.get("codigoQr");

  const idDestino =
    searchParams.get("idDestino");


  /* Estados */

  const [
    rota,
    setRota,
  ] = useState<RotaCalculada | null>(
    null
  );

  const [
    andaresDisponiveis,
    setAndaresDisponiveis,
  ] = useState<AndarMapa[]>([]);

  const [
    andarSelecionado,
    setAndarSelecionado,
  ] = useState<Andar>("3º");

  const [
    tipoRota,
    setTipoRota,
  ] = useState<TipoRota>(() =>
    obterTipoRotaPreferido()
  );

  const [
    rotacaoMapa,
    setRotacaoMapa,
  ] = useState(0);


  /* Trecho atual */

  const indiceTrechoAtual =
    rota?.trechos.findIndex(
      (trecho) => {
        const labelAndar =
          obterLabelAndar(
            trecho.andar.nome
          );

        return (
          labelAndar ===
          andarSelecionado
        );
      }
    ) ?? -1;


  const trechoAtual =
    rota &&
    indiceTrechoAtual >= 0
      ? rota.trechos[
          indiceTrechoAtual
        ]
      : null;


  /* Mapa exibido */

  const andarPadraoAtual =
    andaresDisponiveis.find(
      (andar) =>
        obterLabelAndar(
          andar.nome
        ) === andarSelecionado
    ) ?? null;


  const mapaExibido =
    trechoAtual?.andar ??
    andarPadraoAtual;


  /* Linha da rota */

  const pontosPolyline =
    trechoAtual
      ? trechoAtual.caminho
          .map(
            (ponto) =>
              `${ponto.x},${ponto.y}`
          )
          .join(" ")
      : "";


  /* Partida e chegada */

  const pontoPartida =
    trechoAtual &&
    indiceTrechoAtual === 0 &&
    trechoAtual.caminho.length > 0
      ? trechoAtual.caminho[0]
      : null;


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


  /* Continuação entre andares */

  const ehAndarIntermediario =
    rota &&
    trechoAtual &&
    indiceTrechoAtual > 0 &&
    indiceTrechoAtual <
      rota.trechos.length - 1;


  const pontoContinuidade =
    ehAndarIntermediario &&
    trechoAtual.caminho.length > 0
      ? trechoAtual.caminho[
          trechoAtual.caminho.length - 1
        ]
      : null;


  const proximoTrecho =
    rota &&
    ehAndarIntermediario
      ? rota.trechos[
          indiceTrechoAtual + 1
        ]
      : null;


  let direcaoContinuidade:
    | "subindo"
    | "descendo"
    | null = null;


  if (
    trechoAtual &&
    proximoTrecho
  ) {
    const andarAtual =
      obterOrdemAndar(
        trechoAtual.andar.nome
      );

    const proximoAndar =
      obterOrdemAndar(
        proximoTrecho.andar.nome
      );

    if (
      andarAtual !== null &&
      proximoAndar !== null
    ) {
      direcaoContinuidade =
        proximoAndar > andarAtual
          ? "subindo"
          : "descendo";
    }
  }


  /* Resumo da rota */

  const primeiroTrecho =
    rota?.trechos[0] ?? null;


  const ultimoTrecho =
    rota &&
    rota.trechos.length > 0
      ? rota.trechos[
          rota.trechos.length - 1
        ]
      : null;

const localizacaoAtual =
  getCurrentLocation();

const nomeOrigem =
  localizacaoAtual?.name ??
  (
    primeiroTrecho &&
    primeiroTrecho.caminho.length > 0
      ? primeiroTrecho.caminho[0].nome
      : codigoQr ?? "Origem"
  );

  const nomeDestino =
    ultimoTrecho &&
    ultimoTrecho.caminho.length > 0
      ? ultimoTrecho.caminho[
          ultimoTrecho.caminho.length - 1
        ].nome
      : idDestino ?? "Destino";


  /* Instrução atual */

  const primeiroPontoTrecho =
    trechoAtual &&
    trechoAtual.caminho.length > 0
      ? trechoAtual.caminho[0]
      : null;


  const ultimoPontoTrecho =
    trechoAtual &&
    trechoAtual.caminho.length > 0
      ? trechoAtual.caminho[
          trechoAtual.caminho.length - 1
        ]
      : null;


  let instrucaoAtual =
    "Siga a rota indicada no mapa.";


  if (
    rota &&
    trechoAtual &&
    primeiroPontoTrecho &&
    ultimoPontoTrecho
  ) {
    const ultimoIndice =
      rota.trechos.length - 1;


    // Origem e destino no mesmo andar
    if (rota.trechos.length === 1) {
      instrucaoAtual =
        `Saia de ${primeiroPontoTrecho.nome} e siga a linha verde até ${nomeDestino}.`;
    }


    // Primeiro andar da rota
    else if (
      indiceTrechoAtual === 0
    ) {
      const trechoSeguinte =
        rota.trechos[1];

      const ordemAtual =
        obterOrdemAndar(
          trechoAtual.andar.nome
        );

      const ordemSeguinte =
        obterOrdemAndar(
          trechoSeguinte.andar.nome
        );

      const direcao =
        ordemAtual !== null &&
        ordemSeguinte !== null &&
        ordemSeguinte > ordemAtual
          ? "subindo"
          : "descendo";

      instrucaoAtual =
        `Siga até ${ultimoPontoTrecho.nome} e continue ${direcao} ${obterTextoTipoRota(
          tipoRota
        )}.`;
    }


    // Andar intermediário
    else if (
      indiceTrechoAtual > 0 &&
      indiceTrechoAtual <
        ultimoIndice
    ) {
      const trechoSeguinte =
        rota.trechos[
          indiceTrechoAtual + 1
        ];

      const ordemAtual =
        obterOrdemAndar(
          trechoAtual.andar.nome
        );

      const ordemSeguinte =
        obterOrdemAndar(
          trechoSeguinte.andar.nome
        );

      const direcao =
        ordemAtual !== null &&
        ordemSeguinte !== null &&
        ordemSeguinte > ordemAtual
          ? "subindo"
          : "descendo";

      instrucaoAtual =
        `Neste andar, siga até ${ultimoPontoTrecho.nome} e continue ${direcao} ${obterTextoTipoRota(
          tipoRota
        )}.`;
    }


    // Último andar
    else if (
      indiceTrechoAtual ===
      ultimoIndice
    ) {
      instrucaoAtual =
        `Neste andar, siga a linha verde até ${nomeDestino}.`;
    }
  }


  /* Persistência da rota */

  useEffect(() => {
    const codigoQrUrl =
      searchParams.get(
        "codigoQr"
      );

    const idDestinoUrl =
      searchParams.get(
        "idDestino"
      );

    const tipoRotaUrl =
      searchParams.get(
        "tipoRota"
      ) as
        | "Rampa"
        | "Elevador"
        | "Escada"
        | null;


    const currentLocation =
      getCurrentLocation();


    if (
      codigoQrUrl &&
      idDestinoUrl
    ) {
      saveActiveRoute({
        codigoQr:
          codigoQrUrl,

        idDestino:
          idDestinoUrl,

        tipoRota:
          tipoRotaUrl ??
          "Rampa",
      });

      return;
    }


    const rotaSalva =
      getActiveRoute();


    if (!rotaSalva) {
      return;
    }


    if (
      currentLocation &&
      currentLocation.pointCode !==
        rotaSalva.codigoQr
    ) {
      clearActiveRoute();

      return;
    }


    setSearchParams(
      {
        codigoQr:
          rotaSalva.codigoQr,

        idDestino:
          rotaSalva.idDestino,

        tipoRota:
          rotaSalva.tipoRota,
      },
      {
        replace: true,
      }
    );
  }, [
    searchParams,
    setSearchParams,
  ]);


  /* Carrega os andares */

  useEffect(() => {
    async function carregarAndares() {
      try {
        const resultado =
          await buscarAndares();

        setAndaresDisponiveis(
          resultado
        );
      } catch (error) {
        console.error(
          "Erro ao carregar andares:",
          error
        );
      }
    }

    carregarAndares();
  }, []);


  /* Calcula a rota */

  useEffect(() => {
    async function carregarRota() {
      try {
        if (
          !codigoQr ||
          !idDestino
        ) {
          setRota(null);

          return;
        }


        const resultado =
          await calcularRota(
            codigoQr,
            idDestino,
            tipoRota
          );


        console.log(
          "ROTA RECEBIDA DO BACKEND:",
          resultado
        );


        setRota(resultado);


        if (
          resultado.trechos.length >
          0
        ) {
          const primeiroAndar =
            obterLabelAndar(
              resultado.trechos[0]
                .andar.nome
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
  }, [
    codigoQr,
    idDestino,
    tipoRota,
  ]);


  return (
    <section className="page map-page">
      {/* Mapa */}

      <div className="map-zoom-area">
        <div className="map-rotation-buttons">
          <button
            type="button"
            onClick={() =>
              setRotacaoMapa(
                (rotacao) =>
                  rotacao - 90
              )
            }
            title="Girar para esquerda"
          >
            ↺
          </button>

          <button
            type="button"
            onClick={() =>
              setRotacaoMapa(
                (rotacao) =>
                  rotacao + 90
              )
            }
            title="Girar para direita"
          >
            ↻
          </button>
        </div>


        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={5}
          centerOnInit
          doubleClick={{
            disabled: true,
          }}
          wheel={{
            disabled: false,
          }}
          pinch={{
            disabled: false,
          }}
          panning={{
            disabled: false,
          }}
        >
          <TransformComponent
            wrapperClass="map-transform-wrapper"
            contentClass="map-transform-content"
          >
            {mapaExibido && (
              <svg
                viewBox={`
                  ${mapaExibido.viewBox.minX}
                  ${mapaExibido.viewBox.minY}
                  ${mapaExibido.viewBox.largura}
                  ${mapaExibido.viewBox.altura}
                `}
                className="map-image"
                style={{
                  transform:
                    `rotate(${rotacaoMapa}deg)`,

                  transformOrigin:
                    "center center",

                  transition:
                    "transform 0.3s ease",
                }}
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label={
                  `Mapa do ${mapaExibido.nome}`
                }
              >
                {/* Planta */}

                <image
                  href={
                    `/maps/${mapaExibido.arquivoSvg}`
                  }
                  x={
                    mapaExibido.viewBox
                      .minX
                  }
                  y={
                    mapaExibido.viewBox
                      .minY
                  }
                  width={
                    mapaExibido.viewBox
                      .largura
                  }
                  height={
                    mapaExibido.viewBox
                      .altura
                  }
                  preserveAspectRatio="xMidYMid meet"
                />


                {/* Linha da rota */}

                {trechoAtual && (
                  <>
                    <polyline
                      points={
                        pontosPolyline
                      }
                      fill="none"
                      stroke="#00a63d"
                      strokeWidth="25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <polyline
                      key={
                        pontosPolyline
                      }
                      points={
                        pontosPolyline
                      }
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
                  </>
                )}


                {/* Troca de andar */}

                {pontoContinuidade &&
                  direcaoContinuidade && (
                    <g
                      transform={
                        `translate(${pontoContinuidade.x}, ${pontoContinuidade.y})`
                      }
                      style={{
                        pointerEvents:
                          "none",
                      }}
                    >
                      <g
                        transform={
                          `rotate(${-rotacaoMapa})`
                        }
                      >
                        <circle
                          cx="0"
                          cy="0"
                          r="25"
                          fill="#F97316"
                          stroke="#ffffff"
                          strokeWidth="6"
                        />

                        <text
                          x="0"
                          y="2"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="34"
                          fontWeight="700"
                          fill="#ffffff"
                        >
                          {direcaoContinuidade ===
                          "subindo"
                            ? "↑"
                            : "↓"}
                        </text>

                        <rect
                          x="-165"
                          y="-115"
                          width="330"
                          height="68"
                          rx="22"
                          fill="#F97316"
                          stroke="#ffffff"
                          strokeWidth="5"
                        />

                        <polygon
                          points="-20,-50 20,-50 0,-24"
                          fill="#F97316"
                        />

                        <text
                          x="0"
                          y="-88"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="25"
                          fontWeight="700"
                          fill="#ffffff"
                        >
                          {direcaoContinuidade ===
                          "subindo"
                            ? "Continue subindo"
                            : "Continue descendo"}
                        </text>

                        <text
                          x="0"
                          y="-63"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="20"
                          fontWeight="500"
                          fill="#ffffff"
                        >
                          {obterTextoTipoRota(
                            tipoRota
                          )}
                        </text>
                      </g>
                    </g>
                  )}


                {/* Você está aqui */}

                {pontoPartida && (
                  <g
                    transform={
                      `translate(${pontoPartida.x}, ${pontoPartida.y})`
                    }
                    style={{
                      pointerEvents:
                        "none",
                    }}
                  >
                    <g
                      transform={
                        `rotate(${-rotacaoMapa})`
                      }
                    >
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

                      <polygon
                        points="-20,-51 20,-51 0,-24"
                        fill="#F97316"
                      />

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
                  </g>
                )}


                {/* Chegada */}

                {pontoDestino && (
                  <g
                    transform={
                      `translate(${pontoDestino.x}, ${pontoDestino.y})`
                    }
                    style={{
                      pointerEvents:
                        "none",
                    }}
                  >
                    <g
                      transform={
                        `rotate(${-rotacaoMapa})`
                      }
                    >
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
                  </g>
                )}
              </svg>
            )}
          </TransformComponent>
        </TransformWrapper>
      </div>


      {/* Informações da rota */}

      {rota && (
        <div className="map-route-info">
          <div className="map-route-summary">
            <span className="map-info-label">
              Rota atual
            </span>

            <div className="map-route-line">
              <span className="map-route-origin">
                {nomeOrigem}
              </span>

              <span className="map-route-arrow">
                →
              </span>

              <strong className="map-route-destination">
                {nomeDestino}
              </strong>
            </div>
          </div>

          <div className="map-route-instruction">
            <span className="map-info-label">
              Próximo passo
            </span>

            <p>
              {instrucaoAtual}
            </p>
          </div>
        </div>
      )}


      {/* Controles */}

      <div className="map-options-card">
        {rota && (
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
                VIA{" "}
                {tipo.toUpperCase()}
              </button>
            ))}
          </div>
        )}


        <div className="floor-choice-buttons">
          {(
            [
              "Térreo",
              "1º",
              "2º",
              "3º",
            ] as Andar[]
          ).map((andar) => {
            const existeMapa =
              andaresDisponiveis.some(
                (mapa) =>
                  obterLabelAndar(
                    mapa.nome
                  ) === andar
              );


            const podeSelecionar =
              rota
                ? rota.trechos.some(
                    (trecho) =>
                      obterLabelAndar(
                        trecho.andar.nome
                      ) === andar
                  )
                : existeMapa;


            return (
              <button
                key={andar}
                type="button"
                disabled={
                  !podeSelecionar
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