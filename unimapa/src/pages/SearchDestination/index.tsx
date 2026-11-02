import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { pesquisarDestinos } from "../../services/api";

import {
  getCurrentLocation,
} from "../../services/cookieService";

import type {
  Destino,
} from "../../types/destino";


const LIMITE_POR_PAGINA = 6;

function SearchDestination() {
  const navigate = useNavigate();

  const [
    pesquisa,
    setPesquisa,
  ] = useState("");

  const [
    pesquisaAplicada,
    setPesquisaAplicada,
  ] = useState("");

  const [
    andarSelecionado,
    setAndarSelecionado,
  ] = useState("");

  const [
    blocoSelecionado,
    setBlocoSelecionado,
  ] = useState("");

  const [
    resultados,
    setResultados,
  ] = useState<Destino[]>([]);

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [
    erro,
    setErro,
  ] = useState<string | null>(
    null
  );

  const [
    pagina,
    setPagina,
  ] = useState(1);

  const [
    totalPaginas,
    setTotalPaginas,
  ] = useState(1);

  const [
    totalResultados,
    setTotalResultados,
  ] = useState(0);


  /* Carrega destinos */

  useEffect(() => {
    async function carregarDestinos() {
      try {
        setCarregando(true);
        setErro(null);

        const resposta =
          await pesquisarDestinos({
            pesquisa:
              pesquisaAplicada,

            andar:
              andarSelecionado,

            bloco:
              blocoSelecionado,

            pagina,

            limite:
              LIMITE_POR_PAGINA,
          });

        setResultados(
          resposta.destinos
        );

        setTotalPaginas(
          resposta.paginacao
            .totalPaginas
        );

        setTotalResultados(
          resposta.paginacao.total
        );
      } catch (error) {
        console.error(
          "Erro ao carregar destinos:",
          error
        );

        setResultados([]);

        setErro(
          "Não foi possível carregar os destinos."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarDestinos();
  }, [
    pesquisaAplicada,
    andarSelecionado,
    blocoSelecionado,
    pagina,
  ]);


  /* Seleciona destino */

  function abrirDestino(
    destino: Destino
  ) {
    const currentLocation =
      getCurrentLocation();

    if (!currentLocation) {
      setErro(
        "Defina sua localização antes de escolher um destino."
      );

      return;
    }

    const codigoQr =
      currentLocation.pointCode;

    navigate(
      `/map?codigoQr=${encodeURIComponent(
        codigoQr
      )}&idDestino=${encodeURIComponent(
        destino.id_destino
      )}`
    );
  }


  /* Pesquisa */

  function realizarPesquisa() {
    setPagina(1);

    setPesquisaAplicada(
      pesquisa.trim()
    );
  }


  /* Filtro por andar */

  function alterarAndar(
    andar: string
  ) {
    setPagina(1);
    setAndarSelecionado(andar);
  }


  /* Filtro por bloco */

  function alterarBloco(
    bloco: string
  ) {
    setPagina(1);
    setBlocoSelecionado(bloco);
  }


  /* Paginação */

  function paginaAnterior() {
    if (pagina > 1) {
      setPagina(
        (paginaAtual) =>
          paginaAtual - 1
      );
    }
  }


  function proximaPagina() {
    if (
      pagina < totalPaginas
    ) {
      setPagina(
        (paginaAtual) =>
          paginaAtual + 1
      );
    }
  }

  function obterPaginasVisiveis() {
  const paginas: (number | string)[] = [];

  if (totalPaginas <= 5) {
    for (
      let numero = 1;
      numero <= totalPaginas;
      numero++
    ) {
      paginas.push(numero);
    }

    return paginas;
  }

  if (pagina <= 3) {
    return [
      1,
      2,
      3,
      4,
      "...",
      totalPaginas,
    ];
  }

  if (pagina >= totalPaginas - 2) {
    return [
      1,
      "...",
      totalPaginas - 3,
      totalPaginas - 2,
      totalPaginas - 1,
      totalPaginas,
    ];
  }

  return [
    1,
    "...",
    pagina - 1,
    pagina,
    pagina + 1,
    "...",
    totalPaginas,
  ];
}

  return (
    <section className="page search-page">
      {/* Pesquisa */}

      <div className="search-row">
        <input
          type="text"
          placeholder="Pesquisar destino..."
          value={pesquisa}
          onChange={(event) =>
            setPesquisa(
              event.target.value
            )
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter"
            ) {
              realizarPesquisa();
            }
          }}
        />

        <button
          type="button"
          aria-label="Pesquisar destino"
          onClick={realizarPesquisa}
        >
          <Search size={28} />
        </button>
      </div>


      {/* Filtros */}

      <div className="destination-filters">
        <select
          value={
            andarSelecionado
          }
          onChange={(event) =>
            alterarAndar(
              event.target.value
            )
          }
          aria-label="Filtrar por andar"
        >
          <option value="">
            Todos os andares
          </option>

          <option value="0">
            Térreo
          </option>

          <option value="1">
            1º Andar
          </option>

          <option value="2">
            2º Andar
          </option>

          <option value="3">
            3º Andar
          </option>
        </select>


        <select
          value={
            blocoSelecionado
          }
          onChange={(event) =>
            alterarBloco(
              event.target.value
            )
          }
          aria-label="Filtrar por bloco"
        >
          <option value="">
            Todos os blocos
          </option>

          <option value="A">
            Bloco A
          </option>

          <option value="B">
            Bloco B
          </option>

          <option value="C">
            Bloco C
          </option>

          <option value="D">
            Bloco D
          </option>

          <option value="E">
            Bloco E
          </option>

          <option value="F">
            Bloco F
          </option>

          <option value="G">
            Bloco G
          </option>
        </select>
      </div>


      {/* Resultados */}

      <div className="placeholder-card destination-results-card">
        <div className="destination-results-header">
          <h2>
            Destinos
          </h2>

          {!carregando && (
            <span>
              {totalResultados}{" "}
              {totalResultados === 1
                ? "resultado"
                : "resultados"}
            </span>
          )}
        </div>


        {carregando && (
          <p>
            Carregando destinos...
          </p>
        )}


        {erro && (
          <p className="destination-error">
            {erro}
          </p>
        )}


        {!carregando &&
          !erro &&
          resultados.length === 0 && (
            <p>
              Nenhum destino
              encontrado.
            </p>
          )}


        {!carregando &&
          resultados.map(
            (destino) => (
              <button
                key={
                  destino.id_destino
                }
                type="button"
                className="destination-result"
                onClick={() =>
                  abrirDestino(
                    destino
                  )
                }
              >
                <p>
                  <strong>
                    {destino.nome}
                  </strong>
                </p>

                <p>
                  {destino.andar}

                  {destino.bloco
                    ? ` - Bloco ${destino.bloco}`
                    : ""}
                </p>
              </button>
            )
          )}


        {/* Paginação */}

        {!carregando &&
          !erro &&
          totalResultados > 0 && (
            <div className="destination-pagination">
              <button
                type="button"
                className="pagination-arrow"
                onClick={paginaAnterior}
                disabled={pagina === 1}
                aria-label="Página anterior"
              >
                <ChevronLeft size={17} />
              </button>

              <div className="pagination-pages">
                {obterPaginasVisiveis().map(
                  (item, index) => {
                    if (item === "...") {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          className="pagination-ellipsis"
                        >
                          …
                        </span>
                      );
                    }

                    const numeroPagina =
                      Number(item);

                    return (
                      <button
                        key={numeroPagina}
                        type="button"
                        className={
                          pagina === numeroPagina
                            ? "pagination-number active"
                            : "pagination-number"
                        }
                        onClick={() =>
                          setPagina(numeroPagina)
                        }
                      >
                        {numeroPagina}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                type="button"
                className="pagination-arrow"
                onClick={proximaPagina}
                disabled={
                  pagina >= totalPaginas
                }
                aria-label="Próxima página"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          )}
      </div>
    </section>
  );
}

export default SearchDestination;