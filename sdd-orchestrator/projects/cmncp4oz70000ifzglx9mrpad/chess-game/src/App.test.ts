import { describe, expect, it } from "vitest";

import { createGameState, getLegalMoves, movePiece, samePosition } from "./chess";

describe("chess logic", () => {
  it("allows a white pawn to advance one or two squares from the start", () => {
    const state = createGameState();
    const moves = getLegalMoves(state.board, { row: 6, col: 4 });

    expect(moves.some((move) => samePosition(move, { row: 5, col: 4 }))).toBe(true);
    expect(moves.some((move) => samePosition(move, { row: 4, col: 4 }))).toBe(true);
  });

  it("blocks sliding pieces when another piece is in the way", () => {
    const state = createGameState();
    const moves = getLegalMoves(state.board, { row: 7, col: 0 });

    expect(moves).toHaveLength(0);
  });

  it("rejects moves that are not legal and switches turns after a valid move", () => {
    const state = createGameState();
    const invalid = movePiece(state, { row: 6, col: 4 }, { row: 3, col: 4 });

    expect(invalid.error).toBeTruthy();

    const valid = movePiece(state, { row: 6, col: 4 }, { row: 4, col: 4 });
    expect(valid.error).toBeUndefined();
    expect(valid.state.turn).toBe("black");
  });
});
