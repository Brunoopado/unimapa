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

export type RotaCalculada = {
  status: string;
  origem: string;
  destino: string;
  andar: AndarRota;
  caminho: PontoRota[];
};