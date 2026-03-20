export type PieceColor = "w" | "b";
export type PieceType = "K" | "Q" | "R" | "B" | "N" | "P";
export type Piece = string;
export type Board = (Piece | null)[][];

export interface CastlingRights {
  wK: boolean;
  wQ: boolean;
  bK: boolean;
  bQ: boolean;
}

export interface GameState {
  board: Board;
  currentTurn: PieceColor;
  castlingRights: CastlingRights;
  enPassantTarget: [number, number] | null;
  status: "playing" | "check" | "checkmate" | "stalemate";
  moveHistory: string[];
  lastMove: { from: [number, number]; to: [number, number] } | null;
}

export const PIECE_SYMBOLS: Record<string, string> = {
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

export function getPieceColor(piece: Piece | null): PieceColor | null {
  if (!piece) return null;
  return piece[0] as PieceColor;
}

export function getPieceType(piece: Piece | null): PieceType | null {
  if (!piece) return null;
  return piece[1] as PieceType;
}

function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function getInitialBoard(): Board {
  const b: Board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));
  b[0] = ["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"];
  b[1] = Array(8).fill("bP");
  b[6] = Array(8).fill("wP");
  b[7] = ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"];
  return b;
}

export function getInitialState(): GameState {
  return {
    board: getInitialBoard(),
    currentTurn: "w",
    castlingRights: { wK: true, wQ: true, bK: true, bQ: true },
    enPassantTarget: null,
    status: "playing",
    moveHistory: [],
    lastMove: null,
  };
}

function getPseudoLegalMoves(
  board: Board,
  row: number,
  col: number,
  enPassantTarget: [number, number] | null,
  castlingRights: CastlingRights,
): [number, number][] {
  const piece = board[row][col];
  if (!piece) return [];
  const color = getPieceColor(piece)!;
  const type = getPieceType(piece)!;
  const moves: [number, number][] = [];
  const enemy = color === "w" ? "b" : "w";

  function addIfValid(r: number, c: number): boolean {
    if (!isInBounds(r, c)) return false;
    const target = board[r][c];
    if (target && getPieceColor(target) === color) return false;
    moves.push([r, c]);
    return !target;
  }

  switch (type) {
    case "P": {
      const dir = color === "w" ? -1 : 1;
      const startRow = color === "w" ? 6 : 1;
      if (isInBounds(row + dir, col) && !board[row + dir][col]) {
        moves.push([row + dir, col]);
        if (row === startRow && !board[row + 2 * dir][col]) {
          moves.push([row + 2 * dir, col]);
        }
      }
      for (const dc of [-1, 1]) {
        const r = row + dir;
        const c = col + dc;
        if (isInBounds(r, c)) {
          const target = board[r][c];
          if (target && getPieceColor(target) === enemy) {
            moves.push([r, c]);
          } else if (
            enPassantTarget &&
            enPassantTarget[0] === r &&
            enPassantTarget[1] === c
          ) {
            moves.push([r, c]);
          }
        }
      }
      break;
    }
    case "R": {
      for (const [dr, dc] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        for (let i = 1; i < 8; i++) {
          if (!addIfValid(row + dr * i, col + dc * i)) break;
        }
      }
      break;
    }
    case "N": {
      for (const [dr, dc] of [
        [2, 1],
        [2, -1],
        [-2, 1],
        [-2, -1],
        [1, 2],
        [1, -2],
        [-1, 2],
        [-1, -2],
      ]) {
        addIfValid(row + dr, col + dc);
      }
      break;
    }
    case "B": {
      for (const [dr, dc] of [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ]) {
        for (let i = 1; i < 8; i++) {
          if (!addIfValid(row + dr * i, col + dc * i)) break;
        }
      }
      break;
    }
    case "Q": {
      for (const [dr, dc] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ]) {
        for (let i = 1; i < 8; i++) {
          if (!addIfValid(row + dr * i, col + dc * i)) break;
        }
      }
      break;
    }
    case "K": {
      for (const [dr, dc] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ]) {
        addIfValid(row + dr, col + dc);
      }
      const backRank = color === "w" ? 7 : 0;
      if (row === backRank && col === 4) {
        const ksRight = color === "w" ? castlingRights.wK : castlingRights.bK;
        if (
          ksRight &&
          !board[backRank][5] &&
          !board[backRank][6] &&
          board[backRank][7] === `${color}R`
        ) {
          moves.push([backRank, 6]);
        }
        const qsRight = color === "w" ? castlingRights.wQ : castlingRights.bQ;
        if (
          qsRight &&
          !board[backRank][3] &&
          !board[backRank][2] &&
          !board[backRank][1] &&
          board[backRank][0] === `${color}R`
        ) {
          moves.push([backRank, 2]);
        }
      }
      break;
    }
  }
  return moves;
}

