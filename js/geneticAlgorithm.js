
import { criarGeradorAleatorio } from "./random.js";
import { repararSolucao } from "./repair.js";
import { avaliarSolucao } from "./evaluation.js";

export function gerarPopulacaoInicial(
  projetos,
  tamanhoPopulacao,
  orcamento,
  semente
) {
  const aleatorio = criarGeradorAleatorio(semente);
  const populacao = [];

  for (let i = 0; i < tamanhoPopulacao; i++) {
    const cromossomo = projetos.map(() =>
      aleatorio() < 0.5 ? 0 : 1
    );

    const resultado = repararSolucao(cromossomo, projetos, orcamento);
    populacao.push(resultado.cromossomo);
  }

  return populacao;
}

export function selecionarPorTorneio(
  populacao,
  projetos,
  tamanhoTorneio,
  aleatorio
) {
  const indicesDisponiveis = populacao.map((_, indice) => indice);
  const candidatos = [];

  for (let i = 0; i < tamanhoTorneio; i++) {
    const posicao = Math.floor(
      aleatorio() * indicesDisponiveis.length
    );

    candidatos.push(indicesDisponiveis[posicao]);
    indicesDisponiveis.splice(posicao, 1);
  }

  let vencedor = candidatos[0];

  for (const indice of candidatos.slice(1)) {
    const fitnessAtual = avaliarSolucao(
      populacao[indice], projetos
    ).fitness;

    const fitnessVencedor = avaliarSolucao(
      populacao[vencedor], projetos
    ).fitness;

    if (
      fitnessAtual > fitnessVencedor ||
      (fitnessAtual === fitnessVencedor && indice < vencedor)
    ) {
      vencedor = indice;
    }
  }

  return [...populacao[vencedor]];
}

export function cruzamentoUmPonto(pai1, pai2, aleatorio) {
  const pontoCorte =
    Math.floor(aleatorio() * (pai1.length - 1)) + 1;

  const filho1 = [
    ...pai1.slice(0, pontoCorte),
    ...pai2.slice(pontoCorte)
  ];

  const filho2 = [
    ...pai2.slice(0, pontoCorte),
    ...pai1.slice(pontoCorte)
  ];

  return { pontoCorte, filho1, filho2 };
}

export function mutarCromossomo(cromossomo, taxaMutacao, aleatorio) {
  const mutado = [...cromossomo];
  const eventos = [];

  for (let i = 0; i < mutado.length; i++) {
    if (aleatorio() < taxaMutacao / 100) {
      const valorAnterior = mutado[i];
      mutado[i] = mutado[i] === 0 ? 1 : 0;

      eventos.push(`Gene ${i}: ${valorAnterior} -> ${mutado[i]}`);
    }
  }

  return { cromossomo: mutado, eventos };
}

export function executarGeracao(
  populacao,
  projetos,
  configuracoes,
  aleatorio
) {
  const novaPopulacao = [];
  const eventos = [];

  const avaliados = populacao.map((cromossomo, indice) => ({
    cromossomo: [...cromossomo],
    fitness: avaliarSolucao(cromossomo, projetos).fitness,
    indice
  }));

  avaliados.sort(
    (a, b) => b.fitness - a.fitness || a.indice - b.indice
  );

  for (let i = 0; i < configuracoes.elite; i++) {
    novaPopulacao.push([...avaliados[i].cromossomo]);
    eventos.push(
      `Elitismo: indivíduo ${avaliados[i].indice} preservado; cromossomo ${avaliados[i].cromossomo.join("")}.`
    );
  }

  while (novaPopulacao.length < configuracoes.populacao) {
    const pai1 = selecionarPorTorneio(
      populacao, projetos, configuracoes.torneio, aleatorio
    );

    const pai2 = selecionarPorTorneio(
      populacao, projetos, configuracoes.torneio, aleatorio
    );

    let filho1 = [...pai1];
    let filho2 = [...pai2];

    eventos.push(
      `Seleção por torneio: pais escolhidos ${pai1.join("")} e ${pai2.join("")}.`
    );

    if (aleatorio() < configuracoes.cruzamento / 100) {
      const resultado = cruzamentoUmPonto(pai1, pai2, aleatorio);
      filho1 = resultado.filho1;
      filho2 = resultado.filho2;

      eventos.push(
        `Cruzamento no ponto ${resultado.pontoCorte}: ` +
        `${pai1.join("")} + ${pai2.join("")} -> ` +
        `${filho1.join("")} e ${filho2.join("")}`
      );
    } else {
      eventos.push(
        `Sem cruzamento para o par ${pai1.join("")} e ${pai2.join("")}; cópias dos pais seguem para mutação.`
      );
    }

    const mutacao1 = mutarCromossomo(
      filho1, configuracoes.mutacao, aleatorio
    );

    const mutacao2 = mutarCromossomo(
      filho2, configuracoes.mutacao, aleatorio
    );

    filho1 = mutacao1.cromossomo;
    filho2 = mutacao2.cromossomo;

    eventos.push(
      ...mutacao1.eventos.map(evento => `Mutação no filho 1: ${evento}`)
    );

    eventos.push(
      ...mutacao2.eventos.map(evento => `Mutação no filho 2: ${evento}`)
    );

    const reparo1 = repararSolucao(
      filho1, projetos, configuracoes.orcamento
    );

    
    novaPopulacao.push(reparo1.cromossomo);

    eventos.push(
      `Filho 1 após mutação: ${filho1.join("")}.`
    );

    eventos.push(...reparo1.eventos);

    eventos.push(
      `Filho 1 após reparo: ${reparo1.cromossomo.join("")}.`
    );


    if (novaPopulacao.length < configuracoes.populacao) {
      const reparo2 = repararSolucao(
        filho2, projetos, configuracoes.orcamento
      );

      
      novaPopulacao.push(reparo2.cromossomo);

      eventos.push(
        `Filho 2 após mutação: ${filho2.join("")}.`
      );

      eventos.push(...reparo2.eventos);

      eventos.push(
        `Filho 2 após reparo: ${reparo2.cromossomo.join("")}.`
      );

    }
  }

  return { populacao: novaPopulacao, eventos };
}
