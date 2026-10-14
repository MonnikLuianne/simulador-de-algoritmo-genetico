import { repararSolucao } from "./repair.js";
import { avaliarSolucao } from "./evaluation.js";

// A população inicial agora recebe o gerador compartilhado (aleatorio),
// garantindo que a sequência de números pseudoaleatórios seja contínua
// entre a inicialização e as gerações subsequentes.
export function gerarPopulacaoInicial(
  projetos,
  tamanhoPopulacao,
  orcamento,
  aleatorio
) {
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

  return { cromossomo: [...populacao[vencedor]], indice: vencedor };
}

// Corte sorteado entre o primeiro gene (posição 1) e o penúltimo gene
// (posição length-1), conforme o enunciado.
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

      eventos.push(`Gene ${i + 1} (${String.fromCharCode(65 + i)}): ${valorAnterior} → ${mutado[i]}`);
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

  // Elitismo: copia os melhores sem modificação
  for (let i = 0; i < configuracoes.elite; i++) {
    novaPopulacao.push([...avaliados[i].cromossomo]);
    eventos.push(
      `Elitismo: indivíduo ${avaliados[i].indice + 1} (${avaliados[i].cromossomo.join("")}) preservado com aptidão ${avaliados[i].fitness}.`
    );
  }

  // Completa as vagas restantes com descendentes
  while (novaPopulacao.length < configuracoes.populacao) {
    const selecao1 = selecionarPorTorneio(
      populacao, projetos, configuracoes.torneio, aleatorio
    );

    const selecao2 = selecionarPorTorneio(
      populacao, projetos, configuracoes.torneio, aleatorio
    );

    const pai1 = selecao1.cromossomo;
    const pai2 = selecao2.cromossomo;

    let filho1 = [...pai1];
    let filho2 = [...pai2];

    eventos.push(
      `Seleção por torneio: pai 1 = ${pai1.join("")} (índice ${selecao1.indice + 1}), pai 2 = ${pai2.join("")} (índice ${selecao2.indice + 1}).`
    );

    if (aleatorio() < configuracoes.cruzamento / 100) {
      const resultado = cruzamentoUmPonto(pai1, pai2, aleatorio);
      filho1 = resultado.filho1;
      filho2 = resultado.filho2;

      eventos.push(
        `Cruzamento no ponto ${resultado.pontoCorte}: ` +
        `${pai1.join("")} + ${pai2.join("")} → ` +
        `filho 1 = ${filho1.join("")}, filho 2 = ${filho2.join("")}.`
      );
    } else {
      eventos.push(
        `Sem cruzamento: filhos são cópias dos pais antes da mutação (${pai1.join("")} e ${pai2.join("")}).`
      );
    }

    const mutacao1 = mutarCromossomo(
      filho1, configuracoes.mutacao, aleatorio
    );

    const mutacao2 = mutarCromossomo(
      filho2, configuracoes.mutacao, aleatorio
    );

    const filho1AntesMutacao = filho1.join("");
    const filho2AntesMutacao = filho2.join("");

    filho1 = mutacao1.cromossomo;
    filho2 = mutacao2.cromossomo;

    if (mutacao1.eventos.length > 0) {
      eventos.push(
        `Mutação no filho 1 (${filho1AntesMutacao} → ${filho1.join("")}): ${mutacao1.eventos.join("; ")}.`
      );
    } else {
      eventos.push(`Mutação no filho 1: nenhum gene alterado (${filho1.join("")}).`);
    }

    if (mutacao2.eventos.length > 0) {
      eventos.push(
        `Mutação no filho 2 (${filho2AntesMutacao} → ${filho2.join("")}): ${mutacao2.eventos.join("; ")}.`
      );
    } else {
      eventos.push(`Mutação no filho 2: nenhum gene alterado (${filho2.join("")}).`);
    }

    // Reparo e adição do filho 1
    const reparo1 = repararSolucao(
      filho1, projetos, configuracoes.orcamento
    );

    novaPopulacao.push(reparo1.cromossomo);

    if (reparo1.eventos.length > 0) {
      eventos.push(
        `Reparo do filho 1: ${filho1.join("")} → ${reparo1.cromossomo.join("")} (${reparo1.eventos.join("; ")}).`
      );
    } else {
      eventos.push(`Filho 1 viável: ${reparo1.cromossomo.join("")} (aptidão ${reparo1.avaliacao.fitness}).`);
    }

    // Só adiciona filho 2 se ainda há vagas
    if (novaPopulacao.length < configuracoes.populacao) {
      const reparo2 = repararSolucao(
        filho2, projetos, configuracoes.orcamento
      );

      novaPopulacao.push(reparo2.cromossomo);

      if (reparo2.eventos.length > 0) {
        eventos.push(
          `Reparo do filho 2: ${filho2.join("")} → ${reparo2.cromossomo.join("")} (${reparo2.eventos.join("; ")}).`
        );
      } else {
        eventos.push(`Filho 2 viável: ${reparo2.cromossomo.join("")} (aptidão ${reparo2.avaliacao.fitness}).`);
      }
    }
  }

  return { populacao: novaPopulacao, eventos };
}