import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Crown, RotateCcw, Swords } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { GameState } from "../utils/chessLogic";

interface GameSidebarProps {
  gameState: GameState;
  capturedByWhite: string[];
  capturedByBlack: string[];
  onNewGame: () => void;
}

const PIECE_SYMBOLS: Record<string, string> = {
  wK: "♔",
  wQ: "♕",
  wR: "♖",
  wB: "♗",
  wN: "♘",
  wP: "♙",
  bK: "♚",
  bQ: "♛",
  bR: "♜",
  bB: "♝",
  bN: "♞",
  bP: "♟",
};

// Build stable keys for captured pieces using reduce (no index param)
function toCaptureItems(pieces: string[], prefix: string) {
  return pieces.reduce<Array<{ piece: string; uid: string }>>((acc, piece) => {
    acc.push({ piece, uid: `${prefix}-${piece}-${acc.length}` });
    return acc;
  }, []);
}

// Build move pair items with stable keys using explicit for-loop
function toMovePairItems(history: string[]) {
  const items: Array<{
    white: string;
    black: string | null;
    moveNum: number;
    key: string;
  }> = [];
  for (let step = 0; step < history.length; step += 2) {
    const moveNum = step / 2 + 1;
    items.push({
      white: history[step],
      black: history[step + 1] ?? null,
      moveNum,
      key: `move-${moveNum}`,
    });
  }
  return items;
}

function StatusBadge({
  status,
  turn,
}: { status: GameState["status"]; turn: "w" | "b" }) {
  if (status === "checkmate") {
    const winner = turn === "w" ? "Black" : "White";
    return (
      <Badge
        className="text-sm px-3 py-1 animate-pulse-check"
        style={{
          background: "oklch(0.58 0.22 25)",
          color: "oklch(0.97 0.01 80)",
          border: "none",
        }}
      >
        <Crown className="w-4 h-4 mr-1" /> {winner} wins!
      </Badge>
    );
  }
  if (status === "stalemate") {
    return (
      <Badge
        className="text-sm px-3 py-1"
        style={{
          background: "oklch(0.50 0.10 240)",
          color: "oklch(0.97 0.01 80)",
          border: "none",
        }}
      >
        <Swords className="w-4 h-4 mr-1" /> Stalemate
      </Badge>
    );
  }
  if (status === "check") {
    return (
      <Badge
        className="text-sm px-3 py-1 animate-pulse-check"
        style={{
          background: "oklch(0.58 0.22 25)",
          color: "oklch(0.97 0.01 80)",
          border: "none",
        }}
      >
        Check!
      </Badge>
    );
  }
  const turnLabel = turn === "w" ? "White" : "Black";
  const turnSymbol = turn === "w" ? "♔" : "♚";
  return (
    <Badge
      className="text-sm px-3 py-1"
      style={{
        background:
          turn === "w" ? "oklch(0.92 0.04 80)" : "oklch(0.15 0.02 30)",
        color: turn === "w" ? "oklch(0.12 0.02 35)" : "oklch(0.93 0.02 75)",
        border: `1px solid oklch(${turn === "w" ? "0.72 0.08 70" : "0.35 0.05 35"})`,
      }}
    >
      {turnSymbol} {turnLabel}'s turn
    </Badge>
  );
}

function CapturedPieces({
  pieces,
  prefix,
}: { pieces: string[]; prefix: string }) {
  const items = toCaptureItems(pieces, prefix);
  if (items.length === 0) {
    return (
      <span className="text-xs" style={{ color: "oklch(0.40 0.03 50)" }}>
        —
      </span>
    );
  }
  return (
    <>
      {items.map(({ piece, uid }) => (
        <span
          key={uid}
          className="leading-none"
          style={{
            fontSize: "16px",
            color:
              piece[0] === "w" ? "oklch(0.92 0.03 80)" : "oklch(0.10 0.01 30)",
            filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.5))",
          }}
        >
          {PIECE_SYMBOLS[piece]}
        </span>
      ))}
    </>
  );
}

