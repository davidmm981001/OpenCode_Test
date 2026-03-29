export type Color = "white" | "black";
export type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";

export type Piece = {
  color: Color;
  type: PieceType;
};

export type Position = {
  row: number;
  col: number;
};

export type Board = Array<Array<Piece | null>>;

export type MoveRecord = {
  from: Position;
  to: Position;
  piece: Piece;
  captured: Piece | null;
};

export type GameState = {
  board: Board;
  turn: Color;
  winner: Color | null;
  history: MoveRecord[];
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

const pieceNames: Record<PieceType, string> = {
  king: "rey",
  queen: "reina",
  rook: "torre",
  bishop: "alfil",
  knight: "caballo",
  pawn: "peón",
};

export const pieceSymbols: Record<Color, Record<PieceType, string>> = {
  white: {
    king: "♔",
    queen: "♕",
    rook: "♖",
    bishop: "♗",
    knight: "♘",
    pawn: "♙",
  },
  black: {
    king: "♚",
    queen: "♛",
    rook: "♜",
    bishop: "♝",
    knight: "♞",
    pawn: "♟",
  },
};

export function createGameState(): GameState {
  return {
    board: createInitialBoard(),
    turn: "white",
    winner: null,
    history: [],
  };
}

export function createInitialBoard(): Board {
  return [
    [
      { color: "black", type: "rook" },
      { color: "black", type: "knight" },
      { color: "black", type: "bishop" },
      { color: "black", type: "queen" },
      { color: "black", type: "king" },
      { color: "black", type: "bishop" },
      { color: "black", type: "knight" },
      { color: "black", type: "rook" },
    ],
    Array.from({ length: 8 }, () => ({ color: "black", type: "pawn" })),
    Array.from({ length: 8 }, () => null),
    Array.from({ length: 8 }, () => null),
    Array.from({ length: 8 }, () => null),
    Array.from({ length: 8 }, () => null),
    Array.from({ length: 8 }, () => ({ color: "white", type: "pawn" })),
    [
      { color: "white", type: "rook" },
      { color: "white", type: "knight" },
      { color: "white", type: "bishop" },
      { color: "white", type: "queen" },
      { color: "white", type: "king" },
      { color: "white", type: "bishop" },
      { color: "white", type: "knight" },
      { color: "white", type: "rook" },
    ],
  ];
}

export function isInsideBoard(row: number, col: number) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

export function samePosition(a: Position, b: Position) {
  return a.row === b.row && a.col === b.col;
}

export function getPiece(board: Board, position: Position) {
  return board[position.row]?.[position.col] ?? null;
}

export function getLegalMoves(board: Board, from: Position) {
  const piece = getPiece(board, from);
  if (!piece) return [];

  if (piece.type === "pawn") return getPawnMoves(board, from, piece.color);
  if (piece.type === "rook") return getRayMoves(board, from, piece.color, [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]);
  if (piece.type === "bishop") return getRayMoves(board, from, piece.color, [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ]);
  if (piece.type === "queen") {
    return getRayMoves(board, from, piece.color, [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]);
  }
  if (piece.type === "knight") return getKnightMoves(board, from, piece.color);
  return getKingMoves(board, from, piece.color);
}

export function movePiece(state: GameState, from: Position, to: Position) {
  if (state.winner) {
    return { state, error: "La partida ya terminó." };
  }

  const piece = getPiece(state.board, from);
  if (!piece) return { state, error: "No hay pieza en la casilla origen." };
  if (piece.color !== state.turn) return { state, error: "No es el turno de esa pieza." };

  const legalMoves = getLegalMoves(state.board, from);
  if (!legalMoves.some((move) => samePosition(move, to))) {
    return { state, error: "Ese movimiento no es válido." };
  }

  const board = cloneBoard(state.board);
  const captured = board[to.row][to.col];
  board[to.row][to.col] = promoteIfNeeded(piece, to.row);
  board[from.row][from.col] = null;

  const winner = captured?.type === "king" ? piece.color : null;

  return {
    state: {
      board,
      turn: winner ? state.turn : nextTurn(state.turn),
      winner,
      history: [
        ...state.history,
        {
          from,
          to,
          piece: promoteIfNeeded(piece, to.row),
          captured,
        },
      ],
    },
  };
}

export function formatSquare(position: Position) {
  return `${FILES[position.col]}${8 - position.row}`;
}

export function describeMove(move: MoveRecord) {
  const actor = `${capitalize(move.piece.color)} ${pieceNames[move.piece.type]}`;
  const capture = move.captured ? ` y captura ${pieceNames[move.captured.type]}` : "";
  return `${actor} ${formatSquare(move.from)} → ${formatSquare(move.to)}${capture}`;
}

export function pieceLabel(piece: Piece) {
  return `${capitalize(piece.color)} ${pieceNames[piece.type]}`;
}

function nextTurn(turn: Color): Color {
  return turn === "white" ? "black" : "white";
}

function cloneBoard(board: Board): Board {
  return board.map((row) => row.slice());
}

function promoteIfNeeded(piece: Piece, row: number): Piece {
  if (piece.type === "pawn" && (row === 0 || row === 7)) {
    return { ...piece, type: "queen" };
  }
  return piece;
}

function getPawnMoves(board: Board, from: Position, color: Color) {
  const direction = color === "white" ? -1 : 1;
  const startRow = color === "white" ? 6 : 1;
  const moves: Position[] = [];

  const oneStep = { row: from.row + direction, col: from.col };
  if (isInsideBoard(oneStep.row, oneStep.col) && !getPiece(board, oneStep)) {
    moves.push(oneStep);

    const twoStep = { row: from.row + direction * 2, col: from.col };
    if (from.row === startRow && !getPiece(board, twoStep)) {
      moves.push(twoStep);
    }
  }

  for (const offset of [-1, 1]) {
    const target = { row: from.row + direction, col: from.col + offset };
    const occupant = isInsideBoard(target.row, target.col) ? getPiece(board, target) : null;
    if (occupant && occupant.color !== color) moves.push(target);
  }

  return moves;
}

function getKnightMoves(board: Board, from: Position, color: Color) {
  const moves: Position[] = [];
  const offsets = [
    [2, 1],
    [2, -1],
    [-2, 1],
    [-2, -1],
    [1, 2],
    [1, -2],
    [-1, 2],
    [-1, -2],
  ];

  for (const [rowOffset, colOffset] of offsets) {
    const target = { row: from.row + rowOffset, col: from.col + colOffset };
    if (!isInsideBoard(target.row, target.col)) continue;
    const occupant = getPiece(board, target);
    if (!occupant || occupant.color !== color) moves.push(target);
  }

  return moves;
}

function getKingMoves(board: Board, from: Position, color: Color) {
  const moves: Position[] = [];

  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
      if (rowOffset === 0 && colOffset === 0) continue;
      const target = { row: from.row + rowOffset, col: from.col + colOffset };
      if (!isInsideBoard(target.row, target.col)) continue;
      const occupant = getPiece(board, target);
      if (!occupant || occupant.color !== color) moves.push(target);
    }
  }

  return moves;
}

function getRayMoves(board: Board, from: Position, color: Color, directions: Array<[number, number]>) {
  const moves: Position[] = [];

  for (const [rowStep, colStep] of directions) {
    let row = from.row + rowStep;
    let col = from.col + colStep;

    while (isInsideBoard(row, col)) {
      const occupant = getPiece(board, { row, col });
      if (!occupant) {
        moves.push({ row, col });
      } else {
        if (occupant.color !== color) moves.push({ row, col });
        break;
      }
      row += rowStep;
      col += colStep;
    }
  }

  return moves;
}

function capitalize(value: string) {
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}
