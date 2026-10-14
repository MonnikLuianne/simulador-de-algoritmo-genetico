import { avaliarSolucao } from "./evaluation.js";

export function repararSolucao(cromossomo, projetos, orcamento) {
  const reparado = [...cromossomo];
  const eventos = [];

  while (avaliarSolucao(reparado, projetos).custo > orcamento) {
    let indiceRemover = -1;
    let menorRazao = Infinity;

    for (let i = 0; i < reparado.length; i++) {
      if (reparado[i] !== 1) continue;

      const razao = projetos[i].beneficio / projetos[i].custo;

      // Em empate de razão, escolhe o de menor índice (primeira ocorrência)
      if (
        razao < menorRazao ||
        (razao === menorRazao && indiceRemover === -1)
      ) {
        menorRazao = razao;
        indiceRemover = i;
      }
    }

    if (indiceRemover === -1) break;

    eventos.push(
      `Remover ${projetos[indiceRemover].nome} ` +
      `(razão benefício/custo = ${(projetos[indiceRemover].beneficio / projetos[indiceRemover].custo).toFixed(4)}).`
    );

    reparado[indiceRemover] = 0;
  }

  return {
    cromossomo: reparado,
    avaliacao: avaliarSolucao(reparado, projetos),
    eventos
  };
}