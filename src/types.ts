export enum Direction {
  Up,
  Down,
  Left,
  Right,
}

export interface Position {
  x: number;
  y: number;
}

export interface Ghost extends Position {
  direction: Direction;
}

export interface GameState {
  pacman: Position;
  ghosts: Ghost[];
  direction: Direction;
  score: number;
  pellets: Position[];
  powerPellets: Position[];
  walls: Position[];
  gameOver: boolean;
  powerMode: boolean;
  powerModeTimer: number | null;
}

export const BOARD_SIZE = 28;
export const PACMAN_SPEED = 150;
export const GHOST_SPEED = 200;
export const POWER_MODE_DURATION = 10000; // 10 seconds