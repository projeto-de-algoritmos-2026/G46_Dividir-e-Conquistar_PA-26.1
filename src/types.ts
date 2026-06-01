export interface Box {
  id: string;
  weight: number;
}

// Estrutura do Gerador no Mapa 2D
export interface GeneratorNode {
  id: string;
  x: number; // Posição horizontal (0 a 100%)
  y: number; // Posição vertical (0 a 100%)
}