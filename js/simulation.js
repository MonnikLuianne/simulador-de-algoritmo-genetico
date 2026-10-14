import { gerarPopulacaoInicial, executarGeracao } from "./geneticAlgorithm.js";
import { avaliarSolucao } from "./evaluation.js";
import { criarGeradorAleatorio } from "./random.js";

export function criarSimulacao(projetos, configuracoes) {
  const projetosCopia = projetos.map(projeto => ({ ...projeto }));

  let aleatorio;
  let populacao;
  let geracaoAtual;
  let historico;
  let melhorAcumulado;
  let executando;

  function avaliarPopulacao(individuos) {
    const avaliados = individuos.map(cromossomo => ({
      cromossomo: [...cromossomo],
      ...avaliarSolucao(cromossomo, projetosCopia)
    }));

    const somaFitness = avaliados.reduce(
      (soma, individuo) => soma + individuo.fitness,
      0
    );

    const melhor = avaliados.reduce(
      (atual, individuo) =>
        individuo.fitness > atual.fitness ? individuo : atual,
      avaliados[0]
    );

    return {
      melhor,
      media: avaliados.length ? somaFitness / avaliados.length : 0
    };
  }

  function registrarHistorico() {
    const resultado = avaliarPopulacao(populacao);

    if (
      !melhorAcumulado ||
      resultado.melhor.fitness > melhorAcumulado.fitness
    ) {
      melhorAcumulado = {
        cromossomo: [...resultado.melhor.cromossomo],
        fitness: resultado.melhor.fitness,
        custo: resultado.melhor.custo,
        beneficio: resultado.melhor.beneficio,
        geracao: geracaoAtual
      };
    }

    historico.push({
      geracao: geracaoAtual,
      melhorFitness: resultado.melhor.fitness,
      mediaFitness: resultado.media,
      melhorAcumulado: melhorAcumulado.fitness
    });
  }

  function reiniciar() {
    // Um único gerador compartilhado, inicializado com a semente.
    // A geração da população inicial e as gerações subsequentes
    // consomem a mesma sequência pseudoaleatória, garantindo
    // reprodutibilidade completa.
    aleatorio = criarGeradorAleatorio(configuracoes.semente);

    populacao = gerarPopulacaoInicial(
      projetosCopia,
      configuracoes.populacao,
      configuracoes.orcamento,
      aleatorio      // passa o gerador compartilhado
    );

    geracaoAtual = 0;
    historico = [];
    melhorAcumulado = null;
    executando = false;

    registrarHistorico();

    return obterEstado();
  }

  function avancarGeracao() {
    if (geracaoAtual >= configuracoes.geracoes) {
      executando = false;
      return obterEstado();
    }

    const resultado = executarGeracao(
      populacao,
      projetosCopia,
      configuracoes,
      aleatorio
    );

    populacao = resultado.populacao;
    geracaoAtual++;

    registrarHistorico();

    if (geracaoAtual >= configuracoes.geracoes) {
      executando = false;
    }

    return {
      ...obterEstado(),
      eventos: resultado.eventos
    };
  }

  function obterEstado() {
    const resultado = avaliarPopulacao(populacao);

    return {
      geracaoAtual,
      populacao: populacao.map(cromossomo => [...cromossomo]),
      melhorGeracao: resultado.melhor,
      mediaPopulacao: resultado.media,
      melhorAcumulado: { ...melhorAcumulado },
      historico: [...historico],
      executando,
      concluida: geracaoAtual >= configuracoes.geracoes
    };
  }

  function executar() {
    if (geracaoAtual >= configuracoes.geracoes) {
      return obterEstado();
    }

    executando = true;
    return obterEstado();
  }

  function pausar() {
    executando = false;
    return obterEstado();
  }

  reiniciar();

  return {
    executar,
    pausar,
    avancarGeracao,
    reiniciar,
    obterEstado
  };
}