function isKingInCheck(
  board: Board,
  color: PieceColor,
  enPassantTarget: [number, number] | null,
): boolean {
  let kingRow = -1;
  let kingCol = -1;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === `${color}K`) {
        kingRow = r;
        kingCol = c;
      }
    }
  }
  if (kingRow === -1) return false;

  const enemy = color === "w" ? "b" : "w";
  const noCastle: CastlingRights = {
    wK: false,
    wQ: false,
    bK: false,
    bQ: false,
  };
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] && getPieceColor(board[r][c]) === enemy) {
        const attacks = getPseudoLegalMoves(
          board,
          r,
          c,
          enPassantTarget,
          noCastle,
        );
        if (attacks.some(([ar, ac]) => ar === kingRow && ac === kingCol)) {
          return true;
        }
      }
    }
  }
  return false;
}

interface ApplyMoveResult {
  board: Board;
  newEnPassantTarget: [number, number] | null;
}

function applyMove(
  board: Board,
  from: [number, number],
  to: [number, number],
  enPassantTarget: [number, number] | null,
): ApplyMoveResult {
  const newBoard = board.map((r) => [...r]);
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;
  const piece = newBoard[fromRow][fromCol]!;
  const color = getPieceColor(piece)!;
  const type = getPieceType(piece)!;
  let newEnPassantTarget: [number, number] | null = null;

  if (
    type === "P" &&
    enPassantTarget &&
    toRow === enPassantTarget[0] &&
    toCol === enPassantTarget[1]
  ) {
    const captureRow = color === "w" ? toRow + 1 : toRow - 1;
    newBoard[captureRow][toCol] = null;
  }

  if (type === "P" && Math.abs(toRow - fromRow) === 2) {
    newEnPassantTarget = [(fromRow + toRow) / 2, fromCol];
  }

  if (type === "K" && Math.abs(toCol - fromCol) === 2) {
    if (toCol === 6) {
      newBoard[toRow][5] = newBoard[toRow][7];
      newBoard[toRow][7] = null;
    } else {
      newBoard[toRow][3] = newBoard[toRow][0];
      newBoard[toRow][0] = null;
    }
  }

  newBoard[toRow][toCol] = piece;
  newBoard[fromRow][fromCol] = null;

  if (type === "P" && (toRow === 0 || toRow === 7)) {
    newBoard[toRow][toCol] = `${color}Q`;
  }

  return { board: newBoard, newEnPassantTarget };
}

export function getLegalMoves(
  state: GameState,
  row: number,
  col: number,
): [number, number][] {
  const piece = state.board[row][col];
  if (!piece || getPieceColor(piece) !== state.currentTurn) return [];

  const pseudoMoves = getPseudoLegalMoves(
    state.board,
    row,
    col,
    state.enPassantTarget,
    state.castlingRights,
  );
  const color = getPieceColor(piece)!;
  const type = getPieceType(piece)!;
  const legalMoves: [number, number][] = [];

  for (const [toRow, toCol] of pseudoMoves) {
    if (type === "K" && Math.abs(toCol - col) === 2) {
      const backRank = color === "w" ? 7 : 0;
      const intermediate = toCol === 6 ? 5 : 3;
      if (isKingInCheck(state.board, color, state.enPassantTarget)) continue;
      const tempBoard = state.board.map((r) => [...r]);
      tempBoard[backRank][intermediate] = piece;
      tempBoard[backRank][col] = null;
      if (isKingInCheck(tempBoard, color, null)) continue;
    }

    const { board: newBoard } = applyMove(
      state.board,
      [row, col],
      [toRow, toCol],
      state.enPassantTarget,
    );
    if (!isKingInCheck(newBoard, color, null)) {
      legalMoves.push([toRow, toCol]);
    }
  }
  return legalMoves;
}

