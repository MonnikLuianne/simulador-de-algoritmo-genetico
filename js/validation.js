export function lerConfiguracoes() {
  const configuracoes = {
    orcamento: document.getElementById("orcamento").value,
    populacao: document.getElementById("populacao").value,
    geracoes: document.getElementById("geracoes").value,
    cruzamento: document.getElementById("cruzamento").value,
    mutacao: document.getElementById("mutacao").value,
    torneio: document.getElementById("torneio").value,
    elite: document.getElementById("elite").value,
    semente: document.getElementById("semente").value
  };

  const numericos = Object.values(configuracoes);

  if (numericos.some(valor => valor.trim() === "")) {
    throw new Error("Preencha todos os campos de configuração.");
  }

  const valores = Object.fromEntries(
    Object.entries(configuracoes).map(([chave, valor]) => [
      chave,
      Number(valor)
    ])
  );

  if (Object.values(valores).some(valor => !Number.isFinite(valor))) {
    throw new Error("Todos os parâmetros devem ser números válidos.");
  }

  if (valores.orcamento < 0) {
    throw new Error("O orçamento não pode ser negativo.");
  }

  if (!Number.isInteger(valores.populacao) || valores.populacao < 2) {
    throw new Error("A população deve ser um inteiro maior ou igual a 2.");
  }

  if (!Number.isInteger(valores.geracoes) || valores.geracoes < 1) {
    throw new Error("O número de gerações deve ser um inteiro maior ou igual a 1.");
  }

  if (valores.cruzamento < 0 || valores.cruzamento > 100) {
    throw new Error("A taxa de cruzamento deve estar entre 0 e 100%.");
  }

  if (valores.mutacao < 0 || valores.mutacao > 100) {
    throw new Error("A taxa de mutação deve estar entre 0 e 100%.");
  }

  if (
    !Number.isInteger(valores.torneio) ||
    valores.torneio < 2 ||
    valores.torneio > valores.populacao
  ) {
    throw new Error("O tamanho do torneio deve estar entre 2 e o tamanho da população.");
  }

  if (
    !Number.isInteger(valores.elite) ||
    valores.elite < 0 ||
    valores.elite >= valores.populacao
  ) {
    throw new Error("O elitismo deve ser um inteiro entre 0 e população - 1.");
  }

  if (!Number.isInteger(valores.semente)) {
    throw new Error("A semente deve ser um número inteiro.");
  }

  return valores;
}