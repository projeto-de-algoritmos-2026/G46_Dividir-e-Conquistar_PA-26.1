import { useState, useEffect } from 'react';
import { countInversions, findClosestPair } from './algorithms';
import type { Box, GeneratorNode } from './types';

// --- GERADORES DE DADOS ---
const generateBoxes = (count: number): Box[] => {
  const nums = Array.from({ length: count }, (_, i) => i + 1);
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  return nums.map(num => ({ id: `box-${num}`, weight: num }));
};

const generateNodes = (count: number): GeneratorNode[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `gen-${i}`,
    x: Math.floor(Math.random() * 90) + 5, // Evita bordas extremas (5% a 95%)
    y: Math.floor(Math.random() * 90) + 5,
  }));
};

function App() {
  // Estados da Esteira
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [chaosLevel, setChaosLevel] = useState<number>(0);
  const [selectedBoxIndex, setSelectedBoxIndex] = useState<number | null>(null);

  // Estados da Malha de Energia
  const [generators, setGenerators] = useState<GeneratorNode[]>([]);
  const [closestPair, setClosestPair] = useState<[GeneratorNode, GeneratorNode] | null>(null);
  const [selectedGenerators, setSelectedGenerators] = useState<string[]>([]);
  const [energyStable, setEnergyStable] = useState<boolean>(false);

  // Inicialização
  useEffect(() => {
    handleRestartAll();
  }, []);

  // Recalcula o caos da esteira
  useEffect(() => {
    if (boxes.length > 0) {
      const { inversions } = countInversions(boxes.map(b => b.weight));
      setChaosLevel(inversions);
    }
  }, [boxes]);

  // Recalcula o par mais próximo na malha
  useEffect(() => {
    if (generators.length > 0) {
      const result = findClosestPair(generators);
      setClosestPair(result.pair);
    }
  }, [generators]);

  const handleRestartAll = () => {
    setBoxes(generateBoxes(8));
    setSelectedBoxIndex(null);
    setGenerators(generateNodes(12));
    setSelectedGenerators([]);
    setEnergyStable(false);
  };

  // Lógica de clique na Esteira
  const handleBoxClick = (index: number) => {
    if (chaosLevel === 0) return;
    if (selectedBoxIndex === null) {
      setSelectedBoxIndex(index);
    } else {
      if (selectedBoxIndex !== index) {
        const newBoxes = [...boxes];
        [newBoxes[selectedBoxIndex], newBoxes[index]] = [newBoxes[index], newBoxes[selectedBoxIndex]];
        setBoxes(newBoxes);
      }
      setSelectedBoxIndex(null);
    }
  };

  // Lógica de clique nos Geradores
  const handleGeneratorClick = (id: string) => {
    if (energyStable || !closestPair) return;

    const newSelected = selectedGenerators.includes(id) 
      ? selectedGenerators.filter(g => g !== id)
      : [...selectedGenerators, id];
    
    setSelectedGenerators(newSelected);

    // Checa se acertou os dois corretos
    if (newSelected.length === 2) {
      const isCorrect = closestPair.every(node => newSelected.includes(node.id));
      if (isCorrect) {
        setEnergyStable(true);
      } else {
        // Errou, toma um choque e limpa
        setTimeout(() => setSelectedGenerators([]), 500);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans flex flex-col items-center">
      
      {/* HUD Superior */}
      <header className="w-full max-w-5xl flex justify-between items-end border-b border-slate-800 pb-4 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white">
            CAOS <span className="text-orange-500">&</span> CONQUISTA
          </h1>
          <p className="text-slate-500 font-mono mt-1 text-sm tracking-widest uppercase">
            Sistema de Operações Logísticas
          </p>
        </div>
        <button onClick={handleRestartAll} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-orange-500 border border-orange-500/30 rounded font-bold transition-all cursor-pointer">
          ↻ Reiniciar Sistemas
        </button>
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUNA 1: ESTEIRA (BPM) */}
        <section className="bg-slate-900 border-2 border-slate-800 rounded-xl p-6 relative shadow-2xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold font-mono text-slate-300">Setor 1: Logística</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-bold uppercase">Inversões:</span>
              <span className={`text-2xl font-black font-mono ${chaosLevel === 0 ? 'text-emerald-500' : 'text-red-500'}`}>{chaosLevel}</span>
            </div>
          </div>

          <div className="relative flex-grow h-48 bg-slate-950 rounded-lg border-y-4 border-slate-700 flex flex-wrap content-center justify-center gap-2 p-4">
            {boxes.map((box, index) => (
              <div
                key={box.id}
                onClick={() => handleBoxClick(index)}
                className={`
                  relative z-10 w-16 h-16 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all duration-300 select-none
                  ${selectedBoxIndex === index ? 'bg-orange-500 text-slate-900 scale-110 shadow-[0_0_15px_#f97316]' : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-600'}
                  ${chaosLevel === 0 ? 'bg-emerald-600 border-emerald-400' : ''}
                `}
              >
                <span className="text-xl font-black">{box.weight}</span>
              </div>
            ))}
            
            {chaosLevel === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm rounded-lg z-20">
                <span className="text-2xl font-black text-emerald-500 tracking-widest border-2 border-emerald-500 px-4 py-2 rounded">ESTABILIZADO</span>
              </div>
            )}
          </div>
        </section>

        {/* COLUNA 2: MALHA DE ENERGIA */}
        <section className="bg-slate-900 border-2 border-slate-800 rounded-xl p-6 relative shadow-2xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold font-mono text-slate-300">Setor 2: Energia</h2>
            <div className={`w-3 h-3 rounded-full animate-pulse ${energyStable ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-orange-500 shadow-[0_0_10px_#f97316]'}`}></div>
          </div>

          <p className="text-xs text-slate-400 mb-2 font-mono">
            ALERTA: Curto-circuito iminente. Conecte os dois geradores MAIS PRÓXIMOS para isolar a rede.
          </p>

          <div className="relative flex-grow h-64 bg-slate-950 rounded-lg border border-slate-700 overflow-hidden">
            
            {/* Grid de fundo para dar estilo de radar */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            {/* Geradores */}
            {generators.map((gen) => {
              const isSelected = selectedGenerators.includes(gen.id);
              // Trapaça visual sutil (apenas para o jogador não ficar louco tentando medir pixels)
              const isTarget = closestPair && (closestPair[0].id === gen.id || closestPair[1].id === gen.id);
              
              return (
                <div
                  key={gen.id}
                  onClick={() => handleGeneratorClick(gen.id)}
                  className={`absolute w-4 h-4 -ml-2 -mt-2 rounded-full cursor-pointer transition-all duration-300
                    ${isSelected ? 'bg-orange-500 scale-150 shadow-[0_0_15px_#f97316]' : 'bg-slate-600 hover:bg-slate-400 border border-slate-950'}
                    ${energyStable && isTarget ? 'bg-emerald-500 shadow-[0_0_20px_#10b981]' : ''}
                    ${!energyStable && isTarget ? 'animate-pulse' : ''} 
                  `}
                  style={{ left: `${gen.x}%`, top: `${gen.y}%` }}
                />
              );
            })}

            {/* Raio visual entre os dois pontos se ganhar */}
            {energyStable && closestPair && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <line 
                  x1={`${closestPair[0].x}%`} y1={`${closestPair[0].y}%`} 
                  x2={`${closestPair[1].x}%`} y2={`${closestPair[1].y}%`} 
                  stroke="#10b981" strokeWidth="3" className="drop-shadow-[0_0_5px_#10b981] animate-pulse" 
                />
              </svg>
            )}

            {energyStable && (
               <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px] rounded-lg z-20">
                 <span className="text-2xl font-black text-emerald-500 tracking-widest border-2 border-emerald-500 px-4 py-2 rounded transform rotate-[-5deg]">REDE ISOLADA</span>
               </div>
            )}

          </div>
        </section>

      </main>
    </div>
  );
}

export default App;