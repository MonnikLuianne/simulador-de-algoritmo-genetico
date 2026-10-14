
import { lerConfiguracoes } from "./validation.js";
import { avaliarSolucao } from "./evaluation.js";
import {
  gerarPopulacaoInicial,
  selecionarPorTorneio,
  cruzamentoUmPonto,
  mutarCromossomo
} from "./geneticAlgorithm.js";
import { criarGeradorAleatorio } from "./random.js";
import { criarSimulacao } from "./simulation.js";

let projetos = [
  { nome: "Iluminação do campus", custo: 4000, beneficio: 7 },
  { nome: "Bicicletários", custo: 3000, beneficio: 5 },
  { nome: "Bancos para áreas comuns", custo: 2000, beneficio: 3 },
  { nome: "Reforma da área de convivência", custo: 5000, beneficio: 8 }
];

const listaProjetos = document.getElementById("lista-projetos");
const botaoAdicionar = document.getElementById("adicionar-projeto");
const formulario = document.getElementById("form-configuracao");
const mensagemValidacao = document.getElementById("mensagem-validacao");

const botaoExecutar = document.getElementById("executar");
const botaoPausar = document.getElementById("pausar");
const botaoAvancar = document.getElementById("avancar");
const botaoReiniciar = document.getElementById("reiniciar");

let simulacao = null;
let intervalo = null;
let configuracoesAtuais = null;

function mostrarProjetos() {
  listaProjetos.innerHTML = "";

  projetos.forEach((projeto, indice) => {
    const item = document.createElement("div");
    item.classList.add("projeto-item");

    item.innerHTML = `
      <label>
        Nome do projeto
        <input type="text" value="${projeto.nome}"
          data-indice="${indice}" data-campo="nome">
      </label>

      <label>
        Custo (R$)
        <input type="number" min="0.01" step="0.01"
          value="${projeto.custo}"
          data-indice="${indice}" data-campo="custo">
      </label>

      <label>
        Benefício
        <input type="number" min="0" step="any"
          value="${projeto.beneficio}"
          data-indice="${indice}" data-campo="beneficio">
      </label>

      <button type="button" class="botao-remover"
        data-indice="${indice}">
        Remover projeto
      </button>
    `;

    listaProjetos.appendChild(item);
  });
}

function pararIntervalo() {
  if (intervalo !== null) {
    clearInterval(intervalo);
    intervalo = null;
  }
}

function lerConfiguracoesDaTela() {
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

    if (!Number.isFinite(projeto.beneficio) || projeto.beneficio < 0) {
      throw new Error("O benefício não pode ser negativo.");
    }
  }

  if (configuracoes.torneio > configuracoes.populacao) {
    throw new Error("O torneio não pode ser maior que a população.");
  }

  if (configuracoes.elite >= configuracoes.populacao) {
    throw new Error("A quantidade de indivíduos de elite deve ser menor que a população.");
  }

  return configuracoes;
}

function mostrarEstado(estado) {
  document.getElementById("geracao-atual").textContent =
    estado.geracaoAtual;

  document.getElementById("melhor-geracao").textContent =
    estado.melhorGeracao.fitness;

  document.getElementById("media-populacao").textContent =
    estado.mediaPopulacao.toFixed(2);

  document.getElementById("melhor-acumulado").textContent =
    estado.melhorAcumulado.fitness;

  mostrarMelhorSolucao(estado.melhorAcumulado);
  mostrarHistorico(estado.historico);
}

function mostrarMelhorSolucao(melhor) {
  const resultado = document.getElementById("resultado-final");

  const projetosSelecionados = melhor.cromossomo
    .map((gene, indice) => gene === 1 ? projetos[indice] : null)
    .filter(Boolean);

  const avaliacao = avaliarSolucao(melhor.cromossomo, projetos);

  const lista = projetosSelecionados.length
    ? `<ul>${projetosSelecionados.map(projeto =>
        `<li>${projeto.nome} — R$ ${projeto.custo.toFixed(2)}; benefício ${projeto.beneficio}</li>`
      ).join("")}</ul>`
    : "<p>Nenhum projeto selecionado.</p>";

  resultado.innerHTML = `
    <p><strong>Geração encontrada:</strong> ${melhor.geracao}</p>
    <p><strong>Cromossomo:</strong> ${melhor.cromossomo.join("")}</p>
    <p><strong>Benefício total:</strong> ${avaliacao.beneficio}</p>
    <p><strong>Custo total:</strong> R$ ${avaliacao.custo.toFixed(2)}</p>
    <p><strong>Orçamento restante:</strong> R$ ${
      (configuracoesAtuais.orcamento - avaliacao.custo).toFixed(2)
    }</p>
    <h3>Projetos selecionados</h3>
    ${lista}
  `;
}

