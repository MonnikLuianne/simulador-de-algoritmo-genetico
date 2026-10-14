export function avaliarSolucao(cromossomo, projetos) {
  let custo = 0;
  let beneficio = 0;

  cromossomo.forEach((gene, indice) => {
    if (gene === 1) {
      custo += projetos[indice].custo;
      beneficio += projetos[indice].beneficio;
    }
  });

  return {
    custo: Number(custo.toFixed(2)),
    beneficio,
    fitness: beneficio
  };
}
