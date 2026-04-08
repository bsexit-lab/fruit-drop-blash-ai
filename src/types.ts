export type FruitType = 'apple' | 'banana' | 'cherry' | 'grape' | 'orange' | 'pear' | 'strawberry' | 'watermelon';

export interface Fruit {
  id: string;
  type: FruitType;
  x: number; // column index
  y: number; // row index (from bottom)
  status: 'falling' | 'stable' | 'clearing';
}

export interface GameState {
  score: number;
  level: number;
  remainingFruits: number;
  board: Fruit[];
  nextFruits: FruitType[];
  status: 'playing' | 'level-completed' | 'game-over' | 'paused';
}
