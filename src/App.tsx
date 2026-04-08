/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FruitType, Fruit } from './types';
import { FRUIT_DATA, GRID_WIDTH, GRID_HEIGHT, LOSE_THRESHOLD } from './constants';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Play, Pause, AlertCircle } from 'lucide-react';

const INITIAL_LEVEL_FRUITS = 20;

export default function App() {
  const [board, setBoard] = useState<Fruit[][]>(Array.from({ length: GRID_WIDTH }, () => []));
  const [topFruits, setTopFruits] = useState<FruitType[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [remainingToSpawn, setRemainingToSpawn] = useState(INITIAL_LEVEL_FRUITS);
  const [status, setStatus] = useState<'playing' | 'level-completed' | 'game-over' | 'paused' | 'start'>('start');
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize level
  const initLevel = useCallback((lvl: number) => {
    setBoard(Array.from({ length: GRID_WIDTH }, () => []));
    setScore(0);
    setLevel(lvl);
    setRemainingToSpawn(INITIAL_LEVEL_FRUITS + (lvl - 1) * 10);
    setStatus('playing');
    setIsProcessing(false);
    
    // Generate initial top row
    const types = Object.keys(FRUIT_DATA) as FruitType[];
    setTopFruits(Array.from({ length: GRID_WIDTH }, () => types[Math.floor(Math.random() * types.length)]));
  }, []);

  useEffect(() => {
    if (status === 'start') {
      // Just waiting for user to click start
    }
  }, [status]);

  const dropFruit = async (colIndex: number) => {
    if (status !== 'playing' || isProcessing || board[colIndex].length >= LOSE_THRESHOLD) return;

    setIsProcessing(true);
    const fruitType = topFruits[colIndex];
    const newId = Math.random().toString(36).substr(2, 9);
    
    // Update top row
    const types = Object.keys(FRUIT_DATA) as FruitType[];
    const nextType = types[Math.floor(Math.random() * types.length)];
    const newTopFruits = [...topFruits];
    newTopFruits[colIndex] = nextType;
    setTopFruits(newTopFruits);
    setRemainingToSpawn(prev => Math.max(0, prev - 1));

    const newFruit: Fruit = {
      id: newId,
      type: fruitType,
      x: colIndex,
      y: board[colIndex].length,
      status: 'falling'
    };

    // Check for match
    const lastFruit = board[colIndex][board[colIndex].length - 1];
    
    if (lastFruit && lastFruit.type === fruitType) {
      // Match!
      setBoard(prev => {
        const next = [...prev];
        next[colIndex] = [...next[colIndex], { ...newFruit, status: 'clearing' }];
        return next;
      });

      // Wait for "falling" animation then clear
      setTimeout(() => {
        setBoard(prev => {
          const next = [...prev];
          const col = [...next[colIndex]];
          col.pop(); // Remove the "clearing" one
          col.pop(); // Remove the matched one
          next[colIndex] = col;
          return next;
        });
        setScore(s => s + 20 * level);
        setIsProcessing(false);
      }, 300);
    } else {
      // No match, just add
      setBoard(prev => {
        const next = [...prev];
        next[colIndex] = [...next[colIndex], { ...newFruit, status: 'stable' }];
        return next;
      });
      
      // Check for game over
      if (board[colIndex].length + 1 >= LOSE_THRESHOLD) {
        setTimeout(() => setStatus('game-over'), 500);
      }
      
      setIsProcessing(false);
    }
  };

  // Check for win condition
  useEffect(() => {
    if (status === 'playing' && remainingToSpawn === 0) {
      const totalOnBoard = board.reduce((sum, col) => sum + col.length, 0);
      if (totalOnBoard === 0) {
        setStatus('level-completed');
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  }, [board, remainingToSpawn, status]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-white">
      {/* Game Container (9:16 Aspect Ratio) */}
      <div className="relative w-full max-w-[400px] aspect-[9/16] bg-gradient-to-b from-indigo-600 to-purple-800 rounded-3xl shadow-2xl overflow-hidden border-8 border-slate-800">
        
        {/* Background Clouds/Atmosphere */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        {/* HUD */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20">
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <div className="text-[10px] uppercase tracking-widest text-indigo-200 font-bold">Score</div>
            <div className="text-2xl font-black tabular-nums">{score}</div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-right">
              <div className="text-[10px] uppercase tracking-widest text-indigo-200 font-bold">Level {level}</div>
              <div className="text-xl font-black">{remainingToSpawn} <span className="text-xs opacity-50">left</span></div>
            </div>
            
            {/* "Remaining" badge like screenshot */}
            <div className="bg-orange-500/90 px-3 py-1 rounded-lg border-2 border-orange-200 shadow-lg transform -rotate-3">
              <div className="text-[8px] uppercase font-black text-orange-950 leading-none">Remaining</div>
              <div className="text-sm font-black text-white leading-tight">{remainingToSpawn}</div>
            </div>
          </div>
        </div>

        {/* Top Spawn Area */}
        <div className="absolute top-24 left-0 right-0 px-4 grid grid-cols-5 gap-2 z-10">
          {topFruits.map((type, i) => (
            <button
              key={i}
              onClick={() => dropFruit(i)}
              disabled={isProcessing || status !== 'playing'}
              className="aspect-square bg-white/10 hover:bg-white/20 active:scale-95 transition-all rounded-xl flex items-center justify-center text-3xl shadow-inner border border-white/5 disabled:opacity-50"
            >
              <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                key={type}
              >
                {FRUIT_DATA[type].emoji}
              </motion.span>
            </button>
          ))}
        </div>

        {/* Game Board / Bin Area */}
        <div className="absolute bottom-0 left-0 right-0 h-[65%] px-4 pb-8 flex flex-col justify-end">
          {/* The Funnel Shape */}
          <div className="relative w-full h-full bg-black/20 rounded-t-[40px] border-t-4 border-white/10 overflow-hidden">
            
            {/* Slanted Sides (Visual Only) */}
            <div className="absolute inset-0 pointer-events-none z-20">
              <div className="absolute left-0 bottom-0 top-0 w-8 bg-gradient-to-r from-slate-800/80 to-transparent skew-x-[15deg] origin-bottom -translate-x-4" />
              <div className="absolute right-0 bottom-0 top-0 w-8 bg-gradient-to-l from-slate-800/80 to-transparent -skew-x-[15deg] origin-bottom translate-x-4" />
            </div>

            {/* Height Limit Line */}
            <div 
              className="absolute w-full border-t-2 border-dashed border-red-500/50 z-0"
              style={{ bottom: `${(LOSE_THRESHOLD / GRID_HEIGHT) * 100}%` }}
            >
              <div className="absolute right-2 -top-5 text-[10px] font-bold text-red-400 uppercase">Limit</div>
            </div>

            <div className="grid grid-cols-5 h-full relative">
              {board.map((column, colIndex) => (
                <div key={colIndex} className="relative h-full border-r border-white/5 last:border-r-0">
                  <AnimatePresence>
                    {column.map((fruit, rowIndex) => (
                      <motion.div
                        key={fruit.id}
                        initial={fruit.status === 'falling' ? { y: -400, opacity: 0 } : { scale: 0 }}
                        animate={{ 
                          y: 0, 
                          opacity: 1, 
                          scale: fruit.status === 'clearing' ? [1, 1.5, 0] : 1 
                        }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ 
                          type: fruit.status === 'falling' ? 'spring' : 'tween',
                          stiffness: 300,
                          damping: 20
                        }}
                        className="absolute w-full aspect-square flex items-center justify-center text-3xl z-10"
                        style={{ 
                          bottom: `${(rowIndex / GRID_HEIGHT) * 100}%`,
                        }}
                      >
                        <div className="relative">
                          {fruit.status === 'clearing' && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 2, opacity: 0 }}
                              className="absolute inset-0 bg-white rounded-full blur-md"
                            />
                          )}
                          {FRUIT_DATA[fruit.type].emoji}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Overlays */}
        <AnimatePresence>
          {status === 'start' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="mb-8"
              >
                <div className="text-6xl mb-4">🍎🍌🍒</div>
                <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent uppercase italic">
                  Fruit Drop Blast
                </h1>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Tap to drop fruits. Match two of the same kind to clear them. Don't let the bin overflow!
                </p>
              </motion.div>
              <button
                onClick={() => initLevel(1)}
                className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-2xl font-bold text-xl flex items-center gap-3 shadow-lg shadow-indigo-500/20"
              >
                <Play className="fill-current" />
                Start Game
              </button>
            </motion.div>
          )}

          {status === 'game-over' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-50 bg-red-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
            >
              <AlertCircle size={64} className="text-red-500 mb-4" />
              <h2 className="text-4xl font-black mb-2 uppercase italic">Game Over</h2>
              <p className="text-red-200/60 mb-8">The bin overflowed! Try again?</p>
              <div className="flex flex-col gap-4 w-full">
                <div className="bg-white/10 rounded-2xl p-4 mb-4">
                  <div className="text-xs uppercase font-bold opacity-50">Final Score</div>
                  <div className="text-3xl font-black">{score}</div>
                </div>
                <button
                  onClick={() => initLevel(1)}
                  className="px-8 py-4 bg-white text-red-900 rounded-2xl font-bold text-xl flex items-center justify-center gap-3"
                >
                  <RotateCcw />
                  Restart
                </button>
              </div>
            </motion.div>
          )}

          {status === 'level-completed' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-50 bg-indigo-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
            >
              <Trophy size={64} className="text-yellow-400 mb-4 animate-bounce" />
              <h2 className="text-4xl font-black mb-2 uppercase italic">Level Clear!</h2>
              <p className="text-indigo-200/60 mb-8">Amazing job! Ready for more?</p>
              <div className="bg-white/10 rounded-2xl p-6 mb-8 w-full">
                <div className="flex justify-between items-center mb-2">
                  <span className="opacity-50">Score</span>
                  <span className="font-bold">{score}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="opacity-50">Level</span>
                  <span className="font-bold">{level}</span>
                </div>
              </div>
              <button
                onClick={() => initLevel(level + 1)}
                className="w-full px-8 py-4 bg-yellow-400 text-indigo-950 rounded-2xl font-bold text-xl flex items-center justify-center gap-3"
              >
                Next Level
                <Play className="fill-current" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pause Button */}
        {status === 'playing' && (
          <button 
            onClick={() => setStatus('paused')}
            className="absolute bottom-6 left-6 p-3 bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-md border border-white/10 z-30"
          >
            <Pause size={20} />
          </button>
        )}

        {status === 'paused' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center p-8"
          >
            <h2 className="text-3xl font-black mb-8 uppercase italic">Paused</h2>
            <div className="flex flex-col gap-4 w-full max-w-[200px]">
              <button
                onClick={() => setStatus('playing')}
                className="px-6 py-3 bg-indigo-600 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Play size={18} /> Resume
              </button>
              <button
                onClick={() => initLevel(1)}
                className="px-6 py-3 bg-white/10 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} /> Restart
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
