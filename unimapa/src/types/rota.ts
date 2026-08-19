export type PontoRota = {
  id: string;
  nome: string;
  tipo: string;
  idAndar: number;
  x: number;
  y: number;
};

export type ViewBoxMapa = {
  minX: number;
  minY: number;
  largura: number;
  altura: number;
};

export type AndarRota = {
  id: number;
  nome: string;
  arquivoSvg: string;
  viewBox: ViewBoxMapa;
};

export type TrechoRota = {
  andar: AndarRota;
  caminho: PontoRota[];
};

export type TransicaoRota = {
  deAndar: number;
  paraAndar: number;
  pontoSaida: PontoRota;
  pontoEntrada: PontoRota;
};

export type RotaCalculada = {
  status: string;

  codigoQr: string;
  idDestino: string;

  origem: string;
  destino: string;

  totalTrechos: number;

  trechos: TrechoRota[];

  transicoes: TransicaoRota[];
};