export default function GameSidebar({
  gameState,
  capturedByWhite,
  capturedByBlack,
  onNewGame,
}: GameSidebarProps) {
  const movePairItems = toMovePairItems(gameState.moveHistory);

  return (
    <div
      className="flex flex-col h-full gap-4"
      style={{ minWidth: "220px", maxWidth: "280px" }}
    >
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1
          className="font-display text-2xl tracking-wide"
          style={{ color: "oklch(0.88 0.09 65)" }}
        >
          ♟ Chess
        </h1>
        <p
          className="text-xs font-body"
          style={{ color: "oklch(0.55 0.05 55)" }}
        >
          Two-player local game
        </p>
      </div>

      {/* Status */}
      <div data-ocid="game.panel">
        <StatusBadge status={gameState.status} turn={gameState.currentTurn} />
      </div>

      {/* Captured pieces */}
      <div
        className="rounded-lg p-3 flex flex-col gap-2"
        style={{ background: "oklch(0.17 0.03 32)" }}
      >
        <p
          className="text-xs uppercase tracking-widest font-body font-semibold"
          style={{ color: "oklch(0.55 0.05 55)" }}
        >
          Captured
        </p>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <span
              className="text-xs w-14 font-body"
              style={{ color: "oklch(0.70 0.06 65)" }}
            >
              White:
            </span>
            <div className="flex flex-wrap gap-0.5">
              <CapturedPieces pieces={capturedByWhite} prefix="cw" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="text-xs w-14 font-body"
              style={{ color: "oklch(0.70 0.06 65)" }}
            >
              Black:
            </span>
            <div className="flex flex-wrap gap-0.5">
              <CapturedPieces pieces={capturedByBlack} prefix="cb" />
            </div>
          </div>
        </div>
      </div>

      {/* Move History */}
      <div
        className="flex-1 rounded-lg overflow-hidden"
        style={{ background: "oklch(0.17 0.03 32)", minHeight: 0 }}
      >
        <div className="px-3 pt-3 pb-2">
          <p
            className="text-xs uppercase tracking-widest font-body font-semibold"
            style={{ color: "oklch(0.55 0.05 55)" }}
          >
            Move History
          </p>
        </div>
        <ScrollArea className="h-48 px-1">
          <div className="px-2 pb-3">
            {movePairItems.length === 0 ? (
              <p
                className="text-xs text-center py-4 font-body"
                style={{ color: "oklch(0.40 0.03 50)" }}
                data-ocid="moves.empty_state"
              >
                No moves yet
              </p>
            ) : (
              <table className="w-full text-sm font-body">
                <tbody>
                  <AnimatePresence initial={false}>
                    {movePairItems.map(({ white, black, moveNum, key }) => (
                      <motion.tr
                        key={key}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        data-ocid={`moves.item.${moveNum}`}
                        className="hover:bg-white/5 rounded"
                      >
                        <td
                          className="py-0.5 pr-2 w-6 text-right"
                          style={{ color: "oklch(0.45 0.04 50)" }}
                        >
                          {moveNum}.
                        </td>
                        <td
                          className="py-0.5 pr-2 w-16 font-mono tracking-wide"
                          style={{ color: "oklch(0.88 0.04 75)" }}
                        >
                          {white}
                        </td>
                        <td
                          className="py-0.5 font-mono tracking-wide"
                          style={{ color: "oklch(0.70 0.04 65)" }}
                        >
                          {black ?? ""}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* New Game */}
      <Button
        data-ocid="game.primary_button"
        onClick={onNewGame}
        className="w-full font-body font-semibold tracking-wide"
        style={{
          background: "oklch(0.55 0.10 55)",
          color: "oklch(0.95 0.03 80)",
          border: "none",
        }}
      >
        <RotateCcw className="w-4 h-4 mr-2" /> New Game
      </Button>

      {/* Footer */}
      <p
        className="text-xs text-center font-body"
        style={{ color: "oklch(0.38 0.03 50)" }}
      >
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "oklch(0.60 0.09 60)" }}
        >
          caffeine.ai
        </a>
      </p>
    </div>
  );
}
