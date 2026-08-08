export type Destino = {
  id_destino: string;
  nome: string;
  bloco: string | null;
  codigo_andar: string;
  andar: string;
  id_no_chegada: string;
};

export type RespostaDestinos = {
  status: string;
  destinos: Destino[];
};