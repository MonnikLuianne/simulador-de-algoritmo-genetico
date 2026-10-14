import { lerConfiguracoes } from "./validation.js";
import { avaliarSolucao } from "./evaluation.js";
import { criarSimulacao } from "./simulation.js";

let projetos = [
  { nome: "Iluminação do campus", custo: 4000, beneficio: 7 },
  { nome: "Bicicletários", custo: 3000, beneficio: 5 },
  { nome: "Bancos para áreas comuns", custo: 2000, beneficio: 3 },
  { nome: "Reforma da área de convivência", custo: 5000, beneficio: 8 }
];

const $ = id => document.getElementById(id);
const listaProjetos = $("lista-projetos");
const botaoAdicionar = $("adicionar-projeto");
const formulario = $("form-configuracao");
const mensagemValidacao = $("mensagem-validacao");
const botaoExecutar = $("executar");
const botaoPausar = $("pausar");
const botaoAvancar = $("avancar");
const botaoReiniciar = $("reiniciar");
const botaoProximaEtapa = $("proxima-etapa");
const botaoEtapaAnterior = $("etapa-anterior");
const botaoContinuar = $("continuar");
const botaoPular = $("pular");
const botaoTodasGeracoes = $("resultado-todas-geracoes");

let simulacao = null;
let intervalo = null;
let configuracoesAtuais = null;
let roteiro = [];
let indiceEtapa = -1;
let estadoPendente = null;
let logsVisiveis = [];
let todosLogs = [];
let idsLogs = new Set();
let execucaoEncerrada = false;

