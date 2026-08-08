import type { RotaCalculada } from "../types/rota";
import type { RespostaDestinos,} from "../types/destino";

export type RespostaQr = {
  status: string;
  codigoQr: string;
  descricao: string;
  andar: string;
  no: {
    id: string;
    idAndar: number;
    x: number;
    y: number;
  };
};

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3001/api";

export async function buscarRotaTeste(): Promise<RotaCalculada> {
  const response = await fetch(
    `${API_URL}/teste-rota`
  );

  

  if (!response.ok) {
    throw new Error(
      `Erro ao buscar rota: ${response.status}`
    );
  }

  const dados: RotaCalculada =
    await response.json();

  return dados;
}

export async function calcularRota(
  codigoQr: string,
  idDestino: string
): Promise<RotaCalculada> {
  const response = await fetch(
    `${API_URL}/rotas/calcular`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        codigoQr,
        idDestino,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Erro ao calcular rota: ${response.status}`
    );
  }

  const dados: RotaCalculada =
    await response.json();

  return dados;
}

export async function pesquisarDestinos(
  pesquisa: string
): Promise<RespostaDestinos> {
  const response = await fetch(
    `${API_URL}/destinos?q=${encodeURIComponent(
      pesquisa
    )}`
  );

  if (!response.ok) {
    throw new Error(
      `Erro ao pesquisar destinos: ${response.status}`
    );
  }

  const dados: RespostaDestinos =
    await response.json();

  return dados;
}

export async function buscarQrPorCodigo(
  codigo: string
): Promise<RespostaQr> {
  const response = await fetch(
    `${API_URL}/qr/${encodeURIComponent(codigo)}`
  );

  if (!response.ok) {
    throw new Error(
      `QR Code não encontrado: ${response.status}`
    );
  }

  const dados: RespostaQr =
    await response.json();

  return dados;
}