import { FruitType } from './types';

export const FRUIT_DATA: Record<FruitType, { emoji: string; color: string; label: string }> = {
  apple: { emoji: '🍎', color: '#ef4444', label: 'Apple' },
  banana: { emoji: '🍌', color: '#facc15', label: 'Banana' },
  cherry: { emoji: '🍒', color: '#dc2626', label: 'Cherry' },
  grape: { emoji: '🍇', color: '#8b5cf6', label: 'Grape' },
  orange: { emoji: '🍊', color: '#f97316', label: 'Orange' },
  pear: { emoji: '🍐', color: '#84cc16', label: 'Pear' },
  strawberry: { emoji: '🍓', color: '#f43f5e', label: 'Strawberry' },
  watermelon: { emoji: '🍉', color: '#10b981', label: 'Watermelon' },
};

export const GRID_WIDTH = 5;
export const GRID_HEIGHT = 8;
export const WIN_THRESHOLD = 0; // Clear all
export const LOSE_THRESHOLD = 7; // Height limit
