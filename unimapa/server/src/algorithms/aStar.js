function calcularHeuristica(noAtual, noDestino) {
  return Math.hypot(
    noDestino.x - noAtual.x,
    noDestino.y - noAtual.y
  );
}

function reconstruirCaminho(veioDe, destinoId) {
  const caminho = [destinoId];

  let atual = destinoId;

  while (veioDe.has(atual)) {
    atual = veioDe.get(atual);
    caminho.unshift(atual);
  }

  return caminho;
}

export function calcularAStar(
  nos,
  arestas,
  origemId,
  destinoId
) {
  const nosPorId = new Map();

  for (const no of nos) {
    nosPorId.set(no.id_no, no);
  }

  const origem = nosPorId.get(origemId);
  const destino = nosPorId.get(destinoId);

  if (!origem) {
    throw new Error("Nó de origem não encontrado.");
  }

  if (!destino) {
    throw new Error("Nó de destino não encontrado.");
  }

  /*
    Se origem e destino estiverem em andares diferentes,
    não podemos comparar diretamente X e Y dos SVGs.

    Nesse caso, usamos heurística 0.

    A* com heurística 0 funciona como Dijkstra e continua
    encontrando o menor caminho com base nas distâncias
    cadastradas nas conexões.
  */
  const rotaEntreAndares =
    origem.id_andar !== destino.id_andar;

  const vizinhos = new Map();

  for (const aresta of arestas) {
    if (!vizinhos.has(aresta.no_origem)) {
      vizinhos.set(aresta.no_origem, []);
    }

    vizinhos.get(aresta.no_origem).push(aresta);
  }

  const abertos = new Set([origemId]);

  const veioDe = new Map();

  const custoDesdeOrigem = new Map();
  custoDesdeOrigem.set(origemId, 0);

  const custoEstimado = new Map();

  custoEstimado.set(
    origemId,
    rotaEntreAndares
      ? 0
      : calcularHeuristica(origem, destino)
  );

  while (abertos.size > 0) {
    let atualId = null;
    let menorCusto = Infinity;

    for (const idNo of abertos) {
      const custo =
        custoEstimado.get(idNo) ?? Infinity;

      if (custo < menorCusto) {
        menorCusto = custo;
        atualId = idNo;
      }
    }

    if (atualId === destinoId) {
      return reconstruirCaminho(
        veioDe,
        destinoId
      );
    }

    abertos.delete(atualId);

    const conexoesDoNo =
      vizinhos.get(atualId) ?? [];

    for (const aresta of conexoesDoNo) {
      const vizinhoId = aresta.no_destino;

      const custoAtual =
        custoDesdeOrigem.get(atualId) ??
        Infinity;

      const novoCusto =
        custoAtual +
        Number(aresta.distancia);

      const custoAnterior =
        custoDesdeOrigem.get(vizinhoId) ??
        Infinity;

      if (novoCusto < custoAnterior) {
        veioDe.set(vizinhoId, atualId);

        custoDesdeOrigem.set(
          vizinhoId,
          novoCusto
        );

        const vizinho =
          nosPorId.get(vizinhoId);

        const heuristica =
          rotaEntreAndares
            ? 0
            : calcularHeuristica(
                vizinho,
                destino
              );

        custoEstimado.set(
          vizinhoId,
          novoCusto + heuristica
        );

        abertos.add(vizinhoId);
      }
    }
  }

  throw new Error(
    "Não foi possível encontrar uma rota."
  );
}