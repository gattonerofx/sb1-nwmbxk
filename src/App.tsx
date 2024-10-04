import React, { useState, useEffect, useCallback, useRef } from 'react';
import PacmanBoard from './components/PacmanBoard';
import { GameState, Direction, PACMAN_SPEED, GHOST_SPEED, POWER_MODE_DURATION } from './types';
import {
  moveCharacter,
  moveGhost,
  checkCollision,
  eatPellet,
  eatPowerPellet,
  initializeGame,
} from './utils/gameUtils';

function App() {
  const [gameState, setGameState] = useState<GameState>(initializeGame());
  const [isMuted, setIsMuted] = useState(false);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const wakaSoundRef = useRef<HTMLAudioElement | null>(null);
  const powerPelletSoundRef = useRef<HTMLAudioElement | null>(null);
  const deathSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    backgroundMusicRef.current = new Audio('/sounds/pacman_beginning.mp3');
    wakaSoundRef.current = new Audio('/sounds/waka.mp3');
    powerPelletSoundRef.current = new Audio('/sounds/power_pellet.mp3');
    deathSoundRef.current = new Audio('/sounds/death.mp3');

    backgroundMusicRef.current.loop = true;
  }, []);

  const playSound = (sound: HTMLAudioElement | null) => {
    if (sound && !isMuted) {
      sound.currentTime = 0;
      sound.play();
    }
  };

  const moveCharacters = useCallback(() => {
    setGameState((prevState) => {
      if (prevState.gameOver) return prevState;

      const newPacman = moveCharacter(prevState.pacman, prevState.direction, prevState.walls);
      const [newPellets, pelletScore] = eatPellet(newPacman, prevState.pellets);
      const [newPowerPellets, powerModeActivated] = eatPowerPellet(newPacman, prevState.powerPellets);

      if (pelletScore > 0) {
        playSound(wakaSoundRef.current);
      }

      if (powerModeActivated) {
        playSound(powerPelletSoundRef.current);
      }

      const newGhosts = prevState.ghosts.map((ghost) => moveGhost(ghost, prevState.walls));

      let newScore = prevState.score + pelletScore;
      let newPowerMode = prevState.powerMode;
      let newPowerModeTimer = prevState.powerModeTimer;

      if (powerModeActivated) {
        newPowerMode = true;
        newPowerModeTimer = POWER_MODE_DURATION;
        newScore += 50;
      } else if (newPowerMode) {
        newPowerModeTimer = Math.max(0, (newPowerModeTimer || 0) - PACMAN_SPEED);
        if (newPowerModeTimer === 0) {
          newPowerMode = false;
          newPowerModeTimer = null;
        }
      }

      const collision = checkCollision(newPacman, newGhosts);
      if (collision && !newPowerMode) {
        playSound(deathSoundRef.current);
        return { ...prevState, gameOver: true };
      } else if (collision && newPowerMode) {
        newScore += 200;
        const eatenGhostIndex = newGhosts.findIndex((ghost) => ghost.x === newPacman.x && ghost.y === newPacman.y);
        newGhosts[eatenGhostIndex] = { x: 9, y: 10, direction: Direction.Right };
      }

      return {
        ...prevState,
        pacman: newPacman,
        ghosts: newGhosts,
        pellets: newPellets,
        powerPellets: newPowerPellets,
        score: newScore,
        powerMode: newPowerMode,
        powerModeTimer: newPowerModeTimer,
      };
    });
  }, [isMuted]);

  useEffect(() => {
    const pacmanIntervalId = setInterval(moveCharacters, PACMAN_SPEED);
    const ghostIntervalId = setInterval(moveCharacters, GHOST_SPEED);
    return () => {
      clearInterval(pacmanIntervalId);
      clearInterval(ghostIntervalId);
    };
  }, [moveCharacters]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          setGameState((prev) => ({ ...prev, direction: Direction.Up }));
          break;
        case 'ArrowDown':
          setGameState((prev) => ({ ...prev, direction: Direction.Down }));
          break;
        case 'ArrowLeft':
          setGameState((prev) => ({ ...prev, direction: Direction.Left }));
          break;
        case 'ArrowRight':
          setGameState((prev) => ({ ...prev, direction: Direction.Right }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const restartGame = () => {
    setGameState(initializeGame());
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.currentTime = 0;
      backgroundMusicRef.current.play();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (backgroundMusicRef.current) {
      if (isMuted) {
        backgroundMusicRef.current.play();
      } else {
        backgroundMusicRef.current.pause();
      }
    }
  };

  useEffect(() => {
    if (backgroundMusicRef.current && !isMuted) {
      backgroundMusicRef.current.play();
    }
  }, [isMuted]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-yellow-400 mb-4">Pacman</h1>
      <div className="bg-black p-4 rounded-lg border-4 border-blue-500">
        <PacmanBoard gameState={gameState} />
      </div>
      <div className="mt-4 text-white text-xl">Score: {gameState.score}</div>
      <button
        className="mt-2 bg-yellow-400 text-black font-bold py-2 px-4 rounded hover:bg-yellow-500"
        onClick={toggleMute}
      >
        {isMuted ? 'Unmute' : 'Mute'}
      </button>
      {gameState.gameOver && (
        <div className="mt-4">
          <p className="text-red-500 text-2xl font-bold">Game Over!</p>
          <button
            className="mt-2 bg-yellow-400 text-black font-bold py-2 px-4 rounded hover:bg-yellow-500"
            onClick={restartGame}
          >
            Restart Game
          </button>
        </div>
      )}
    </div>
  );
}

export default App;