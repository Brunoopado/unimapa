import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCurrentLocation } from "../../services/cookieService";

import { pesquisarDestinos } from "../../services/api";
import type { Destino } from "../../types/destino";

function SearchDestination() {
  const [pesquisa, setPesquisa] = useState("");
  const [resultados, setResultados] = useState<Destino[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pesquisou, setPesquisou] = useState(false);
  const navigate = useNavigate();

  function abrirDestino(destino: Destino) {
  const currentLocation = getCurrentLocation();

  if (!currentLocation) {
    setErro(
      "Defina sua localização antes de escolher um destino."
    );

    return;
  }

  const codigoQr = currentLocation.pointCode;

  navigate(
    `/map?codigoQr=${encodeURIComponent(
      codigoQr
    )}&idDestino=${encodeURIComponent(
      destino.id_destino
    )}`
  );
}

  async function realizarPesquisa() {
    const termo = pesquisa.trim();

    if (!termo) {
      return;
    }

    try {
      setCarregando(true);
      setErro(null);

      const resposta = await pesquisarDestinos(termo);

      setResultados(resposta.destinos);
      setPesquisou(true);
    } catch (error) {
      console.error(
        "Erro ao pesquisar destinos:",
        error
      );

      setErro(
        "Não foi possível pesquisar os destinos."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="page search-page">
      <h1>Pesquisar Destino</h1>

      <div className="search-row">
        <input
          type="text"
          placeholder="Pesquisar destino..."
          value={pesquisa}
          onChange={(event) =>
            setPesquisa(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
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

      {carregando && (
        <p>Pesquisando...</p>
      )}

      {erro && (
        <p>{erro}</p>
      )}

      {!pesquisou && (
        <div className="placeholder-card">
          <h2>Prédio Principal</h2>

          <p>Térreo</p>
          <p>Biblioteca</p>
          <p>Cantina</p>
          <p>Elevador</p>
          <p>Escada</p>
        </div>
      )}

      {pesquisou && (
        <div className="placeholder-card">
          <h2>Resultados</h2>

          {resultados.length === 0 ? (
            <p>Nenhum destino encontrado.</p>
          ) : (
            resultados.map((destino) => (
              <button
                key={destino.id_destino}
                type="button"
                className="destination-result"
                onClick={() => abrirDestino(destino)}
              >
                <p>
                  <strong>{destino.nome}</strong>
                </p>

                <p>
                  {destino.andar}
                  {destino.bloco
                    ? ` - Bloco ${destino.bloco}`
                    : ""}
                </p>
              </button>
            ))
          )}
        </div>
      )}
    </section>
  );
}

export default SearchDestination;