function escapar(texto) {
  return String(texto).replace(/[&<>"']/g, caractere => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[caractere]);
}

function mostrarProjetos() {
  listaProjetos.innerHTML = "";

  projetos.forEach((projeto, indice) => {
    const item = document.createElement("div");
    item.className = "projeto-item";

    item.innerHTML = `
      <label>Nome do projeto
        <input type="text" value="${escapar(projeto.nome)}"
          data-indice="${indice}" data-campo="nome" required>
      </label>

      <label>Custo (R$)
        <input type="number" min="0.01" step="0.01"
          value="${projeto.custo}" data-indice="${indice}"
          data-campo="custo" required>
      </label>

      <label>Benefício
        <input type="number" min="0" step="any"
          value="${projeto.beneficio}" data-indice="${indice}"
          data-campo="beneficio" required>
      </label>

      <button type="button" class="botao-remover"
        data-indice="${indice}">
        Remover projeto
      </button>`;

    listaProjetos.appendChild(item);
  });
}

function pararRelogio() {
  if (intervalo !== null) clearInterval(intervalo);
  intervalo = null;
}

function validarProjetosEConfiguracoes() {
  const configuracoes = lerConfiguracoes();

  if (projetos.length < 4 || projetos.length > 15) {
    throw new Error("Cadastre entre 4 e 15 projetos.");
  }

  for (const projeto of projetos) {
    if (!projeto.nome.trim()) {
      throw new Error("Todos os projetos precisam ter um nome.");
    }

    if (!Number.isFinite(projeto.custo) || projeto.custo <= 0) {
      throw new Error("O custo de cada projeto deve ser maior que zero.");
    }

    if (Math.round(projeto.custo * 100) !== projeto.custo * 100) {
      throw new Error("Os custos devem ter no máximo duas casas decimais.");
    }

    if (!Number.isFinite(projeto.beneficio) || projeto.beneficio < 0) {
      throw new Error("O benefício não pode ser negativo.");
    }
  }

  return configuracoes;
}

function mostrarEstado(estado) {
  $("geracao-atual").textContent = estado.geracaoAtual;
  $("melhor-geracao").textContent = estado.melhorGeracao.fitness;
  $("media-populacao").textContent = estado.mediaPopulacao.toFixed(2);
  $("melhor-acumulado").textContent = estado.melhorAcumulado.fitness;

  mostrarMelhorSolucao(estado.melhorAcumulado);
  mostrarHistorico(estado.historico);
  mostrarPopulacao(estado.populacao);
  desenharGrafico(estado.historico);
}

function mostrarMelhorSolucao(melhor) {
  const resultado = $("resultado-final");

  if (!melhor || !configuracoesAtuais) {
    resultado.textContent =
      "Aguardando execução do algoritmo genético.";
    return;
  }

  const avaliacao = avaliarSolucao(melhor.cromossomo, projetos);

  const selecionados = melhor.cromossomo
    .map((gene, i) => gene ? projetos[i] : null)
    .filter(Boolean);

  const lista = selecionados.length
    ? `<ul>${selecionados.map(projeto =>
        `<li>${escapar(projeto.nome)} — R$ ${projeto.custo.toFixed(2)};
        benefício ${projeto.beneficio}</li>`
      ).join("")}</ul>`
    : "<p>Nenhum projeto selecionado.</p>";

  resultado.innerHTML = `
    <p><strong>Geração encontrada:</strong> ${melhor.geracao}</p>
    <p><strong>Cromossomo:</strong>
      <code>${melhor.cromossomo.join("")}</code>
    </p>
    <p><strong>Benefício total:</strong> ${avaliacao.beneficio}</p>
    <p><strong>Custo total:</strong>
      R$ ${avaliacao.custo.toFixed(2)}
    </p>
    <p><strong>Orçamento restante:</strong> R$
      ${(configuracoesAtuais.orcamento - avaliacao.custo).toFixed(2)}
    </p>
    <h3>Projetos selecionados</h3>
    ${lista}`;
}

function mostrarHistorico(historico) {
  $("historico-geracoes").innerHTML = historico.map(item => `
    <tr>
      <td>${item.geracao}</td>
      <td>${item.melhorFitness}</td>
      <td>${item.mediaFitness.toFixed(2)}</td>
      <td>${item.melhorAcumulado}</td>
    </tr>
  `).join("");
}

function mostrarPopulacao(populacao) {
  $("tabela-populacao").innerHTML = populacao.map((cromossomo, i) => {
    const avaliacao = avaliarSolucao(cromossomo, projetos);

    return `
      <tr>
        <td>${i + 1}</td>
        <td><code>${cromossomo.join("")}</code></td>
        <td>R$ ${avaliacao.custo.toFixed(2)}</td>
        <td>${avaliacao.fitness}</td>
      </tr>`;
  }).join("");
}

function desenharGrafico(historico) {
  const area = $("grafico-evolucao");

  if (!historico.length) {
    area.innerHTML = "<p>Sem dados para exibir.</p>";
    return;
  }

  const largura = 760;
  const altura = 270;
  const margem = {
    esquerda: 44,
    direita: 18,
    topo: 20,
    baixo: 35
  };

  const internoW = largura - margem.esquerda - margem.direita;
  const internoH = altura - margem.topo - margem.baixo;

  const maxY = Math.max(
    1,
    ...historico.flatMap(d => [
      d.melhorFitness,
      d.mediaFitness,
      d.melhorAcumulado
    ])
  ) * 1.12;

  const x = i => margem.esquerda +
    (historico.length === 1
      ? internoW / 2
      : i * internoW / (historico.length - 1));

  const y = valor =>
    margem.topo + internoH - (valor / maxY) * internoH;

  const linha = chave => historico.map((d, i) =>
    `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d[chave]).toFixed(1)}`
  ).join(" ");

  let grades = "";

  for (let i = 0; i <= 4; i++) {
    const valor = maxY * i / 4;
    const yy = y(valor);

    grades += `
      <line x1="${margem.esquerda}" y1="${yy}"
        x2="${largura - margem.direita}" y2="${yy}"
        class="grade-svg"/>

      <text x="${margem.esquerda - 8}" y="${yy + 4}"
        text-anchor="end" class="rotulo-svg">
        ${valor.toFixed(1)}
      </text>`;
  }

  const ultimo = historico[historico.length - 1];

  area.innerHTML = `
    <svg viewBox="0 0 ${largura} ${altura}" role="img"
      aria-label="Gráfico da aptidão ao longo das gerações"
      class="grafico-svg">

      ${grades}

      <line x1="${margem.esquerda}" y1="${margem.topo}"
        x2="${margem.esquerda}" y2="${altura - margem.baixo}"
        class="eixo-svg"/>

      <line x1="${margem.esquerda}" y1="${altura - margem.baixo}"
        x2="${largura - margem.direita}" y2="${altura - margem.baixo}"
        class="eixo-svg"/>

      <path d="${linha("melhorFitness")}"
        class="linha-svg linha-melhor"/>

      <path d="${linha("mediaFitness")}"
        class="linha-svg linha-media"/>

      <path d="${linha("melhorAcumulado")}"
        class="linha-svg linha-acumulado"/>

      <text x="${margem.esquerda}" y="${altura - 8}"
        class="rotulo-svg">Geração 0</text>

      <text x="${largura - margem.direita}" y="${altura - 8}"
        text-anchor="end" class="rotulo-svg">
        Geração ${ultimo.geracao}
      </text>
    </svg>`;
}

function mostrarLogs(eventos) {
  $("logs").innerHTML = eventos.length
    ? eventos.map((evento, i) => `
        <p>
          <strong>${String(i + 1).padStart(2, "0")}.</strong>
          ${escapar(evento)}
        </p>
      `).join("")
    : "<p>Os eventos da simulação aparecerão aqui.</p>";

  $("logs").scrollTop = $("logs").scrollHeight;
}

// Registra cada evento uma única vez, quando a geração é calculada.
function registrarEventosGeracao(resultado) {
  const geracao = resultado.geracaoAtual;

  (resultado.eventos || []).forEach((evento, indice) => {
    const chave = `${geracao}:${indice}`;

    if (!idsLogs.has(chave)) {
      idsLogs.add(chave);
      todosLogs.push(`Geração ${geracao}: ${evento}`);
    }
  });

  mostrarLogs(todosLogs);
}

function criarRoteiro(eventos, geracaoAlvo) {
  const passos = [
    {
      titulo: `Preparação da geração ${geracaoAlvo}`,
      descricao:
        "A população anterior fica congelada como fonte dos pais. " +
        "Os resultados desta geração já foram calculados uma única vez.",
      tipo: "Preparação"
    },
    {
      titulo: "Avaliação e seleção por torneio",
      descricao:
        "Os indivíduos são comparados pela aptidão. Cada torneio " +
        "utiliza candidatos distintos; em empate, vence o menor índice original.",
      tipo: "Seleção"
    }
  ];

  eventos.forEach(evento => {
    let tipo = "Operador genético";

    if (/Cruzamento/i.test(evento)) tipo = "Cruzamento";
    else if (/Mutação/i.test(evento)) tipo = "Mutação";
    else if (/Remover|Reparo/i.test(evento)) tipo = "Reparo";
    else if (/Elitismo/i.test(evento)) tipo = "Elitismo";
    else if (/Seleção por torneio/i.test(evento)) tipo = "Seleção";

    passos.push({
      titulo: tipo,
      descricao: evento,
      tipo
    });
  });

  passos.push({
    titulo: `Geração ${geracaoAlvo} concluída`,
    descricao:
      "A nova população é confirmada. Métricas, gráfico, histórico " +
      "e tabela populacional são atualizados; a próxima animação " +
      "partirá desta população.",
    tipo: "Conclusão",
    final: true
  });

  return passos;
}

function mostrarCromossomos(etapa) {
  const area = $("visual-cromossomos");
  if (!area) return;

  if (!etapa || !etapa.descricao) {
    area.innerHTML =
      "<p>Os cromossomos aparecerão aqui durante a animação.</p>";
    return;
  }

  const descricao = etapa.descricao;

  const cromossomos = [
    ...descricao.matchAll(/(?<!\d)[01]{4,15}(?!\d)/g)
  ].map(m => m[0]);

  const corteMatch = descricao.match(/Cruzamento no ponto\s+(\d+)/i);
  const corte = corteMatch ? Number(corteMatch[1]) : null;

  let rotulos = [];

  if (/Cruzamento/i.test(etapa.tipo) || /Cruzamento/i.test(descricao)) {
    rotulos = ["Pai 1", "Pai 2", "Filho 1", "Filho 2"];
  } else if (/Seleção/i.test(etapa.tipo) || /pai 1 =/i.test(descricao)) {
    rotulos = ["Pai selecionado 1", "Pai selecionado 2"];
  } else if (/Reparo do filho 1/i.test(descricao)) {
    rotulos = ["Filho 1 antes do reparo", "Filho 1 depois do reparo"];
  } else if (/Reparo do filho 2/i.test(descricao)) {
    rotulos = ["Filho 2 antes do reparo", "Filho 2 depois do reparo"];
  } else if (/Mutação/i.test(etapa.tipo)) {
    rotulos = ["Cromossomo em mutação"];
  } else if (/Elitismo/i.test(etapa.tipo)) {
    rotulos = ["Indivíduo preservado"];
  } else {
    rotulos = cromossomos.map((_, i) => `Cromossomo ${i + 1}`);
  }

  if (!cromossomos.length) {
    area.innerHTML = `
      <p class="sem-cromossomos">
        ${escapar(descricao)}<br>
        <small>
          Nesta etapa, o evento não contém um cromossomo binário explícito.
        </small>
      </p>`;
    return;
  }

  const cards = cromossomos.slice(0, 4).map((bits, indice) => {
    const rotulo = rotulos[indice] || `Cromossomo ${indice + 1}`;
    const ehFilho = /Filho/i.test(rotulo);

    const genes = [...bits].map((bit, geneIndex) => {
      let classe = bit === "1"
        ? "gene gene-um"
        : "gene gene-zero";

      if (
        corte !== null &&
        (indice === 2 || indice === 3) &&
        geneIndex >= corte
      ) {
        classe += " gene-herdado";
      }

      return `
        <span class="${classe}"
          title="Projeto ${geneIndex + 1}: ${
            bit === "1" ? "selecionado" : "não selecionado"
          }">
          ${bit}
          <small>${String.fromCharCode(65 + geneIndex)}</small>
        </span>`;
    }).join("");

    return `
      <article class="cromossomo-card ${
        ehFilho ? "cromossomo-filho" : ""
      }" style="--ordem-cromossomo:${indice}">
        <strong>${escapar(rotulo)}</strong>
        <div class="genes">${genes}</div>
        <code>${bits}</code>
      </article>`;
  }).join("");

  let explicacao =
    "Cada quadrado é um gene, na mesma ordem dos projetos cadastrados.";

  if (corte !== null) {
    explicacao =
      `Cruzamento de um ponto: o corte ocorre depois do gene ${corte}. ` +
      "O trecho final dos filhos é herdado do outro pai.";
  } else if (/Mutação/i.test(etapa.tipo)) {
    explicacao =
      "Na mutação, cada gene tem uma chance independente de inverter " +
      "0 para 1 ou 1 para 0.";
  } else if (/Elitismo/i.test(etapa.tipo)) {
    explicacao =
      "O indivíduo de elite é copiado sem alteração para a próxima geração.";
  } else if (/reparo/i.test(descricao)) {
    explicacao =
      "O reparo desliga genes (1 → 0) até o custo total respeitar o orçamento.";
  }

  area.innerHTML = `
    <div class="cromossomos-grade">${cards}</div>
    <p class="explicacao-cromossomos">${escapar(explicacao)}</p>`;
}

function atualizarQuadro() {
  const quadro = $("quadro-animacao");

  if (!roteiro.length || indiceEtapa < 0) {
    quadro.innerHTML = `
      <span class="etapa-selo">AGUARDANDO</span>
      <h3>Pronto para começar</h3>
      <p>
        Pressione "Reproduzir animação" para acompanhar uma geração
        passo a passo.
      </p>`;

    $("contador-etapas").textContent = "Etapa 0 de 0";
    $("progresso-animacao").style.width = "0%";
    mostrarCromossomos(null);
    return;
  }

  const etapa = roteiro[indiceEtapa];
  mostrarCromossomos(etapa);

  quadro.innerHTML = `
    <span class="etapa-selo">${escapar(etapa.tipo)}</span>
    <h3>${escapar(etapa.titulo)}</h3>
    <p>${escapar(etapa.descricao)}</p>
    <div class="etapa-indicador">
      ${indiceEtapa + 1} / ${roteiro.length}
    </div>`;

  $("contador-etapas").textContent =
    `Etapa ${indiceEtapa + 1} de ${roteiro.length}`;

  $("progresso-animacao").style.width =
    `${((indiceEtapa + 1) / roteiro.length) * 100}%`;

  $("status-animacao").textContent =
    estadoPendente && indiceEtapa === roteiro.length - 1
      ? "Geração concluída"
      : "Animação em andamento";
}

function atualizarBotoes() {
  const temRoteiro = roteiro.length > 0;
  const noInicio = indiceEtapa <= 0;
  const noFim = temRoteiro && indiceEtapa >= roteiro.length - 1;

  botaoPausar.disabled = intervalo === null;
  botaoExecutar.disabled = intervalo !== null || execucaoEncerrada;

  botaoContinuar.disabled =
    intervalo !== null || !temRoteiro || noFim || execucaoEncerrada;

  botaoProximaEtapa.disabled =
    !simulacao || execucaoEncerrada ||
    (noFim && !podePrepararNovaGeracao());

  botaoEtapaAnterior.disabled =
    !temRoteiro || noInicio || intervalo !== null;

  botaoPular.disabled =
    !simulacao || execucaoEncerrada ||
    (noFim && !podePrepararNovaGeracao());

  botaoAvancar.disabled = !simulacao || execucaoEncerrada;

  if (botaoTodasGeracoes) {
    botaoTodasGeracoes.disabled = execucaoEncerrada;
  }
}

function podePrepararNovaGeracao() {
  return simulacao && !simulacao.obterEstado().concluida;
}

function confirmarGeracaoPendente() {
  if (!estadoPendente) return;

  mostrarEstado(estadoPendente);
  estadoPendente = null;

  if (simulacao.obterEstado().concluida) {
    execucaoEncerrada = true;
    $("status-animacao").textContent = "Execução completa";
    mensagemValidacao.textContent =
      "Todas as gerações configuradas foram concluídas.";
  } else {
    mensagemValidacao.textContent =
      `Geração ${simulacao.obterEstado().geracaoAtual} concluída. ` +
      "Pronta para a próxima animação.";
  }
}

function prepararProximaAnimacao() {
  if (!simulacao) criarNovaSimulacao();

  const antes = simulacao.obterEstado();

  if (antes.concluida) {
    execucaoEncerrada = true;
    mensagemValidacao.textContent =
      "A simulação já chegou ao número máximo de gerações.";
    atualizarBotoes();
    return false;
  }

  const resultado = simulacao.avancarGeracao();

  // Registra os eventos uma vez, quando a geração é calculada.
  registrarEventosGeracao(resultado);

  estadoPendente = resultado;
  roteiro = criarRoteiro(
    resultado.eventos || [],
    resultado.geracaoAtual
  );

  indiceEtapa = -1;
  logsVisiveis = [];

  $("status-animacao").textContent =
    `Preparando geração ${resultado.geracaoAtual}`;

  return true;
}

function avancarEtapa() {
  pararRelogio();

  if (!simulacao) {
    try {
      criarNovaSimulacao();
    } catch (erro) {
      mensagemValidacao.textContent = erro.message;
      return;
    }
  }

  if (
    !roteiro.length ||
    (indiceEtapa >= roteiro.length - 1 && !estadoPendente)
  ) {
    if (!prepararProximaAnimacao()) {
      atualizarBotoes();
      return;
    }
  }

  if (indiceEtapa < roteiro.length - 1) {
    indiceEtapa++;
  }

  atualizarQuadro();

  if (indiceEtapa === roteiro.length - 1) {
    confirmarGeracaoPendente();
  }

  atualizarBotoes();
}

function reproduzir() {
  if (!simulacao) {
    try {
      criarNovaSimulacao();
    } catch (erro) {
      mensagemValidacao.textContent = erro.message;
      return;
    }
  }

  if (execucaoEncerrada) return;

  if (!estadoPendente) {
    if (!prepararProximaAnimacao()) {
      atualizarBotoes();
      return;
    }
  }

  if (indiceEtapa < 0) indiceEtapa = 0;

  atualizarQuadro();

  const ms = Number($("velocidade").value) || 800;
  pararRelogio();

  intervalo = setInterval(() => {
    if (indiceEtapa < roteiro.length - 1) {
      indiceEtapa++;
      atualizarQuadro();

      if (indiceEtapa === roteiro.length - 1) {
        pararRelogio();
        confirmarGeracaoPendente();
        atualizarQuadro();
        atualizarBotoes();
      }
    } else {
      pararRelogio();
      atualizarBotoes();
    }
  }, ms);

  $("status-animacao").textContent = "Reproduzindo animação";

  mensagemValidacao.textContent =
    "Reprodução em andamento. Você pode parar e continuar do mesmo ponto.";

  atualizarBotoes();
}

function criarNovaSimulacao() {
  pararRelogio();

  configuracoesAtuais = validarProjetosEConfiguracoes();
  simulacao = criarSimulacao(projetos, configuracoesAtuais);

  roteiro = [];
  indiceEtapa = -1;
  estadoPendente = null;
  logsVisiveis = [];
  todosLogs = [];
  idsLogs = new Set();
  execucaoEncerrada = false;

  const estado = simulacao.obterEstado();
  mostrarEstado(estado);

  todosLogs.push(
    "Simulação iniciada na geração 0. População inicial criada e reparada."
  );
  mostrarLogs(todosLogs);

  $("status-animacao").textContent = "Pronto para a geração 1";
  atualizarQuadro();

  mensagemValidacao.textContent =
    "Simulação preparada. Reproduza a animação ou avance etapa por etapa.";

  atualizarBotoes();
}

function pularParaResultado() {
  pararRelogio();

  if (!simulacao) {
    try {
      criarNovaSimulacao();
    } catch (erro) {
      mensagemValidacao.textContent = erro.message;
      return;
    }
  }

  if (
    !roteiro.length ||
    (indiceEtapa >= roteiro.length - 1 && !estadoPendente)
  ) {
    if (!prepararProximaAnimacao()) return;
  }

  indiceEtapa = roteiro.length - 1;

  atualizarQuadro();
  confirmarGeracaoPendente();
  atualizarQuadro();
  atualizarBotoes();
}

// Executa todas as gerações restantes sem reproduzir a animação.
function verResultadoTodasGeracoes() {
  pararRelogio();

  if (!simulacao) {
    try {
      criarNovaSimulacao();
    } catch (erro) {
      mensagemValidacao.textContent = erro.message;
      return;
    }
  }

  // Se uma geração já foi calculada para a animação, confirma-a.
  // Não executa essa mesma geração novamente.
  if (estadoPendente) {
    confirmarGeracaoPendente();
  }

  // Continua a simulação atual até atingir o limite configurado.
  while (!simulacao.obterEstado().concluida) {
    const resultado = simulacao.avancarGeracao();
    registrarEventosGeracao(resultado);
  }

  const estadoFinal = simulacao.obterEstado();

  mostrarEstado(estadoFinal);
  mostrarLogs(todosLogs);

  roteiro = [];
  indiceEtapa = -1;
  estadoPendente = null;
  execucaoEncerrada = true;

  $("status-animacao").textContent = "Execução completa";
  $("contador-etapas").textContent = "Todas as gerações concluídas";
  $("progresso-animacao").style.width = "100%";

  $("quadro-animacao").innerHTML = `
    <span class="etapa-selo">CONCLUÍDO</span>
    <h3>Simulação finalizada</h3>
    <p>
      Todas as gerações configuradas foram executadas.
      Confira o gráfico, o histórico, a população final
      e a melhor solução encontrada.
    </p>`;

  mostrarCromossomos(null);

  mensagemValidacao.textContent =
    `Execução concluída: ${estadoFinal.geracaoAtual} gerações realizadas. ` +
    `A melhor aptidão encontrada foi ${estadoFinal.melhorAcumulado.fitness}.`;

  atualizarBotoes();
}

function invalidarSimulacaoPorEdicao() {
  pararRelogio();

  simulacao = null;
  configuracoesAtuais = null;
  roteiro = [];
  indiceEtapa = -1;
  estadoPendente = null;
  execucaoEncerrada = false;

  logsVisiveis = [];
  todosLogs = [];
  idsLogs = new Set();

  $("geracao-atual").textContent = "—";
  $("melhor-geracao").textContent = "—";
  $("media-populacao").textContent = "—";
  $("melhor-acumulado").textContent = "—";

  $("resultado-final").textContent =
    "Reinicie a simulação para calcular os novos resultados.";

  $("historico-geracoes").innerHTML = "";
  $("tabela-populacao").innerHTML = "";

  $("grafico-evolucao").innerHTML =
    "<p>Sem dados para exibir.</p>";

  mostrarLogs([]);
  atualizarQuadro();

  $("status-animacao").textContent =
    "Simulação aguardando reinício";

  mensagemValidacao.textContent =
    "Projeto alterado. Reinicie a simulação para aplicar as mudanças.";

  atualizarBotoes();
}

listaProjetos.addEventListener("change", evento => {
  const campo = evento.target.dataset.campo;
  const indice = Number(evento.target.dataset.indice);

  if (!campo || !Number.isInteger(indice) || !projetos[indice]) {
    return;
  }

  const valor = evento.target.value;

  if (campo === "nome") {
    if (!valor.trim()) {
      alert("O nome do projeto não pode ficar vazio.");
      mostrarProjetos();
      return;
    }

    projetos[indice].nome = valor.trim();
  } else {
    const numero = Number(valor);

    if (valor.trim() === "" || !Number.isFinite(numero)) {
      alert("Informe um número válido.");
      mostrarProjetos();
      return;
    }

    if (
      campo === "custo" &&
      (numero <= 0 || Math.round(numero * 100) !== numero * 100)
    ) {
      alert(
        "O custo deve ser positivo e ter no máximo duas casas decimais."
      );
      mostrarProjetos();
      return;
    }

    if (campo === "beneficio" && numero < 0) {
      alert("O benefício não pode ser negativo.");
      mostrarProjetos();
      return;
    }

    projetos[indice][campo] = numero;
  }

  invalidarSimulacaoPorEdicao();
});

listaProjetos.addEventListener("click", evento => {
  if (!evento.target.classList.contains("botao-remover")) return;

  const indice = Number(evento.target.dataset.indice);

  if (projetos.length <= 4) {
    alert("Mantenha pelo menos 4 projetos cadastrados.");
    return;
  }

  projetos.splice(indice, 1);
  mostrarProjetos();
  invalidarSimulacaoPorEdicao();
});

botaoAdicionar.addEventListener("click", () => {
  if (projetos.length >= 15) {
    alert("O limite é de 15 projetos.");
    return;
  }

  projetos.push({
    nome: `Novo projeto ${projetos.length + 1}`,
    custo: 1000,
    beneficio: 1
  });

  mostrarProjetos();
  invalidarSimulacaoPorEdicao();
});

botaoExecutar.addEventListener("click", reproduzir);

botaoPausar.addEventListener("click", () => {
  pararRelogio();

  $("status-animacao").textContent = "Animação parada";

  mensagemValidacao.textContent =
    "Animação parada. Continue para retomar do mesmo ponto.";

  atualizarBotoes();
});

botaoContinuar.addEventListener("click", reproduzir);
botaoProximaEtapa.addEventListener("click", avancarEtapa);

botaoEtapaAnterior.addEventListener("click", () => {
  pararRelogio();

  if (indiceEtapa > 0) indiceEtapa--;

  if (estadoPendente) {
    $("status-animacao").textContent = "Visualizando etapa anterior";
  }

  atualizarQuadro();
  atualizarBotoes();
});

botaoPular.addEventListener("click", pularParaResultado);

botaoAvancar.addEventListener("click", () => {
  pararRelogio();

  if (!simulacao) {
    try {
      criarNovaSimulacao();
    } catch (erro) {
      mensagemValidacao.textContent = erro.message;
      return;
    }
  }

  if (
    !roteiro.length ||
    (indiceEtapa >= roteiro.length - 1 && !estadoPendente)
  ) {
    if (!prepararProximaAnimacao()) return;
  }

  indiceEtapa = roteiro.length - 1;

  atualizarQuadro();
  confirmarGeracaoPendente();
  atualizarQuadro();
  atualizarBotoes();
});

if (botaoTodasGeracoes) {
  botaoTodasGeracoes.addEventListener(
    "click",
    verResultadoTodasGeracoes
  );
}

botaoReiniciar.addEventListener("click", () => {
  try {
    pararRelogio();

    configuracoesAtuais = validarProjetosEConfiguracoes();
    simulacao = criarSimulacao(projetos, configuracoesAtuais);

    roteiro = [];
    indiceEtapa = -1;
    estadoPendente = null;
    logsVisiveis = [];
    todosLogs = [];
    idsLogs = new Set();
    execucaoEncerrada = false;

    mostrarEstado(simulacao.obterEstado());

    todosLogs.push(
      "Simulação reiniciada com a semente configurada."
    );
    mostrarLogs(todosLogs);

    $("status-animacao").textContent = "Pronto para a geração 1";

    atualizarQuadro();
    atualizarBotoes();

    mensagemValidacao.textContent =
      "Simulação reiniciada. A população e o histórico voltaram à geração 0.";
  } catch (erro) {
    mensagemValidacao.textContent = erro.message;
  }
});

formulario.addEventListener("submit", evento => {
  evento.preventDefault();
  reproduzir();
});

$("velocidade").addEventListener("change", () => {
  if (intervalo !== null) {
    pararRelogio();
    reproduzir();
  }
});

mostrarProjetos();

botaoPausar.disabled = true;
botaoContinuar.disabled = true;
botaoEtapaAnterior.disabled = true;
botaoPular.disabled = true;
botaoAvancar.disabled = false;

if (botaoTodasGeracoes) {
  botaoTodasGeracoes.disabled = false;
}