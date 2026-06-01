import { useState, useEffect } from 'react';
import { countInversions, findClosestPair } from './algorithms';
import type { Box, GeneratorNode } from './types';

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
    x: Math.floor(Math.random() * 90) + 5,
    y: Math.floor(Math.random() * 90) + 5,
  }));
};

const LEVELS = {
  easy: { time: 45, label: 'Normal (45s)' },
  medium: { time: 30, label: 'Tenso (30s)' },
  hard: { time: 20, label: 'Hardcore (20s)' },
};

type LevelKey = keyof typeof LEVELS;

function App() {
  const [difficulty, setDifficulty] = useState<LevelKey>('medium');
  
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [chaosLevel, setChaosLevel] = useState<number>(-1);
  const [selectedBoxIndex, setSelectedBoxIndex] = useState<number | null>(null);

  const [generators, setGenerators] = useState<GeneratorNode[]>([]);
  const [closestPair, setClosestPair] = useState<[GeneratorNode, GeneratorNode] | null>(null);
  const [selectedGenerators, setSelectedGenerators] = useState<string[]>([]);
  const [energyStable, setEnergyStable] = useState<boolean>(false);

  const [timeLeft, setTimeLeft] = useState<number>(LEVELS.medium.time);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);

  // Decorativo: Linhas do terminal falso
  const [fakeLogs, setFakeLogs] = useState<string[]>([]);

  useEffect(() => {
    handleRestartAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 1. O CRONÔMETRO REVERSO
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !gameWon && !gameOver && chaosLevel !== -1) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameOver(true);
            setIsPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameWon, gameOver, chaosLevel]);

  // 2. O AGENTE AUTÔNOMO EXTREMO & LOGS FALSOS
  useEffect(() => {
    let anomalyInterval: NodeJS.Timeout;
    
    if (isPlaying && !gameWon && !gameOver && chaosLevel !== -1) {
      anomalyInterval = setInterval(() => {
        
        // Adiciona um log falso para dar imersão
        setFakeLogs(prev => {
          const newLog = `[WARN] Anomalia detectada via script_0x${Math.floor(Math.random() * 9999)}. BPM desincronizado.`;
          return [newLog, ...prev].slice(0, 5); // Mantém só os últimos 5
        });

        // Sabota a esteira se não estiver estabilizada
        if (chaosLevel !== 0) {
          setBoxes(prev => {
            const newBoxes = [...prev];
            const i = Math.floor(Math.random() * newBoxes.length);
            let j = Math.floor(Math.random() * newBoxes.length);
            while (i === j) j = Math.floor(Math.random() * newBoxes.length); 
            [newBoxes[i], newBoxes[j]] = [newBoxes[j], newBoxes[i]]; 
            return newBoxes;
          });
        } 
        
        // Sabota a energia se não estiver estabilizada
        if (!energyStable) {
          setGenerators(prev => {
            const newGens = [...prev];
            const i = Math.floor(Math.random() * newGens.length);
            newGens[i] = {
              ...newGens[i],
              x: Math.floor(Math.random() * 90) + 5,
              y: Math.floor(Math.random() * 90) + 5,
            };
            return newGens;
          });
          setSelectedGenerators([]); 
        }
        
      }, 5000);
    }
    return () => clearInterval(anomalyInterval);
  }, [isPlaying, gameWon, gameOver, chaosLevel, energyStable]);

  // Checagem de Vitória Global
  useEffect(() => {
    if (chaosLevel === 0 && energyStable && !gameOver) {
      setIsPlaying(false);
      setGameWon(true);
      setFakeLogs(prev => [`[SUCCESS] Fluxos isolados. BPM otimizado.`, ...prev].slice(0, 5));
    }
  }, [chaosLevel, energyStable, gameOver]);

  useEffect(() => {
    if (boxes.length > 0) {
      const { inversions } = countInversions(boxes.map(b => b.weight));
      setChaosLevel(inversions);
    }
  }, [boxes]);

  useEffect(() => {
    if (generators.length > 0) {
      const result = findClosestPair(generators);
      setClosestPair(result.pair);
    }
  }, [generators]);

  const handleRestartAll = (newDifficulty?: LevelKey) => {
    const levelToUse = newDifficulty || difficulty;
    if (newDifficulty) setDifficulty(newDifficulty);
    
    setBoxes(generateBoxes(17));
    setSelectedBoxIndex(null);
    setGenerators(generateNodes(12));
    setSelectedGenerators([]);
    setEnergyStable(false);
    setTimeLeft(LEVELS[levelToUse].time);
    setIsPlaying(true);
    setGameWon(false);
    setGameOver(false);
    setFakeLogs(['[INFO] Sistema reiniciado.', '[INFO] Carregando malha espacial...', '[INFO] Calibrando sensores...']);
  };

  const handleBoxClick = (index: number) => {
    if (chaosLevel === 0 || !isPlaying) return;
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

  const handleGeneratorClick = (id: string) => {
    if (energyStable || !closestPair || !isPlaying) return;
    const newSelected = selectedGenerators.includes(id) 
      ? selectedGenerators.filter(g => g !== id)
      : [...selectedGenerators, id];
    
    setSelectedGenerators(newSelected);

    if (newSelected.length === 2) {
      const isCorrect = closestPair.every(node => newSelected.includes(node.id));
      if (isCorrect) {
        setEnergyStable(true);
        setFakeLogs(prev => [`[INFO] Malha conectada. Loop fechado.`, ...prev].slice(0, 5));
      } else {
        setFakeLogs(prev => [`[ERROR] Falha de conexão. Distância sub-ótima.`, ...prev].slice(0, 5));
        setTimeout(() => setSelectedGenerators([]), 500);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className={`min-h-screen p-4 lg:p-8 font-sans flex flex-col items-center relative overflow-hidden transition-colors duration-300 ${
      timeLeft <= 10 && isPlaying ? 'bg-red-950/40' : 'bg-slate-950'
    }`}>
      
      {timeLeft <= 15 && isPlaying && (
        <div className={`absolute inset-0 pointer-events-none z-0 mix-blend-overlay transition-all ${
          timeLeft <= 5 ? 'bg-red-600/30 animate-ping' : 'bg-red-800/20 animate-pulse'
        }`}></div>
      )}

      {/* PAINEL GLOBAL (Engloba tudo) */}
      <div className="w-full max-w-7xl bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-sm z-10 relative">
        
        {/* PARAFUSOS DECORATIVOS NAS BORDAS */}
        <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-slate-800 border border-slate-700 shadow-inner"></div>
        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-slate-800 border border-slate-700 shadow-inner"></div>
        <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-slate-800 border border-slate-700 shadow-inner"></div>
        <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-slate-800 border border-slate-700 shadow-inner"></div>

        {/* HUD Superior */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-slate-800 pb-6 mb-6">
          <div className="flex items-center gap-4">
            {/* Logo Simulado */}
            <div className="w-16 h-16 bg-slate-950 rounded border-2 border-orange-500/50 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(249,115,22,0.2)_0%,transparent_70%)]"></div>
              <span className="text-orange-500 font-black text-2xl animate-pulse">⚙️</span>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                CAOS <span className="text-orange-500">&</span> CONQUISTA
              </h1>
              <p className="text-slate-500 font-mono mt-1 text-xs md:text-sm tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                Operações Logísticas & Infraestrutura
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-8 mt-6 md:mt-0">
            <div className="flex flex-col items-end mt-1">
              <span className={`text-xs font-bold uppercase tracking-widest mb-1 bg-slate-950 px-2 py-1 rounded border ${
                timeLeft <= 10 ? 'text-red-400 border-red-900/50 animate-pulse' : 'text-slate-400 border-slate-800'
              }`}>
                {timeLeft <= 10 ? '⚠ COLAPSO IMINENTE ⚠' : 'SEJA RÁPIDO, O TEMPO ESTÁ PASSANDO'}
              </span>
              <span className={`text-5xl font-mono font-black transition-all ${
                timeLeft <= 15 ? 'text-red-500 drop-shadow-[0_0_15px_#ef4444]' : 'text-slate-200'
              } ${timeLeft <= 5 ? 'scale-110 animate-bounce text-red-400' : ''}`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-1 bg-slate-950 p-1 rounded border border-slate-800">
                {(Object.keys(LEVELS) as LevelKey[]).map(key => (
                  <button
                    key={key}
                    onClick={() => handleRestartAll(key)}
                    className={`px-3 py-1 text-[10px] uppercase font-bold rounded transition-colors ${
                      difficulty === key 
                        ? 'bg-orange-600 text-white shadow-[0_0_10px_#ea580c]' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {LEVELS[key].label}
                  </button>
                ))}
              </div>
              <button onClick={() => handleRestartAll()} className="px-6 py-2 bg-slate-950 hover:bg-slate-800 text-orange-500 border border-orange-500/50 rounded font-bold transition-all cursor-pointer shadow-lg w-full text-sm uppercase tracking-wider">
                [ REBOOT SYSTEM ]
              </button>
            </div>
          </div>
        </header>

        {/* LAYOUT PRINCIPAL (3 Colunas no Desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* COLUNA ESQUERDA: Terminal Falso (DECORATIVO) */}
          <aside className="hidden lg:flex lg:col-span-2 flex-col gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded p-4 h-full flex flex-col">
              <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest border-b border-slate-800 pb-2 mb-3">
                Telemetry Log
              </h3>
              <div className="flex-grow font-mono text-[10px] flex flex-col gap-2 overflow-hidden opacity-80">
                {fakeLogs.map((log, i) => (
                  <div key={i} className={`${log.includes('ERROR') ? 'text-red-400' : log.includes('WARN') ? 'text-orange-400' : log.includes('SUCCESS') ? 'text-emerald-400' : 'text-slate-400'}`}>
                    &gt; {log}
                  </div>
                ))}
              </div>
              {/* Barras falsas de carregamento */}
              <div className="mt-4 border-t border-slate-800 pt-3 flex flex-col gap-3">
                <div>
                  <div className="flex justify-between text-[8px] text-slate-500 mb-1"><span>CPU LOAD</span><span>78%</span></div>
                  <div className="h-1 w-full bg-slate-900 rounded"><div className="h-full bg-orange-500 w-[78%] animate-pulse rounded"></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-[8px] text-slate-500 mb-1"><span>MEMORY</span><span>42%</span></div>
                  <div className="h-1 w-full bg-slate-900 rounded"><div className="h-full bg-slate-400 w-[42%] rounded"></div></div>
                </div>
              </div>
            </div>
          </aside>

          {/* COLUNA CENTRAL: O Jogo Real */}
          <main className={`lg:col-span-10 grid grid-cols-1 xl:grid-cols-2 gap-6 transition-transform ${
            timeLeft <= 5 && isPlaying ? 'translate-x-[2px] translate-y-[2px] animate-pulse' : ''
          }`}>
            
            {/* SETOR 1: ESTEIRA */}
            <section className={`bg-slate-900 border-2 rounded p-6 relative shadow-inner flex flex-col transition-colors ${
              timeLeft <= 10 && isPlaying ? 'border-red-900/50' : 'border-slate-700'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold font-mono text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <span className="text-orange-500">_</span> Setor 1: Logística
                </h2>
                <div className="flex items-center gap-3 bg-slate-950 px-3 py-1 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Nível de Caos</span>
                  <span className={`text-2xl font-black font-mono transition-transform ${chaosLevel === 0 ? 'text-emerald-500' : 'text-red-500 scale-110'}`}>{chaosLevel === -1 ? 0 : chaosLevel}</span>
                </div>
              </div>
              <div className="relative flex-grow min-h-[12rem] bg-slate-950 rounded border-y-4 border-slate-700 flex flex-wrap content-center justify-center gap-2 p-4 shadow-inner">
                {boxes.map((box, index) => (
                  <div
                    key={box.id}
                    onClick={() => handleBoxClick(index)}
                    className={`relative z-10 w-11 h-11 flex flex-col items-center justify-center rounded cursor-pointer transition-all duration-300 select-none
                      ${selectedBoxIndex === index ? 'bg-orange-500 text-slate-900 scale-110 shadow-[0_0_15px_#f97316]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'}
                      ${chaosLevel === 0 ? 'bg-emerald-600 border-emerald-400 shadow-[0_0_15px_#10b981] text-white' : ''}`}
                  >
                    <span className="text-lg font-black">{box.weight}</span>
                  </div>
                ))}
                {chaosLevel === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-20">
                    <span className="text-xl font-black text-emerald-500 tracking-widest border border-emerald-500 px-6 py-2 rounded bg-slate-950 shadow-[0_0_20px_#10b981]">ESTABILIZADO</span>
                  </div>
                )}
              </div>
            </section>

            {/* SETOR 2: ENERGIA */}
            <section className={`bg-slate-900 border-2 rounded p-6 relative shadow-inner flex flex-col transition-colors ${
              timeLeft <= 10 && isPlaying ? 'border-red-900/50' : 'border-slate-700'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold font-mono text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <span className="text-orange-500">_</span> Setor 2: Energia
                </h2>
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded border border-slate-800">
                   <span className="text-[10px] text-slate-500 uppercase font-bold">Status:</span>
                   <div className={`w-3 h-3 rounded-full ${energyStable ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-orange-500 animate-pulse shadow-[0_0_10px_#f97316]'}`}></div>
                </div>
              </div>
              <div className="relative flex-grow h-64 bg-slate-950 rounded border border-slate-700 overflow-hidden shadow-inner cursor-crosshair">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                {/* Linha de escaneamento visual falso */}
                <div className="absolute top-0 left-0 w-full h-1 bg-orange-500/20 shadow-[0_0_20px_#f97316] animate-[scan_3s_linear_infinite] pointer-events-none"></div>

                {generators.map((gen) => {
                  const isSelected = selectedGenerators.includes(gen.id);
                  return (
                    <div
                      key={gen.id}
                      onClick={() => handleGeneratorClick(gen.id)}
                      className={`absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-sm cursor-pointer transition-all duration-200
                        ${isSelected ? 'bg-orange-500 scale-125 shadow-[0_0_15px_#f97316] rotate-45' : 'bg-slate-600 hover:bg-slate-400 border border-slate-900'}
                        ${energyStable && (closestPair?.[0].id === gen.id || closestPair?.[1].id === gen.id) ? 'bg-emerald-500 shadow-[0_0_20px_#10b981] rotate-0' : ''}`}
                      style={{ left: `${gen.x}%`, top: `${gen.y}%` }}
                    >
                      {/* Detalhe interno do gerador */}
                      <div className="w-2 h-2 bg-slate-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-sm pointer-events-none"></div>
                    </div>
                  );
                })}
                {energyStable && closestPair && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <line x1={`${closestPair[0].x}%`} y1={`${closestPair[0].y}%`} x2={`${closestPair[1].x}%`} y2={`${closestPair[1].y}%`} stroke="#10b981" strokeWidth="2" strokeDasharray="5,5" className="drop-shadow-[0_0_5px_#10b981] animate-pulse" />
                  </svg>
                )}
                {energyStable && (
                   <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-[2px] z-20">
                     <span className="text-xl font-black text-emerald-500 tracking-widest border border-emerald-500 px-6 py-2 rounded bg-slate-950 transform rotate-[-5deg] shadow-[0_0_20px_#10b981]">REDE ISOLADA</span>
                   </div>
                )}
              </div>
            </section>
          </main>
        </div>

        {/* FOOTER: Painel de Chaves Falsas (DECORATIVO) */}
        <footer className="mt-6 border-t-2 border-slate-800 pt-6 flex flex-wrap justify-center gap-4">
          {['SYS_OVERRIDE', 'COOLING_PUMP', 'VALVE_CONTROL', 'AUX_POWER', 'BPM_BYPASS'].map((btn, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-4 rounded-full bg-slate-950 border border-slate-700 relative p-0.5 cursor-not-allowed`}>
                <div className={`w-3 h-3 rounded-full ${i % 2 === 0 ? 'bg-orange-500/50 ml-0' : 'bg-emerald-500/50 ml-auto'}`}></div>
              </div>
              <span className="text-[8px] font-mono text-slate-500">{btn}</span>
            </div>
          ))}
        </footer>

      </div>

      {/* TELA DE VITÓRIA GERAL */}
      {gameWon && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-in fade-in duration-500">
          <h2 className="text-7xl font-black text-emerald-500 mb-4 drop-shadow-[0_0_30px_#10b981] text-center">OPERAÇÃO<br/>CONCLUÍDA</h2>
          <div className="bg-slate-900 border border-emerald-500/30 p-6 rounded text-center mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <p className="text-slate-400 font-mono text-sm uppercase tracking-widest mb-2">Relatório de Eficiência</p>
            <p className="text-xl text-slate-200 font-mono">
              Fábrica salva na dificuldade <span className="text-orange-500 font-black uppercase">{LEVELS[difficulty].label}</span>
            </p>
            <p className="text-sm text-slate-500 mt-2 font-mono">Restaram {formatTime(timeLeft)} no contador de colapso.</p>
          </div>
          <button onClick={() => handleRestartAll()} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-lg uppercase tracking-widest font-bold rounded shadow-[0_0_20px_#10b981] transition-all cursor-pointer">
            [ Iniciar Novo Turno ]
          </button>
        </div>
      )}

      {/* TELA DE GAME OVER */}
      {gameOver && (
        <div className="fixed inset-0 bg-red-950/95 backdrop-blur-lg z-50 flex flex-col items-center justify-center animate-in fade-in duration-700">
          <div className="absolute inset-0 bg-gradient-to-t from-orange-600/40 to-transparent pointer-events-none mix-blend-color-dodge animate-pulse"></div>
          
          <h2 className="text-6xl md:text-8xl font-black text-red-500 mb-2 drop-shadow-[0_0_50px_#ef4444] tracking-tighter text-center leading-none">
            FÁBRICA<br/>COMPROMETIDA
          </h2>
          <p className="text-xl text-red-200 font-mono mb-12 opacity-90 uppercase tracking-widest bg-black/50 px-6 py-2 rounded mt-6">
            Falha crítica nos sistemas de contenção.
          </p>
          <button onClick={() => handleRestartAll()} className="px-8 py-4 bg-red-700 hover:bg-red-600 text-white text-lg font-bold rounded shadow-[0_0_30px_#b91c1c] transition-all cursor-pointer relative z-10 border border-red-400/50 hover:scale-105 tracking-widest uppercase">
            ⚠ REINICIAR PROTOCOLOS ⚠
          </button>
        </div>
      )}

      {/* Animação do Scanner (adicionado via tag style para não precisar mexer no tailwind.config) */}
      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; opacity: 0; }
          51% { top: 0; opacity: 0; }
          100% { top: 0; opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default App;