// ==========================================
// ALGORITMO 1: Contagem de Inversões (Merge Sort modificado)
// Objetivo: Calcular o Nível de Caos da esteira em O(N log N)
// ==========================================

export const countInversions = (arr: number[]): { sorted: number[], inversions: number } => {
  // Caso base: array de tamanho 1 não tem inversões
  if (arr.length <= 1) {
    return { sorted: arr, inversions: 0 };
  }

  // Dividir (Divide)
  const mid = Math.floor(arr.length / 2);
  const leftResult = countInversions(arr.slice(0, mid));
  const rightResult = countInversions(arr.slice(mid));

  // Conquistar (Conquer)
  let inversions = leftResult.inversions + rightResult.inversions;
  const sorted: number[] = [];
  
  let i = 0; // Ponteiro da esquerda
  let j = 0; // Ponteiro da direita
  const left = leftResult.sorted;
  const right = rightResult.sorted;

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      sorted.push(left[i]);
      i++;
    } else {
      // todos os itens restantes da esquerda formam uma inversão com este item da direita!
      sorted.push(right[j]);
      inversions += (left.length - i); 
      j++;
    }
  }

  // Junta o que sobrou
  sorted.push(...left.slice(i));
  sorted.push(...right.slice(j));

  return { sorted, inversions };
};