import { motion } from "motion/react";
import { PIECE_SYMBOLS, getPieceColor } from "../utils/chessLogic";
import type { Board } from "../utils/chessLogic";

interface ChessBoardProps {
  board: Board;
  selectedSquare: [number, number] | null;
  validMoves: [number, number][];
  lastMove: { from: [number, number]; to: [number, number] } | null;
  checkSquare: [number, number] | null;
  currentTurn: "w" | "b";
  isGameOver: boolean;
  onSquareClick: (row: number, col: number) => void;
}

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

// Precomputed stable position keys — no index params used at render time
const BOARD_SQUARES = Array.from({ length: 64 }, (_, idx) => ({
  row: Math.floor(idx / 8),
  col: idx % 8,
  key: `r${Math.floor(idx / 8)}c${idx % 8}`,
}));

function getSquareColor(row: number, col: number): string {
  return (row + col) % 2 === 0
    ? "bg-[oklch(0.91_0.07_80)]"
    : "bg-[oklch(0.52_0.09_55)]";
}

export default function ChessBoard({
  board,
  selectedSquare,
  validMoves,
  lastMove,
  checkSquare,
  currentTurn,
  isGameOver,
  onSquareClick,
}: ChessBoardProps) {
  function isSelected(row: number, col: number) {
    return selectedSquare?.[0] === row && selectedSquare?.[1] === col;
  }
  function isValidMove(row: number, col: number) {
    return validMoves.some(([r, c]) => r === row && c === col);
  }
  function isLastMove(row: number, col: number) {
    if (!lastMove) return false;
    return (
      (lastMove.from[0] === row && lastMove.from[1] === col) ||
      (lastMove.to[0] === row && lastMove.to[1] === col)
    );
  }
  function isCheckSquare(row: number, col: number) {
    return checkSquare?.[0] === row && checkSquare?.[1] === col;
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className="shadow-board rounded-sm overflow-hidden"
        style={{ border: "3px solid oklch(0.35 0.06 40)" }}
      >
        <div className="flex">
          {/* Rank labels */}
          <div className="flex flex-col">
            {RANKS.map((rank) => (
              <div
                key={rank}
                className="w-5 flex items-center justify-center font-body"
                style={{
                  height: "clamp(44px, 8vw, 70px)",
                  color: "oklch(0.65 0.08 60)",
                  fontSize: "clamp(9px, 1.2vw, 13px)",
                }}
              >
                {rank}
              </div>
            ))}
          </div>
          {/* Board grid — uses precomputed BOARD_SQUARES with stable string keys */}
          <div>
            <div className="grid grid-cols-8">
              {BOARD_SQUARES.map(({ row, col, key }) => {
                const piece = board[row][col];
                const selected = isSelected(row, col);
                const valid = isValidMove(row, col);
                const lastMoveHl = isLastMove(row, col);
                const checkHl = isCheckSquare(row, col);
                const isOccupied = piece !== null;
                const isClickable =
                  !isGameOver &&
                  (isOccupied
                    ? getPieceColor(piece) === currentTurn || valid
                    : valid);

                return (
                  <motion.div
                    key={key}
                    data-ocid={`board.item.${row * 8 + col + 1}`}
                    whileHover={isClickable ? { scale: 1.02 } : {}}
                    className={[
                      getSquareColor(row, col),
                      "relative flex items-center justify-center select-none",
                      isClickable ? "cursor-pointer" : "cursor-default",
                    ].join(" ")}
                    style={{
                      width: "clamp(44px, 8vw, 70px)",
                      height: "clamp(44px, 8vw, 70px)",
                    }}
                    onClick={() => onSquareClick(row, col)}
                  >
                    {/* Last move highlight */}
                    {lastMoveHl && !selected && (
                      <div
                        className="absolute inset-0"
                        style={{ background: "oklch(0.80 0.14 85 / 0.35)" }}
                      />
                    )}
                    {/* Check highlight */}
                    {checkHl && (
                      <div
                        className="absolute inset-0 animate-pulse-check"
                        style={{
                          background:
                            "radial-gradient(circle at center, oklch(0.58 0.22 25 / 0.9) 0%, oklch(0.58 0.22 25 / 0.3) 70%, transparent 100%)",
                        }}
                      />
                    )}
                    {/* Selected highlight */}
                    {selected && (
                      <div
                        className="absolute inset-0"
                        style={{ background: "oklch(0.75 0.18 130 / 0.55)" }}
                      />
                    )}
                    {/* Valid move dot */}
                    {valid && !isOccupied && (
                      <div
                        className="absolute rounded-full z-10"
                        style={{
                          width: "32%",
                          height: "32%",
                          background: "oklch(0.18 0.02 35 / 0.35)",
                        }}
                      />
                    )}
                    {/* Capture ring */}
                    {valid && isOccupied && (
                      <div
                        className="absolute inset-0 z-10"
                        style={{
                          boxShadow:
                            "inset 0 0 0 4px oklch(0.18 0.02 35 / 0.45)",
                        }}
                      />
                    )}
                    {/* Piece */}
                    {piece && (
                      <motion.span
                        key={`piece-${key}`}
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.15 }}
                        className="relative z-20 leading-none pointer-events-none"
                        style={{
                          fontSize: "clamp(28px, 5.2vw, 48px)",
                          filter:
                            getPieceColor(piece) === "w"
                              ? "drop-shadow(0 1px 2px rgba(0,0,0,0.55))"
                              : "drop-shadow(0 1px 2px rgba(0,0,0,0.8))",
                          color:
                            getPieceColor(piece) === "w"
                              ? "oklch(0.97 0.02 80)"
                              : "oklch(0.08 0.01 30)",
                        }}
                      >
                        {PIECE_SYMBOLS[piece]}
                      </motion.span>
                    )}
                  </motion.div>
                );
              })}
            </div>
            {/* File labels */}
            <div className="flex">
              {FILES.map((file) => (
                <div
                  key={file}
                  className="flex items-center justify-center font-body"
                  style={{
                    width: "clamp(44px, 8vw, 70px)",
                    height: "20px",
                    color: "oklch(0.65 0.08 60)",
                    fontSize: "clamp(9px, 1.2vw, 13px)",
                  }}
                >
                  {file}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
