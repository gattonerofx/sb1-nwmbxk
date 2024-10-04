import { Position, Direction, Ghost, GameState, BOARD_SIZE } from '../types';

export const isValidMove = (position: Position, walls: Position[]): boolean => {
  return (
    position.x >= 0 &&
    position.x < BOARD_SIZE &&
    position.y >= 0 &&
    position.y < BOARD_SIZE &&
    !walls.some((wall) => wall.x === position.x && wall.y === position.y)
  );
};

export const moveCharacter = (position: Position, direction: Direction, walls: Position[]): Position => {
  const newPosition = { ...position };
  switch (direction) {
    case Direction.Up:
      newPosition.y = (newPosition.y - 1 + BOARD_SIZE) % BOARD_SIZE;
      break;
    case Direction.Down:
      newPosition.y = (newPosition.y + 1) % BOARD_SIZE;
      break;
    case Direction.Left:
      newPosition.x = (newPosition.x - 1 + BOARD_SIZE) % BOARD_SIZE;
      break;
    case Direction.Right:
      newPosition.x = (newPosition.x + 1) % BOARD_SIZE;
      break;
  }
  return isValidMove(newPosition, walls) ? newPosition : position;
};

export const getRandomDirection = (): Direction => {
  return Math.floor(Math.random() * 4);
};

export const moveGhost = (ghost: Ghost, walls: Position[]): Ghost => {
  const newGhost = { ...ghost };
  const newPosition = moveCharacter(ghost, ghost.direction, walls);
  
  if (newPosition.x === ghost.x && newPosition.y === ghost.y) {
    // Ghost is blocked, choose a new random direction
    newGhost.direction = getRandomDirection();
  } else {
    newGhost.x = newPosition.x;
    newGhost.y = newPosition.y;
  }
  
  return newGhost;
};

export const checkCollision = (pacman: Position, ghosts: Ghost[]): boolean => {
  return ghosts.some((ghost) => ghost.x === pacman.x && ghost.y === pacman.y);
};

export const eatPellet = (pacman: Position, pellets: Position[]): [Position[], number] => {
  const pelletIndex = pellets.findIndex((pellet) => pellet.x === pacman.x && pellet.y === pacman.y);
  if (pelletIndex !== -1) {
    const newPellets = [...pellets.slice(0, pelletIndex), ...pellets.slice(pelletIndex + 1)];
    return [newPellets, 10];
  }
  return [pellets, 0];
};

export const eatPowerPellet = (pacman: Position, powerPellets: Position[]): [Position[], boolean] => {
  const pelletIndex = powerPellets.findIndex((pellet) => pellet.x === pacman.x && pellet.y === pacman.y);
  if (pelletIndex !== -1) {
    const newPowerPellets = [...powerPellets.slice(0, pelletIndex), ...powerPellets.slice(pelletIndex + 1)];
    return [newPowerPellets, true];
  }
  return [powerPellets, false];
};

export const generateMaze = (): Position[] => {
  const walls: Position[] = [];

  // Generate a more maze-like structure
  const mazePattern = [
    "XXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "X............XX............X",
    "X.XXXX.XXXXX.XX.XXXXX.XXXX.X",
    "XoXXXX.XXXXX.XX.XXXXX.XXXXoX",
    "X.XXXX.XXXXX.XX.XXXXX.XXXX.X",
    "X..........................X",
    "X.XXXX.XX.XXXXXXXX.XX.XXXX.X",
    "X.XXXX.XX.XXXXXXXX.XX.XXXX.X",
    "X......XX....XX....XX......X",
    "XXXXXX.XXXXX XX XXXXX.XXXXXX",
    "XXXXXX.XXXXX XX XXXXX.XXXXXX",
    "XXXXXX.XX          XX.XXXXXX",
    "XXXXXX.XX XXXXXXXX XX.XXXXXX",
    "XXXXXX.XX X      X XX.XXXXXX",
    "      .   X      X   .      ",
    "XXXXXX.XX X      X XX.XXXXXX",
    "XXXXXX.XX XXXXXXXX XX.XXXXXX",
    "XXXXXX.XX          XX.XXXXXX",
    "XXXXXX.XX XXXXXXXX XX.XXXXXX",
    "XXXXXX.XX XXXXXXXX XX.XXXXXX",
    "X............XX............X",
    "X.XXXX.XXXXX.XX.XXXXX.XXXX.X",
    "X.XXXX.XXXXX.XX.XXXXX.XXXX.X",
    "Xo..XX.......  .......XX..oX",
    "XXX.XX.XX.XXXXXXXX.XX.XX.XXX",
    "XXX.XX.XX.XXXXXXXX.XX.XX.XXX",
    "X......XX....XX....XX......X",
    "X.XXXXXXXXXX.XX.XXXXXXXXXX.X",
    "X.XXXXXXXXXX.XX.XXXXXXXXXX.X",
    "X..........................X",
    "XXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  ];

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (mazePattern[y][x] === 'X') {
        walls.push({ x, y });
      }
    }
  }

  return walls;
};

export const generatePellets = (walls: Position[]): Position[] => {
  const pellets: Position[] = [];
  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      if (!walls.some((wall) => wall.x === x && wall.y === y)) {
        pellets.push({ x, y });
      }
    }
  }
  return pellets;
};

export const generatePowerPellets = (walls: Position[], pellets: Position[]): Position[] => {
  const powerPellets: Position[] = [];
  const powerPelletPositions = [
    { x: 1, y: 3 },
    { x: BOARD_SIZE - 2, y: 3 },
    { x: 1, y: BOARD_SIZE - 5 },
    { x: BOARD_SIZE - 2, y: BOARD_SIZE - 5 },
  ];

  powerPelletPositions.forEach((position) => {
    if (!walls.some((wall) => wall.x === position.x && wall.y === position.y)) {
      powerPellets.push(position);
      // Remove the regular pellet at this position
      const index = pellets.findIndex((pellet) => pellet.x === position.x && pellet.y === position.y);
      if (index !== -1) {
        pellets.splice(index, 1);
      }
    }
  });

  return powerPellets;
};

export const initializeGame = (): GameState => {
  const walls = generateMaze();
  const pellets = generatePellets(walls);
  const powerPellets = generatePowerPellets(walls, pellets);

  return {
    pacman: { x: 13, y: 23 },
    ghosts: [
      { x: 11, y: 13, direction: Direction.Left },
      { x: 12, y: 13, direction: Direction.Left },
      { x: 15, y: 13, direction: Direction.Right },
      { x: 16, y: 13, direction: Direction.Right },
    ],
    direction: Direction.Left,
    score: 0,
    pellets,
    powerPellets,
    walls,
    gameOver: false,
    powerMode: false,
    powerModeTimer: null,
  };
};