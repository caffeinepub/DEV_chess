import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import ChessBoard from "./components/ChessBoard";
import GameSidebar from "./components/GameSidebar";
import {
  getInitialState,
  getLegalMoves,
  getPieceColor,
  getPieceType,
  makeMove,
} from "./utils/chessLogic";
import type { GameState } from "./utils/chessLogic";

function findKingSquare(
  board: GameState["board"],
  color: "w" | "b",
): [number, number] | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === `${color}K`) return [r, c];
    }
  }
  return null;
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>(getInitialState());
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(
    null,
  );
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [capturedByWhite, setCapturedByWhite] = useState<string[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<string[]>([]);

  const isGameOver =
    gameState.status === "checkmate" || gameState.status === "stalemate";

  const checkSquare: [number, number] | null =
    gameState.status === "check" || gameState.status === "checkmate"
      ? findKingSquare(gameState.board, gameState.currentTurn)
      : null;

  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      if (isGameOver) return;

      const piece = gameState.board[row][col];

      if (selectedSquare) {
        const isValidTarget = validMoves.some(
          ([r, c]) => r === row && c === col,
        );

        if (isValidTarget) {
          const captured = gameState.board[row][col];
          const isEnPassant =
            piece === null &&
            getPieceType(
              gameState.board[selectedSquare[0]][selectedSquare[1]],
            ) === "P" &&
            selectedSquare[1] !== col;

          if (captured) {
            const moverColor = getPieceColor(
              gameState.board[selectedSquare[0]][selectedSquare[1]],
            );
            if (moverColor === "w") {
              setCapturedByWhite((prev) => [...prev, captured]);
            } else {
              setCapturedByBlack((prev) => [...prev, captured]);
            }
          } else if (isEnPassant) {
            const moverColor = getPieceColor(
              gameState.board[selectedSquare[0]][selectedSquare[1]],
            );
            const capturedPawn = moverColor === "w" ? "bP" : "wP";
            if (moverColor === "w") {
              setCapturedByWhite((prev) => [...prev, capturedPawn]);
            } else {
              setCapturedByBlack((prev) => [...prev, capturedPawn]);
            }
          }

          const newState = makeMove(gameState, selectedSquare, [row, col]);
          setGameState(newState);
          setSelectedSquare(null);
          setValidMoves([]);
        } else if (piece && getPieceColor(piece) === gameState.currentTurn) {
          setSelectedSquare([row, col]);
          setValidMoves(getLegalMoves(gameState, row, col));
        } else {
          setSelectedSquare(null);
          setValidMoves([]);
        }
      } else {
        if (piece && getPieceColor(piece) === gameState.currentTurn) {
          setSelectedSquare([row, col]);
          setValidMoves(getLegalMoves(gameState, row, col));
        }
      }
    },
    [gameState, selectedSquare, validMoves, isGameOver],
  );

  const handleNewGame = useCallback(() => {
    setGameState(getInitialState());
    setSelectedSquare(null);
    setValidMoves([]);
    setCapturedByWhite([]);
    setCapturedByBlack([]);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "oklch(0.12 0.02 35)" }}
    >
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8 w-full max-w-5xl"
        >
          <div className="flex-1 flex justify-center">
            <ChessBoard
              board={gameState.board}
              selectedSquare={selectedSquare}
              validMoves={validMoves}
              lastMove={gameState.lastMove}
              checkSquare={checkSquare}
              currentTurn={gameState.currentTurn}
              isGameOver={isGameOver}
              onSquareClick={handleSquareClick}
            />
          </div>

          <div
            className="w-full lg:w-64 rounded-xl p-4 flex flex-col"
            style={{
              background: "oklch(0.15 0.025 32)",
              border: "1px solid oklch(0.25 0.04 35)",
              minHeight: "400px",
            }}
          >
            <GameSidebar
              gameState={gameState}
              capturedByWhite={capturedByWhite}
              capturedByBlack={capturedByBlack}
              onNewGame={handleNewGame}
            />
          </div>
        </motion.div>
      </main>

      <AnimatePresence>
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            style={{ background: "oklch(0.05 0.01 30 / 0.55)" }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="rounded-2xl p-8 flex flex-col items-center gap-4 pointer-events-auto"
              data-ocid="game.dialog"
              style={{
                background: "oklch(0.17 0.03 32)",
                border: "1px solid oklch(0.30 0.06 55)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
              }}
            >
              <span style={{ fontSize: "56px" }}>
                {gameState.status === "checkmate" ? "♛" : "🤝"}
              </span>
              <h2
                className="font-display text-3xl text-center"
                style={{ color: "oklch(0.88 0.09 65)" }}
              >
                {gameState.status === "checkmate"
                  ? `${gameState.currentTurn === "w" ? "Black" : "White"} Wins!`
                  : "Stalemate"}
              </h2>
              <p
                className="font-body text-center text-sm"
                style={{ color: "oklch(0.60 0.05 55)" }}
              >
                {gameState.status === "checkmate"
                  ? "Checkmate! Well played."
                  : "No legal moves — it's a draw."}
              </p>
              <button
                type="button"
                data-ocid="game.primary_button"
                onClick={handleNewGame}
                className="mt-2 px-6 py-2.5 rounded-lg font-body font-semibold tracking-wide transition-all hover:brightness-110 active:scale-95"
                style={{
                  background: "oklch(0.55 0.10 55)",
                  color: "oklch(0.95 0.03 80)",
                }}
              >
                Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
