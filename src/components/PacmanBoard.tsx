import React from 'react';
import { GameState, Direction, Position, BOARD_SIZE } from '../types';

interface PacmanBoardProps {
  gameState: GameState;
}

const PacmanBoard: React.FC<PacmanBoardProps> = ({ gameState }) => {
  const { pacman, ghosts, direction, walls, pellets, powerPellets, powerMode } = gameState;

  const getPacmanRotation = () => {
    switch (direction) {
      case Direction.Up:
        return 'rotate-270';
      case Direction.Down:
        return 'rotate-90';
      case Direction.Left:
        return 'rotate-180';
      case Direction.Right:
      default:
        return '';
    }
  };

  const renderCell = (position: Position) => {
    if (position.x === pacman.x && position.y === pacman.y) {
      return (
        <div
          className={`w-full h-full rounded-full bg-yellow-400 flex items-center justify-center ${getPacmanRotation()}`}
        >
          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[12px] border-l-black border-b-[6px] border-b-transparent"></div>
        </div>
      );
    }

    const ghost = ghosts.find((g) => g.x === position.x && g.y === position.y);
    if (ghost) {
      return (
        <div className={`w-full h-full ${powerMode ? 'text-blue-300' : 'text-red-500'}`}>
          &#9781;
        </div>
      );
    }

    if (walls.some((wall) => wall.x === position.x && wall.y === position.y)) {
      return <div className="w-full h-full bg-blue-500"></div>;
    }

    if (pellets.some((pellet) => pellet.x === position.x && pellet.y === position.y)) {
      return <div className="w-1 h-1 bg-yellow-200 rounded-full mx-auto my-auto"></div>;
    }

    if (powerPellets.some((pellet) => pellet.x === position.x && pellet.y === position.y)) {
      return <div className="w-3 h-3 bg-yellow-200 rounded-full mx-auto my-auto animate-pulse"></div>;
    }

    return null;
  };

  return (
    <div
      className="grid gap-0"
      style={{
        gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, index) => {
        const x = index % BOARD_SIZE;
        const y = Math.floor(index / BOARD_SIZE);

        return (
          <div key={index} className="w-4 h-4 bg-black flex items-center justify-center">
            {renderCell({ x, y })}
          </div>
        );
      })}
    </div>
  );
};

export default PacmanBoard;