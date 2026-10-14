import { avaliarSolucao } from "./evaluation.js";

export function repararSolucao(cromossomo, projetos, orcamento) {
  const reparado = [...cromossomo];
  const eventos = [];

  while (avaliarSolucao(reparado, projetos).custo > orcamento) {
    let indiceRemover = -1;
    let menorRazao = Infinity;

    for (let i = 0; i < reparado.length; i++) {
      if (reparado[i] !== 1) {
        continue;
      }

      const razao = projetos[i].beneficio / projetos[i].custo;

      if (razao < menorRazao) {
        menorRazao = razao;
        indiceRemover = i;
      }
    }

    if (indiceRemover === -1) {
      break;
    }

    eventos.push(
      `Projeto removido: ${projetos[indiceRemover].nome}`
    );

    reparado[indiceRemover] = 0;
  }

  return {
    cromossomo: reparado,
    avaliacao: avaliarSolucao(reparado, projetos),
    eventos
  };
}
