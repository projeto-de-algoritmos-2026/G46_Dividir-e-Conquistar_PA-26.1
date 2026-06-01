import { useState, useEffect } from 'react';
import { countInversions } from './algorithms';
import type { Box } from './types';

// Gera uma lista aleatória de caixas fora de ordem
const generateBoxes = (count: number): Box[] => {
  const nums = Array.from({ length: count }, (_, i) => i + 1);
  // Embaralha o array
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  return nums.map(num => ({ id: `box-${num}`, weight: num }));
};

function App() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [chaosLevel, setChaosLevel] = useState<number>(0);
  const [selectedBoxIndex, setSelectedBoxIndex] = useState<number | null>(null);

  // Inicia o jogo com 8 caixas
  useEffect(() => {
    handleRestart();
  }, []);

  // Sempre que a ordem das caixas muda, o algoritmo recalcula o caos
  useEffect(() => {
    if (boxes.length > 0) {
      const weights = boxes.map(b => b.weight);
      const { inversions } = countInversions(weights);
      setChaosLevel(inversions);
    }
  }, [boxes]);

  const handleRestart = () => {
    setBoxes(generateBoxes(8));
    setSelectedBoxIndex(null);
  };

  const handleBoxClick = (index: number) => {
    if (chaosLevel === 0) return; // Jogo já vencido

    if (selectedBoxIndex === null) {
      // Seleciona a primeira caixa
      setSelectedBoxIndex(index);
    } else {
      // Troca de lugar se clicou em outra caixa
      if (selectedBoxIndex !== index) {
        const newBoxes = [...boxes];
        const temp = newBoxes[selectedBoxIndex];
        newBoxes[selectedBoxIndex] = newBoxes[index];
        newBoxes[index] = temp;
        setBoxes(newBoxes);
      }
      setSelectedBoxIndex(null); // Limpa a seleção
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans flex flex-col items-center">
      
      {/* HUD Superior */}
      <header className="w-full max-w-5xl flex justify-between items-end border-b border-slate-800 pb-4 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white">
            CAOS <span className="text-orange-500">&</span> CONQUISTA
          </h1>
          <p className="text-slate-500 font-mono mt-1 text-sm tracking-widest uppercase">
            Sistema de Operações Logísticas
          </p>
        </div>
        
        <div className="flex gap-6 items-center">
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-400 font-bold tracking-wider uppercase mb-1">
              Nível de Caos (Inversões)
            </span>
            <span className={`text-4xl font-black font-mono transition-colors duration-500 ${chaosLevel === 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {chaosLevel}
            </span>
          </div>
          <button 
            onClick={handleRestart}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-orange-500 border border-orange-500/30 rounded font-bold transition-all cursor-pointer"
          >
            ↻ Reiniciar Esteira
          </button>
        </div>
      </header>

      {/* Área da Esteira (BPM Visual) */}
      <main className="w-full max-w-5xl flex flex-col items-center">
        
        <div className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-8 relative shadow-2xl">
          
          <div className="absolute top-4 left-6 flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full animate-pulse ${chaosLevel === 0 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}></div>
            <span className="text-xs font-mono text-slate-400 uppercase">Status da Linha</span>
          </div>

          <p className="text-center text-slate-500 mb-8 max-w-2xl mx-auto text-sm">
            As caixas estão fora de ordem! Clique em duas caixas para trocá-las de lugar. 
            O algoritmo conta as inversões em tempo real. Seu objetivo é zerar o Caos colocando-as em ordem crescente.
          </p>

          {/* O trilho da esteira */}
          <div className="relative h-40 bg-slate-950 rounded-lg border-y-4 border-slate-700 flex items-center justify-center gap-2 px-4 overflow-hidden">
            
            {/* Animação visual de esteira rodando (fundo listrado) */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #f97316 10px, #f97316 20px)' }}></div>

            {boxes.map((box, index) => (
              <div
                key={box.id}
                onClick={() => handleBoxClick(index)}
                className={`
                  relative z-10 w-20 h-20 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all duration-300 transform select-none
                  ${selectedBoxIndex === index ? 'bg-orange-500 text-slate-900 scale-110 shadow-[0_0_20px_#f97316]' : 'bg-slate-800 text-white hover:bg-slate-700 border-2 border-slate-600'}
                  ${chaosLevel === 0 ? 'bg-emerald-600 border-emerald-400 hover:bg-emerald-500' : ''}
                `}
              >
                <span className="text-xs opacity-50 font-mono mb-1">CX</span>
                <span className="text-3xl font-black">{box.weight}</span>
              </div>
            ))}
          </div>

          {chaosLevel === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm rounded-xl z-20 transition-all">
              <div className="text-center transform animate-bounce">
                <h2 className="text-5xl font-black text-emerald-500 mb-2">FLUXO ESTABILIZADO!</h2>
                <p className="text-emerald-200">Zero inversões detectadas na linha de produção.</p>
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}

export default App;