function generateNotation(
  board: Board,
  from: [number, number],
  to: [number, number],
  enPassantTarget: [number, number] | null,
): string {
  const piece = board[from[0]][from[1]]!;
  const type = getPieceType(piece)!;
  const [, fromCol] = from; // fromRow not needed
  const [toRow, toCol] = to;
  const files = "abcdefgh";
  const ranks = "87654321";
  const toSquare = `${files[toCol]}${ranks[toRow]}`;

  if (type === "K") {
    const fromCol2 = from[1];
    if (toCol - fromCol2 === 2) return "O-O";
    if (toCol - fromCol2 === -2) return "O-O-O";
  }

  const isCapture =
    board[toRow][toCol] !== null ||
    (type === "P" &&
      enPassantTarget !== null &&
      toRow === enPassantTarget[0] &&
      toCol === enPassantTarget[1]);

  if (type === "P") {
    let notation = "";
    if (isCapture) notation = `${files[fromCol]}x${toSquare}`;
    else notation = toSquare;
    if (toRow === 0 || toRow === 7) notation += "=Q";
    return notation;
  }

  const symbols: Record<string, string> = {
    K: "K",
    Q: "Q",
    R: "R",
    B: "B",
    N: "N",
  };
  return `${symbols[type]}${isCapture ? "x" : ""}${toSquare}`;
}

export function makeMove(
  state: GameState,
  from: [number, number],
  to: [number, number],
): GameState {
  const piece = state.board[from[0]][from[1]]!;
  const color = getPieceColor(piece)!;
  const type = getPieceType(piece)!;

  const notation = generateNotation(
    state.board,
    from,
    to,
    state.enPassantTarget,
  );
  const { board: newBoard, newEnPassantTarget } = applyMove(
    state.board,
    from,
    to,
    state.enPassantTarget,
  );

  const newCastlingRights = { ...state.castlingRights };
  if (type === "K") {
    if (color === "w") {
      newCastlingRights.wK = false;
      newCastlingRights.wQ = false;
    } else {
      newCastlingRights.bK = false;
      newCastlingRights.bQ = false;
    }
  }
  if (type === "R") {
    if (from[0] === 7 && from[1] === 7) newCastlingRights.wK = false;
    if (from[0] === 7 && from[1] === 0) newCastlingRights.wQ = false;
    if (from[0] === 0 && from[1] === 7) newCastlingRights.bK = false;
    if (from[0] === 0 && from[1] === 0) newCastlingRights.bQ = false;
  }

  const nextTurn: PieceColor = color === "w" ? "b" : "w";
  const inCheck = isKingInCheck(newBoard, nextTurn, newEnPassantTarget);

  const nextState: GameState = {
    ...state,
    board: newBoard,
    currentTurn: nextTurn,
    castlingRights: newCastlingRights,
    enPassantTarget: newEnPassantTarget,
    status: "playing",
    moveHistory: state.moveHistory,
    lastMove: { from, to },
  };

  let hasLegalMoves = false;
  outerLoop: for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (newBoard[r][c] && getPieceColor(newBoard[r][c]) === nextTurn) {
        const moves = getLegalMoves(nextState, r, c);
        if (moves.length > 0) {
          hasLegalMoves = true;
          break outerLoop;
        }
      }
    }
  }

  let status: GameState["status"] = "playing";
  if (!hasLegalMoves) {
    status = inCheck ? "checkmate" : "stalemate";
  } else if (inCheck) {
    status = "check";
  }

  let finalNotation = notation;
  if (status === "checkmate") finalNotation += "#";
  else if (inCheck) finalNotation += "+";

  return {
    board: newBoard,
    currentTurn: nextTurn,
    castlingRights: newCastlingRights,
    enPassantTarget: newEnPassantTarget,
    status,
    moveHistory: [...state.moveHistory, finalNotation],
    lastMove: { from, to },
  };
}
