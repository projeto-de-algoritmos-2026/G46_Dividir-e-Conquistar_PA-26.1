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

import type { GeneratorNode } from './types';

// Função auxiliar para calcular a distância Euclidiana
const getDistance = (p1: GeneratorNode, p2: GeneratorNode) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

// ==========================================
// ALGORITMO 2: Par de Pontos Mais Próximos (Closest Pair)
// Objetivo: Achar o gargalo de energia no mapa em O(N log N)
// ==========================================
export const findClosestPair = (points: GeneratorNode[]): { pair: [GeneratorNode, GeneratorNode] | null, distance: number } => {
  // Se houver 3 ou menos pontos, a força bruta é mais rápida (Caso Base)
  const bruteForce = (pts: GeneratorNode[]) => {
    let minD = Infinity;
    let closestPair: [GeneratorNode, GeneratorNode] | null = null;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = getDistance(pts[i], pts[j]);
        if (d < minD) {
          minD = d;
          closestPair = [pts[i], pts[j]];
        }
      }
    }
    return { pair: closestPair, distance: minD };
  };

  // Ordena os pontos pelo eixo X apenas uma vez
  const pointsSortedX = [...points].sort((a, b) => a.x - b.x);

  // Função recursiva de Dividir e Conquistar
  const divideAndConquer = (ptsX: GeneratorNode[]): { pair: [GeneratorNode, GeneratorNode] | null, distance: number } => {
    if (ptsX.length <= 3) return bruteForce(ptsX);

    // Dividir pelo meio
    const mid = Math.floor(ptsX.length / 2);
    const midPoint = ptsX[mid];

    const left = divideAndConquer(ptsX.slice(0, mid));
    const right = divideAndConquer(ptsX.slice(mid));

    // Pega o menor entre a esquerda e a direita
    let minResult = left.distance < right.distance ? left : right;

    // Conquistar: Verifica a "faixa" central (strip)
    // Pega só os pontos que estão mais próximos da linha do meio do que a distância mínima atual
    const strip = ptsX.filter(p => Math.abs(p.x - midPoint.x) < minResult.distance);
    // Ordena o strip pelo eixo Y para otimização
    strip.sort((a, b) => a.y - b.y);

    for (let i = 0; i < strip.length; i++) {
      for (let j = i + 1; j < strip.length && (strip[j].y - strip[i].y) < minResult.distance; j++) {
        const d = getDistance(strip[i], strip[j]);
        if (d < minResult.distance) {
          minResult = { pair: [strip[i], strip[j]], distance: d };
        }
      }
    }

    return minResult;
  };

  return divideAndConquer(pointsSortedX);
};