function mostrarHistorico(historico) {
  const corpo = document.getElementById("historico-geracoes");

  corpo.innerHTML = historico.map(item => `
    <tr>
      <td>${item.geracao}</td>
      <td>${item.melhorFitness}</td>
      <td>${item.mediaFitness.toFixed(2)}</td>
      <td>${item.melhorAcumulado}</td>
    </tr>
  `).join("");
}

function mostrarLogs(eventos) {
  const areaLogs = document.getElementById("logs");

  if (!eventos || eventos.length === 0) {
    areaLogs.innerHTML = "<p>Nenhum evento nesta geração.</p>";
    return;
  }

  areaLogs.innerHTML = eventos.map(evento =>
    `<p>${evento}</p>`
  ).join("");
}

function atualizarBotoes(estado) {
  botaoExecutar.disabled =
    estado.executando || estado.concluida;

  botaoPausar.disabled = !estado.executando;
  botaoAvancar.disabled =
    estado.executando || estado.concluida;
}

function avancarUmaGeracao() {
  if (!simulacao) return;

  const estado = simulacao.avancarGeracao();

  mostrarEstado(estado);
  mostrarLogs(estado.eventos || []);
  atualizarBotoes(estado);

  if (estado.concluida) {
    pararIntervalo();
    mensagemValidacao.textContent = "Simulação concluída.";
  }
}

function iniciarSimulacao() {
  try {
    pararIntervalo();

    configuracoesAtuais = lerConfiguracoesDaTela();

    simulacao = criarSimulacao(
      projetos,
      configuracoesAtuais
    );

    const estadoInicial = simulacao.obterEstado();

    mostrarEstado(estadoInicial);
    mostrarLogs(["Simulação iniciada na geração 0."]);

    const estadoExecutando = simulacao.executar();

    atualizarBotoes(estadoExecutando);
    mensagemValidacao.textContent = "Simulação em execução.";

    intervalo = setInterval(() => {
      if (!simulacao) {
        pararIntervalo();
        return;
      }

      const estado = simulacao.obterEstado();

      if (!estado.executando || estado.concluida) {
        pararIntervalo();
        atualizarBotoes(estado);
        return;
      }

      avancarUmaGeracao();
    }, 500);
  } catch (erro) {
    mensagemValidacao.textContent = erro.message;
    pararIntervalo();
  }
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

    if (campo === "custo" && numero <= 0) {
      alert("O custo deve ser maior que zero.");
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

  // As alterações exigem reiniciar a simulação.
  pararIntervalo();
  simulacao = null;
  configuracoesAtuais = null;

  mensagemValidacao.textContent =
    "Projeto alterado. Execute novamente para aplicar as mudanças.";

  console.log("Projetos atualizados:", projetos);
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

  pararIntervalo();
  simulacao = null;
  configuracoesAtuais = null;
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

  pararIntervalo();
  simulacao = null;
  configuracoesAtuais = null;
});

botaoExecutar.addEventListener("click", iniciarSimulacao);

botaoPausar.addEventListener("click", () => {
  if (!simulacao) return;

  pararIntervalo();

  const estado = simulacao.pausar();
  atualizarBotoes(estado);
  mensagemValidacao.textContent = "Simulação pausada.";
});

botaoAvancar.addEventListener("click", () => {
  if (!simulacao) {
    try {
      configuracoesAtuais = lerConfiguracoesDaTela();
      simulacao = criarSimulacao(projetos, configuracoesAtuais);

      mostrarEstado(simulacao.obterEstado());
    } catch (erro) {
      mensagemValidacao.textContent = erro.message;
      return;
    }
  }

  pararIntervalo();

  const estado = simulacao.pausar();
  atualizarBotoes(estado);

  avancarUmaGeracao();
});

botaoReiniciar.addEventListener("click", () => {
  pararIntervalo();

  try {
    configuracoesAtuais = lerConfiguracoesDaTela();

    simulacao = criarSimulacao(
      projetos,
      configuracoesAtuais
    );

    const estado = simulacao.reiniciar();

    mostrarEstado(estado);
    mostrarLogs(["Simulação reiniciada com a semente configurada."]);
    atualizarBotoes(estado);

    mensagemValidacao.textContent = "Simulação reiniciada.";
  } catch (erro) {
    mensagemValidacao.textContent = erro.message;
  }
});

formulario.addEventListener("submit", evento => {
  evento.preventDefault();
  iniciarSimulacao();
});

mostrarProjetos();

console.log("Simulador carregado com", projetos.length, "projetos.");

// Inicializa a apresentação dos controles.
botaoPausar.disabled = true;
botaoAvancar.disabled = false;
