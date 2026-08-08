import "dotenv/config";
import express from "express";
import cors from "cors";

import { pool } from "./config/database.js";
import { calcularAStar } from "./algorithms/aStar.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);

app.use(express.json());

const porta = Number(process.env.PORT ?? 3001);

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    return res.json({
      status: "ok",
      banco: "conectado",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: "erro",
      banco: "desconectado",
    });
  }
});

app.get("/api/teste-banco", async (req, res) => {
  try {
    const [resultadoNos] = await pool.query(
      "SELECT COUNT(*) AS total FROM no_mapa"
    );

    const [resultadoConexoes] = await pool.query(
      "SELECT COUNT(*) AS total FROM conexao"
    );

    const [resultadoDestinos] = await pool.query(
      "SELECT COUNT(*) AS total FROM destino"
    );

    const [resultadoQrCodes] = await pool.query(
      "SELECT COUNT(*) AS total FROM qr_code"
    );

    const [resultadoArestas] = await pool.query(
      "SELECT COUNT(*) AS total FROM vw_arestas_grafo"
    );

    return res.json({
      status: "ok",
      dados: {
        nos: resultadoNos[0].total,
        conexoes: resultadoConexoes[0].total,
        destinos: resultadoDestinos[0].total,
        qrCodes: resultadoQrCodes[0].total,
        arestas: resultadoArestas[0].total,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: "erro",
      mensagem: error.message,
    });
  }
});

app.get("/api/qr/:codigo", async (req, res) => {
  try {
    const codigo = req.params.codigo;

    const [resultado] = await pool.execute(
    `
        SELECT
        q.codigo_qr,
        q.descricao,
        q.id_no_atual,
        n.x,
        n.y,
        n.id_andar,
        a.nome AS nome_andar
        FROM qr_code q
        INNER JOIN no_mapa n
        ON n.id_no = q.id_no_atual
        INNER JOIN andar a
        ON a.id_andar = n.id_andar
        WHERE q.codigo_qr = ?
        AND q.ativo = TRUE
        LIMIT 1
    `,
    [codigo]
    );

    if (resultado.length === 0) {
      return res.status(404).json({
        status: "erro",
        mensagem: "QR Code não encontrado",
      });
    }

    const qr = resultado[0];

    return res.json({
      status: "ok",

      codigoQr: qr.codigo_qr,
      descricao: qr.descricao,
      andar: qr.nome_andar,


      no: {
        id: qr.id_no_atual,
        idAndar: qr.id_andar,
        x: Number(qr.x),
        y: Number(qr.y),
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: "erro",
      mensagem: error.message,
    });
  }
});

app.get("/api/destino/:id", async (req, res) => {
  try {
    const idDestino = req.params.id;

    const [resultado] = await pool.execute(
      `
        SELECT
          d.id_destino,
          d.nome,
          d.id_no_chegada,
          n.x,
          n.y,
          n.id_andar
        FROM destino d
        INNER JOIN no_mapa n
          ON n.id_no = d.id_no_chegada
        WHERE d.id_destino = ?
          AND d.ativo = TRUE
        LIMIT 1
      `,
      [idDestino]
    );

    if (resultado.length === 0) {
      return res.status(404).json({
        status: "erro",
        mensagem: "Destino não encontrado",
      });
    }

    const destino = resultado[0];

    return res.json({
      status: "ok",

      destino: {
        id: destino.id_destino,
        nome: destino.nome,
      },

      no: {
        id: destino.id_no_chegada,
        idAndar: destino.id_andar,
        x: Number(destino.x),
        y: Number(destino.y),
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: "erro",
      mensagem: error.message,
    });
  }
});

app.get("/api/teste-rota", async (req, res) => {
  try {
    const origemId = "N_QR_3_01";
    const destinoId = "N_D134";

    const [nos] = await pool.query(
      `
        SELECT
          id_no,
          id_andar,
          nome,
          tipo_no,
          x,
          y
        FROM no_mapa
        WHERE ativo = TRUE
      `
    );

    const [arestas] = await pool.query(
      `
        SELECT
          no_origem,
          no_destino,
          tipo_caminho,
          distancia
        FROM vw_arestas_grafo
      `
    );

    const caminhoIds = calcularAStar(
  nos,
  arestas,
  origemId,
  destinoId
);

/*
 * Criamos uma espécie de índice:
 *
 * ID do nó → informações do nó
 *
 * Exemplo:
 * N_QR_3_01 → { x: 798, y: 983, ... }
 */
const nosPorId = new Map();

for (const no of nos) {
  nosPorId.set(no.id_no, no);
}

/*
 * Agora percorremos o caminho calculado pelo A*
 * e buscamos as coordenadas de cada nó.
 */
const caminhoComCoordenadas = caminhoIds.map(
  (idNo) => {
    const no = nosPorId.get(idNo);

    return {
      id: no.id_no,
      nome: no.nome,
      tipo: no.tipo_no,
      idAndar: no.id_andar,
      x: Number(no.x),
      y: Number(no.y),
    };
  }
);

const idAndar = caminhoComCoordenadas[0].idAndar;

const [resultadoAndar] = await pool.execute(
  `
    SELECT
      id_andar,
      nome,
      arquivo_svg,
      viewbox_largura,
      viewbox_altura
    FROM andar
    WHERE id_andar = ?
    LIMIT 1
  `,
  [idAndar]
);

if (resultadoAndar.length === 0) {
  return res.status(404).json({
    status: "erro",
    mensagem: "Andar não encontrado.",
  });
}

const andar = resultadoAndar[0];

return res.json({
  status: "ok",

  origem: origemId,
  destino: destinoId,

  andar: {
    id: andar.id_andar,
    nome: andar.nome,
    arquivoSvg: andar.arquivo_svg,

    viewBox: {
      minX: 0,
      minY: 0,
      largura: Number(andar.viewbox_largura),
      altura: Number(andar.viewbox_altura),
    },
  },

  caminho: caminhoComCoordenadas,
});

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: "erro",
      mensagem: error.message,
    });
  }
});

app.post("/api/rotas/calcular", async (req, res) => {
  try {
    const { codigoQr, idDestino } = req.body;

    if (!codigoQr || !idDestino) {
      return res.status(400).json({
        status: "erro",
        mensagem:
          "codigoQr e idDestino são obrigatórios.",
      });
    }

    // 1. Descobrir o nó correspondente ao QR Code
    const [resultadoQr] = await pool.execute(
      `
        SELECT
          q.id_no_atual
        FROM qr_code q
        WHERE q.codigo_qr = ?
          AND q.ativo = TRUE
        LIMIT 1
      `,
      [codigoQr]
    );

    if (resultadoQr.length === 0) {
      return res.status(404).json({
        status: "erro",
        mensagem: "QR Code não encontrado.",
      });
    }

    // 2. Descobrir o nó correspondente ao destino
    const [resultadoDestino] = await pool.execute(
      `
        SELECT
          d.id_no_chegada
        FROM destino d
        WHERE d.id_destino = ?
          AND d.ativo = TRUE
        LIMIT 1
      `,
      [idDestino]
    );

    if (resultadoDestino.length === 0) {
      return res.status(404).json({
        status: "erro",
        mensagem: "Destino não encontrado.",
      });
    }

    const origemId = resultadoQr[0].id_no_atual;
    const destinoId =
      resultadoDestino[0].id_no_chegada;

    // 3. Buscar os nós do grafo
    const [nos] = await pool.query(
      `
        SELECT
          id_no,
          id_andar,
          nome,
          tipo_no,
          x,
          y
        FROM no_mapa
        WHERE ativo = TRUE
      `
    );

    // 4. Buscar as conexões
    const [arestas] = await pool.query(
      `
        SELECT
          no_origem,
          no_destino,
          tipo_caminho,
          distancia
        FROM vw_arestas_grafo
      `
    );

    // 5. Calcular o caminho usando A*
    const caminhoIds = calcularAStar(
      nos,
      arestas,
      origemId,
      destinoId
    );

    // 6. Criar um índice dos nós
    const nosPorId = new Map();

    for (const no of nos) {
      nosPorId.set(no.id_no, no);
    }

    // 7. Transformar IDs em coordenadas
    const caminhoComCoordenadas = caminhoIds.map(
      (idNo) => {
        const no = nosPorId.get(idNo);

        return {
          id: no.id_no,
          nome: no.nome,
          tipo: no.tipo_no,
          idAndar: no.id_andar,
          x: Number(no.x),
          y: Number(no.y),
        };
      }
    );

    // 8. Descobrir qual planta deve ser utilizada
    const idAndar =
      caminhoComCoordenadas[0].idAndar;

    const [resultadoAndar] =
      await pool.execute(
        `
          SELECT
            id_andar,
            nome,
            arquivo_svg,
            viewbox_largura,
            viewbox_altura
          FROM andar
          WHERE id_andar = ?
          LIMIT 1
        `,
        [idAndar]
      );

    if (resultadoAndar.length === 0) {
      return res.status(404).json({
        status: "erro",
        mensagem: "Andar não encontrado.",
      });
    }

    const andar = resultadoAndar[0];

    return res.json({
      status: "ok",

      codigoQr,
      idDestino,

      origem: origemId,
      destino: destinoId,

      andar: {
        id: andar.id_andar,
        nome: andar.nome,
        arquivoSvg: andar.arquivo_svg,

        viewBox: {
          minX: 0,
          minY: 0,
          largura: Number(
            andar.viewbox_largura
          ),
          altura: Number(
            andar.viewbox_altura
          ),
        },
      },

      caminho: caminhoComCoordenadas,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: "erro",
      mensagem: error.message,
    });
  }
});

app.get("/api/destinos", async (req, res) => {
  try {
    const pesquisa = String(req.query.q ?? "").trim();

    const termo = `%${pesquisa}%`;

    const [destinos] = await pool.execute(
      `
        SELECT
          id_destino,
          nome,
          bloco,
          codigo_andar,
          andar,
          id_no_chegada
        FROM vw_destinos
        WHERE nome LIKE ?
           OR id_destino LIKE ?
        ORDER BY nome
        LIMIT 50
      `,
      [termo, termo]
    );

    return res.json({
      status: "ok",
      destinos,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: "erro",
      mensagem: error.message,
    });
  }
});

app.listen(porta, () => {
  console.log(
    `Servidor UNIMAPA rodando na porta ${porta}`,
  );
});