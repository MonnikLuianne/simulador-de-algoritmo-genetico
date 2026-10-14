export function criarGeradorAleatorio(semente) {
  let estado = semente >>> 0;

  return function aleatorio() {
    estado = (estado + 0x6D2B79F5) >>> 0;

    let valor = estado;
    valor = Math.imul(valor ^ (valor >>> 15), valor | 1);
    valor ^= valor + Math.imul(valor ^ (valor >>> 7), valor | 61);

    return ((valor ^ (valor >>> 14)) >>> 0) / 4294967296;
  };
}
